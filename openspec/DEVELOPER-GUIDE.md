# OpenSpec PDLC — Developer Guide

> Practical reference for developers. Open this when you need to know which command to run next.

---

## 1. Quick Start

OpenSpec is a structured change workflow that turns a named change into a sequence of artifacts
(proposal, specs, design, tasks, etc.) and then into committed code. You start a change with
`/opsx:new` or `/opsx:propose`, generate artifacts one at a time with `/opsx:continue` (or all at
once with `/opsx:propose`), implement with `/opsx:apply`, and close out with `/opsx:archive`. Every
change lives under `openspec/changes/<change-name>/` and follows a schema that controls which
artifacts are created.

**Five commands every developer needs:**

```
/opsx:new <change-name>        # Start a new change (uses schema from config.yaml)
/opsx:continue                 # Generate the next artifact in sequence
/opsx:apply                    # Work through tasks.md and implement the change
/opsx:verify <change-name>     # Confirm implementation matches artifacts before archiving
/opsx:archive <change-name>    # Close the change and merge specs into openspec/specs/
```

---

## 2. Choosing a Schema — Decision Tree

```
Start here
    |
    v
Is this an event-driven / messaging / async system?
    |--- YES ---> event-driven
    |
    v
Do you need BDD acceptance tests with Cucumber.js?
    |--- YES ---> behaviour-driven
    |
    v
Is this a small, well-scoped change with clear specs but no ambiguity?
    |--- YES ---> minimalist
    |
    v
Do you need Architecture Decision Records (ADRs)?
    |--- NO  ---> spec-driven
    |
    v
Do you want the full Gherkin workflow with grill-me, C4 diagrams, and ADR skills?
    |--- YES ---> intent-driven  (project default)
    |--- NO  ---> spec-driven-with-adr
```

### Schema Comparison

| Schema | Artifacts | Best for | Avoid when |
|---|---|---|---|
| `minimalist` | specs, tasks | Small, well-scoped low-risk changes | Cross-cutting or multi-team changes |
| `spec-driven` | proposal, specs, design, tasks | Standard features, no ADR needed | Long-lived architectural decisions exist |
| `spec-driven-with-adr` | proposal, specs, design, adr, tasks | Standard features with ADR tracking | BDD / acceptance tests required |
| `behaviour-driven` | proposal, specs, design, tasks + feature files + acceptance tests | BDD first, Cucumber.js acceptance suite | No Node.js test infrastructure |
| `intent-driven` | proposal, specs (Gherkin), design, adr, tasks | Default full workflow; activates grill-me, C4, ADR, gherkin skills | Tiny or time-critical changes |
| `event-driven` | event-storming, event-modeling, specs, design, asyncapi, tasks | Messaging/eventing systems, AsyncAPI contracts | Pure CRUD with no async boundaries |

---

## 3. Schema-by-Schema Command Reference

### spec-driven

Artifact chain: `proposal → specs → design → tasks`

```
# Option A — generate artifacts one at a time
/opsx:new my-feature --schema spec-driven
/opsx:continue    # → proposal.md
/opsx:continue    # → specs/<capability>/spec.md
/opsx:continue    # → design.md
/opsx:continue    # → tasks.md

/opsx:apply

git commit -m "feat(scope): implement my-feature"

/opsx:archive my-feature

# Option B — generate all artifacts at once, then implement
/opsx:propose my-feature --schema spec-driven
/opsx:apply
git commit -m "feat(scope): implement my-feature"
/opsx:archive my-feature
```

---

### minimalist

Artifact chain: `specs → tasks`  (no proposal)

```
/opsx:new my-change --schema minimalist
/opsx:continue    # → specs/<capability>/spec.md
/opsx:continue    # → tasks.md

/opsx:apply

git commit -m "feat(scope): my-change"

/opsx:archive my-change
```

Start directly with specs. Suitable when the "why" is already documented elsewhere and the
change is limited to a single well-understood area.

---

### behaviour-driven

Artifact chain: `proposal → specs → design → tasks`
Tasks include mandatory BDD gates: feature extraction → failing acceptance tests → implementation.

```
/opsx:new my-feature --schema behaviour-driven
/opsx:continue    # → proposal.md
/opsx:continue    # → specs/<capability>/spec.md  (Gherkin-style, extractable to .feature)
/opsx:continue    # → design.md
/opsx:continue    # → tasks.md  (contains gherkin-lint, Cucumber.js, acceptance gates)

/opsx:apply
# Apply enforces gate order:
# 1. Extract features/*.feature from specs and run gherkin-lint (zero errors required)
# 2. Commit feature extraction gate
# 3. Set up acceptance-tests/ Node project (Cucumber.js, HTML reports)
# 4. Commit failing acceptance-test setup
# 5. Implement in scenario slices until acceptance tests pass
# 6. Commit passing implementation

git commit -m "feat(scope): my-feature — acceptance tests passing"

/opsx:archive my-feature
```

