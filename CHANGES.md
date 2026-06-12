# Changes

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
