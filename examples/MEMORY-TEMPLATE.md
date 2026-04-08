---
name: feedback_descriptive_name
description: One line describing this memory - used for keyword matching against prompts. Be specific about WHAT the rule is and WHICH system it applies to.
type: feedback
---

# The Rule (Short Title)

State the rule clearly in one sentence.

**Why:** The reason this rule exists. What happened when it was violated. How much time was wasted. Be specific - dates, hours lost, exact symptoms.

**How to apply:** When this rule kicks in. Which files, which systems, which scenarios. Concrete enough that an agent can check if the rule applies to the current task.

---

## Memory Types

### feedback (highest priority in auto-injection)
Rules learned from mistakes or confirmed approaches.
Examples:
- "Never use mirror UV wrapping - creates seams on non-tiling content"
- "Always validate auth tokens server-side, not in middleware"
- "User prefers single bundled PRs over many small ones for refactors"

### project (high priority)
Current state of ongoing work. Include dates so freshness is visible.
Examples:
- "V3 compiler is production, V4 is quarantined (as of 2026-04-01)"
- "Merge freeze begins 2026-03-05 for mobile release"

### user
Who the user is and how to work with them.
Examples:
- "Senior Go developer, new to React frontend"
- "Uses voice-to-text, prompts are long and unstructured"

### reference
Pointers to external systems.
Examples:
- "Bugs tracked in Linear project INGEST"
- "Staging environment at staging.example.com"
