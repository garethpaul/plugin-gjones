## Plugin Gjones Vision

Plugin Gjones is a credential-free Twilio CLI plugin scaffold with a single
`gjones` command topic and a simple example command.

The repository is useful as a minimal oclif/Twilio CLI plugin reference: it
shows package metadata, command placement, generated README structure, and the
basic oclif command extension point.

The goal is to keep the scaffold understandable while clarifying whether it is
an example plugin or a maintained user-facing CLI extension.

Current baseline: `npm run check`, `npm run lint`, `npm run build`, and
`npm test` verify the credential-free command, package metadata, CI
guardrails, docs, and static baseline without requiring Twilio credentials or a
live account.
Make fails closed and is not a validation entrypoint.
`npm run test:command` keeps the documented scaffold output aligned with the
command implementation by executing `run()` with a mocked oclif base class.
Node 24 is the default local toolchain. GitHub Actions runs Node 20, 22, and 24
on hosted Linux plus Node 24 on Windows with script-disabled installation,
repository and packed consumer audits, tests, and package validation.

The current focus is:

Priority:

- Keep the dependency-free command test plus installed launcher smoke coverage
  running on pinned hosted Linux and Windows across Node 20, 22, and 24

- Preserve the minimal command scaffold
- Keep oclif and Twilio CLI metadata coherent
- Keep the installed `gjones` topic description aligned with the
  credential-free scaffold purpose
- Avoid adding side effects to the example command
- Keep the current command credential-free and free of account mutations
- Keep generated documentation aligned with command names
- Keep command execution test coverage dependency-free
- Keep the scaffold output constant aligned with README behavior
- Keep the immutable output export aligned with runtime command behavior
- Keep command description metadata covered by the command execution test
- Keep the package description aligned with the credential-free scaffold purpose
- Keep `bin/run` as the executable launcher for Unix installs
- Keep the Windows launcher wrapper delegated to the adjacent Node launcher
- Keep packaged launcher files included for npm publishes
- Keep `npm run lint` and `npm run build` available as stable static gate aliases
- Keep the direct verifier fail-closed against inherited and command-line Node
  preloads before repository child dispatch without presenting it as a sandbox
  or independent attestation
- Keep package oclif metadata aligned with the command topic and launcher bin
- Keep Node 24 as the `.nvmrc` default while engines and CI support Node 20+
- Keep `@oclif/core` compatible with Twilio CLI Core 8.3.4 and keep the
  repository plus packed consumer audit pinned to the reviewed upstream chain
- Keep Twilio CLI `>=6.0.0 <7.0.0` on Node 20, 22, and 24 as the explicit supported host
  boundary, with CLI Core 8 compatibility covered without live credentials

Next priorities:

- Add full Twilio CLI host-installation coverage only when it can remain
  credential-free and deterministic across hosted Linux and Windows

Contribution rules:

- One PR = one focused command, package, test, or documentation change.
- Do not add account-affecting behavior without explicit docs and tests.
- Keep examples free of credentials.
- Keep `npm run check`, `npm run lint`, `npm run build`, and `npm test`
  passing for command and package metadata changes.
- Regenerate command docs only when command metadata changes.

## Security And Responsible Use

Canonical security policy and reporting:

- [`SECURITY.md`](SECURITY.md)

CLI plugins run in a user-authenticated Twilio CLI context. Future commands
should make account reads and writes explicit and should avoid printing or
persisting sensitive profile data.

## What We Will Not Merge (For Now)

- Hidden account mutations
- Credential capture or logging
- Broad command expansion before the plugin purpose is documented
- Generated docs that do not match the command implementation

This list is a roadmap guardrail, not a permanent rule.
Strong user demand and strong technical rationale can change it.
