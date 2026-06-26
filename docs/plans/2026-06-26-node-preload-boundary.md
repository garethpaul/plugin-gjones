# Node Preload Boundary

status: completed

## Summary

Reject Node bootstrap configuration that can replace repository verifier
process dispatch and return a false green before any baseline or test runs.

## Problem

The canonical command ran `scripts/verify-repository.js` directly, but accepted
`NODE_OPTIONS` and command-line preload flags. A preload could replace
`child_process.spawnSync` before the verifier imported it. Every child dispatch
then returned status zero without executing, and the canonical test command
also exited zero.

## Design

Validate inherited `NODE_OPTIONS` and `NODE_PATH` plus command-line preload
flags before repository child dispatch. Reject require, import, loader,
experimental-loader, and compact `-r` forms. Remove Node injection variables
from every child environment as defense in depth.

This is fail-closed detection, not a sandbox or independent attestation. Node
executes a configured preload before JavaScript entrypoint code, so a hostile
same-user preload has already run and could mutate process state. The
base-owned trusted-tree check remains the independent protected-path merge
control; candidate-controlled package jobs remain behavioral evidence.

## Implementation

- Added `assertSafeNodeBootstrap` before verifier mode dispatch.
- Rejected inherited Node injection variables and command-line preload flags.
- Sanitized child environments.
- Added causal environment and command-line preload regressions.
- Updated project guidance and static contracts without broadening publication
  or independent-attestation claims.

## Verification Completed

- The preload regressions first returned zero without running repository
  children, then failed closed with the documented diagnostic after the fix.
- The repository authority suite passed on Node 20, 22, and 24.
- The full direct verifier test passed on Node 20, 22, and 24.
- Package audit, packed consumer audit, package contents, real Twilio host
  compatibility, Linux/Windows hosted checks, and the base-owned trusted-tree
  check passed at the exact pull-request head.
- `git diff --check`, JavaScript syntax, generated-artifact, conflict-marker,
  and secret-shaped-content audits passed.
