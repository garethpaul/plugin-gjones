# Plugin Gjones oclif Toolchain Migration

status: in_progress

## Goal

Replace the unlocked archived oclif development graph, which currently reports
33 known vulnerabilities including 14 high-severity findings, without changing
the `gjones:mycommand` output, command ID, credential-free behavior, or Node 24
runtime floor.

## Priorities

1. Migrate the command and launcher to the `@oclif/core` 1.x line compatible
   with Twilio CLI Core 8.3.4.
2. Replace `@oclif/dev-cli` with the maintained oclif utility CLI and remove
   unused direct test, lint, coverage, and glob dependencies.
3. Commit a lockfile and require script-disabled locked installs plus a
   zero-finding complete-graph audit.
4. Add installed launcher smoke coverage for help and `gjones:mycommand` while
   preserving the existing dependency-free output test.
5. Replace AppVeyor with pinned Ubuntu and Windows GitHub Actions jobs on Node
   24, including tests, audit, and package dry runs.
6. Enforce the dependency, workflow, packaging, and verification contracts in
   the repository baseline and maintained documentation.

## Implementation Units

- `package.json` and `package-lock.json`
- `src/commands/gjones/mycommand.js`
- `bin/run`
- `tests/command-output.test.js`
- `tests/oclif-command-smoke.test.js`
- `.github/workflows/check.yml`
- `appveyor.yml` removal
- `Makefile`
- `scripts/check-baseline.js`
- `README.md`, `SECURITY.md`, `VISION.md`, and `CHANGES.md`

## Verification Plan

- `npm ci --ignore-scripts`
- `npm audit --audit-level=low`
- `npm run check`, `npm test`, `make lint`, `make build`, and `make check`
- installed launcher help and command smoke tests
- external-working-directory `make check`
- `npm pack --dry-run` with reviewed package contents and portable cleanup
- hostile mutations for archived imports, dependency drift, missing lockfile,
  weakened audit policy, removed Windows coverage, missing smoke tests, and
  nonportable Make execution
- successful exact-head push and pull-request jobs on `ubuntu-24.04` and
  `windows-2025` using Node 24

## Boundaries

- Do not add Twilio credentials, account access, network calls, or mutations.
- Do not change `Hello World Test!`, the `gjones:mycommand` ID, command
  description, immutable output export, or package purpose.
- Do not adopt oclif core 4 until the Twilio CLI Core host contract supports it.
- Do not publish the package during this unit.
