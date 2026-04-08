---
name: my-skill-name
description: One paragraph describing what this skill covers. Be detailed - this text is used for keyword matching against user prompts. Include domain terms, tool names, framework names, and common phrases users would say when they need this skill.
metadata:
  priority: 80
  sessionStart: false
  docs: []
  pathPatterns:
    - '**/relevant/directory/**'
    - '**/specific-file-pattern.ts'
  bashPatterns:
    - 'keyword'
    - 'another keyword'
  importPatterns:
    - 'SomeImport'
    - 'AnotherImport'
  promptSignals:
    phrases:
      - 'exact phrase that triggers this skill'
      - 'another trigger phrase'
      - 'build a widget'
      - 'fix the widget'
      - 'widget architecture'
      - 'widget performance'
    allOf: []
    anyOf: []
    noneOf: []
    minScore: 4
---

# My Skill Name

> One-line description of what this skill provides.

---

## When to Use This Skill

- Task type A (e.g., "building new API endpoints")
- Task type B (e.g., "optimizing database queries")
- Task type C (e.g., "debugging authentication issues")

## When NOT to Use This Skill

- Different domain -> use `/other-skill` instead
- Pure frontend work -> use `/frontend-skill` instead

---

## Decision Tree

```
What's the task?
  ├── Building new [thing] → Read references/patterns.md
  ├── Fixing a bug in [thing] → Read references/debugging.md
  ├── Optimizing [thing] → Read references/performance.md
  └── Designing [thing] architecture → Read references/architecture.md
```

---

## Non-Negotiables

1. **Rule one** — Always do X before Y
2. **Rule two** — Never use pattern Z (it causes ABC)
3. **Rule three** — Every output must include D

---

## Anti-Patterns

| Anti-Pattern | Do This Instead |
|---|---|
| Doing X without checking Y | Always verify Y first |
| Using deprecated API Z | Use modern API W |

---

## Bundled References

| # | File | When to Read |
|---|------|-------------|
| 1 | `references/patterns.md` | When implementing new features |
| 2 | `references/debugging.md` | When fixing bugs |
| 3 | `references/performance.md` | When optimizing |
| 4 | `references/architecture.md` | When designing systems |
