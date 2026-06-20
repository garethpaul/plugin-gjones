# Changes

## 2026-06-19 deep review

- Documented Twilio CLI `>=6.0.0 <7.0.0` on Node 20, 22, and 24 as the supported
  plugin host boundary while retaining Node 24 as the `.nvmrc` default.
- Rejected unexpected argv without echoing credential-like values.
- Removed root-only npm overrides and the ineffective js-yaml launcher shim;
  added a packed consumer audit that fail-closes around the exact
  `GHSA-h67p-54hq-rp68` upstream chain.
- Kept `form-data 4.0.6` and `undici 6.27.0` in the reviewed lock and added
  multi-Node hosted gates without live Twilio calls or plugin publishing.

## 2026-06-20

- Pinned transitive `js-yaml` to 4.2.0 and preloaded the safe-by-default
  `load`/`dump` APIs under the legacy oclif `safeLoad`/`safeDump` aliases.
- Replaced the reviewed advisory allowance with a fail-closed audit policy that
  requires zero known vulnerabilities across the complete dependency graph.
- Superseded by the 2026-06-19 deep review after a packed consumer install
  proved npm ignores dependency-package overrides.

## 2026-06-19

- Pinned transitive `undici` to 6.27.0 to remove the newly disclosed request
  smuggling and unbounded decompression advisories without changing the Twilio
  CLI compatibility boundary.

## 2026-06-15

- Patched the high-severity form-data advisory and kept full hosted audits
  fail-closed around the exact moderate js-yaml chain blocked upstream.

## 2026-06-13

- Documented Twilio CLI `>=6.0.0 <7.0.0` on Node 24 as the supported plugin
  host boundary and added an executable CLI Core 8 compatibility contract.
- Replaced the stale `gjones` oclif topic description with the maintained
  credential-free scaffold wording and added installed-help coverage.

- Replaced the archived oclif command, launcher, and development toolchain with
  compatible `@oclif/core` 1.26.2, Twilio CLI Core 8.3.4, and oclif 4.23.14.
- Added a reviewed lockfile, installed launcher smoke coverage, portable package
  cleanup, zero-finding full dependency graph auditing, and caller-independent
  Make targets.
- Replaced AppVeyor with pinned Ubuntu 24.04 and Windows 2025 GitHub Actions
  jobs on Node 24 using script-disabled locked installs and package dry runs.
- Added a required `check` aggregator over the platform matrix to preserve the
  repository's existing protected status context without reducing coverage.

## 2026-06-10

- Refreshed the stale Node toolchain baseline to Node 24 across `.nvmrc`,
  package engines, AppVeyor, and GitHub Actions while keeping verification on
  the dependency-free baseline.
- Added pinned, credential-free, read-only hosted Linux validation on Node 24
  for the dependency-free plugin command baseline.
- Made the exported output constant immutable and covered its property
  descriptor in the command execution test.
- Added a static guard for the Windows launcher wrapper entry point.

## 2026-06-09

- Added stable `make lint`, `make build`, `npm run lint`, and `npm run build`
  aliases for the static plugin baseline.
- Added command description metadata coverage to the scaffold command execution
  test.
- Aligned the package description with the credential-free Twilio CLI plugin
  scaffold purpose.

## 2026-06-08

- Added a root `make check` wrapper for the static and command-output gates.
- Added `npm run check` and `npm test` static baseline verification.
- Made the scaffold command credential-free by extending oclif `Command`
  instead of a credential-aware Twilio client base class.
- Removed remote Codecov script execution from AppVeyor.
- Updated package metadata and docs for the current repository.
- Added docs and checks that keep the sample free of account mutations and
  Twilio credential handling.
- Added a dependency-free `npm run test:command` guard for the scaffold output.
- Strengthened `npm run test:command` into a command execution test that calls
  `run()` with a mocked oclif base class.
- Moved the scaffold output text into an exported `OUTPUT_MESSAGE` constant.
- Made the exported output constant non-writable and non-configurable.
- Added a static check that preserves the executable launcher mode on `bin/run`.
- Included packaged launcher files in the npm package file list.
- Added a static check that preserves oclif metadata for the command topic,
  launcher bin, command directory, and source links.
