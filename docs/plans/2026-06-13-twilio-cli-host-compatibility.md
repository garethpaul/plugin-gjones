# Twilio CLI Host Compatibility

status: completed

## Context

The plugin documents a Node 24 floor and locks `@twilio/cli-core` 8.3.4, but it
does not tell operators which Twilio CLI host line matches that runtime and core
contract. npm registry metadata shows Twilio CLI 5.23.1 on CLI Core 7.26.5 and
Twilio CLI 6.0.0 through the current 6.2.4 line on CLI Core 8. The repository
should state the supported host boundary without implying that every host patch
is installed end to end in CI.

## Requirements

- Document Twilio CLI `>=6.0.0 <7.0.0` on Node 24 as the supported host line.
- State that Twilio CLI 5.x and Node versions below 24 are outside the supported
  boundary.
- Distinguish the locked CLI Core 8.3.4 command/launcher validation from a full
  Twilio CLI host-installation matrix.
- Add a dependency-free test and static contracts that reject drift in the
  package Node floor, CLI Core major, compatibility wording, and plan evidence.

## Scope Boundaries

- Do not add `twilio-cli` as a production or development dependency.
- Do not change command output, command metadata, launchers, workflows,
  dependencies, or the lockfile.
- Do not claim live authentication, account access, publication, or compatibility
  with unreleased Twilio CLI 7.x.

## Verification Plan

- Run the focused compatibility test and the complete npm and Make gates on
  Node 24.
- Run the full dependency audit and package dry run.
- Parse package, lockfile, workflow, and README SVG metadata.
- Run focused hostile mutations against the version range, Node floor, CLI Core
  major, documentation, and completed-plan evidence.
- Inspect the exact diff, generated artifacts, credentials, dependency files,
  command sources, launchers, and workflows before committing.

## Work Completed

- Documented Twilio CLI `>=6.0.0 <7.0.0` on Node 24 as the supported plugin
  host boundary and marked Twilio CLI 5.x and older Node runtimes unsupported.
- Added a dependency-free compatibility test for the package Node floor, the
  declared CLI Core 8.3.4 dependency, the locked CLI Core major, and the active
  Node runtime.
- Added package-script, test-source, documentation, and completed-plan contracts
  while preserving dependencies, the lockfile, commands, launchers, and CI.

## Verification Completed

- npm registry metadata confirmed Twilio CLI 5.23.1 uses CLI Core 7.26.5 and
  Twilio CLI 6.0.0 through 6.2.4 use CLI Core 8 on Node 20 or newer.
- Node 24.16.0: `npm run test:compatibility`, the dependency-free command test,
  and the installed oclif smoke test passed.
- Node 24.16.0: `npm test`, `npm run lint`, `npm run build`, and all Make gates
  passed.
- `npm audit --audit-level=low` reported zero vulnerabilities, and
  `npm pack --dry-run` contained the expected six files with generated manifest
  cleanup.
- Seven focused hostile mutations covering the Node floor, CLI Core dependency
  and lock major, compatibility test assertions, README range, package test
  wiring, and plan status were rejected.
- JavaScript syntax validation, `git diff --check`, generated-artifact and
  credential scans, and command/dependency/lockfile/launcher/workflow
  preservation checks passed.
