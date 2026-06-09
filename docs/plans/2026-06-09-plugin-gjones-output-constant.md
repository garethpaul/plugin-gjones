# Output Constant Plan

status: completed

## Context

The scaffold command output was embedded directly inside `run()`, while the
dependency-free command test inferred the output with a narrow log-call regex.

## Objectives

- Move the scaffold output into an exported `OUTPUT_MESSAGE` constant.
- Keep `run()` logging that shared constant.
- Extend the command execution test and static baseline for the output
  constant.

## Verification

- `npm run check`
- `npm run test:command`
- `npm test`
- `make check`
- `git diff --check`
