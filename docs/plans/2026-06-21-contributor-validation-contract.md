# Contributor Validation Contract

status: completed

## Context

The repository supports Node 20 and newer, validates Node 20, 22, 24, and 25 in
hosted Linux and Windows jobs, and installs the reviewed lockfile with npm
lifecycle scripts disabled. `AGENTS.md` instead recommended `npm install` and a
Node 24 minimum, which could bypass the lockfile contract and misstate the
supported runtime boundary.

## Work Completed

- Replaced lifecycle-enabled dependency installation guidance with
  `npm ci --ignore-scripts`.
- Identified `node scripts/verify-repository.js test` as the canonical direct
  repository-local test and `npm test` as its convenience alias for reviewed
  trees.
- Recorded the exact package job commands: `node scripts/check-audit.js`, the
  direct repository test, and `npm pack --dry-run`.
- Recorded the exact consumer job commands: `npm run audit:consumer` and
  `npm run verify:twilio-host`.
- Documented that the base-owned trusted-tree check validates only protected
  Git tree paths. It does not attest package behavior or consumer safety, and
  the candidate-controlled package jobs are not independent merge authority.
- Aligned contributor runtime guidance with `package.json` and the hosted Node
  20, 22, 24, and 25 matrix while preserving Node 24 as the `.nvmrc` default.
- Extended the static baseline to reject stale contributor instructions.
- Clarified that no contributor command publishes the package and passing these
  checks does not authorize publication or prove registry-release security.

## Verification Completed

- `node scripts/verify-repository.js test`
- `npm test`
- `npm run check`
- `npm run lint`
- `npm run build`
- `npm run audit:consumer`
- `npm run verify:twilio-host`
- `npm pack --dry-run`
- Repository and packed-consumer audits reported zero plugin-owned findings.
- The repository remains unpublished; this validation does not authorize
  publication.
