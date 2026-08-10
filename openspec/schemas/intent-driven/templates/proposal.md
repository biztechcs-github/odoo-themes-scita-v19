## Why

<!-- Explain the motivation for this change. What problem does this solve? Why now? -->

## What Changes

<!-- Describe what will change. Be specific about new capabilities, modifications, or removals. -->

## Capabilities

### New Capabilities
<!-- Capabilities being introduced. Replace <name> with kebab-case identifier (e.g., user-auth, data-export, api-rate-limiting). Each creates specs/<name>/spec.md with OpenSpec delta headers and Gherkin-style scenarios. -->
- `<name>`: <brief description of what this capability covers>

### Modified Capabilities
<!-- Existing capabilities whose behaviour is changing (not just implementation).
     Only list here if spec-level behaviour changes. Each needs a delta spec.md file.
     Use existing spec names from openspec/specs/ -->
- `<existing-name>`: <what behaviour is changing>

## Impact Scope

<!--
  MANDATORY — complete this before writing any spec scenario.
  Search the full codebase for every file, component, route, service, controller,
  view, grid, or shared UI element this change touches. No location may be omitted.
  If a location is intentionally excluded, state why in the "Excluded" column.
-->

| Location | Type | Why affected | Excluded? |
|---|---|---|---|
| `<file or component path>` | `<shared component / controller / service / view / grid>` | `<e.g. same grid rendered here, same helper called, same data field displayed>` | — |

> If this change touches a shared UI component (grid, form, panel, partial view),
> list every page/route where that component appears. All must be covered in the specs.
