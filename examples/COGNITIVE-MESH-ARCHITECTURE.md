# The Cognitive Mesh — Skill Architecture Guide

> How to structure Claude Code skills so each one is a deep specialist brain,
> not a bloated document dump. This is the architecture behind the
> Context Intelligence Layer's skill system.

---

## The Problem with Monolithic Skills

Most people create 3-4 giant skills that try to cover everything:

```
frontend-skill/
  SKILL.md (2000+ lines, covers React AND state AND CSS AND testing)
  references/
    react-patterns.md
    css-architecture.md
    state-management.md
    testing-patterns.md
    accessibility.md
    performance.md
    ... 30 more files
```

This breaks down fast:

- **95% of loaded content is irrelevant** to any single task
- **Specialist knowledge gets diluted** into routing decisions
- **1 monolith = 1 of 3 available skill slots** wasted on irrelevant content
- **Every new domain makes the monolith heavier** — doesn't scale

---

## The Cognitive Mesh Solution

Split skills into three layers that collaborate:

```
Layer 1: SPECIALISTS (the scientists)
  Each owns ONE deep domain
  Has its own SKILL.md with domain-specific rules
  Never absorbed — sovereign experts
  4-30 reference documents, 800-2000 lines each

Layer 2: ORCHESTRATORS (the department heads)
  Small SKILL.md (~200 lines) focused on routing
  Routes to 4-7 specialists based on task type
  Owns only cross-domain synthesis content

Layer 3: HOOKS (the dispatcher)
  Auto-matches prompts to the right specialists
  Loads up to 3 skills per invocation
  Orchestrator + 2 specialists = maximum relevance
```

---

## Why This Is Better

| Factor | Monolithic Skills | Cognitive Mesh |
|--------|------------------|----------------|
| Content relevance per task | ~5-15% | ~60-80% |
| Specialist depth | Diluted | Preserved |
| Scaling | Gets heavier with each addition | Adding skills doesn't affect others |
| Parallel loading | 1 skill = 1 slot wasted | 3 focused skills = 3 slots used well |
| Maintenance | Change one domain = edit the monolith | Change one specialist = only that file |
| Cross-domain work | Implicit (hope it figures it out) | Explicit routing + synthesis |

---

## Anatomy of a Specialist Skill

Each specialist is a self-contained expert brain:

```
api-design/
  SKILL.md                         # The Expert Brain
    YAML Frontmatter                 name, promptSignals, pathPatterns
    Domain Identity                  "I cover API design. I do NOT cover auth or database."
    Decision Tree                    "Building new endpoint? Read patterns.md"
    Non-Negotiables (5-10)           Rules that define quality
    Anti-Patterns (5-10)             Common mistakes with corrections
    Output Contract                  What quality output looks like
    Bundled References Table         Index of all reference docs

  references/
    rest-conventions.md              # 800-2000 lines of deep content
    error-handling-patterns.md       # Actionable, not theoretical
    versioning-strategies.md         # Includes code examples
    rate-limiting-design.md          # Decision frameworks + trade-offs
```

### What Goes in SKILL.md (The Brain)

The SKILL.md is what Claude reads when the skill is invoked. It should be **200-400 lines** and contain:

**1. YAML Frontmatter** — for auto-injection matching:
```yaml
---
name: api-design
description: REST API conventions, endpoint design, error handling, versioning...
metadata:
  priority: 80
  pathPatterns:
    - '**/api/**'
    - '**/routes/**'
  promptSignals:
    phrases:
      - 'API endpoint'
      - 'route handler'
      - 'REST convention'
      - '500 error'
      - 'API versioning'
    minScore: 4
---
```

**2. Domain Identity** — what this covers AND what it explicitly does NOT:
```markdown
## This Skill Covers
- REST endpoint design and conventions
- Error response formatting
- API versioning strategies
- Rate limiting patterns

## This Skill Does NOT Cover
- Authentication/authorization -> use /auth-security
- Database queries -> use /database-patterns
- Frontend data fetching -> use /data-fetching
```

**3. Decision Tree** — routes to the right reference for each task:
```markdown
## Decision Tree
  What's the task?
    Building a new endpoint       -> Read references/rest-conventions.md
    Fixing error responses        -> Read references/error-handling-patterns.md
    Adding versioning             -> Read references/versioning-strategies.md
    Performance issues            -> Read references/rate-limiting-design.md
```

**4. Non-Negotiables** — the rules that define quality:
```markdown
## Non-Negotiables
1. Every endpoint returns a consistent envelope: { success, data, error }
2. Error responses include machine-readable codes, not just messages
3. All list endpoints support cursor pagination, not offset
4. Rate limits are always per-user, never global
5. Breaking changes require a new API version, never modify existing
```

**5. Anti-Patterns** — common mistakes:
```markdown
## Anti-Patterns
| Don't Do This | Do This Instead |
|---------------|-----------------|
| Return raw database errors | Map to domain-specific error codes |
| Use offset pagination | Use cursor pagination (scales better) |
| Version via URL path only | Support Accept header versioning too |
```

### What Goes in References (The Library)

References are loaded on-demand — only when the decision tree points to them. Each one should be:

