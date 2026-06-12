# Immutable Output Export

status: completed

## Context

The command closes over a constant output string but exported the same value by
writable assignment. Consumers could overwrite `CommandClass.OUTPUT_MESSAGE`
without changing `run()`, leaving public metadata inconsistent with actual
command output.

## Objectives

- Export `OUTPUT_MESSAGE` with `Object.defineProperty`.
- Keep the property enumerable for inspection.
- Keep the property non-writable and non-configurable.
- Verify reassignment fails and the command still logs exactly one documented
  line.

## Verification

- `npm run test:command`
- `npm test`
- `npm run lint`
- `npm run build`
- `make check`
- Mutation: restore writable assignment and confirm the descriptor test fails.
- `git diff --check`
