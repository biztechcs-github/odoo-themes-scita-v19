---
name: "OPSX: Verify"
description: Verify implementation matches change artifacts before archiving
category: Workflow
tags: [workflow, verify, experimental]
---

Verify that an implementation matches the change artifacts (specs, tasks, design).

**Store selection:** If the user names a store (a store is a standalone OpenSpec repo registered on this machine) or the work lives in one, run `openspec store list --json` to discover registered store ids, then pass `--store <id>` on the commands that read or write specs and changes (`new change`, `status`, `instructions`, `list`, `show`, `validate`, `archive`, `doctor`, `context`). Other commands do not take the flag. Hints printed by commands already carry the flag; keep it on follow-ups. Without a store, commands act on the nearest local `openspec/` root.

**Input**: Optionally specify a change name after `/opsx:verify` (e.g., `/opsx:verify add-auth`). If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

**Steps**

1. **If no change name provided, prompt for selection**

   Run `openspec list --json` to get available changes. Use the **AskUserQuestion tool** to let the user select.

   Show changes that have implementation tasks (tasks artifact exists).
   Include the schema used for each change if available.
   Mark changes with incomplete tasks as "(In Progress)".

   **IMPORTANT**: Do NOT guess or auto-select a change. Always let the user choose.

2. **Check status to understand the schema**
   ```bash
   openspec status --change "<name>" --json
   ```
   Parse the JSON to understand:
   - `schemaName`: The workflow being used (e.g., "spec-driven")
   - `planningHome`, `changeRoot`, `artifactPaths`, and `actionContext`: path and scope context
   - Which artifacts exist for this change

3. **Get planning context and load artifacts**

   ```bash
   openspec instructions apply --change "<name>" --json
   ```

   This returns the change directory and `contextFiles` (artifact ID -> array of concrete file paths). Read all available artifacts from `contextFiles`.

4. **Initialize verification report structure**

   Create a report structure with six dimensions:
   - **Completeness**: Track tasks and spec coverage
   - **Correctness**: Track requirement implementation and scenario coverage
   - **Coherence**: Track design adherence and pattern consistency
   - **CI & Test**: Track unfinished-code markers and test file coverage
   - **Linkage**: Track artifact cross-reference resolution
   - **Security**: Track auth coverage, injection surfaces, IDOR risks, and data exposure

   Each dimension can have CRITICAL, WARNING, or SUGGESTION issues.

5. **Verify Completeness**

   **Task Completion**:
   - If `contextFiles.tasks` exists, read every file path in it
   - Parse checkboxes: `- [ ]` (incomplete) vs `- [x]` (complete)
   - Count complete vs total tasks
   - If incomplete tasks exist:
     - Add CRITICAL issue for each incomplete task
     - Recommendation: "Complete task: <description>" or "Mark as done if already implemented"

   **Spec Coverage**:
   - If delta specs exist in `contextFiles.specs`:
     - Extract all requirements (marked with "### Requirement:")
     - For each requirement:
       - Search codebase for keywords related to the requirement
       - Assess if implementation likely exists
     - If requirements appear unimplemented:
       - Add CRITICAL issue: "Requirement not found: <requirement name>"
       - Recommendation: "Implement requirement X: <description>"

6. **Verify Correctness**

   **Requirement Implementation Mapping**:
   - For each requirement from delta specs:
     - Search codebase for implementation evidence
     - If found, note file paths and line ranges
     - Assess if implementation matches requirement intent
     - If divergence detected:
       - Add WARNING: "Implementation may diverge from spec: <details>"
       - Recommendation: "Review <file>:<lines> against requirement X"

   **Scenario Coverage**:
   - For each scenario in delta specs (marked with "#### Scenario:"):
     - Check if conditions are handled in code
     - Check if tests exist covering the scenario
     - If scenario appears uncovered:
       - Add WARNING: "Scenario not covered: <scenario name>"
       - Recommendation: "Add test or implementation for scenario: <description>"

7. **Verify Coherence**

   **Design Adherence**:
   - If `contextFiles.design` exists:
     - Extract key decisions (look for sections like "Decision:", "Approach:", "Architecture:")
     - Verify implementation follows those decisions
     - If contradiction detected:
       - Add WARNING: "Design decision not followed: <decision>"
       - Recommendation: "Update implementation or revise design.md to match reality"
   - If no design.md: Skip design adherence check, note "No design.md to verify against"

   **Code Pattern Consistency**:
   - Review new code for consistency with project patterns
   - Check file naming, directory structure, coding style
   - If significant deviations found:
     - Add SUGGESTION: "Code pattern deviation: <details>"
     - Recommendation: "Consider following project pattern: <example>"

