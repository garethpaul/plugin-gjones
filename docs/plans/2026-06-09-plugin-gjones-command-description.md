# Command Description Metadata Plan

status: completed

## Context

The command execution test verified the shared output constant and runtime log
line, but it did not verify the command description metadata that appears in
the plugin help surface.

## Objectives

- Assert `CommandClass.description` in the sandboxed command execution test.
- Keep command output behavior unchanged.
- Extend static baseline checks and docs for command description metadata.

## Verification

- `npm run test:command`
- `npm test`
- `make check`
- `git diff --check`