---

### spec-driven-with-adr

Artifact chain: `proposal → specs → design → adr → tasks`

```
/opsx:new my-feature --schema spec-driven-with-adr
/opsx:continue    # → proposal.md
/opsx:continue    # → specs/<capability>/spec.md
/opsx:continue    # → design.md
/opsx:continue    # → adr.md  (change-local manifest; durable ADRs written to adr/ at repo root)
/opsx:continue    # → tasks.md

/opsx:apply

git commit -m "feat(scope): my-feature"

/opsx:archive my-feature
```

The `adr` step reads every file under `adr/` at the repo root, checks supersession links, and
either records new durable ADRs (`adr/NNNN-kebab-title.md`) or explicitly states none were needed.
ADR files are immutable once accepted — to revise a decision, create a new superseding ADR.

---

### intent-driven  _(project default)_

Artifact chain: `proposal → specs → design → adr → tasks`
Skills fire automatically per `openspec/config.yaml` rules:
- **proposal** — `grill-me` skill (interview to sharpen scope before writing)
- **specs** — `gherkin-authoring` skill (Gherkin GIVEN/WHEN/THEN format)
- **design** — `c4-diagrams` skill (C4 architecture diagrams)
- **adr** — `architectural-decision-records` skill

```
# No --schema flag needed — config.yaml defaults to intent-driven
/opsx:new my-feature
/opsx:continue    # → proposal.md       (grill-me runs first)
/opsx:continue    # → specs/**/*.md     (gherkin-authoring skill)
/opsx:continue    # → design.md         (c4-diagrams skill)
/opsx:continue    # → adr.md            (architectural-decision-records skill)
/opsx:continue    # → tasks.md

/opsx:apply

git commit -m "feat(scope): my-feature"

/opsx:verify my-feature    # recommended before archiving

/opsx:archive my-feature
```

---

### event-driven

Artifact chain: `event-storming → event-modeling → specs → design → asyncapi → tasks`

```
/opsx:new my-event-change --schema event-driven
/opsx:continue    # → event-storming.md   (domain events, commands, actors, hotspots)
/opsx:continue    # → event-modeling.md   (Trigger → Command → Event → Read Model swim lanes)
/opsx:continue    # → specs/**/*.md       (user stories with Given/When/Then criteria)
/opsx:continue    # → design.md           (broker choices, subject naming, payload formats)
/opsx:continue    # → asyncapi.yaml       (validated with: asyncapi-cli validate asyncapi.yaml)
/opsx:continue    # → tasks.md            (only after asyncapi.yaml validates cleanly)

/opsx:apply

git commit -m "feat(scope): my-event-change"

/opsx:archive my-event-change
```

The `asyncapi` artifact will not be marked done until `asyncapi-cli validate asyncapi.yaml`
passes. Resolve validation errors before running `/opsx:continue` for tasks.

---

## 4. All Available Commands Reference

| Command | Syntax | What it does | When to use |
|---|---|---|---|
| `new` | `/opsx:new <name> [--schema <schema>]` | Creates the change directory and metadata under `openspec/changes/<name>/`. Uses `config.yaml` schema when `--schema` is omitted. | First step for every change. |
| `propose` | `/opsx:propose <name> [--schema <schema>]` | Creates the change AND generates all artifacts in one pass. | When you want everything drafted in a single step rather than one at a time. |
| `explore` | `/opsx:explore` | Opens a thinking-partner mode for investigating a problem, clarifying requirements, or stress-testing an idea before committing to a change. | Before `/opsx:new` when the scope is unclear. |
| `continue` | `/opsx:continue [<name>]` | Generates the next pending artifact in the current change's sequence. Respects artifact dependencies — will not run an artifact until its `requires` are done. | After each artifact to advance through the workflow. |
| `ff` | `/opsx:ff [<name>]` | Fast-forwards by generating all remaining artifacts at once. | Mid-change when you want to draft everything remaining without stepping through `/opsx:continue` one by one. |
| `apply` | `/opsx:apply [<name>]` | Reads `tasks.md` and works through unchecked tasks, marking them complete as it goes. Pauses on blockers. | After `tasks.md` exists and you are ready to implement. |
| `verify` | `/opsx:verify [<name>]` | Checks that the implementation matches the change artifacts before archiving. Flags gaps between tasks.md and actual code. | After implementation, before archiving. |
| `sync` | `/opsx:sync [<name>]` | Merges delta specs from the change into `openspec/specs/` without archiving the change. | When you want to update main specs mid-change or from a parallel branch. |
| `archive` | `/opsx:archive <name>` | Merges specs, marks change complete, and moves it to the archive. Requires tasks complete. | Final step once implementation and verification are done. |
| `bulk-archive` | `/opsx:bulk-archive` | Archives multiple completed changes in one operation. | When several parallel changes all finished at the same time. |
| `onboard` | `/opsx:onboard` | Walks through OpenSpec setup for a project: creates `openspec/`, writes `config.yaml`, explains the schema choices. | Once per project, when first adopting OpenSpec. |

