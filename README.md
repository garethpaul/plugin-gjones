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
- `Makefile` - repository-level verification wrapper
- `README.md` - project overview and local usage notes
- `package.json` - JavaScript dependency and script metadata
- `bin` - source or example code
- `SECURITY.md` - security reporting and disclosure guidance
- `src` - source or example code
- `tests` - dependency-free command output checks
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
- Node.js 24 or newer and npm

### Setup

```bash
git clone https://github.com/garethpaul/plugin-gjones.git
cd plugin-gjones
nvm use
make check
```

The setup commands above are derived from repository files. Legacy mobile, Python, or JavaScript samples may require older SDKs or package versions than a modern workstation uses by default.

## Running or Using the Project

- Run `make check`, `make lint`, or `make build` before changing command
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
- Keep `bin/run` as the executable launcher for Unix installs; `bin/run.cmd`
  remains the non-executable Windows wrapper.
- Keep the Windows launcher wrapper as a quiet delegation to the adjacent
  `bin/run` Node entry point.
- Packaged launcher files stay included through the package `files` list.
- Keep the oclif metadata aligned with the `gjones` command topic, `twilio`
  launcher bin, and `./src/commands` command directory.

Detected npm scripts:

- `npm run build` - `npm run check`
- `npm run postpack` - `rm -f oclif.manifest.json`
- `npm run prepack` - `oclif-dev manifest && oclif-dev readme`
- `npm run check` - `node scripts/check-baseline.js`
- `npm run lint` - `npm run check`
- `npm run test` - `npm run check && npm run test:command`
- `npm run test:command` - `node tests/command-output.test.js`
- `npm run version` - `oclif-dev readme && git add README.md`

## Testing and Verification

Pinned, credential-free hosted Linux validation reads Node 24 from `.nvmrc` and
runs the dependency-free `make check` baseline without installing the unlocked
legacy oclif/Twilio graph.

- `make check`
- `make lint`
- `make build`
- `npm run check`
- `npm run lint`
- `npm run build`
- `npm test`
- `node scripts/check-baseline.js`
- `npm run test:command`

`npm run test:command` is a dependency-free command execution test. It evaluates
`gjones:mycommand` with a mocked oclif `Command`, calls `run()`, and verifies the
documented scaffold output and command description metadata without requiring
installed packages. GitHub Actions reads `.nvmrc`, uses Node 24, and runs the
same dependency-free baseline through `make check` on pushes and pull requests.

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

- Run `npm run check`, `npm run lint`, `npm run build`, `make lint`,
  `make build`, and `make check` before changing command code, package
  scripts, CI, or Twilio credential handling.
- Keep `.nvmrc`, `package.json` engines, AppVeyor, and GitHub Actions aligned
  on the Node 24 toolchain baseline.
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
