# Changes

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
- Added a static check that preserves the executable launcher mode on `bin/run`.