---

## 5. Common Workflows

### Starting a new feature (full intent-driven)

```
/opsx:explore                      # optional — stress-test the idea first
/opsx:new customer-portal          # creates openspec/changes/customer-portal/
/opsx:continue                     # grill-me fires, then proposal.md is written
/opsx:continue                     # gherkin-authoring fires, specs are written
/opsx:continue                     # c4-diagrams fires, design.md is written
/opsx:continue                     # architectural-decision-records fires, adr.md written
/opsx:continue                     # tasks.md written
/opsx:apply                        # implement
git add CGControls/...
git commit -m "feat(customer-portal): implement login and dashboard"
/opsx:verify customer-portal
/opsx:archive customer-portal
```

### Quickly fixing a bug (minimalist)

```
/opsx:new fix-date-overflow --schema minimalist
/opsx:continue    # specs/fix-date-overflow/spec.md — acceptance scenario
/opsx:continue    # tasks.md — a handful of checkboxes
/opsx:apply
git commit -m "fix(jobs): correct date overflow on recurring schedules"
/opsx:archive fix-date-overflow
```

### Adding a new event to a message bus (event-driven)

```
/opsx:new job-completed-event --schema event-driven
/opsx:continue    # event-storming.md — map the domain event and its triggers
/opsx:continue    # event-modeling.md — Trigger → Command → Event → Read Model
/opsx:continue    # specs — acceptance criteria per consumer
/opsx:continue    # design.md — broker, subject naming, payload schema
/opsx:continue    # asyncapi.yaml — then run: asyncapi-cli validate asyncapi.yaml
/opsx:continue    # tasks.md
/opsx:apply
git commit -m "feat(messaging): add JobCompleted event contract"
/opsx:archive job-completed-event
```

### Adding BDD acceptance tests (behaviour-driven)

```
/opsx:new stock-check-bdd --schema behaviour-driven
/opsx:continue    # proposal.md
/opsx:continue    # specs with Gherkin scenarios (GIVEN/WHEN/THEN)
/opsx:continue    # design.md
/opsx:continue    # tasks.md — BDD gates are written in here automatically
/opsx:apply       # extracts features/*.feature, lints with gherkin-lint,
                  # sets up acceptance-tests/ Node project, then implements
git commit -m "feat(stock): stock check — acceptance tests passing"
/opsx:archive stock-check-bdd
```

### Continuing a half-finished change

```
# Resume the next pending artifact
/opsx:continue my-change-name

# Or fast-forward all remaining artifacts at once
/opsx:ff my-change-name

# Then implement
/opsx:apply my-change-name
```

### Fast-forwarding all artifacts at once

```
/opsx:new reporting-dashboard
# Changed mind — want everything drafted immediately
/opsx:ff reporting-dashboard    # generates proposal → specs → design → adr → tasks in one pass
/opsx:apply
```

### Verifying implementation before archiving

```
/opsx:verify my-change

# If verify flags gaps, fix them, then re-run:
/opsx:verify my-change

# Once clean:
/opsx:archive my-change
```

### Archiving multiple completed changes

```
# When several changes all finished in parallel
/opsx:bulk-archive
# Prompts for which completed changes to archive, then merges all specs in one pass
```

---

## 6. Config Reference

**File:** `openspec/config.yaml`

```yaml
# Default schema used by /opsx:new when --schema is not specified
schema: intent-driven

# Project context injected into every artifact prompt.
# Keeps all generated content aligned with the tech stack and conventions.
context: |
  Tech stack: ASP.NET Core 10 MVC, EF Core + Dapper, Razor views,
              DevExtreme / ComponentOne / jQuery, xUnit
  Language: C#
  App root: CGControls/
  Naming: PascalCase for types and methods, snake_case for SQL columns
  Commits: conventional commits (feat/fix/chore/plan/docs)
  Domain: field-service management — jobs, quotes, staff scheduling, stock, calendar

# rules: per-artifact skill triggers.
# When a rule is set for an artifact, the named skill fires automatically
# before that artifact is generated. Remove or comment out to disable.
rules:
  proposal:
    - Must use grill-me skill             # interviews you to sharpen scope first
  spec:
    - Must use gherkin-authoring skill    # enforces GIVEN/WHEN/THEN structure
  design:
    - Must use c4-diagrams skill          # generates C4 architecture diagrams
  adr:
    - Must use architectural-decision-records skill  # ADR review and formatting
```

### Rules → Skills Mapping

