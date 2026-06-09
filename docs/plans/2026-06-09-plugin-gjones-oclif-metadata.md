# Plugin Gjones Oclif Metadata Plan

status: completed

## Context

The scaffold depends on `package.json` oclif metadata to expose the `gjones`
topic through the Twilio CLI launcher. Existing checks covered command output,
launcher modes, and package files, but they did not catch accidental drift in
the command topic, launcher bin, command directory, or source-link metadata.

## Objectives

- Require `package.json` oclif metadata to keep the `gjones` plugin name.
- Require the Twilio CLI `twilio` launcher bin and `./src/commands` command
  directory to stay aligned with the scaffold.
- Require the `gjones` topic description and command source-link template to
  remain populated.
- Document the oclif metadata guardrail in README, VISION, and CHANGES.

## Verification

- `node scripts/check-baseline.js`
- `npm run check`
- `npm run test:command`
- `npm test`
- `make check`
- `git diff --check`
