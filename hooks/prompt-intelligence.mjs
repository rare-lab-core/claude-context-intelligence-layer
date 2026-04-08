#!/usr/bin/env node
// Context Intelligence Layer - Prompt Intelligence Hook
// UserPromptSubmit hook: auto-injects relevant skills + memories on every prompt.
// Zero external dependencies. Pure Node.js ESM.
import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, join } from 'node:path'

// --- CONFIG ---
const MAX_SKILLS_INJECTED = 3
const MAX_MEMORIES_INJECTED = 5
const DEFAULT_MIN_SCORE = 4
const MIN_PROMPT_LENGTH = 8
const MEMORY_MATCH_THRESHOLD = 2
const SESSION_DIR = resolve(
  process.env.HOME || process.env.USERPROFILE || '',
  '.claude/hooks/context-intelligence/.sessions'
)

// --- SKILL DEPENDENCIES (customize for your project) ---
// When a primary skill matches, its dependencies are auto-suggested.
const SKILL_DEPENDENCIES = {
  // 'my-frontend-skill': ['my-api-skill'],
  // 'my-shader-skill': ['my-math-skill', 'my-gpu-skill'],
}

// --- PROJECT DETECTION (customize: change this to match YOUR project) ---
function isTargetProject(cwd) {
  // Return true for directories where this hook should activate.
  // Examples:
  //   return cwd.includes('my-project')
  //   return existsSync(join(cwd, '.claude/skills'))
  //   return true  // activate everywhere
  return existsSync(resolve(cwd, '.claude/skills'))
}

// --- MEMORY DIRECTORY (customize: path to your memory files) ---
function getMemoryDir() {
  // Claude Code stores auto-memories in ~/.claude/projects/<encoded-path>/memory/
  // You can also use a fixed path:
  //   return resolve(process.env.HOME, '.claude/projects/my-project/memory')
  //
  // For auto-detection, scan for the project directory:
  const projectsDir = resolve(process.env.HOME || process.env.USERPROFILE || '', '.claude/projects')
  if (!existsSync(projectsDir)) return null
  for (const dir of readdirSync(projectsDir)) {
    const memDir = join(projectsDir, dir, 'memory')
    if (existsSync(memDir)) return memDir
  }
  return null
}

// --- STDIN ---
let stdin = ''
for await (const chunk of process.stdin) { stdin += chunk }
const trimmed = stdin.trim()
if (!trimmed) { process.stdout.write('{}'); process.exit(0) }

let input
try { input = JSON.parse(trimmed) } catch { process.stdout.write('{}'); process.exit(0) }

const prompt = (input.prompt || input.message || '').trim()
if (prompt.length < MIN_PROMPT_LENGTH) { process.stdout.write('{}'); process.exit(0) }

const sessionId = input.session_id || input.conversation_id || process.env.SESSION_ID || 'default'
const cwd = input.cwd || process.env.CLAUDE_PROJECT_ROOT || process.cwd()

if (!isTargetProject(cwd)) { process.stdout.write('{}'); process.exit(0) }

// --- YAML FRONTMATTER PARSER ---
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return {}
  const yaml = match[1]
  const result = {}
  const stack = []
  let inArray = false
  let arrayPath = null
  let arrayItems = []

  function currentPath(key) {
    return [...stack.map(s => s.key), key].join('.')
  }

  for (const line of yaml.split('\n')) {
    const trimLine = line.trimEnd()
    if (!trimLine) continue

    const arrayMatch = trimLine.match(/^(\s*)-\s+(.*)$/)
    if (arrayMatch) {
      const val = arrayMatch[2].replace(/^['"]|['"]$/g, '').replace(/['"]$/g, '')
      if (inArray) arrayItems.push(val)
      continue
    }

    if (inArray) {
      setNested(result, arrayPath, arrayItems)
      inArray = false; arrayPath = null; arrayItems = []
    }

    const kvMatch = trimLine.match(/^(\s*)([\w][\w.-]*)\s*:\s*(.*)$/)
    if (kvMatch) {
      const indent = kvMatch[1].length
      const key = kvMatch[2]
      const val = kvMatch[3].trim()

      while (stack.length > 0 && stack[stack.length - 1].indent >= indent) stack.pop()
      const fullPath = currentPath(key)

      if (val === '' || val === '[]') {
        stack.push({ indent, key })
        if (val === '[]') { setNested(result, fullPath, []) }
        else { inArray = true; arrayPath = fullPath; arrayItems = [] }
        continue
      }

      setNested(result, fullPath, val.replace(/^['"]|['"]$/g, '').replace(/['"]$/g, ''))
    }
  }

  if (inArray && arrayItems.length > 0) setNested(result, arrayPath, arrayItems)
  return result
}

