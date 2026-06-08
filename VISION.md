## Plugin Gjones Vision

Plugin Gjones is a small Twilio CLI plugin scaffold with a single `gjones`
command topic and a simple example command.

The repository is useful as a minimal oclif/Twilio CLI plugin reference: it
shows package metadata, command placement, generated README structure, and the
basic oclif command extension point.

The goal is to keep the scaffold understandable while clarifying whether it is
an example plugin or a maintained user-facing CLI extension.

Current baseline: `npm run check` verifies the credential-free command,
package metadata, CI guardrails, docs, and static baseline without requiring
Twilio credentials or a live account.

The current focus is:

Priority:

- Preserve the minimal command scaffold
- Keep oclif and Twilio CLI metadata coherent
- Avoid adding side effects to the example command
- Keep the current command credential-free and free of account mutations
- Keep generated documentation aligned with command names

Next priorities:

- Add a README note that defines the plugin purpose
- Add a command test for the current output
- Fix any stale package metadata or issue links
- Document supported Node and Twilio CLI versions

Contribution rules:

- One PR = one focused command, package, test, or documentation change.
- Do not add account-affecting behavior without explicit docs and tests.
- Keep examples free of credentials.
- Keep `npm run check` passing for command and package metadata changes.
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
