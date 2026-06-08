# Plugin Gjones Baseline Plan

status: completed

## Context

`plugin-gjones` is a minimal oclif/Twilio CLI plugin scaffold with one example
command.

## Risks

- The hello-world command extended a credential-aware Twilio client base class,
  implying credential setup for output that does not need a live account.
- `npm test` depended on absent test files, coverage thresholds, and `npm audit`
  despite no committed lockfile.
- AppVeyor downloaded and executed a remote Codecov shell script.
- Package metadata pointed issue reports at the upstream Twilio CLI repository.

## Work Completed

- Added `scripts/check-baseline.js`, `npm run check`, and `npm test`.
- Made the command extend oclif `Command` and use `this.log`.
- Removed remote Codecov script download/execution from AppVeyor.
- Updated the package bugs URL to this repository.
- Documented the credential-free, no-account-mutation baseline.

## Verification

- `npm run check`
- `npm test`
- `node scripts/check-baseline.js`
- `git diff --check`