function setNested(obj, path, value) {
  if (!path) return
  const parts = path.split('.')
  let current = obj
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]] || typeof current[parts[i]] !== 'object') current[parts[i]] = {}
    current = current[parts[i]]
  }
  current[parts[parts.length - 1]] = value
}

function getNested(obj, path) {
  return path ? path.split('.').reduce((o, k) => o && o[k], obj) : undefined
}

// --- SCANNERS ---
function scanSkills(skillsDir) {
  const skills = []
  if (!existsSync(skillsDir)) return skills
  for (const dir of readdirSync(skillsDir, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue
    const skillMd = join(skillsDir, dir.name, 'SKILL.md')
    if (!existsSync(skillMd)) continue
    try {
      const fm = parseFrontmatter(readFileSync(skillMd, 'utf-8'))
      skills.push({
        name: fm.name || dir.name,
        description: fm.description || '',
        phrases: getNested(fm, 'metadata.promptSignals.phrases') || [],
        minScore: Number(getNested(fm, 'metadata.promptSignals.minScore')) || DEFAULT_MIN_SCORE,
        priority: Number(getNested(fm, 'metadata.priority')) || 50,
        dir: dir.name
      })
    } catch { /* skip */ }
  }
  return skills
}

function scanMemories(memoryDir) {
  const memories = []
  if (!memoryDir || !existsSync(memoryDir)) return memories
  for (const file of readdirSync(memoryDir)) {
    if (!file.endsWith('.md') || file === 'MEMORY.md') continue
    try {
      const fm = parseFrontmatter(readFileSync(join(memoryDir, file), 'utf-8'))
      memories.push({
        name: fm.name || file.replace('.md', ''),
        description: fm.description || '',
        type: fm.type || 'unknown',
        file
      })
    } catch { /* skip */ }
  }
  return memories
}

// --- SCORING ---
function normalizeText(text) {
  return text.toLowerCase().replace(/[^\w\s-]/g, ' ').replace(/\s+/g, ' ').trim()
}

function scoreSkill(skill, np) {
  let score = 0
  const matched = []
  for (const phrase of skill.phrases) {
    const np2 = normalizeText(phrase)
    if (!np2) continue
    if (np.includes(np2)) {
      score += Math.max(Math.ceil(np2.length / 4), 2)
      matched.push(phrase)
      continue
    }
    const words = np2.split(' ')
    if (words.filter(w => w.length > 2 && np.includes(w)).length >= Math.ceil(words.length * 0.6)) {
      score += 1
      matched.push('~' + phrase)
    }
  }
  const descWords = normalizeText(skill.description).split(' ').filter(w => w.length > 4)
  const promptWords = new Set(np.split(' '))
  let hits = 0
  for (const dw of descWords) { if (promptWords.has(dw)) hits++ }
  if (hits >= 3) { score += Math.min(hits, 4); matched.push('(desc:' + hits + ' keywords)') }
  return { score, matched, minScore: skill.minScore }
}

function scoreMemory(memory, np) {
  const words = normalizeText(memory.description).split(' ').filter(w => w.length > 3)
  let score = 0
  for (const w of words) { if (np.includes(w)) score++ }
  if (memory.type === 'feedback') score += 1
  if (memory.type === 'project') score += 0.5
  return { score }
}

// --- SEEN SKILLS ---
function getSeenSkills(sid) {
  try {
    const f = join(SESSION_DIR, sid + '.json')
    if (existsSync(f)) return new Set(JSON.parse(readFileSync(f, 'utf-8')).seenSkills || [])
  } catch { /* ignore */ }
  return new Set()
}

function markSeen(sid, names) {
  try {
    mkdirSync(SESSION_DIR, { recursive: true })
    const f = join(SESSION_DIR, sid + '.json')
    let d = {}
    try { if (existsSync(f)) d = JSON.parse(readFileSync(f, 'utf-8')) } catch { /* ignore */ }
    const s = new Set(d.seenSkills || [])
    for (const n of names) s.add(n)
    d.seenSkills = [...s]
    d.lastUpdated = new Date().toISOString()
    writeFileSync(f, JSON.stringify(d, null, 2))
  } catch { /* ignore */ }
}

function expandDeps(primary) {
  const expanded = new Set(primary)
  for (const s of primary) {
    const deps = SKILL_DEPENDENCIES[s]
    if (deps) for (const d of deps) expanded.add(d)
  }
  return [...expanded]
}

// --- MAIN ---
const np = normalizeText(prompt)
const skillsDir = resolve(cwd.replace(/\\/g, '/'), '.claude/skills')
const skills = scanSkills(skillsDir)
const memoryDir = getMemoryDir()
const memories = scanMemories(memoryDir)

const seen = getSeenSkills(sessionId)
const skillScores = skills
  .map(s => {
    const r = scoreSkill(s, np)
    return { ...s, score: r.score, matchedPhrases: r.matched, passed: r.score >= r.minScore, wasSeen: seen.has(s.name) }
  })
  .filter(s => s.passed)
  .sort((a, b) => {
    if (a.wasSeen !== b.wasSeen) return a.wasSeen ? 1 : -1
    if (b.score !== a.score) return b.score - a.score
    return b.priority - a.priority
  })
  .slice(0, MAX_SKILLS_INJECTED)

const primaryNames = skillScores.map(s => s.name)
const expanded = expandDeps(primaryNames)
const depNames = expanded.filter(n => !primaryNames.includes(n))

const memScores = memories
  .map(m => {
    const r = scoreMemory(m, np)
    return { ...m, score: r.score, passed: r.score >= MEMORY_MATCH_THRESHOLD }
  })
  .filter(m => m.passed)
  .sort((a, b) => b.score - a.score)
  .slice(0, MAX_MEMORIES_INJECTED)

if (skillScores.length === 0 && memScores.length === 0) {
  process.stdout.write('{}')
  process.exit(0)
}

const lines = ['[context-intelligence] Prompt analysis complete.']

if (skillScores.length > 0) {
  lines.push('', 'Skills matched (MUST invoke via Skill tool during execution):')
  for (const s of skillScores) {
    const tag = s.wasSeen ? ' [seen]' : ''
    lines.push('  - /' + s.name + ' (score: ' + s.score + ', matched: ' + s.matchedPhrases.slice(0, 4).map(p => '"' + p + '"').join(', ') + ')' + tag)
  }
  if (depNames.length > 0) {
    lines.push('  Co-dependencies: ' + depNames.map(n => '/' + n).join(', '))
  }
}

if (memScores.length > 0) {
  lines.push('', 'Relevant memories (read before executing):')
  for (const m of memScores) {
    const tag = m.type === 'feedback' ? ' [FEEDBACK]' : m.type === 'project' ? ' [PROJECT]' : ''
    lines.push('  - ' + m.file + tag + ' -- ' + m.description.slice(0, 120))
  }
}

lines.push('', 'IMPORTANT: Invoke listed skills using the Skill tool before writing code.')

markSeen(sessionId, primaryNames)

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'UserPromptSubmit',
    additionalContext: lines.join('\n')
  }
}))
