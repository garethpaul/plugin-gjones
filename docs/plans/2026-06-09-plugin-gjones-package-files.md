# Plugin Gjones Package Files Plan

status: completed

## Context

The repository already preserved launcher mode for `bin/run`, but the
`package.json` `files` list only included the manifest and `src`. Published
packages could omit the reviewed launcher files even though local verification
protected them.

## Objectives

- Include `/bin` in `package.json` `files`.
- Extend the static baseline so launcher files remain packaged.
- Document the packaged launcher file guardrail.

## Verification

- `npm run check`
- `npm run test:command`
- `make check`
- `node scripts/check-baseline.js`
- `git diff --check`
