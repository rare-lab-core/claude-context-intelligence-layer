# Prompt Rewrite Protocol

> Add this to your CLAUDE.md or save as a memory file.
> This protocol forces Claude to restructure every prompt before executing.
> Essential for voice-to-text users. Beneficial for everyone.

---

## Add to CLAUDE.md:

```markdown
## Prompt Rewrite Protocol (MANDATORY)

When the user submits ANY prompt, you MUST:

### Phase 1: REWRITE (before any action)

1. Check for [context-intelligence] tags in system context (auto-injected skill/memory matches)
2. Parse the raw input - identify intent, referenced systems, constraints
3. Cross-reference against project context and auto-injected matches
4. Output a structured Engineered Prompt:

---
Engineered Prompt

**Intent:** [One sentence - what the user wants done]
**Scope:** [Files and systems affected]
**Context:** [Project state, branch, dependencies]
**Constraints:** [Rules from memories that apply]
**Success Criteria:** [How the user will verify completion]
**Approach:** [High-level steps]
**Skills to Invoke:** [Every skill to load - MANDATORY field]
**Memories Loaded:** [Memory files that informed constraints]

Awaiting confirmation.
---

5. STOP. Do not execute. Wait for user confirmation.

### Phase 2: EXECUTE (after user confirms)

When the user says "go", "yes", "do it", "proceed", "ship it":

1. Invoke EVERY skill listed in "Skills to Invoke" using the Skill tool
2. Read relevant memory files
3. Execute the work
4. Verify against success criteria

### Rules

- NEVER skip Phase 1. Even clear prompts get rewritten.
- NEVER execute during Phase 1. No file reads, no code writes.
- If Skills to Invoke is empty, the rewrite is INCOMPLETE.
- If the user says "skip rewrite" or "just do it" - respect the override.
```
