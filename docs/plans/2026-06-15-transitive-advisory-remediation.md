# Transitive Advisory Remediation

status: completed

## Context

The original reviewed lock reported a high-severity `form-data@4.0.5` finding
(GHSA-hmw2-7cc7-3qxx) and five moderate records inherited from vulnerable
`js-yaml@3.14.2` (GHSA-h67p-54hq-rp68). The compatible Twilio CLI Core and
oclif core 1.x host line invokes the removed `safeLoad` and `safeDump` aliases,
so a direct major-version override initially broke the documented host contract.

On 2026-06-19, a fresh exact-head audit also reported newly disclosed high and
moderate findings in transitive `undici@6.26.0`. The compatible patched release
is `undici 6.27.0`, so that finding can be removed without changing the host
contract or the accepted audit-policy boundary.

## Requirements

- Resolve the high-severity form-data finding without changing direct Twilio
  or oclif host versions.
- Keep a full-graph audit at the low-severity threshold and fail closed unless
  the report contains zero known vulnerabilities.
- Reject every vulnerable package, inconsistent count, nonzero severity, and
  malformed output.
- Preserve Node 24, Linux/Windows, aggregate-check, package, command, launcher,
  and external-directory validation.
- Record completed work, actual verification, and the remaining upstream risk.

## Approach

- Add a root override for patched `form-data 4.0.6` and regenerate only the
  exact lockfile.
- Pin patched `js-yaml 4.2.0` and preload safe-by-default `load` and `dump`
  under the legacy aliases before oclif starts.
- Add a dependency-free Node audit policy that executes
  `npm audit --audit-level=low --json` on every hosted lane.
- Add focused report mutations and static contracts for the workflow, policy,
  override, lock, plan status, and security guidance.

## Scope Boundaries

- Do not change command output, CLI metadata, launchers, supported Twilio CLI
  host versions, or direct dependency majors.
- Do not use `npm audit fix --force`, hide audit output, omit dependency groups,
  or accept any advisory class.

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

- The compatibility preload is intentionally narrow and must remain active
  before oclif imports js-yaml through Twilio CLI Core.
- A future oclif host migration should remove the legacy alias preload only
  after installed launcher coverage proves it is no longer required.

## Work Completed

- Added an exact root override for `form-data 4.0.6` while preserving direct
  Twilio CLI Core 8.3.4 and oclif core 1.26.2 host versions.
- Added an exact root override for `undici 6.27.0` after the advisory database
  began reporting high and moderate findings for the locked 6.26.0 release.
- Added an exact root override for `js-yaml 4.2.0`, leaving one patched parser
  copy in the lock and installed graph.
- Added a launcher preload that maps `safeLoad` and `safeDump` to js-yaml 4's
  safe-by-default `load` and `dump` APIs before oclif starts, preserving the
  supported Twilio CLI host behavior.
- Replaced the advisory allowance with a cross-platform fail-closed JSON policy
  that accepts only zero known vulnerabilities and rejects vulnerable packages,
  inconsistent counts, nonzero severities, and malformed output.
- Added focused report mutations, hosted workflow enforcement, completed-plan
  enforcement, dependency-risk guidance, and changelog evidence.

## Verification Completed

- `npm ci --ignore-scripts` reproduced the 461-package graph on Node 24.16.0.
- `npm audit --audit-level=low` and `node scripts/check-audit.js` reported
  zero known vulnerabilities across production dependencies and development
  tooling.
- Installed-path inspection confirmed patched `form-data 4.0.6`,
  `undici 6.27.0`, and one `js-yaml 4.2.0` copy in the exact lock and installed
  graph.
- Focused audit tests rejected vulnerable-package, inconsistent-count,
  nonzero-severity, and malformed-report mutations.
- Installed compatibility, command-output, and oclif launcher smoke tests
  passed with the legacy parser aliases supplied by the compatibility preload.
- `npm test`, all npm aliases, every Make target, and `make check` passed on
  Node 24, including execution from an external working directory.
- `npm pack --dry-run` preserved the reviewed package contents.
- Isolated hostile mutations were rejected across override removal, vulnerable
  lock restoration, launcher-preload removal, workflow bypass, broadened policy
  acceptance, focused-test removal, missing guidance, and false completion.
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

## Historical Upstream Blocker

- Twilio CLI Core 8.3.4 still depends on the oclif core 1.x host line.
- That compatible host invokes removed js-yaml aliases, and no patched js-yaml
  3.x release exists. The compatibility preload now supplies those aliases from
  js-yaml 4.2.0's safe-by-default APIs.
- The full low-threshold audit remains enabled through the fail-closed JSON
  policy and must continue to report zero known vulnerabilities.
