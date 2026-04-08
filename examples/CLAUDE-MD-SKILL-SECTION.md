# CLAUDE.md Skill Mapping Sections

> Add these sections to your project's CLAUDE.md to enable plain-English skill detection.
> Customize the skills, keywords, and file patterns for YOUR project.

---

## Section: Skill Invocation Table

```markdown
## Skill Invocation

**Before ANY code, invoke relevant skills.** Match the MOST SPECIFIC skill to the task.

| Skill | When to Invoke |
|---|---|
| `/api-design` | API endpoints, REST, GraphQL, route handlers, middleware |
| `/database-patterns` | schema design, migrations, queries, indexing, ORM |
| `/auth-security` | authentication, authorization, tokens, sessions, RBAC |
| `/frontend-architecture` | React components, state management, routing, SSR |
| `/testing-standards` | unit tests, integration tests, E2E, coverage, TDD |
| `/deployment-ops` | CI/CD, Docker, Kubernetes, monitoring, scaling |
| `/performance-tuning` | profiling, caching, lazy loading, bundle size |
```

## Section: File-Based Auto-Dispatch

```markdown
## File-Based Auto-Dispatch

When editing these files, the listed skills MUST be invoked:

| File Pattern | Skills |
|---|---|
| `app/api/**`, `route.ts` | `/api-design` |
| `prisma/**`, `schema.prisma` | `/database-patterns` |
| `middleware.ts`, `auth/**` | `/auth-security` |
| `components/**`, `app/(routes)/**` | `/frontend-architecture` |
| `*.test.ts`, `*.spec.ts` | `/testing-standards` |
| `Dockerfile`, `.github/workflows/**` | `/deployment-ops` |
```

## Section: Plain English Detection

```markdown
## Software Areas - Plain English Detection

> Users say "fix the login bug", not "invoke /auth-security".
> YOUR JOB: detect the area, auto-invoke the right skills.

| # | Area | Primary Skill | Plain English Signals |
|---|---|---|---|
| 1 | API Layer | `/api-design` | "endpoint", "API", "route", "REST", "GraphQL", "500 error", "CORS" |
| 2 | Database | `/database-patterns` | "query slow", "migration", "schema", "index", "N+1", "deadlock" |
| 3 | Auth | `/auth-security` | "login", "signup", "token", "session", "permission", "403", "unauthorized" |
| 4 | Frontend | `/frontend-architecture` | "component", "state", "render", "hydration", "layout shift", "loading" |
| 5 | Testing | `/testing-standards` | "test", "coverage", "mock", "flaky", "assertion", "TDD" |
| 6 | Deployment | `/deployment-ops` | "deploy", "build fail", "container", "scaling", "downtime", "rollback" |
| 7 | Performance | `/performance-tuning` | "slow", "memory leak", "bundle size", "cache", "lazy load", "profiler" |
```

## Section: Multi-Skill Combinations

```markdown
## Multi-Skill Combinations

| Task | Skills to Load |
|---|---|
| Build new API with auth | `/api-design` + `/auth-security` |
| Database migration with tests | `/database-patterns` + `/testing-standards` |
| Performance-critical frontend | `/frontend-architecture` + `/performance-tuning` |
| Deploy with monitoring | `/deployment-ops` + `/performance-tuning` |
```
