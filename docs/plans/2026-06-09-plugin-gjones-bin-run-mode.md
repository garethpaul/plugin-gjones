# Bin Run Mode Plan

status: completed

## Context

The package ships `bin/run` as the Unix launcher for the oclif command and
`bin/run.cmd` as the Windows wrapper. The repository already has the correct
mode bits, but the static baseline did not catch accidental launcher permission
changes.

## Objectives

- Require `bin/run` to remain executable.
- Require `bin/run.cmd` to remain non-executable.
- Document the executable launcher packaging guardrail.
- Keep verification dependency-free through `npm run check`.

## Verification

- `make check`
- `npm run check`
- `npm run test:command`
- `git diff --check`
