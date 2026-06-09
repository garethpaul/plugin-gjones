# Plugin Gjones Check Wrapper

status: completed

## Context

The scaffold plugin already exposes `npm test` as the combined static baseline
and command-output verification gate, but repository automation expects a root
`make check` command.

## Goals

- Add a root Makefile with `test`, `verify`, and `check` targets.
- Make `make check` run the same command and metadata gates as `npm test`.
- Keep the scaffold command credential-free and dependency-light.
- Document and preserve the wrapper through README, CHANGES, and the baseline.

## Verification

- `make check`
- `npm test`
- `git diff --check`
