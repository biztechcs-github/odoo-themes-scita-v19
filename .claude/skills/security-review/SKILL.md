---
name: security-review
description: Adversarial security review of a change's proposal and design. Use during the design phase to identify auth gaps, IDOR risks, injection surfaces, and data-exposure issues before tasks are written.
license: MIT
metadata:
  author: cgcontrols
  version: "1.0"
---

Review the proposal and design of the current change from an adversarial security perspective. The goal is to surface security gaps before implementation begins — not after.

**When to use:** After drafting `design.md`, before finalising tasks. The author runs this skill on their own design and must address every finding before the design is considered complete.

**Input:** The current change's `proposal.md` and `design.md`. If neither exists, stop and tell the user to complete the design first.

---

**Steps**

1. **Load the change artifacts**

   Read `proposal.md` and `design.md` from the current change folder.
   Also read the `context:` block in `openspec/config.yaml` to understand the tech stack.

   If neither artifact exists: stop. Tell the user: "Run security-review after design.md is drafted."

2. **Identify the attack surface**

   From the proposal and design, extract:
   - Every new or modified **controller action / API endpoint / function** that handles user input or returns data
   - Every **database query** introduced or changed
   - Every **file path** or **redirect URL** built from user-supplied input
   - Every piece of **sensitive data** stored, exposed, or transmitted (PII, financial, session, credentials)
   - The **trust boundary**: who can reach each endpoint — anonymous / authenticated / role-restricted

3. **Run the adversarial checklist**

   For each item identified in step 2, challenge it with these lenses:

   **Authentication & Authorization**
   - Is every non-public endpoint protected? List the expected `[Authorize]` role/policy for each.
   - Can a lower-privileged user reach a higher-privileged endpoint by manipulating a route or parameter?
   - Are there any new admin or elevated-privilege paths that could be reached unauthenticated?

   **IDOR (Insecure Direct Object Reference)**
   - Does any endpoint accept a user-supplied ID (route param, query string, form field) that maps to a database record?
   - Is there an ownership check confirming the requesting user owns that record?
   - What happens if an attacker replaces their own ID with another user's ID?

   **Injection**
   - Is any Dapper query built with string concatenation instead of parameterised input? (`$"SELECT ... WHERE Id = {id}"` is a red flag)
   - Is any file path constructed from user input without sanitisation or allowlisting?
   - Is any HTML or JSON response built by concatenating user input without encoding?

   **Sensitive Data Exposure**
   - Does any API response return more fields than the caller needs? (over-fetching)
   - Are there fields that should never leave the server (password hash, session token, internal IDs)?
   - Does any error message expose stack traces, SQL, or internal paths to the caller?
   - Is any sensitive data written to application logs?

   **Session & State**
   - Does any action mutate state that belongs to another user's session?
   - Are any security-sensitive values (user ID, roles) read from a source the caller controls (cookie, header, form field) rather than from the verified session?

4. **Author findings**

   For each issue found, write:
   ```
   **[CRITICAL / WARNING]** <one-line issue title>
   - Where: <file or section, if known>
   - Risk: <what an attacker could do>
   - Fix: <specific change needed>
   ```

   Severity guide:
   - **CRITICAL** — exploitable without special access: unauthenticated endpoint, SQL injection, IDOR with no ownership check
   - **WARNING** — requires some access or effort: over-fetching, missing rate limit, weak redirect validation

5. **Reviewer pass (adversarial)**

   Adopt the perspective of a malicious insider or external attacker with read access to this design document.
   Re-read the design once more and ask: "What is the one thing the author assumed was safe but didn't explicitly protect?"
   Add that as an additional finding if not already captured.

6. **Populate the Security Considerations section**

   Write or update the `## Security Considerations` section in `design.md` with:
   - Trust Boundary — who can reach each endpoint
   - Data Sensitivity — what sensitive data is involved
   - Auth & Authorization — confirmed `[Authorize]` coverage per endpoint
   - Injection Surfaces — Dapper queries, file paths, redirects reviewed
   - Security Checklist — the standard checklist with boxes ticked for confirmed items, unchecked for outstanding items:
     - [ ] All new endpoints have [Authorize] or are explicitly documented as public
     - [ ] No user-supplied IDs used in queries without ownership validation (IDOR)
     - [ ] All SQL via Dapper uses parameterized queries — no string concatenation
     - [ ] No sensitive data logged or returned in error messages
     - [ ] No redirect URLs built from user input without validation

7. **Report to the author**

   Present all findings clearly. For each CRITICAL finding, state: "This must be resolved before tasks are written."
   For WARNINGs: "Address before archiving — verify in the Security Review dimension."

   End with a summary line:
   - "Security review complete. X critical finding(s), Y warning(s). Update design.md before proceeding." — if issues found
   - "Security review complete. No critical issues. Security Considerations section populated." — if clean

---

**Guardrails**
- Never fabricate a finding. If you are uncertain whether a risk is real, mark it WARNING and explain what you are unsure about.
- Never mark the Security Considerations checklist as fully ticked unless you have read the actual code or the design explicitly addresses each item.
- A clean security review of the design does NOT mean the implementation is secure — verify.md has a separate security dimension that checks the actual code.
