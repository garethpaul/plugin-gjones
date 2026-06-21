# plugin-gjones

<!-- README-OVERVIEW-IMAGE -->
![Project overview](docs/readme-overview.svg)

## Overview

`garethpaul/plugin-gjones` is a credential-free Twilio CLI plugin scaffold with
a single `gjones:mycommand` example command.

The command is credential-free and does not make Twilio API calls or account
mutations. Future commands that read or write account data should document the
side effect and include tests before they are added.

This README is based on the checked-in source, manifests, scripts, and repository metadata on the `master` branch. The project language mix found during review was: JavaScript (1).

## Repository Contents

- `.gitignore` - generated output, dependency, log, and environment ignores
- `CHANGES.md` - baseline change log
- `Makefile` - fail-closed redirect away from untrusted Make validation
- `README.md` - project overview and local usage notes
- `package.json` and `package-lock.json` - reviewed JavaScript dependency and script metadata
- `bin` - source or example code
- `SECURITY.md` - security reporting and disclosure guidance
- `src` - source or example code
- `tests` - dependency-free command output and installed launcher checks
- `VISION.md` - project direction and maintenance guardrails
- `docs/plans/2026-06-08-plugin-gjones-baseline.md` - completed baseline plan
- `scripts/check-baseline.js` - dependency-free static baseline checks

Additional scan context:

- Source directories: bin, src
- Dependency and build manifests: package.json
- Entry points or build surfaces: package.json, Makefile
- Test-looking files: tests/command-output.test.js

## Getting Started

### Prerequisites

- Git
- Node.js 20, 22, 24, or 25 and npm; Node 24 remains the default in `.nvmrc`
- Twilio CLI `>=6.0.0 <7.0.0` when loading this package as a plugin

### Supported Twilio CLI Host

The supported host line is Twilio CLI `>=6.0.0 <7.0.0` on Node 20, 22, 24, and
25. The packed plugin declares Oclif and Twilio CLI Core as optional host
contracts but owns neither dependency. Twilio CLI 5.x and Node versions below
20 are outside the supported contract.

Repository validation exercises the command through the local Oclif toolchain
and a packed artifact linked into real Twilio CLI 6.2.4. It does not exercise
live authentication, profiles, API calls, account mutations, or publication.

### Setup

```bash
git clone https://github.com/garethpaul/plugin-gjones.git
cd plugin-gjones
nvm use
npm ci --ignore-scripts
npm run check
```

The setup commands above are derived from repository files. Legacy mobile, Python, or JavaScript samples may require older SDKs or package versions than a modern workstation uses by default.

## Running or Using the Project

- Run `npm run check`, `npm run lint`, or `npm run build` before changing command
  behavior or package metadata.
- Use `./bin/run gjones:mycommand` after dependencies are installed to run the
  scaffold command. It prints `Hello World Test!`.
- The scaffold output is defined by the exported `OUTPUT_MESSAGE` output
  constant and covered by `npm run test:command`.
- The immutable output export cannot be reassigned independently of the command
  implementation.
- Command description metadata is covered by `npm run test:command` so the
  scaffold help surface stays reviewable.
- The package description stays aligned with the credential-free Twilio CLI
  plugin scaffold purpose.
- Keep `bin/run` as the executable local development launcher; `bin/run.cmd`
  remains the non-executable Windows development wrapper.
- Keep the Windows launcher wrapper as a quiet delegation to the adjacent
  `bin/run` Node entry point.
- Packed artifacts exclude both launchers and contain only generated metadata,
  command source, and standard npm documentation files.
- Keep the oclif metadata aligned with the `gjones` command topic, `twilio`
  launcher bin, and `./src/commands` command directory.
- The installed `gjones` topic help describes the commands as
  `Credential-free plugin scaffold commands`.

Detected npm scripts:

- `npm run build` - repository-owned baseline verification
- `npm run postpack` - portable generated-manifest cleanup
- `npm run prepack` - `oclif manifest && oclif readme`
- `npm run check` - repository-owned baseline verification
- `npm run lint` - repository-owned baseline verification
- `npm run test` - static, host-compatibility, command-output, and installed
  oclif smoke tests
- `npm run test:authority` - reject Make/PATH attempts to claim validation
- `npm run verify` - repository-owned lint, test, and build verification
- `npm run audit:consumer` - pack, install, and audit the consumer artifact
- `npm run test:packed` - prove a fresh packed consumer owns no vulnerable path
- `npm run test:yaml` - prove plugin modules preserve host safe YAML APIs
- `npm run verify:twilio-host` - link the packed plugin into Twilio CLI 6.2.4
- `npm run test:consumer` - dependency-free consumer-audit helper tests
- `npm run test:compatibility` - Node and CLI Core host-boundary contract
- `npm run test:command` - `node tests/command-output.test.js`
- `npm run test:oclif` - `node tests/oclif-command-smoke.test.js`
- `npm run version` - `oclif readme && git add README.md`

