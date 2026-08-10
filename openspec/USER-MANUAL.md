# OpenSpec PDLC — Complete User Manual

> **Active schema:** see `openspec/config.yaml` — the active `schema:` line (uncommented)
> **Config:** `openspec/config.yaml`

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Schema Catalogue](#2-schema-catalogue)
3. [Skills Catalogue](#3-skills-catalogue)
4. [Artifact Reference](#4-artifact-reference)
5. [Disciplines](#5-disciplines)
6. [Folder Structure](#6-folder-structure)

---

## 1. Introduction

### What is the PDLC?

The Product Development Lifecycle (PDLC) in this project is implemented through **OpenSpec** — a structured system for planning, specifying, implementing, and archiving code changes. Every meaningful change to the codebase passes through a planning phase before any code is written.

The core idea is simple: **agree before you build**. Instead of jumping straight to implementation, the PDLC requires you to capture the *why* (proposal), the *what* (specs), optionally the *how* (design) and *decisions* (adr), and then the *steps* (tasks). Only after all planning artifacts are complete does implementation begin.

### Philosophy

**Spec-first.** The planning artifacts are not bureaucracy — they are the mechanism by which you clarify your own thinking. Writing a proposal forces you to articulate why a change is worth doing. Writing specs forces you to think about observable behaviour before writing code. Writing tasks forces you to think about sequencing and dependencies.

**Iterative.** Artifacts are not frozen contracts. If implementation reveals a design flaw, update the design artifact. If the proposal scope changes, update the proposal. The artifacts evolve with your understanding.

**Permanent record.** The `openspec/specs/` folder grows over time as a living specification of the system. The `adr/` folder preserves architectural decisions forever. When a future developer asks "why does this work this way?", the answer is in the archive.

### How the System Works

```
Idea
  |
  v
/opsx:propose  ─────────────────────────────────┐
  |                                              |
  v                                              |
openspec/changes/<name>/                         |
  proposal.md       ← WHY                       |
  specs/<cap>/spec.md ← WHAT                    |
  design.md         ← HOW (optional)            |
  adr.md            ← DECISIONS                 |
  tasks.md          ← STEPS                     |
  |                                              |
  v                                              |
/opsx:apply                                      |
  |                                              |
  (implementation: edit real code files)         |
  |                                              |
  v                                              |
/opsx:verify  (optional but recommended)         |
  |                                              |
  v                                              |
/opsx:archive ────────────────────────────────>  |
  |                                              |
  Syncs delta specs to openspec/specs/<cap>/     |
  Moves change to openspec/changes/archive/      |
```

Every change produces a **change directory** under `openspec/changes/<name>/`. This directory holds all the planning artifacts for that change. When the change is archived, the directory moves to `openspec/changes/archive/YYYY-MM-DD-<name>/`.

### The Three-Commit Discipline

The workflow expects **exactly three commits** per change. Each commit captures a distinct phase:

```
plan(opsx:propose): <change-name>    ← all planning artifacts created
feat(opsx:apply): <change-name>      ← all code implementation done
chore(opsx:archive): <change-name>   ← change archived, specs synced
```

After `/opsx:propose` completes, say **"commit this"** and it commits only the planning files.
After `/opsx:apply` completes, say **"commit this"** and it commits only the code changes.
After `/opsx:archive` completes, say **"commit this"** and it commits the archive move and spec sync.

Never mix planning artifacts and code changes in the same commit. The three-commit structure makes the git history readable as a product history, not just a code history.

---

## 2. Schema Catalogue

A **schema** is a blueprint that defines which artifacts a change must produce, in what order, and what rules apply to each artifact. The schema is set in `openspec/config.yaml`. Changing the schema changes the entire artifact lifecycle for new changes.

Ten schemas are available — six vendor/community schemas and four project-custom schemas. Choose based on the nature of the change.

---

### 2.1 spec-driven

**When to use:** Standard workhorse for medium-complexity changes — new features, behaviour changes, or anything that warrants a written spec but doesn't need ADR-level architectural decisions recorded permanently. This is the baseline schema from which others extend.

**Artifact lifecycle:**

```
proposal.md
    |
    +--------> specs/<capability>/spec.md
    |
    +--------> design.md (optional, skip if simple)
                    |
    +---------------+
    |
    v
tasks.md
    |
    v
  APPLY
```

**Artifact table:**

| Artifact | Answers | Produces |
|---|---|---|
| `proposal.md` | Why is this change needed? What changes? Which capabilities? | The contract that drives specs |
| `specs/<cap>/spec.md` | What must the system do? Delta from current behaviour | Testable requirement + scenario blocks |
| `design.md` | How will it be implemented? What trade-offs? | Technical decision record for this change |
| `tasks.md` | What are the implementation steps in order? | Checkbox list for `/opsx:apply` |

**Skills wired to this schema:** None auto-wired by default (schema is bare). Skills apply when `openspec/config.yaml` adds rules.

**Typical commit sequence:**

```
plan(opsx:propose): add-csv-export
feat(opsx:apply): add-csv-export
chore(opsx:archive): add-csv-export
```

---

### 2.2 minimalist

**When to use:** Well-scoped, low-risk changes that benefit from a written spec but don't need a proposal or design document. The spec IS the proposal — you know what you're building, you just need to define it precisely.

**Artifact lifecycle:**

```
specs/<capability>/spec.md
    |
    v
tasks.md
    |
    v
  APPLY
```

**Artifact table:**

| Artifact | Answers | Produces |
|---|---|---|
| `specs/<cap>/spec.md` | What must the system do? (user story + Given/When/Then) | Spec with acceptance criteria |
| `tasks.md` | What are the implementation steps? | Checkbox list for `/opsx:apply` |

**Skills wired to this schema:** None by default.

**Typical commit sequence:**

```
plan(opsx:propose): add-pagination-to-jobs-grid
feat(opsx:apply): add-pagination-to-jobs-grid
chore(opsx:archive): add-pagination-to-jobs-grid
```

---

### 2.4 behaviour-driven

**When to use:** Changes that benefit from end-to-end BDD gates. Use when the team wants executable acceptance tests (Cucumber.js) extracted from specs before implementation starts. Best for user-facing feature changes where test coverage is a hard requirement.

**Artifact lifecycle:**

```
proposal.md
    |
    v
specs/<capability>/spec.md  ← Gherkin-style, precise enough for feature extraction
    |
    +--------> design.md (optional)
    |               |
    +---------------+
    |
    v
tasks.md  ← MUST include: feature extraction gate, Cucumber setup, step definitions
    |          failing acceptance gate, implementation loop, verification
    v
  APPLY  ← enforces gate order: feature lint → failing tests → implementation → passing tests
```

**Artifact table:**

| Artifact | Answers | Produces |
|---|---|---|
| `proposal.md` | Why? What capabilities? | Contract for specs |
| `specs/<cap>/spec.md` | What must the system do (precise enough for .feature extraction)? | Gherkin requirements ready for Cucumber |
| `design.md` | How? (optional) | Technical decisions |
| `tasks.md` | What are the BDD-gated implementation steps? | Feature extraction tasks, Cucumber setup, acceptance loops, implementation tasks |

**BDD gate contract in tasks.md:**
1. Extract `features/*.feature` files from specs
2. Run `gherkin-lint` — zero errors required before first commit
3. Configure `acceptance-tests/` Node project (Cucumber.js, HTML report)
4. Commit failing acceptance test setup
5. Implement in scenario slices
6. Verify all acceptance tests pass

**Skills wired to this schema:** `gherkin-authoring` is highly recommended for specs under this schema.

**Typical commit sequence:**

```
plan(opsx:propose): add-real-time-job-status
feat(opsx:apply): add-real-time-job-status   ← multiple sub-commits during BDD loop
chore(opsx:archive): add-real-time-job-status
```

---

### 2.5 spec-driven-with-adr

**When to use:** Default for architectural changes — new patterns, technology choices, cross-cutting concerns, or changes that introduce commitments that future changes must respect. Identical to `spec-driven` but with a mandatory `adr` artifact step that may create permanent ADR files in `adr/`.

**Artifact lifecycle:**

```
proposal.md
    |
    +--------> specs/<capability>/spec.md
    |
    +--------> design.md (reads existing ADRs first)
                    |
                    v
                adr.md (change-local manifest; may create repo-level adr/NNNN-*.md)
                    |
    +---------------+
    |
    v
tasks.md
    |
    v
  APPLY
```

**Artifact table:**

| Artifact | Answers | Produces |
|---|---|---|
| `proposal.md` | Why? What capabilities? | Foundation for all other artifacts |
| `specs/<cap>/spec.md` | What must the system do? | Delta spec with requirements and scenarios |
| `design.md` | How? What ADRs constrain this? What decisions emerge? | Technical design respecting in-force ADRs |
| `adr.md` | Which architectural decisions from design warrant a permanent ADR? | Change-local manifest + optional `adr/NNNN-*.md` files |
| `tasks.md` | What are the implementation steps honouring all ADRs? | Checkbox implementation list |

**Skills wired to this schema:** `architectural-decision-records` skill applies to the `adr` artifact.

**Typical commit sequence:**

```
plan(opsx:propose): migrate-to-repository-pattern
feat(opsx:apply): migrate-to-repository-pattern
chore(opsx:archive): migrate-to-repository-pattern
```

---

### 2.6 intent-driven

**When to use:** This project's **active schema**. Intent-driven is a full-fidelity workflow combining proposal, Gherkin-style specs, optional design, ADR manifest, and tasks. Use for any change that affects observable system behaviour. The name reflects the focus on capturing *intent* (what the system should do and why) before any implementation detail.

**Artifact lifecycle:**

```
proposal.md   ← WHY: problem, scope, capabilities affected
    |
    +--------> specs/<cap>/spec.md   ← WHAT: Gherkin-style requirements + scenarios
    |
    +--------> design.md             ← HOW: decisions, trade-offs, risks (skip if simple)
                    |
                    v
                adr.md               ← DECISIONS: per-change manifest; creates adr/NNNN-*.md if needed
                    |
    +---------------+
    |
    v
tasks.md     ← STEPS: ordered checkbox implementation list
    |
    v
  APPLY
```

**Dependency chain:**

```
proposal  →  specs  ─────────────┐
          →  design  →  adr  ────┤
                                 v
                               tasks  →  APPLY
```

**Artifact table:**

| # | Artifact | Answers | What it produces |
|---|---|---|---|
| 1 | `proposal.md` | Why is this change needed? What capabilities are affected? | Problem statement, capability list (drives spec file names) |
| 2 | `specs/<cap>/spec.md` | What must each capability do after this change? | Delta spec with `### Requirement:` + `#### Scenario:` blocks |
| 3 | `design.md` | How will this be implemented? What ADRs are in force? | Technical decisions, risks, migration plan, open questions |
| 4 | `adr.md` | Were any durable architectural decisions made? | Change-local review manifest; `adr/NNNN-*.md` only if warranted |
| 5 | `tasks.md` | What are the implementation steps, in order? | Ordered `- [ ] N.M` checkbox list parsed by `/opsx:apply` |

**Skills wired in this project's config.yaml:**

| Artifact | Skill | What it contributes |
|---|---|---|
| `proposal` | `grill-me` | Interviews you about the plan before writing — surfaces gaps and assumptions |
| `design` | `c4-diagrams` | Adds C4-style architecture diagrams to the design document |
| `adr` | `architectural-decision-records` | Ensures ADR template correctness and review checklist compliance |
| `spec` | `gherkin-authoring` | Produces domain-language Gherkin with observable outcomes |

**Typical commit sequence:**

```
plan(opsx:propose): add-mileage-from-division-in-quotes
feat(opsx:apply): add-mileage-from-division-in-quotes
chore(opsx:archive): add-mileage-from-division-in-quotes
```

---

### 2.7 event-driven

**When to use:** Messaging, eventing, or async systems. Use when the change involves domain events, commands, event sourcing, message brokers, NATS, Kafka, or any event-driven architecture. The schema gates implementation behind a validated AsyncAPI specification.

**Artifact lifecycle:**

```
event-storming.md   ← discovery: domain events, commands, actors, boundaries
    |
    v
event-modeling.md   ← structure: Trigger → Command → Event → Read Model swim lanes
    |
    v
specs/<cap>/spec.md  ← user-story requirements traceable to storming/modeling
    |
    v
design.md           ← broker choice, subject naming, payload format, security
    |
    v
asyncapi.yaml       ← validated AsyncAPI spec (must pass asyncapi-cli validate)
    |
    v
tasks.md            ← implementation only after validated AsyncAPI
    |
    v
  APPLY
```

**Artifact table:**

| Artifact | Answers | Produces |
|---|---|---|
| `event-storming.md` | What domain events, commands, actors, and boundaries exist? | Discovery map with hotspots and open questions |
| `event-modeling.md` | How do events flow (Trigger → Command → Event → Read Model)? | Mermaid flow diagrams, explicit dependencies |
| `specs/<cap>/spec.md` | What does each user story require? | User-story + Given/When/Then acceptance criteria |
| `design.md` | How is the event system architected? | Broker choices, naming conventions, security controls |
| `asyncapi.yaml` | What is the machine-readable API contract for the event system? | Validated AsyncAPI 2.x/3.x specification |
| `tasks.md` | What are the implementation steps? | Checkbox list, preconditioned on validated AsyncAPI |

**Skills wired to this schema:** None auto-wired by default.

**Typical commit sequence:**

```
plan(opsx:propose): add-job-status-event-stream
feat(opsx:apply): add-job-status-event-stream
chore(opsx:archive): add-job-status-event-stream
```

---

### 2.8 spec-driven-ui *(project-custom)*

**When to use:** Any change that introduces or modifies a user-facing screen, interaction, or visible flow. The wireframe is the first artifact — the spec is written against it, not before it. Never use this for backend-only or API-only changes.

**Artifact lifecycle:**

```
wireframe.md   ← signed off by BA + stakeholder before anything else is written
    |
    v
proposal.md    ← scoped against the signed-off wireframe
    |
    +--------> design.md (includes Security Considerations + Wireframe Deviations)
    |
    v
specs/<cap>/spec.md   ← every scenario references a wireframe screen ID (sc1, sc2…)
    |
    v
tasks.md   ← backend/shared tasks BEFORE page-specific tasks
    |
    v
  APPLY
```

**Artifact table:**

| Artifact | Answers | Produces |
|---|---|---|
| `wireframe.md` | What does each screen look like and how does it flow? | Screen inventory, scenario mapping, signed-off UI target |
| `proposal.md` | What is being built and why, grounded in the wireframe? | Scoped change with Impact Scope table |
| `design.md` | How will it be implemented? What deviates from the wireframe? | Technical decisions + Security Considerations + Wireframe Deviations section |
| `specs/<cap>/spec.md` | What must each screen do? | Gherkin scenarios referencing wireframe screen IDs |
| `tasks.md` | What are the implementation steps in order? | Shared-component tasks first, then page-specific tasks |

**Skills wired to this schema (in project config.yaml):** `adversarial-authoring` on proposal and design, `gherkin-authoring` on specs, `security-review` on design.

**Hard gate:** Wireframe must be signed off before the proposal is written. The spec must not be started until the wireframe is locked.

**Typical commit sequence:**

```
plan(opsx:propose): add-templates-panel
feat(opsx:apply): add-templates-panel
chore(opsx:archive): add-templates-panel
```

---

### 2.9 bespoke-discovery *(project-custom)*

**When to use:** New bespoke/custom client projects where scope must be agreed externally before any build begins. Discovery and wireframing happen first; the proposal doubles as the Statement of Work (SOW) that the customer signs off. The Gherkin scenarios in `spec.md` double as UAT acceptance tests.

**Artifact lifecycle:**

```
wireframe.md   ← customer reviews and signs off before SOW is written
    |
    v
proposal.md    ← IS the SOW — customer commercial sign-off required
    |
    v
design.md      ← includes Risk Register + Change Request Triggers + Security Considerations
    |
    v
specs/<cap>/spec.md   ← readable by the customer; doubles as UAT acceptance tests
    |
    v
tasks.md   ← grouped by deliverable/sprint; flags external-input dependencies
    |
    v
  APPLY
```

**Artifact table:**

| Artifact | Answers | Produces |
|---|---|---|
| `wireframe.md` | What are the screens, flows, and customer feedback? | Signed-off wireframes + Customer Feedback Log |
| `proposal.md` | What is in scope, what is explicitly out, and what does it cost? | SOW — the commercial and scope contract |
| `design.md` | How will it be built? What could go wrong? | Technical design + Risk Register + Change Request Triggers |
| `specs/<cap>/spec.md` | What must each capability do, in plain customer-readable language? | Gherkin UAT acceptance criteria |
| `tasks.md` | What are the delivery steps by sprint/deliverable? | Task list with external-dependency flags |

**Skills wired to this schema (in project config.yaml):** `adversarial-authoring` on proposal and design, `gherkin-authoring` on specs, `security-review` on design.

**Two customer sign-off gates:**
1. Wireframe + SOW — before any build
2. UAT on the Gherkin scenarios — on delivery of each sprint

**Typical commit sequence:**

```
plan(opsx:propose): acme-buyer-registration
feat(opsx:apply): acme-buyer-registration
chore(opsx:archive): acme-buyer-registration
```

---

### 2.10 bespoke-proposal *(project-custom)*

**When to use:** Bespoke client work where the scope is already well understood and a wireframe phase is not needed. Lighter than `bespoke-discovery` — starts directly with the SOW proposal. Use when the brief is clear, the customer has already been consulted informally, and UI uncertainty is low.

**Artifact lifecycle:**

```
proposal.md    ← IS the SOW — Scope-Out section is mandatory
    |
    v
design.md      ← includes Risk Register + Change Request Triggers + Security Considerations
    |
    v
specs/<cap>/spec.md   ← customer-readable; doubles as UAT acceptance tests
    |
    v
tasks.md
    |
    v
  APPLY
```

**Artifact table:**

| Artifact | Answers | Produces |
|---|---|---|
| `proposal.md` | What is in scope and explicitly out of scope? | SOW — the commercial and scope contract (no wireframe needed) |
| `design.md` | How will it be built? What risks and change triggers exist? | Technical design + Risk Register |
| `specs/<cap>/spec.md` | What must each capability do, in plain customer-readable language? | Gherkin UAT acceptance criteria |
| `tasks.md` | What are the implementation steps? | Task list with external-dependency flags |

**Skills wired to this schema (in project config.yaml):** `adversarial-authoring` on proposal and design, `gherkin-authoring` on specs, `security-review` on design.

**When to use bespoke-proposal vs bespoke-discovery:** use `bespoke-discovery` when there is any meaningful UI uncertainty or when you need the customer to see wireframes before agreeing scope. Use `bespoke-proposal` when scope is already agreed informally and you just need to formalise it in writing.

---

### 2.11 greenfield-bootstrap *(project-custom)*

**When to use:** Brand-new projects with no existing codebase. The first change is always a foundation scaffold — tech stack, project structure, auth, database layer, CI/CD — never a feature. Use this before switching to `spec-driven` or `intent-driven` for feature work.

**Artifact lifecycle:**

```
scaffold.md    ← tech stack decisions with rationale + rejected alternatives
    |           (domain concepts seeded into glossary before specs are written)
    v
specs/<cap>/spec.md   ← foundation specs (auth, data model, core API)
    |
    v
design.md      ← architecture decisions + Security Considerations
    |
    v
tasks.md       ← strictly ordered: init → bootstrap → database → auth → capabilities → verification
    |
    v
  APPLY   ← build and test after every task group before proceeding to the next
```

**Artifact table:**

| Artifact | Answers | Produces |
|---|---|---|
| `scaffold.md` | What is the tech stack and why? What is the project structure? | Stack decisions table, project tree, domain concepts, non-goals |
| `specs/<cap>/spec.md` | What must the foundation provide? | Foundation specs (auth flows, data model contracts, API shapes) |
| `design.md` | How is the architecture structured? | C4 container sketch + Security Considerations |
| `tasks.md` | What are the ordered setup and bootstrap steps? | Sequential task list: init → bootstrap → database → auth → capabilities → DoD |

**Skills wired to this schema (in project config.yaml):** `adversarial-authoring` on scaffold and design, `gherkin-authoring` and `adversarial-authoring` on specs, `security-review` on design.

**Hard rule:** Never run a feature change against an empty folder. Complete the greenfield-bootstrap change and archive it before proposing any feature.

**Typical commit sequence:**

```
plan(opsx:propose): nfcwine-platform-scaffold
feat(opsx:apply): nfcwine-platform-scaffold
chore(opsx:archive): nfcwine-platform-scaffold
```

---

## 3. Skills Catalogue

Skills are specialised behaviour modules that activate in two ways:
- **Auto-triggered:** when `openspec/config.yaml` lists a skill under `rules.<artifact>`, the skill fires automatically when that artifact is being created.
- **Manually invoked:** by typing the skill name or a trigger phrase in conversation.

---

### 3.1 Quality Skills (Domain Expertise)

#### grill-me

**What it does:** Interviews you relentlessly about your plan before anything is written. It walks down every branch of the decision tree — problem statement, scope, assumptions, risks, alternatives, edge cases — one question at a time. For each question, it provides its own recommended answer so the conversation moves fast. The goal is to surface gaps and wrong assumptions before they become encoded in a proposal.

**When it fires:** Manually, OR auto-triggered in this project when the `proposal` artifact is being created (see `config.yaml` rules). Say "grill me about this" before `/opsx:propose` to invoke manually.

**What it produces:** A shared understanding between you and the AI. The output is not a file — it's the clarified mental model that feeds a better proposal.

**Example use case:** You're about to propose adding mileage tracking to quotes. You say "grill me". The skill asks: "Is this for all quotes or only quotes that have a job attached?" — a question you hadn't considered. The proposal that follows is sharper.

---

#### c4-diagrams

**What it does:** Creates C4-style architecture diagrams in ASCII or Mermaid. It establishes purpose, format (ASCII vs Mermaid), and rigor level first, then inspects entry points, runtime boundaries, integrations, and persistence before drawing. It draws only the C4 levels that answer the actual question (context, container, component, code, dynamic, or deployment) and always accompanies diagrams with explanation bullets covering boundaries, responsibilities, key relationships, assumptions, and open questions.

**When it fires:** Auto-triggered in this project when the `design` artifact is being created. Manually invoke with: "draw a C4 diagram of this".

**What it produces:** ASCII or Mermaid diagram embedded in `design.md`, plus a brief explanation of the diagram.

**Example use case:** You're designing a new integration between the Jobs module and an external scheduling service. The skill draws a container diagram showing the Jobs controller, the scheduling service boundary, and the data flow — giving you something concrete to critique before writing any code.

---

#### architectural-decision-records

**What it does:** Applies ADR best practices to any decision being recorded. It identifies the single decision to capture (splitting bundles of decisions into separate ADRs), selects the right template (MADR full, MADR minimal, Nygard, Y-Statement), captures context, rejected options, rationale tied to requirements, honest downsides, and follow-up work. It enforces the immutability rule: old ADRs are never edited, only superseded.

**When it fires:** Auto-triggered in this project when the `adr` artifact is being created. Manually invoke when documenting any significant architectural decision.

**What it produces:** Correctly structured ADR files with the right template, honest tradeoffs, and explicit status. For the `adr` artifact in the PDLC, it produces both the change-local `adr.md` manifest and any `adr/NNNN-*.md` files.

**Example use case:** The design for a data migration includes a decision to use Dapper over EF Core for bulk operations. The skill ensures the ADR captures why EF Core was rejected (performance at 50k rows), what the consequences are (more SQL to maintain), and what the follow-up work is (query performance monitoring).

---

#### gherkin-authoring

**What it does:** Writes Gherkin scenarios that describe business behaviour in domain language, with observable outcomes. It enforces: Given (known state, no user interaction), When (one meaningful event), Then (observable outcome visible to a user or system). It avoids implementation details — no database table names, no UI selectors, no HTTP methods — unless those are part of the domain contract. It keeps scenarios to 3–5 steps. When Gherkin is inside a Markdown wrapper (as in OpenSpec specs), it preserves the surrounding heading and prose.

**When it fires:** Auto-triggered in this project when the `spec` artifact is being created. Manually invoke when reviewing or improving any Gherkin.

**What it produces:** Well-formed Gherkin scenarios within the `#### Scenario:` blocks of `spec.md` files. For the behaviour-driven schema, it produces scenarios precise enough to extract into `.feature` files.

**Example use case:** Your first draft of a spec says "WHEN user clicks Submit THEN the form is saved". The skill rewrites it as "WHEN a quote is submitted for approval THEN the system records the submission date and notifies the assigned estimator" — behaviour, not mechanics.

---

#### adversarial-authoring

**What it does:** Reduces single-perspective bias by running two subagents for each artifact: an **author** who produces the best draft, and an **adversarial reviewer** who hunts for gaps, ambiguities, over-specification, missing edge cases, wrong assumptions, and template violations. The primary agent reconciles the review — accepting improvements, rejecting suggestions that conflict with the user request or project rules, and deferring unresolvable disagreements to you. A sibling `*.council.md` file records the author summary, reviewer challenges, resolutions, and remaining risks.

**When it fires:** When `openspec/config.yaml` lists `Must use adversarial-authoring skill` in an artifact's rules. (In this project, the rules for proposal, specs, design, and adr are currently commented out — see config.yaml — but can be re-enabled.)

**What it produces:** The artifact file at its target path, plus a sibling `<artifact>.council.md` with the audit trail.

**Example use case:** You propose adding a new API endpoint. The author drafts the proposal. The reviewer challenges: "The proposal doesn't mention rate limiting, and the existing API layer has rate limit constraints." The primary agent adds a line to the Impact section. The council notes record the exchange.

---

#### glossary

**What it does:** Keeps domain and technical terminology consistent across all specification artifacts. It reads `glossary/business.md` and `glossary/technical.md`, extracts domain-specific, abbreviated, or overloaded terms from the artifact being reviewed, compares them against existing glossary entries, updates the glossary with missing or unclear terms, and suggests changes to the artifact so it uses glossary terms consistently.

**When it fires:** Manually. Say "review this against the glossary" or "update the glossary with terms from this spec."

**What it produces:** Updates to `glossary/business.md` and/or `glossary/technical.md`, plus suggested wording changes in the artifact.

**Example use case:** Two specs use "job" and "work order" interchangeably. The skill flags the inconsistency, adds "Job" to the business glossary as the preferred term with "Work Order" under "Avoid", and suggests updating the spec that used "work order".

---

### 3.2 Workflow Skills (PDLC Commands)

#### explore (`/opsx:explore`)

**What it does:** Enters a free-form thinking mode — a thinking partner for investigating problems, comparing options, mapping architecture, and clarifying requirements before committing to a change. It reads the codebase, draws ASCII diagrams, challenges assumptions, and surfaces risks. It explicitly does NOT write code or create implementation files. It CAN create OpenSpec planning artifacts (proposal, design, specs) if you ask.

**When it fires:** Manually via `/opsx:explore` or `/openspec-explore`.

**What it produces:** Diagrams, comparison tables, option analyses, identified unknowns — and optionally, planning artifact files if you decide to capture decisions.

**Example:** You're unsure whether to add a new table or extend an existing one for a feature. `/opsx:explore` maps the existing schema, draws the two options, and identifies that option B creates a naming conflict with an existing foreign key. You exit explore with a clear direction before writing any artifacts.

---

#### new (`/opsx:new`)

**What it does:** Creates a new change directory using `openspec new change "<name>"`, shows you the first artifact's template and instructions, then **stops**. It does not create any artifact content. It is the step-by-step entry point when you want to author each artifact yourself with full control.

**When it fires:** Manually via `/opsx:new <name>`.

**What it produces:** A scaffolded `openspec/changes/<name>/` directory with `.openspec.yaml`, and the template for the first artifact displayed for your review.

**Example:** You want to author every artifact carefully, reviewing each before moving to the next. You run `/opsx:new add-stock-alerts`, read the proposal template, draft the proposal yourself, then call `/opsx:continue` for each subsequent artifact.

---

#### propose (`/opsx:propose`)

**What it does:** The "all-in-one" entry point for starting a change. It creates the change directory with `openspec new change "<name>"`, then generates **all artifacts in dependency order** until the change is apply-ready. After each artifact, it re-checks status and continues until all `applyRequires` artifacts are complete. If context is unclear at any point, it asks you rather than guessing.

**When it fires:** Manually via `/opsx:propose <description>`.

**What it produces:** A fully populated change directory with all required artifacts (proposal, specs, design, adr, tasks for the intent-driven schema). The change is ready for `/opsx:apply` immediately.

**Example:** `/opsx:propose Add mileage from division in quotes` — the system creates the change, asks any clarifying questions, fires `grill-me` on the proposal (per this project's config), creates specs using `gherkin-authoring`, adds a C4 diagram to design, runs the ADR review, and produces tasks. One command, five artifacts.

---

#### continue (`/opsx:continue`)

**What it does:** Creates the **next single artifact** in the dependency chain for an existing change. Checks `openspec status` to find the first artifact with `status: "ready"`, fetches its instructions, reads dependency artifacts for context, and writes the next artifact. Stops after one artifact so you can review before proceeding.

**When it fires:** Manually via `/opsx:continue [name]`.

**What it produces:** One artifact file. Shows what was created, what it unlocked, and prompts you to continue.

**Example:** You ran `/opsx:new add-export-feature`, wrote the proposal yourself, and now want the AI to draft the specs. You run `/opsx:continue` and it produces `specs/data-export/spec.md`, then stops.

---

#### ff (`/opsx:ff` — fast-forward)

**What it does:** Identical behaviour to `/opsx:propose` but for an **existing change** that already has a directory. Fast-forwards through all remaining artifacts until the change is apply-ready. Unlike `/opsx:continue` which creates one artifact at a time, `ff` runs the full loop until done.

**When it fires:** Manually via `/opsx:ff <name>`.

**What it produces:** All remaining artifacts for the change, created in dependency order.

**Example:** You created a change with `/opsx:new`, hand-wrote the proposal, and now want the AI to generate everything else. You run `/opsx:ff add-export-feature` and it creates specs, design, adr, and tasks in sequence.

---

#### apply (`/opsx:apply`)

**What it does:** Implements the change. Reads `openspec status` to understand the schema, then reads `openspec instructions apply` to get the context files and task list. Reads all context files (proposal, specs, design, tasks). Works through each pending task in order, edits the real code files, and marks each task complete (`- [ ]` → `- [x]`) immediately after finishing it. Pauses and asks for guidance if a task is unclear, if implementation reveals a design issue, or if a blocker is encountered.

**When it fires:** Manually via `/opsx:apply [name]`.

**What it produces:** Code changes across the codebase, with all task checkboxes marked complete in `tasks.md`.

**Example:** After `/opsx:propose` creates five artifacts, you run `/opsx:apply`. It announces each task, makes the code changes, ticks the box, and moves to the next. When it hits an ambiguous task it pauses and says "Task 3.2 says 'add validation' but the spec has two validation rules — which should I implement first?"

---

#### verify (`/opsx:verify`)

**What it does:** Validates implementation against the change artifacts across three dimensions: **Completeness** (all tasks ticked, all requirements implemented), **Correctness** (implementation matches spec scenarios, no divergence from design decisions), and **Coherence** (code follows project patterns). Produces a scorecard with CRITICAL (must fix before archive), WARNING (should fix), and SUGGESTION (nice to fix) issues, each with specific file:line references and actionable recommendations.

**When it fires:** Manually via `/opsx:verify [name]`. Invoke before `/opsx:archive` for high-confidence changes.

**What it produces:** A verification report in the conversation, not a file. Each issue has a specific recommendation.

**Example:** After applying a change, you run `/opsx:verify`. It reports: CRITICAL — task 4.2 is still unchecked; WARNING — the `Quote Submission` scenario has no corresponding test file; SUGGESTION — the new service class doesn't follow the project's `IService` interface naming pattern.

---

#### sync (`/opsx:sync`)

**What it does:** Syncs delta specs from a change to the main `openspec/specs/<capability>/spec.md` files **without archiving**. Applies intelligent merging: ADDED requirements are appended, MODIFIED requirements are updated preserving unmentioned scenarios, REMOVED requirements are deleted, RENAMED requirements are renamed. Unlike programmatic merge, this is agent-driven — it can add a single scenario to a requirement without copying the rest.

**When it fires:** Manually via `/opsx:sync [name]`, or prompted automatically during `/opsx:archive`.

**What it produces:** Updated `openspec/specs/<cap>/spec.md` files reflecting all delta operations.

**Example:** You've implemented and verified a change. You want to update the living spec record now, before archiving, so a colleague can see the current behaviour spec. You run `/opsx:sync` and the main spec is updated. The change stays active; you archive separately later.

---

#### archive (`/opsx:archive`)

**What it does:** Finalises a completed change. Checks artifact and task completion (warns if incomplete but lets you proceed). Assesses whether delta specs need syncing to `openspec/specs/`, shows a combined sync summary, and prompts for sync. Then moves the change directory to `openspec/changes/archive/YYYY-MM-DD-<name>/`. The `.openspec.yaml` file moves with the directory.

**When it fires:** Manually via `/opsx:archive [name]`.

**What it produces:** The change directory moved to the archive, and optionally the main specs updated.

**Example:** All tasks are complete. You run `/opsx:archive`. It shows "specs/quotes/spec.md has 3 additions and 1 modification to sync". You choose "Sync now". It syncs specs and archives the change folder.

---

#### bulk-archive (`/opsx:bulk-archive`)

**What it does:** Archives multiple changes in a single operation. Lists all active changes, lets you select which to archive (one, several, or all), checks artifact and task completion for each, detects **spec conflicts** (two changes touching the same capability spec), and resolves conflicts by searching the codebase for implementation evidence — syncing only the specs that are actually implemented. Shows a consolidated status table before asking for confirmation.

**When it fires:** Manually via `/opsx:bulk-archive`.

**What it produces:** Multiple change directories moved to archive, with spec sync applied for each, conflict resolutions noted.

**Example:** Three parallel changes are complete — `schema-management`, `project-config`, and `add-oauth`. Both `schema-management` and `add-oauth` touch `specs/auth/spec.md`. The skill checks the codebase, finds OAuth is implemented but schema-management's auth change isn't yet, and syncs only the implemented one.

---

#### onboard (`/opsx:onboard`)

**What it does:** A guided tutorial that walks you through a complete change lifecycle using a real task in your codebase. It scans for TODO comments, missing error handling, type issues, and debug artifacts, presents 3–4 concrete suggestions, and walks you through explore → new → proposal → specs → design → tasks → apply → archive with narration at each step. It pauses for your review at key transitions.

**When it fires:** Manually via `/opsx:onboard`. Intended for first use.

**What it produces:** A completed change (archived) plus learned workflow knowledge.

**Example:** A new team member runs `/opsx:onboard`. The skill scans the codebase, finds a TODO comment in `QuoteController.cs`, walks them through creating a change for it, and produces a complete archived change with all artifacts.

---

## 4. Artifact Reference

### proposal.md

**What question it answers:** Why is this change being made? What changes? Which capabilities are affected?

**Required content:**
- **Why** — 1–2 sentences on the problem or opportunity. No implementation detail.
- **What Changes** — bullet list of concrete changes. Mark breaking changes `**BREAKING**`.
- **Capabilities** — the critical section. Lists which `specs/<name>/spec.md` files will be created or modified. Each capability name here creates a spec file. Names must be kebab-case.
  - **New Capabilities:** capabilities being introduced
  - **Modified Capabilities:** existing capabilities whose behaviour changes
- **Impact** — affected code, APIs, dependencies, systems.

**Format rules:**
- Keep to 1–2 pages. This is an elevator pitch, not a design document.
- Research `openspec/specs/` before listing Modified Capabilities — use the exact folder name.
- Design detail (how it works) belongs in `design.md`, not here.
- The Capabilities section drives everything downstream. Missing a capability here means no spec file gets created for it.

**Common mistakes:**
- Listing implementation choices (frameworks, SQL schemas) in the proposal. Those belong in design.
- Not researching existing specs before listing Modified Capabilities, causing name mismatches.
- Writing a Modified Capability entry for a change that is purely an implementation detail (no behaviour change visible to users).

---

### specs/\<capability\>/spec.md

**What question it answers:** What must the system do, expressed as observable behaviour?

**Required content:**
Delta headers (use exactly these `## ` headings for archive merge):
- `## ADDED Requirements` — new behaviour capabilities
- `## MODIFIED Requirements` — changed behaviour (must contain the FULL updated requirement block, not a partial diff)
- `## REMOVED Requirements` — deprecated behaviours (must include `**Reason**` and `**Migration**`)
- `## RENAMED Requirements` — name changes only (use `FROM:` / `TO:` format)

Each requirement block:
```markdown
### Requirement: <Name>
<Description of the rule or capability. Use SHALL/MUST for normative requirements.>

#### Scenario: <Scenario name>
- **GIVEN** <precondition>
- **WHEN** <triggering event>
- **THEN** <observable outcome>
- **AND** <additional outcome>
```

**Format rules:**
- Requirements use exactly `### Requirement: <name>` (three hashes). No deviations.
- Scenarios use exactly `#### Scenario: <name>` (four hashes). This is parsed by OpenSpec validation. Using three hashes or bullet points fails silently.
- Every requirement MUST have at least one scenario.
- THEN steps must describe outcomes observable to a user or external system. Do not assert internal database state unless it IS the domain contract.
- Use domain language (business terms), not UI selectors, HTTP methods, or database column names.

**MODIFIED requirement workflow:**
1. Find the requirement in `openspec/specs/<capability>/spec.md` (the permanent spec).
2. Copy the ENTIRE block from `### Requirement:` through all its scenarios.
3. Paste under `## MODIFIED Requirements` in the delta spec.
4. Edit the copy to reflect the new behaviour.
5. Header text must match exactly (whitespace-insensitive).

**Common mistakes:**
- Using three hashes for `#### Scenario:` — fails silently during archive.
- Writing MODIFIED with partial content (e.g., only the new scenario) — at archive time the old content is overwritten with the partial block, losing existing scenarios.
- Writing implementation details in THEN steps ("THEN the `quotes` table has a row with `mileage_km` set").
- Confusing delta spec (`openspec/changes/<name>/specs/`) with permanent spec (`openspec/specs/`).

---

### design.md

**What question it answers:** How will the change be implemented? What technical decisions were made and why?

**Required content (include sections that apply):**
- **Context** — current state, background, constraints, stakeholders
- **Goals / Non-Goals** — what this design achieves and explicitly excludes
- **Decisions** — key technical choices. For each: the decision, rationale (why X over Y), and alternatives considered
- **Risks / Trade-offs** — format: `[Risk] → Mitigation`
- **Migration Plan** — deployment steps, rollback strategy (if applicable)
- **Open Questions** — unresolved decisions or unknowns. Include any in-force ADRs this design suggests revisiting.

**When to create design.md:**
- Cross-cutting change (multiple modules or services)
- New external dependency or significant data model changes
- Security, performance, or migration complexity
- Ambiguity that benefits from written decisions before coding

**When to skip it:**
- Simple, single-file change with no architectural choices
- Change is purely a copy of an existing pattern

**ADR discipline in design.md:**
Before writing, read every file in `adr/`. Build the supersession graph (each ADR's `Supersedes:` field). Only ADRs that are accepted AND not superseded by a later ADR are in-force. Design MUST be coherent with in-force ADRs. If an in-force ADR must be revisited, flag it under Open Questions — do NOT modify the old ADR.

**Common mistakes:**
- Writing a design doc for a trivial change that has no architectural choices.
- Skipping the ADR review step before writing decisions, leading to choices that contradict existing commitments.
- Mixing implementation line-by-line detail with architecture decisions. Design docs are architecture-level.

---

### adr.md (change-local manifest)

**What question it answers:** Were any durable architectural decisions made during this change? Which existing ADRs were reviewed?

**Important distinction:** `openspec/changes/<name>/adr.md` is the **change-local review manifest** — it records what was reviewed and what was created. It is NOT the Architecture Decision Record itself. Actual ADRs live at `adr/NNNN-kebab-title.md` beside `openspec/` at the repo root.

**Required content:**
- Statement that ADR review was completed for this change
- List of in-force ADRs reviewed (by title and sequence number)
- References to any `adr/NNNN-*.md` files created for this change
- If no durable decisions were made: explicit statement that no new ADR files were created

**What triggers a new repo-level ADR:**
A decision qualifies when it:
1. Establishes a long-term architectural commitment (pattern, technology, boundary, contract)
2. Will affect future changes beyond this one
3. Is not already captured by a currently-in-force ADR (or intentionally supersedes one)

**What does NOT qualify:**
- Tactical implementation details (which class goes in which file)
- Design choices that only affect this change
- Restating an existing in-force decision

**Common mistakes:**
- Creating an ADR for every implementation choice.
- Editing an existing ADR file to update it. NEVER edit accepted ADRs. Create a new ADR with `Supersedes: ADR-NNNN`.
- Putting the full ADR content in `adr.md`. The manifest references repo-level ADRs; it does not duplicate them.

---

### tasks.md

**What question it answers:** What are the implementation steps, in dependency order, that make the change complete?

**Required content:**
```markdown
## 1. <Group name>

- [ ] 1.1 <Specific verifiable task>
- [ ] 1.2 <Specific verifiable task>

## 2. <Group name>

- [ ] 2.1 <Specific verifiable task>
```

**Format rules:**
- Every task MUST use `- [ ] N.M <description>` exactly. Non-checkbox lines are not tracked by `/opsx:apply`.
- Group related tasks under `## N.` numbered headings.
- Order tasks by dependency — what must be done first.
- Tasks should be small enough to complete in one focused session.
- Each task should be verifiable — you know definitively when it is done.

**Common mistakes:**
- Writing prose descriptions instead of checkbox tasks.
- Tasks too large to complete in one session (split them).
- Tasks without a clear done condition ("improve performance" vs "add index on Jobs.DivisionId").
- Forgetting SQL migration tasks if the change requires schema changes.
- Not including a manual verification task group at the end.

---

### event-storming.md (event-driven schema only)

**What question it answers:** What domain events, commands, actors, and bounded contexts exist in this area?

**Required content:** Domain events (past-tense business facts), commands that trigger behaviour, actors and external systems, aggregates or bounded contexts, automations/policies that chain commands and events, hotspots and open questions.

This artifact is discovery-oriented and collaborative. It is an input to `event-modeling.md`, specs, design, and AsyncAPI.

---

### event-modeling.md (event-driven schema only)

**What question it answers:** How do events flow from trigger to read model?

**Required content:** Swim lanes in sequence: Trigger → Command → Event → Read Model. Mermaid diagrams visualising interactions and timeline flow. All dependencies and message flows explicit.

---

### asyncapi.yaml (event-driven schema only)

**What question it answers:** What is the machine-readable API contract for the event system?

**Required content:** Valid AsyncAPI 2.x or 3.x specification. **Must pass** `asyncapi-cli validate asyncapi.yaml` before marking this artifact done. Do not create `tasks.md` until validation succeeds.

---

## 5. Disciplines

### 5.1 ADR Discipline

**Immutability rule (IRON RULE):** Once an ADR file in `adr/` has `Status: Accepted`, it MUST NEVER be edited. Not its Status, not its body, not its date. Not even to fix a typo if that typo is substantive. The file is a historical record.

**Supersession rule:** To change a previously accepted decision, create a NEW ADR at `adr/NNNN-kebab-title.md` (next sequence number) with:
```
Status: Accepted, supersedes ADR-OOOO
Supersedes: ADR-OOOO
```
The new ADR explains in its Context section why the prior decision is being revisited. The old ADR's file remains unchanged.

**Supersession graph:** To determine what is currently in-force, build the supersession graph. Walk every ADR's `Supersedes:` field. An ADR is NOT in-force if a later ADR points at it in its `Supersedes:` field. Only leaf-node ADRs (not superseded by anything) are the current commitments.

**Sequence numbering:** ADR filenames use four-digit monotonic sequence: `0001-first-decision.md`, `0042-use-postgres.md`. The sequence is across the entire repo and never reused, never reset.

**Change-local vs repo-level:**
- `openspec/changes/<name>/adr.md` — change-local **review manifest**. Ephemeral, moves to archive.
- `adr/NNNN-kebab-title.md` — **permanent architectural record**. Never moves, never edited.

**When NOT to create a repo-level ADR:**
- Implementation detail that doesn't constrain future changes
- Restating an existing in-force decision
- Tactical choice (which variable to name what)
- Decisions that will obviously be revisited within weeks

---

### 5.2 Specs Discipline

**Delta vs permanent:**
- `openspec/changes/<name>/specs/<capability>/spec.md` — **delta spec**. Records what changes in this change. Uses `## ADDED/MODIFIED/REMOVED/RENAMED Requirements` headers.
- `openspec/specs/<capability>/spec.md` — **permanent spec**. Records the current complete behaviour. Synced at archive. Never uses delta headers — it is always the full current state.

**Delta operation semantics:**

| Header | Meaning | Required content |
|---|---|---|
| `## ADDED Requirements` | New requirement being introduced | Full requirement + all scenarios |
| `## MODIFIED Requirements` | Existing requirement whose behaviour changes | The COMPLETE updated requirement block (not a diff) |
| `## REMOVED Requirements` | Requirement being deprecated | Requirement name, plus `**Reason**` and `**Migration**` |
| `## RENAMED Requirements` | Name change only, no behaviour change | `FROM: ### Requirement: Old Name` / `TO: ### Requirement: New Name` |

**MODIFIED trap:** The most common error. If you put a partial block under `## MODIFIED Requirements` (e.g., only the new scenario), the archive merge overwrites the existing requirement with your partial block, losing all scenarios you didn't copy. Always copy the entire requirement block first, then modify the copy.

**ADDED vs MODIFIED:** If an existing requirement stays unchanged but you are adding a new requirement to the same capability, use `## ADDED Requirements`. Only use `## MODIFIED Requirements` when an existing requirement's content is changing.

**Requirement heading format:**
```
### Requirement: <Name>
```
Three hashes, the word Requirement, a colon, and then the name. The name must match the permanent spec exactly (whitespace-insensitive) for MODIFIED and REMOVED operations.

**Scenario heading format (critical):**
```
#### Scenario: <Name>
```
Four hashes exactly. Three hashes `### Scenario:` is a silent failure — OpenSpec validation and archive will miss it.

**SHALL/MUST for normative requirements:** Use SHALL or MUST in requirement descriptions to indicate normative behaviour. Avoid SHOULD (weak obligation) and MAY (optional) in specs unless you genuinely mean it.

---

### 5.3 Commit Discipline

Every change follows the three-commit structure. Commit after each stage — do not batch planning and implementation in one commit.

```
plan(opsx:propose): <change-name>
```
Staged files: everything under `openspec/changes/<name>/` (proposal, specs, design, adr, tasks). No code files.

```
feat(opsx:apply): <change-name>
```
Staged files: all code files changed during implementation. Also the updated `tasks.md` (with checked boxes). No planning artifacts.

```
chore(opsx:archive): <change-name>
```
Staged files: the archived change folder at its new path, plus any updated `openspec/specs/<cap>/spec.md` permanent spec files, plus any new `adr/NNNN-*.md` files.

**Conventional commit prefixes for this project:**

| Prefix | Use for |
|---|---|
| `plan` | Planning artifacts (propose stage) |
| `feat` | New features or behaviour changes (apply stage) |
| `fix` | Bug fixes (apply stage) |
| `chore` | Archive, dependency updates, tooling (archive stage) |
| `docs` | Documentation only |
| `refactor` | Code restructure with no behaviour change |

---

## 6. Folder Structure

Complete annotated tree for the `openspec/` directory and related repo-level folders:

```
<repo-root>/
│
├── openspec/                         ← OpenSpec planning root
│   │
│   ├── config.yaml                   ← Active schema + project context + artifact rules
│   │                                   schema: intent-driven
│   │                                   context: tech stack, language, naming conventions
│   │                                   rules: per-artifact skill wiring
│   │
│   ├── USER-MANUAL.md                ← This file
│   │
│   ├── schemas/                      ← Schema definitions (read-only, do not edit)
│   │   ├── intent-driven/
│   │   │   ├── schema.yaml           ← Artifact list, dependencies, apply config
│   │   │   └── templates/            ← Default artifact file templates
│   │   ├── minimalist/
│   │   │   └── schema.yaml
│   │   ├── behaviour-driven/
│   │   │   └── schema.yaml
│   │   ├── spec-driven-with-adr/
│   │   │   └── schema.yaml
│   │   ├── event-driven/
│   │   │   └── schema.yaml
│   │   (spec-driven is installed globally, not in project schemas/)
│   │
│   ├── changes/                      ← Active changes (work in progress)
│   │   │
│   │   ├── <change-name>/            ← One directory per active change
│   │   │   ├── .openspec.yaml        ← Change metadata (schema, name, created date)
│   │   │   ├── proposal.md           ← WHY artifact
│   │   │   ├── specs/
│   │   │   │   └── <capability>/
│   │   │   │       ├── spec.md       ← WHAT artifact (delta spec)
│   │   │   │       └── spec.council.md  ← adversarial-authoring audit trail (if enabled)
│   │   │   ├── design.md             ← HOW artifact (optional)
│   │   │   ├── design.council.md     ← adversarial-authoring audit trail (if enabled)
│   │   │   ├── adr.md                ← DECISIONS artifact (change-local manifest)
│   │   │   └── tasks.md              ← STEPS artifact (implementation checklist)
│   │   │
│   │   └── archive/                  ← Completed changes (read-only historical record)
│   │       └── YYYY-MM-DD-<name>/    ← Archived change with all its artifacts
│   │           ├── .openspec.yaml
│   │           ├── proposal.md
│   │           ├── specs/...
│   │           ├── design.md
│   │           ├── adr.md
│   │           └── tasks.md          ← All boxes ticked [x]
│   │
│   └── specs/                        ← Permanent behaviour specification (grows over time)
│       └── <capability>/             ← One folder per capability
│           └── spec.md               ← Full current behaviour (synced at archive)
│                                       No delta headers — always the complete state
│
├── adr/                              ← Permanent architectural decisions (repo-level)
│   │                                   NEVER inside openspec/
│   ├── 0001-<first-decision>.md      ← Immutable once accepted
│   ├── 0002-<second-decision>.md
│   └── NNNN-<kebab-title>.md         ← 4-digit monotonic, never reused
│
└── glossary/                         ← Shared vocabulary (repo-level)
    ├── business.md                   ← Domain, product, user, workflow terms
    └── technical.md                  ← Architecture, implementation, tool terms
```

---

### config.yaml Reference

The project-level `openspec/config.yaml` controls:

```yaml
schema: intent-driven          # Active schema for all new changes

context: |                     # Injected into every artifact instruction
  Tech stack: ...              # (constraints for the AI, never appear in artifacts)
  Language: ...
  Domain: ...

rules:                         # Per-artifact skill wiring
  proposal:
    - Must use grill-me skill
  design:
    - Must use c4-diagrams skill
  adr:
    - Must use architectural-decision-records skill
  spec:
    - Must use gherkin-authoring skill
```

To enable adversarial-authoring for all artifacts, uncomment the relevant lines in `config.yaml`:
```yaml
  # proposal:
  #   - Must use adversarial-authoring skill
  # specs:
  #   - Must use adversarial-authoring skill
```

---

### Quick Reference — Commands

| Command | Stage | What it does |
|---|---|---|
| `/opsx:explore` | Pre-planning | Thinking partner — no code, no artifacts unless you ask |
| `/opsx:new <name>` | Planning | Scaffolds change, shows first artifact template, stops |
| `/opsx:propose <description>` | Planning | Scaffolds change + generates ALL artifacts to apply-ready |
| `/opsx:continue [name]` | Planning | Creates ONE next artifact, then stops |
| `/opsx:ff <name>` | Planning | Fast-forwards ALL remaining artifacts to apply-ready |
| `/opsx:apply [name]` | Implementation | Implements all tasks, ticks checkboxes |
| `/opsx:verify [name]` | Verification | Checks completeness, correctness, coherence |
| `/opsx:sync [name]` | Spec sync | Syncs delta specs to permanent specs (without archiving) |
| `/opsx:archive [name]` | Archive | Syncs specs + moves change to archive |
| `/opsx:bulk-archive` | Archive | Archives multiple changes with conflict resolution |
| `/opsx:onboard` | Learning | Guided tutorial through a complete change cycle |

---

### Quick Reference — Commit Messages

```bash
# After /opsx:propose
git commit -m "plan(opsx:propose): <change-name>"

# After /opsx:apply
git commit -m "feat(opsx:apply): <change-name>"

# After /opsx:archive
git commit -m "chore(opsx:archive): <change-name>"
```

---

### Quick Reference — Common Errors and Fixes

| Error | Cause | Fix |
|---|---|---|
| Scenario not found during archive | Used `### Scenario:` instead of `#### Scenario:` | Change to four hashes |
| MODIFIED requirement loses existing scenarios | Partial block under `## MODIFIED` | Copy entire requirement block before editing |
| Capability name mismatch at archive | Delta spec path differs from permanent spec folder name | Check `openspec/specs/` folder names before writing proposal |
| ADR file was edited after acceptance | Violated immutability rule | Revert the edit; create a new superseding ADR |
| Tasks not tracked by apply | Used prose or `- ` without `[ ]` | Use `- [ ] N.M Description` exactly |
| New spec field not saved (unrelated) | Missing from Bind allow-list (ASP.NET MVC trap) | Add field to model, view, and `[Bind("...")]` list |
| apply blocks saying "missing artifacts" | tasks.md does not exist yet | Run `/opsx:continue` or `/opsx:ff` to complete planning |
