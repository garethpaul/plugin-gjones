# Hosted Node Validation

status: completed

## Context

The credential-free plugin scaffold has dependency-free static and command
execution tests, but only a historical Node 10 AppVeyor configuration. The
legacy package graph is unlocked and should not be installed for this gate.

## Priorities

1. Run `npm test` for pushes and pull requests.
2. Verify the maintained source-level contract on Node 18 and Node 22.
3. Pin actions, runner, permissions, timeout, and concurrency.
4. Keep dependency installation and Twilio credentials out of CI.
5. Preserve the package's existing runtime compatibility declaration.

## Implementation Units

Add a commit-pinned, read-only hosted Linux matrix that runs `npm test` without
`npm install`. Preserve command output, command description, oclif metadata,
launcher modes, package files, and Windows wrapper checks.

## Verification

- `npm run check`
- `npm test`
- `make lint`
- `make build`
- `make check`
- Node 18 container `npm test`
- workflow YAML parse
- `git diff --check`
- successful hosted Linux `Check` workflow for Node 18 and Node 22

## Boundaries

- Do not install or update the unlocked dependency graph.
- Do not use Twilio credentials or make account mutations.
- Do not change the package engine declaration in this pass.
