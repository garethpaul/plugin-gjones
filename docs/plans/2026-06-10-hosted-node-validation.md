# Hosted Node Validation

status: completed

## Context

The credential-free plugin scaffold has dependency-free static and command
execution tests. The legacy package graph is unlocked and should not be
installed for this gate, while the repository now declares Node 24 as its
supported local and hosted toolchain baseline.

## Priorities

1. Run `make check` for pushes and pull requests.
2. Read Node 24 from `.nvmrc` so local and hosted validation stay aligned.
3. Pin actions, runner, permissions, timeout, and concurrency.
4. Disable checkout credential persistence and keep CI read-only.
5. Assign repository review ownership and enforce a sole hosted workflow.
6. Keep dependency installation and Twilio credentials out of CI.

## Implementation Units

Add a commit-pinned, credential-free, read-only hosted Linux job that reads
Node 24 from `.nvmrc` and runs `make check` without `npm install`. Preserve
command output, command description, oclif metadata, launcher modes, package
files, and Windows wrapper checks.

## Verification

- `npm run check`
- `npm test`
- `make lint`
- `make build`
- `make check`
- Node 24 `make check`
- workflow YAML parse
- `git diff --check`
- successful hosted Linux `Check` workflow for Node 24

## Boundaries

- Do not install or update the unlocked dependency graph.
- Do not use Twilio credentials or make account mutations.
- Keep `.nvmrc`, package engines, AppVeyor, and GitHub Actions on Node 24.
