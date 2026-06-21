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
- Identified `node scripts/verify-repository.js test` as the authoritative full
  baseline and `npm test` as a convenience alias for reviewed trees.
- Aligned contributor runtime guidance with `package.json` and the hosted Node
  20, 22, 24, and 25 matrix while preserving Node 24 as the `.nvmrc` default.
- Extended the static baseline to reject stale contributor instructions.

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