| Artifact | Rule (as written in config) | Skill invoked | Effect |
|---|---|---|---|
| `proposal` | `Must use grill-me skill` | `grill-me` | Relentless Q&A to surface assumptions before writing |
| `spec` | `Must use gherkin-authoring skill` | `gherkin-authoring` | Enforces Gherkin GIVEN/WHEN/THEN in all scenarios |
| `design` | `Must use c4-diagrams skill` | `c4-diagrams` | Produces C4 context/container/component diagrams |
| `adr` | `Must use architectural-decision-records skill` | `architectural-decision-records` | Formats decisions as proper MADR-style ADRs |

To disable a rule, comment it out. To add adversarial review across all artifacts, uncomment
the `adversarial-authoring` entries shown in the commented-out block above the active rules.

---

## 7. Commit Convention

OpenSpec changes produce commits at two stages: planning (artifacts) and implementation (code).

| Stage | Prefix | Scope convention | Example |
|---|---|---|---|
| Planning artifacts committed | `plan` | `opsx:propose` or `opsx:new` | `plan(opsx:propose): add-customer-portal` |
| Feature implementation | `feat` | module or area | `feat(customer-portal): implement login flow` |
| Bug fix implementation | `fix` | module or area | `fix(jobs): correct date calculation on recurring jobs` |
| Housekeeping / archive | `chore` | `opsx:archive` | `chore(opsx:archive): add-customer-portal` |
| Documentation only | `docs` | module or area | `docs(api): update stock endpoint reference` |

**Scope tips:**
- Use the change name as scope for planning commits: `plan(opsx:propose): stock-reorder`
- Use the functional area for implementation commits: `feat(stock): add reorder threshold check`
- Mark breaking changes in the commit body with `BREAKING CHANGE:` on its own line

---

## 8. Troubleshooting

### Validation errors

```bash
# Validate the full change against its schema
openspec validate <change-name> --type change

# Strict mode — also checks scenario heading format (#### required)
openspec validate <change-name> --type change --strict

# Validate a single spec file against the spec schema
openspec schema validate openspec/changes/<change-name>/specs/<capability>/spec.md
```

**Most common spec validation errors:**

| Error | Cause | Fix |
|---|---|---|
| `Scenario heading must be ####` | Used `###` for a scenario | Change to `#### Scenario: <name>` (exactly 4 hashes) |
| `Requirement has no scenario` | Requirement block has no `####` child | Add at least one `#### Scenario:` under the requirement |
| `Unknown delta operation` | Incorrect `##` header (e.g. `## CHANGED`) | Use exactly: `## ADDED Requirements`, `## MODIFIED Requirements`, `## REMOVED Requirements`, `## RENAMED Requirements` |
| `MODIFIED requirement missing full content` | Partial MODIFIED block | Copy the entire requirement block from the existing spec, then edit it |

---

### Schema not found

```
Error: Schema 'my-schema' not found
```

Valid schema names are: `minimalist`, `spec-driven`, `spec-driven-with-adr`,
`behaviour-driven`, `intent-driven`, `event-driven`.

Check spelling. Schema names are lowercase with hyphens.

---

### Artifact blocked — dependency not done

```
Cannot generate 'tasks' — requires: [specs, adr]
```

One or more upstream artifacts are missing. Run `/opsx:continue` for each preceding artifact
in order. Check `openspec/changes/<change-name>/` to see which files already exist.

---

### Apply shows 0 tasks / 0 tasks remaining

`/opsx:apply` tracks only lines that match `- [ ]` exactly. If tasks were written without the
checkbox format, they are invisible to apply.

Open `openspec/changes/<change-name>/tasks.md` and verify every task line looks like:

```markdown
- [ ] 1.1 Task description here
```

Not:
```markdown
* Task description    ← bullet, not checkbox — not tracked
- Task description    ← dash without checkbox — not tracked
- [x] Task           ← already marked done — skipped
```

---

### AsyncAPI validation fails (event-driven schema)

The `asyncapi` artifact is gated on `asyncapi-cli validate asyncapi.yaml` passing. If it fails:

```bash
asyncapi-cli validate openspec/changes/<change-name>/asyncapi.yaml
```

Fix the errors reported by the CLI, then re-run `/opsx:continue` to regenerate or hand-edit
`asyncapi.yaml` until validation is clean. Do not proceed to tasks until it passes.

---

### gherkin-lint errors (behaviour-driven schema)

The behaviour-driven apply gate requires zero lint errors before committing feature extraction.

```bash
# From the acceptance-tests/ directory
npx gherkin-lint ../features/*.feature
```

Fix all lint errors in the `.feature` files (not in the spec.md source — the `.feature` files
are what get linted). Common issues: missing `Feature:` header, empty scenarios, invalid step
keywords (must be `Given`/`When`/`Then`/`And`/`But` — not `GIVEN`/`WHEN`/`THEN` in `.feature` files).