8. **CI & Test Gate**

   Scan all production source files changed or created by this change for patterns that signal unfinished work.

   **Identify changed files** — use `git diff --name-only HEAD` or read the task list to determine which source files were added/modified. Exclude test files (files in `**/tests/`, `**/test/`, `**/spec/`, files ending in `.test.*`, `.spec.*`, `*Tests.cs`, `*Test.cs`, `*_test.*`).

   **Scan for forbidden patterns in production code:**
   Grep each changed production file for:
   - `TODO`, `FIXME`, `HACK`, `XXX` (in comments or inline)
   - `mock`, `placeholder`, `dummy`, `fake` (as standalone words in non-test code)
   - Language-specific stubs: `throw new NotImplementedException()`, `throw new Error("not implemented")`, `raise NotImplementedError`, `pass  # TODO`

   For each match:
   - Add CRITICAL: "Unfinished code in `<file>:<line>`: `<matched text>` — remove or implement before archiving"

   **Test coverage check:**
   For each changed production source file, check whether a corresponding test file exists:
   - C#: `<Name>.cs` → `<Name>Tests.cs` or `<Name>Test.cs` in the test project
   - TypeScript/JS: `<name>.ts` → `<name>.test.ts` or `<name>.spec.ts`
   - Python: `<name>.py` → `test_<name>.py` or `<name>_test.py`

   If no test file exists for a non-trivial changed file (skip config files, migrations, DTOs, ViewModels):
   - Add WARNING: "No test file found for `<file>` — add tests covering the changed behaviour"

   **CI confirmation:**
   Check the DoD task group in `tasks.md` for a task confirming CI/build is green.
   - If no such task exists or it is unchecked → add WARNING: "No CI-green confirmation task in the Definition of Done group"

   **Gherkin / SpecFlow check:**
   If any `.feature` files exist in the change folder or `openspec/specs/<change-name>/`:
   - Check test project `.csproj` file(s) for a `SpecFlow`, `Reqnroll`, or `Cucumber` package reference.
   - If `.feature` files exist but no such package reference found → add WARNING: "Gherkin scenarios exist but no SpecFlow/Reqnroll runner is configured in the test project — scenarios will not execute in CI"
   - If a runner is configured, check that step definition files exist in the test project (look for `[Binding]` attribute in C# or a `step_definitions/` folder for other stacks).
   - If no step definitions found → add WARNING: "No step definitions found for `.feature` files — Gherkin scenarios are documentation only until step definitions are implemented"

   **Do not skip this step.** A `TODO` or `mock` in production code is a CRITICAL gate failure regardless of all other checks passing.

9. **Security Review**

   This step applies whenever `design.md` or `proposal.md` exists for the change.

   **Security Considerations section check** — if `design.md` exists:
   - Check if it contains a `## Security Considerations` section.
   - If the section is missing → add CRITICAL: "Security Considerations section missing from design.md — complete it using the security-review skill before archiving"
   - If the section exists but every checklist item is unchecked → add WARNING: "Security checklist in design.md is all unchecked — confirm each item or use the security-review skill"
   - For each unchecked item in the checklist → add WARNING: "Security checklist item unchecked: `<item text>`"

   **Auth & authorization scan** — read proposal.md and/or design.md:
   - Identify every new or modified controller action, API endpoint, or function mentioned
   - Check whether `[Authorize]`, a role, or "public / anonymous" is explicitly stated for each
   - If any endpoint has no auth statement → add WARNING: "Authorization not confirmed for: `<endpoint/action>` — confirm in design.md Security Considerations"

   **Injection surface scan** — grep newly added or changed production code:
   - Look for raw SQL string concatenation in Dapper queries (pattern: `$"... {variable}"` or `string.Format("... {0}"`)
   - Look for file paths built from user input without sanitisation
   - If found → add CRITICAL: "Injection risk: user input concatenated into SQL or file path at `<file>:<line>`"

   **IDOR scan** — grep newly added or changed production code:
   - Look for patterns where a route parameter or query-string value flows directly into a database query without an ownership or role check
   - If found → add WARNING: "Potential IDOR: user-supplied ID in `<file>:<line>` — confirm ownership validation is present"

   If neither `design.md` nor `proposal.md` exists: add note "No design/proposal artifact — Security Review skipped" and continue.

10. **Verify Linkage**

   Check that every artifact cross-reference in the change folder resolves to an existing file.

   **ADR references** — scan all artifact files for patterns like `ADR-NNNN`, `adr/NNNN-*`, or `[ADR-` links.
   For each reference, check that a matching file exists under `adr/` (e.g., `adr/0001-*.md`).
   - If the referenced ADR file does not exist → add CRITICAL: "Broken ADR reference: <ref> not found in adr/"

   **Design references** — if any artifact links to `design.md` or a specific design section, confirm the file exists at `<changeRoot>/design.md`.
   - If missing → add CRITICAL: "Broken design reference: design.md not found in change folder"

   **Wireframe / asset references** — if any artifact links to an image or wireframe file (e.g., `wireframes/login.png`, `assets/flow.pdf`), check the file exists.
   - If missing → add CRITICAL: "Broken asset reference: <path> not found"

   **Impact Scope paths** — if a `proposal.md` exists, read the Impact Scope table and verify that every path listed in the Location column exists in the codebase (use Glob or file read to confirm).
   - If a path does not exist → add WARNING: "Impact Scope path not found: <path> — may be stale or mistyped"

   **Spec cross-references** — if any spec file references another spec or capability by path (e.g., `openspec/specs/<capability>/spec.md`), confirm the target exists.
   - If missing → add CRITICAL: "Broken spec reference: <path> not found"

11. **Generate Verification Report**

   **Summary Scorecard**:
   ```
   ## Verification Report: <change-name>

   ### Summary
   | Dimension    | Status                          |
   |--------------|---------------------------------|
   | Completeness | X/Y tasks, N reqs               |
   | Correctness  | M/N reqs covered                |
   | Coherence    | Followed/Issues                 |
   | CI & Test    | N files scanned, K stubs found  |
   | Linkage      | N refs checked, K broken        |
   | Security     | Section present/missing, K gaps |
   ```

   **Issues by Priority**:

   1. **CRITICAL** (Must fix before archive):
      - Incomplete tasks
      - Missing requirement implementations
      - Each with specific, actionable recommendation

   2. **WARNING** (Should fix):
      - Spec/design divergences
      - Missing scenario coverage
      - Each with specific recommendation

   3. **SUGGESTION** (Nice to fix):
      - Pattern inconsistencies
      - Minor improvements
      - Each with specific recommendation

   **Final Assessment**:
   - If CRITICAL issues: "X critical issue(s) found. Fix before archiving." → result is **FAIL**
   - If only warnings: "PASS — no critical issues. Y warning(s) noted (non-blocking)." → result is **PASS**
   - If all clear: "All checks passed." → result is **PASS**

12. **Write verify result file**

   Write the gate file to the change folder immediately after the report.

   Path: `<changeRoot>/.verify-result`

   - Zero CRITICAL issues → write exactly one line: `PASS`
   - Any CRITICAL issues → write: `FAIL: <semicolon-separated summaries of each critical issue>`

   Example FAIL content:
   ```
   FAIL: Incomplete task "Add unit tests for WhosOffExport"; Requirement "CSV header row" not found in codebase
   ```

   **Do not skip this step.** `/opsx:archive` reads this file and will hard-block if it is missing or contains FAIL.

**Verification Heuristics**

- **Completeness**: Focus on objective checklist items (checkboxes, requirements list)
- **Correctness**: Use keyword search, file path analysis, reasonable inference - don't require perfect certainty
- **Coherence**: Look for glaring inconsistencies, don't nitpick style
- **False Positives**: When uncertain, prefer SUGGESTION over WARNING, WARNING over CRITICAL
- **Actionability**: Every issue must have a specific recommendation with file/line references where applicable

**Graceful Degradation**

- If only tasks.md exists: verify task completion only, skip spec/design checks
- If tasks + specs exist: verify completeness and correctness, skip design
- If full artifacts: verify all three dimensions
- Always note which checks were skipped and why

**Output Format**

Use clear markdown with:
- Table for summary scorecard
- Grouped lists for issues (CRITICAL/WARNING/SUGGESTION)
- Code references in format: `file.ts:123`
- Specific, actionable recommendations
- No vague suggestions like "consider reviewing"
