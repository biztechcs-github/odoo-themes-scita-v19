## 1. Feature Extraction Gate

- [ ] 1.1 Identify the source OpenSpec spec files for `<change-name>` and list the affected capabilities: `<capability-list>`.
- [ ] 1.2 Map each capability to an existing root-level `features/*.feature` file or a new root-level `features/<feature-name>.feature` file. Do not create a new file for an existing capability; update the existing file in place. Reject duplicate feature files or duplicate scenarios before committing.
- [ ] 1.3 Derive or update the root-level feature files from the spec markdown: `<feature-file-list>`.
- [ ] 1.4 Ensure the root-level `acceptance-tests/` Node project ignores `node_modules/` in git and can run `gherkin-lint`.
- [ ] 1.5 Add or update the `acceptance-tests` package script `<gherkin-lint-script>` for `<feature-file-list>`.
- [ ] 1.6 Run `<gherkin-lint-script>` from `acceptance-tests/` and fix feature syntax until it reports zero errors.
- [ ] 1.7 Commit the feature extraction work to git before starting failing acceptance-test setup. Pause here if a commit cannot be made.

## 2. Failing Acceptance-Test Gate

- [ ] 2.1 Add or update Cucumber.js configuration at `<cucumber-config-path>`.
- [ ] 2.2 Add JavaScript lint tooling or scripts for `<step-definition-file-list>` and `<acceptance-helper-file-list>`, then run them.
- [ ] 2.3 Configure Cucumber.js to generate an HTML report at `<acceptance-html-report-path>`.
- [ ] 2.4 Add step definitions in `<step-definition-file-list>` for ALL in-scope business scenarios from the OpenSpec delta: `<scenario-list>` across `<feature-file-list>`.
- [ ] 2.5 Add fixtures, helpers, or environment setup in `<acceptance-helper-file-list>` for `<capability-list>`.
- [ ] 2.6 Run the Gherkin acceptance test suite with HTML report output and confirm it fails for every expected unimplemented business scenario.
- [ ] 2.7 Commit the failing acceptance-test setup to git before implementing the application. Pause here if a commit cannot be made.

## 3. Granular Implementation Gate

- [ ] 3.1 Ask how many acceptance-fix attempts to allow per scenario slice; if no limit is chosen, record `<acceptance-fix-attempt-limit>` as `3`.
- [ ] 3.2 Implement scenario slice `<slice-1>`: changes to `<app-subsystem-list-for-slice-1>` so that `<business-scenario-1>` turns green.
- [ ] 3.3 Run the full Cucumber.js acceptance suite after slice `<slice-1>`; expand into `<acceptance-fix-attempt-limit>` attempt checkboxes. If an early attempt passes, replace remaining unrun attempts with a "not needed" checkpoint. If the final attempt fails, stop with an error and include `<acceptance-html-report-path>`.
- [ ] 3.N Continue adding one implementation task and one attempt-expanded full-suite acceptance run per remaining scenario slice.
- [ ] 3.N+1 Commit the passing implementation to git before verification. Pause here if a commit cannot be made.

## 4. Verification Gate

- [ ] 4.1 Review changes since the failing acceptance-test checkpoint and confirm committed feature files and acceptance tests were not weakened.
- [ ] 4.2 Review the final HTML acceptance report at `<acceptance-html-report-path>` and confirm it reflects the passing run.
- [ ] 4.3 Run `openspec validate <change-name> --type change --strict`.
- [ ] 4.4 Run the project test, lint, or build commands relevant to `<affected-subsystem-list>`.