## Testing and Verification

Pinned, credential-free hosted validation runs Node 20, 22, 24, and 25 on Linux
and Windows. It installs the reviewed lockfile with lifecycle scripts disabled,
runs the complete test suite, audits the full development graph, validates the
package contents, and audits a fresh packed consumer. Both repository and
packed-consumer policies require zero findings; no advisory allowlist exists.
The packed plugin has no runtime `dependencies`, no overrides, no nested
`node_modules`, no launcher, and no YAML preload or monkeypatch.

Twilio CLI 6.2.4 independently resolves `js-yaml 3.14.2` and currently has a
non-zero host audit. Those findings are host-owned and are reported separately;
they are neither installed by the plugin nor treated as plugin audit success.
The real-host check verifies `Hello World Test!` and ensures npm does not
attribute host advisories to `@garethpaul/plugin-gjones`.

- `npm run check`
- `npm run lint`
- `npm run build`
- `npm test`
- `node scripts/verify-repository.js verify`
- `node scripts/check-baseline.js`
- `npm run test:command`
- `npm run test:compatibility`
- `npm run test:oclif`
- `npm run test:packed`
- `npm run test:yaml`
- `npm run audit:consumer`
- `npm run verify:twilio-host`
- `npm audit --audit-level=low`
- `npm pack --dry-run`

Package scripts invoke the repository-owned Node verifier directly, but remain
convenience aliases for an already reviewed tree. Hosted workflows invoke the
verifier without npm so `pretest` and `posttest` lifecycle hooks cannot run
before or after validation. The direct Node verifier is the authoritative hosted
entrypoint. Make is explicitly not a trusted validation entrypoint: every Make
invocation fails during parsing before recipes, shell functions, `PATH`, or
caller-supplied makefiles can claim validation.

`npm run test:command` remains a dependency-free command execution test. It evaluates
`gjones:mycommand` with a mocked oclif `Command`, calls `run()`, and verifies the
documented scaffold output and command description metadata without requiring
installed packages. `npm run test:oclif` verifies installed launcher help and
`gjones:mycommand` behavior through compatible Oclif host APIs. GitHub Actions
runs the locked suite on Ubuntu 24.04 and Windows
2025 for pushes and pull requests. The command rejects unexpected argv with a
generic error so credential-like values are neither accepted nor reflected in
plugin output.

When the required SDK or runtime is unavailable, use static checks and source review first, then verify on a machine that has the matching platform toolchain.

## Configuration and Secrets

- Detected references to Twilio. Keep API keys, OAuth credentials, tokens, and account-specific values in local configuration only.
- Do not commit Twilio credentials, Account SIDs, Auth Tokens, customer data,
  or profile-specific output.

## Security and Privacy Notes

- Review changes touching external API calls or credential-adjacent configuration; examples from the scan include bin/run, package.json, src/commands/gjones/mycommand.js.
- Review changes touching network requests, sockets, or service endpoints; examples from the scan include appveyor.yml, package.json.
- Review changes touching file, media, JSON, XML, CSV, OCR, or data parsing; examples from the scan include appveyor.yml, package.json.
- The current command is credential-free and has no account mutations. Keep that
  static baseline unless the README and security notes explicitly document a
  new Twilio account read or write.
- Keep the output constant aligned with the documented scaffold output.
- Keep the immutable output export non-writable and non-configurable.
- Keep command description metadata covered by the command execution test.
- Keep the package description aligned with the credential-free Twilio CLI
  plugin scaffold purpose.

## Maintenance Notes

- Run `npm run check`, `npm run lint`, `npm run build`, and `npm test`
  before changing command code, package
  scripts, CI, or Twilio credential handling.
- Keep `.nvmrc`, `package.json` engines, the reviewed lockfile, and GitHub
  Actions aligned on the Node 24 toolchain baseline.
- Keep the executable launcher mode on `bin/run` intact when editing packaging
  files.
- Keep the Windows launcher wrapper pointed at the adjacent Node launcher when
  editing packaging files.
- Keep packaged launcher files included when editing `package.json`.
- Keep oclif metadata coherent when editing command names, launcher metadata, or
  generated command docs.
- Keep the package description coherent when editing scaffold purpose or package
  metadata.
- See `CHANGES.md` and `docs/plans/2026-06-08-plugin-gjones-baseline.md` for
  the current static baseline.
- See `SECURITY.md` for vulnerability reporting and safe research guidance.
- See `VISION.md` for project direction and contribution guardrails.

## Contributing

Keep changes small and tied to the project that is already present in this repository. For code changes, document the toolchain used, avoid committing generated dependency directories or local configuration, and update this README when setup or verification steps change.
