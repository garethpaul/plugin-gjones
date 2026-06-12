# Plugin Gjones oclif Toolchain Migration

status: completed

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

## Work Completed

- Migrated the command and launcher from archived oclif packages to compatible
  `@oclif/core` 1.26.2 and Twilio CLI Core 8.3.4 APIs.
- Replaced `@oclif/dev-cli` with oclif 4.23.14 and removed unused direct test,
  lint, coverage, and glob dependencies.
- Added a lockfileVersion 3 graph, installed launcher smoke coverage, portable
  package cleanup, and caller-directory-independent Make targets.
- Replaced AppVeyor with pinned Ubuntu 24.04 and Windows 2025 GitHub Actions
  jobs using script-disabled locked installs, full audits, tests, and package
  dry runs.
- Normalized CRLF reads and limited Unix executable-bit checks to non-Windows
  hosts after the first Windows hosted run exposed those portability gaps.

## Verification Completed

- Node 24.16.0 completed `npm ci --ignore-scripts`, `npm run check`, `npm test`,
  `make lint`, `make test`, `make build`, `make verify`, and `make check`.
- The full Make gate passed from an external working directory.
- `npm audit --audit-level=low` reported zero vulnerabilities across 462 installed packages.
- `npm pack --dry-run` produced the expected six files and portable postpack
  cleanup removed `oclif.manifest.json`.
- The dependency-free output test and installed
  `tests/oclif-command-smoke.test.js` suite passed with exact
  `Hello World Test!` output.
- Eight hostile implementation mutations covering archived imports, core
  drift, missing lockfile, weakened audit, missing Windows coverage, removed
  smoke tests, nonportable Make execution, and restored AppVeyor were rejected.
- A CRLF workflow simulation passed after line-ending normalization was added.
- CodeQL run `27413299838` completed successfully on implementation commit
  `7a6faa081e4617ad96778440ca6a8e228253c954`.
- GitHub Actions push run `27413384712` and pull-request run `27413387196`
  completed successfully on exact implementation head
  `ea4ad6c0a5d93e765d4530b15f4f20ed1879167a`, each covering
  `ubuntu-24.04`, `windows-2025`, and Node 24.

## Boundaries

- Do not add Twilio credentials, account access, network calls, or mutations.
- Do not change `Hello World Test!`, the `gjones:mycommand` ID, command
  description, immutable output export, or package purpose.
- Do not adopt oclif core 4 until the Twilio CLI Core host contract supports it.
- Do not publish the package during this unit.
