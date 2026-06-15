# Transitive Advisory Remediation

status: blocked_upstream

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

## Work Completed

- Added an exact root override for `form-data 4.0.6` while preserving direct
  Twilio CLI Core 8.3.4 and oclif core 1.26.2 host versions.
- Regenerated the lock and required patched form-data plus compatible
  `js-yaml 3.14.2` in the static baseline.
- Added a cross-platform audit-policy gate that accepts only the exact five
  moderate records tied to GHSA-h67p-54hq-rp68 and rejects any changed package,
  count, severity, advisory chain, malformed output, or high/critical finding.
- Added focused report mutations, hosted workflow enforcement, completed-plan
  enforcement, dependency-risk guidance, and changelog evidence.

## Verification Completed

- `npm ci --ignore-scripts` reproduced the 461-package graph on Node 24.16.0.
- `npm audit --audit-level=low` confirms the high form-data finding is closed
  and reports five moderate js-yaml findings that remain blocked upstream.
- Installed-path inspection confirmed patched `form-data 4.0.6` and compatible
  `js-yaml 3.14.2` in the exact lock and installed graph.
- `node scripts/check-audit.js` passed against that exact report; the focused
  audit test rejected new-high, changed-advisory, additional inherited
  advisory, and missing-package reports.
- Installed compatibility, command-output, and oclif launcher smoke tests
  passed, and a disposable js-yaml 4.2.0 install reproduced the removed
  `safeDump` API failure.
- `npm test`, all npm aliases, every Make target, and `make check` passed on
  Node 24, including execution from an external working directory.
- `npm pack --dry-run` preserved the reviewed package contents.
- Eight isolated hostile mutations were rejected across override removal,
  vulnerable lock restoration, workflow bypass, broadened policy acceptance,
  advisory replacement, focused-test removal, missing guidance, and false
  completion.
- Exact-head push run 27578960034 and pull-request run 27578971115 passed the
  Ubuntu lane but exposed `spawnSync npm.cmd EINVAL` before policy evaluation
  on Windows. The audit runner now uses shell dispatch only for the fixed
  Windows `npm.cmd audit --audit-level=low --json` invocation; focused tests
  and the static contract require that boundary without changing the accepted
  report or the protected aggregate check.
- On Node 24.16.0, the focused audit test, complete repository and
  external-directory package gates, live strict audit, and
  `npm pack --dry-run --ignore-scripts` passed after the correction. Isolated
  runtime and static mutations replacing the Windows guard with unconditional
  direct spawning were both rejected.
- `git diff --check` plus exact manifest, lock, secret and generated-artifact audits passed.

## Upstream Blocker

- Twilio CLI Core 8.3.4 still depends on the oclif core 1.x host line.
- That compatible host invokes `safeDump`; js-yaml 4.2.0 replaces it with a
  throwing compatibility stub, and no patched js-yaml 3.x release exists.
- The full low-threshold audit remains enabled through the exact fail-closed
  policy until the upstream host graph migrates or publishes a compatible fix.
