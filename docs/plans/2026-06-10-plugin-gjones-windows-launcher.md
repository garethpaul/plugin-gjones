# Plugin Gjones Windows Launcher Plan

status: completed

## Context

The repository already checks that `bin/run` stays executable for Unix installs
and that `bin/run.cmd` is not marked executable. The Windows launcher wrapper
also needs a content guard so it continues to delegate to the adjacent `bin/run`
Node entry point instead of drifting to a different command path.

## Objectives

- Add a static baseline check for `bin/run.cmd`.
- Keep the wrapper quiet with `@echo off`.
- Keep the wrapper pointed at the adjacent `bin/run` launcher through Node.
- Document the launcher wrapper expectation in the README, security notes, and
  vision.

## Verification

- `npm run check`
- `make check`
- `git diff --check`
