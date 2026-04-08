#!/usr/bin/env node
// Context Intelligence Layer - File Dispatch Hook
// PreToolUse hook: reminds agent to load skills when editing governed files.
// Zero external dependencies. Pure Node.js ESM.

// --- FILE-TO-SKILL MAP (customize for your project) ---
// Each entry: { pattern: /regex/, skills: ['/skill-name'] }
const FILE_SKILL_MAP = [
  // Examples - replace with your own patterns:
  // { pattern: /\.tsx$/i, skills: ['/react-patterns'] },
  // { pattern: /api\/.*route\.ts/i, skills: ['/api-design'] },
  // { pattern: /\.test\.ts$/i, skills: ['/testing-standards'] },
  // { pattern: /prisma\//i, skills: ['/database-patterns'] },
]

// --- PROJECT DETECTION (customize) ---
function isTargetProject(filePath) {
  // Return true for files in your project.
  // Examples:
  //   return filePath.includes('my-project')
  //   return true  // activate for all projects
  return true
}

// --- STDIN ---
let stdin = ''
for await (const chunk of process.stdin) { stdin += chunk }
const trimmed = stdin.trim()
if (!trimmed) { process.stdout.write('{}'); process.exit(0) }

let input
try { input = JSON.parse(trimmed) } catch { process.stdout.write('{}'); process.exit(0) }

const toolName = input.tool_name || ''
if (!['Read', 'Edit', 'Write'].includes(toolName)) {
  process.stdout.write('{}'); process.exit(0)
}

const filePath = (input.tool_input || {}).file_path || ''
if (!filePath) { process.stdout.write('{}'); process.exit(0) }

const normalized = filePath.replace(/\\/g, '/')
if (!isTargetProject(normalized)) { process.stdout.write('{}'); process.exit(0) }

const matched = new Set()
for (const rule of FILE_SKILL_MAP) {
  if (rule.pattern.test(normalized)) {
    for (const skill of rule.skills) matched.add(skill)
  }
}

if (matched.size === 0) { process.stdout.write('{}'); process.exit(0) }

const shortPath = normalized.split('/').slice(-3).join('/')
const advisory = '[context-intelligence] File "' + shortPath + '" matches skills: ' + [...matched].join(', ') + '. Invoke these skills before making changes.'

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'PreToolUse',
    additionalContext: advisory
  }
}))
