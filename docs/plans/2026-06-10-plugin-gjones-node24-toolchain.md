# Plugin Gjones Node 24 Toolchain

status: completed

## Context

The plugin scaffold was still documenting and checking a Node 10 CI baseline.
That toolchain is stale, and the current repository checks do not require
dependency installation because command behavior is validated with static checks
and a dependency-free command execution test.

## Changes

- Added `.nvmrc` with Node 24 as the local and hosted toolchain baseline.
- Updated `package.json` engines to require Node 24 or newer.
- Updated AppVeyor to request Node 24.
- Added a pinned, read-only GitHub Actions workflow that reads `.nvmrc`, does
  not persist checkout credentials, and runs `make check`.
- Added CODEOWNERS review routing and checker enforcement for the sole workflow.
- Extended `scripts/check-baseline.js` and docs so Node 24, GitHub Actions, and
  the dependency-free baseline remain visible.

## Verification

- `make check`
- five hostile workflow and ownership mutations
- `git diff --check`
