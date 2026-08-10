## Context

<!-- Background and current state -->

## Goals / Non-Goals

**Goals:**
<!-- What this design aims to achieve -->

**Non-Goals:**
<!-- What is explicitly out of scope -->

## Decisions

<!-- Key design decisions and rationale -->

## Risks / Trade-offs

<!-- Known risks and trade-offs -->

## Migration Plan

<!-- Deployment, migration, and rollback notes if applicable -->

## Security Considerations

**Trust Boundary:**
<!-- Who can reach the endpoints or functions this change introduces or modifies?
     Options: Anonymous / Authenticated / Role-restricted (list roles) -->

**Data Sensitivity:**
<!-- What sensitive data does this change touch, store, or expose?
     (PII, financial, access-control data, credentials, session tokens) -->

**Auth & Authorization:**
<!-- List every new or changed controller action / API endpoint / function.
     For each: is [Authorize] required? Which roles? -->

**Injection Surfaces:**
<!-- List any raw SQL (Dapper), file paths, redirect URLs, or user-supplied input
     that flows into queries, file operations, or redirects. Confirm parameterization. -->

**Security Checklist:**
- [ ] All new endpoints have [Authorize] or are explicitly documented as public
- [ ] No user-supplied IDs used in queries without ownership validation (IDOR)
- [ ] All SQL via Dapper uses parameterized queries — no string concatenation
- [ ] No sensitive data logged or returned in error messages
- [ ] No redirect URLs built from user input without validation

## Open Questions

<!-- Outstanding decisions, including any in-force ADRs that need supersession -->
