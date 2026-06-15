# Transitive Advisory Remediation

status: planned

## Context

The reviewed lock now reports a high-severity `form-data@4.0.5` finding
(GHSA-hmw2-7cc7-3qxx) and five moderate records inherited from vulnerable
`js-yaml@3.14.2` (GHSA-h67p-54hq-rp68). The compatible Twilio CLI Core and
oclif core 1.x host line invokes `safeDump`, which js-yaml 4 removes, so the
automatic major-version fix would break the documented host contract.

## Requirements

- Resolve the high-severity form-data finding without changing direct Twilio
  or oclif host versions.
- Keep a full-graph audit at the low-severity threshold and fail closed unless
  the report matches the exact reviewed upstream blocker.
- Reject changed packages, counts, severities, advisory chains, malformed
  output, and every high or critical finding.
- Preserve Node 24, Linux/Windows, aggregate-check, package, command, launcher,
  and external-directory validation.
- Record completed work, actual verification, and the remaining upstream risk.

## Approach

- Add a root override for patched `form-data 4.0.6` and regenerate only the
  exact lockfile.
- Add a dependency-free Node audit policy that executes
  `npm audit --audit-level=low --json` on every hosted lane.
- Add focused report mutations and static contracts for the workflow, policy,
  override, lock, plan status, and security guidance.

## Scope Boundaries

- Do not change command output, CLI metadata, launchers, supported Twilio CLI
  host versions, or direct dependency majors.
- Do not use `npm audit fix --force`, hide audit output, omit dependency groups,
  or accept advisory classes beyond the exact js-yaml chain.

## Verification

- Run exact-lock installation, the real audit policy, all npm and Make gates,
  external-directory validation, package dry run, and installed command smoke
  tests on Node 24.
- Run isolated hostile mutations covering override removal, vulnerable lock
  restoration, workflow bypass, broadened policy, advisory replacement,
  focused-test removal, missing guidance, and false completion.
- Audit the exact diff, generated artifacts, credentials, conflicts, file
  modes, binaries, large files, and remote head.

## Risks

- The moderate js-yaml advisory remains until the Twilio/oclif host line
  migrates to a compatible patched parser.
- The policy must be updated or removed when the upstream graph changes; exact
  matching deliberately fails new or reshaped audit reports.