- **800-2000 lines** of deep, actionable content
- **Include code examples** — not just theory
- **Include decision frameworks** — "when to use X vs Y"
- **Include comparison tables** — trade-offs made explicit

---

## Anatomy of an Orchestrator Skill

Orchestrators are thin routing layers. They don't do deep work — they coordinate specialists:

```
frontend-orchestrator/
  SKILL.md (~200 lines)
    Routing Table                    "For component work -> /react-patterns"
                                     "For state management -> /state-management"
                                     "For animations -> /animation-patterns"
    Synthesis Rules                  How specialists combine for YOUR project
    Project-specific conventions     Design tokens, naming, file structure

  references/
    project-conventions.md           Only cross-domain synthesis content
    component-api-standards.md       How YOUR project wires things together
```

### Orchestrators Own vs Route

| Content Type | Orchestrator OWNS | Orchestrator ROUTES TO |
|-------------|-------------------|----------------------|
| Project-specific conventions | File naming, folder structure | -- |
| Domain expertise | -- | Specialist skills |
| How domains combine | Integration patterns | -- |
| Generic patterns | -- | Specialist references |

### Example Routing Table

```markdown
## Routing

| Task | Route To |
|------|----------|
| Build a React component | INVOKE /react-patterns |
| Add state management | INVOKE /state-management |
| Animate a component | INVOKE /animation-patterns |
| Write component tests | INVOKE /testing-standards |
| Optimize performance | INVOKE /performance-tuning |
```

---

## How to Build Your Mesh

### Step 1: Identify Your Domains

List the 5-10 major knowledge areas in your project:

```
Example for a SaaS product:
  1. API design
  2. Auth & security
  3. Database patterns
  4. React architecture
  5. State management
  6. Testing standards
  7. Deployment & CI/CD
```

### Step 2: One Specialist Per Domain

Each domain gets its own skill folder:

```bash
mkdir -p .claude/skills/api-design/references
mkdir -p .claude/skills/auth-security/references
mkdir -p .claude/skills/database-patterns/references
mkdir -p .claude/skills/react-architecture/references
mkdir -p .claude/skills/state-management/references
mkdir -p .claude/skills/testing-standards/references
mkdir -p .claude/skills/deployment-ops/references
```

### Step 3: Write SKILL.md for Each

Follow the anatomy above. Start with:
1. YAML frontmatter (for auto-injection)
2. Domain identity (covers / does NOT cover)
3. 5 non-negotiables
4. 5 anti-patterns
5. Reference table (even if references are empty — fill later)

### Step 4: Create Orchestrators (if 10+ specialists)

If you have fewer than 10 specialists, you probably don't need orchestrators. The auto-injection hook handles routing. Orchestrators become valuable when:
- You have 3+ specialists that frequently combine
- There are project-specific rules about HOW domains integrate
- You need a single entry point for a broad area (e.g., "frontend")

### Step 5: Register in CLAUDE.md

Add keyword mappings so Claude knows which skill to invoke:

```markdown
| Skill | When to Invoke |
|-------|----------------|
| /api-design | API endpoint, route handler, REST, error handling |
| /auth-security | login, auth, token, permission, 403 |
| /database-patterns | query, migration, schema, index, N+1 |
```

### Step 6: Add Dependencies

In `prompt-intelligence.mjs`, define which skills are commonly needed together:

```javascript
const SKILL_DEPENDENCIES = {
  'api-design': ['auth-security'],          // APIs usually need auth
  'database-patterns': ['api-design'],       // DB work is usually for an API
  'react-architecture': ['state-management'], // Components need state
}
```

---

## When to Split vs Keep Together

**Create a NEW specialist when:**
- Domain has 5+ reference documents worth of content
- Content is reusable beyond the current project
- The domain has its own non-negotiables and anti-patterns
- Loading it with unrelated content wastes context

**Keep as references in an existing skill when:**
- Content is fewer than 3 references (too small for standalone)
- Content is tightly coupled to the parent skill's domain
- The content is project-specific synthesis (how domains combine)

**NEVER absorb a specialist into an orchestrator.** The orchestrator routes to the specialist. The specialist retains its identity and depth.

---

## The Analogy

**Monolithic skills** = a university with 4 professors who each teach every subject in their department. Brilliant but spread thin. Students get breadth, not depth.

**Cognitive Mesh** = a research institute with specialist scientists who collaborate through published protocols. The API scientist publishes deep REST research. The Database scientist reads those papers and publishes query patterns that account for API constraints. The Department Head coordinates — but doesn't do the research.

The research institute produces better science because the scientists go deeper, and the coordination is explicit rather than implicit.

---

## Scaling

| Project Size | Specialists | Orchestrators | Reference Docs |
|:---|:---:|:---:|:---:|
| Side project | 3-5 | 0 | 10-20 |
| Startup MVP | 5-10 | 1-2 | 20-50 |
| Growth-stage product | 10-20 | 2-3 | 50-150 |
| Enterprise codebase | 20-50 | 3-5 | 150-500+ |

The system scales linearly. Adding a new specialist doesn't slow down existing ones. The auto-injection hook scans all skills in <500ms regardless of count.
