# Security Policy

## Supported Versions

The supported security scope for `plugin-gjones` is the current default branch, `master`. Older commits, tags, branches, forks, demos, and generated artifacts are not actively supported unless the repository explicitly marks them as maintained.

Project summary: Simple Twilio Plugin 

## Reporting a Vulnerability

Please report suspected vulnerabilities through GitHub's private vulnerability reporting or by opening a draft GitHub Security Advisory for `garethpaul/plugin-gjones` when that option is available. If GitHub does not show a private reporting option for this repository, contact the repository owner through GitHub and avoid posting exploit details publicly until the issue can be assessed.

Do not open a public issue that includes exploit code, secrets, personal data, or detailed reproduction steps for an unpatched vulnerability.

## What to Include

Helpful reports include:

- the affected file, endpoint, permission, dependency, or workflow
- a concise impact statement explaining what an attacker could do
- reproduction steps using test data and accounts you control
- the branch, commit SHA, platform version, device, runtime, or dependency versions used
- logs, screenshots, or proof-of-concept snippets that demonstrate impact without exposing private data

## Project Security Posture

- This repository appears to be a Node.js or JavaScript project. The active security scope is the code and documentation on the default branch.
- Review found authentication, token, or session-related code paths; changes in those areas should receive security-focused review before merge.
- Review found external API integrations or credential-adjacent configuration; changes in those areas should receive security-focused review before merge.
- Review found network clients, sockets, web APIs, or service endpoints; changes in those areas should receive security-focused review before merge.
- Review found file, document, data, or media parsing flows; changes in those areas should receive security-focused review before merge.
- The current scaffold command is credential-free and performs no account
  mutations. Treat any future Twilio account read/write as security-sensitive
  and document the side effect before merge.
- Dependency manifests detected: package.json. Dependency updates should preserve lockfiles when present and avoid introducing packages without a clear maintenance reason.

## Service and API Notes

For web services, APIs, sockets, or scraping workflows, prioritize reports involving authentication bypass, authorization errors, injection, server-side request forgery, unsafe deserialization, credential leakage, data exposure, or denial-of-service conditions. Use test accounts and minimal proof-of-concept traffic only.

For Twilio CLI plugin behavior, also report commands that capture, log, print,
or persist Twilio credentials, profile data, Account SIDs, Auth Tokens, phone
numbers, or customer data unexpectedly.

## Dependency and Supply Chain Security

Pinned, credential-free, read-only hosted Linux and Windows validation uses the
reviewed lockfile, disables lifecycle scripts during installation, runs static,
command-output, and installed launcher tests, audits the full dependency graph,
and validates package contents without using Twilio credentials.

Dependency updates should come from trusted package managers and should keep lockfiles in sync when lockfiles exist. Do not commit credentials, private keys, tokens, generated secrets, or machine-local configuration. If a vulnerability depends on a compromised package, typosquatting risk, insecure transitive dependency, or unsafe build step, include the package name, affected version, and the path through which it is used.

Run `npm run check`, `npm run lint`, `npm run build`, `make lint`,
`make build`, and `make check` before changing command behavior, package
scripts, CI, or credential-adjacent Twilio CLI behavior.
Node 24 is the local and hosted toolchain baseline. Keep `.nvmrc`,
`package.json` engines, `package-lock.json`, and GitHub Actions aligned. Keep
`@oclif/core` compatible with Twilio CLI Core 8.3.4, require
`npm audit --audit-level=low` to remain clean, and do not restore AppVeyor or
archived direct oclif development tools.

The supported plugin host boundary is Twilio CLI `>=6.0.0 <7.0.0` on Node 24
or newer. Twilio CLI 5.x and earlier Node runtimes are unsupported. Treat any
future host-major expansion as a compatibility and security review because the
plugin runs inside the user's authenticated CLI process. Current tests cover
CLI Core 8.3.4 without live profiles, credentials, API calls, or account access.

Run `npm run test:command` after command-output changes so the dependency-free
command execution test continues to cover scaffold behavior without requiring a
live Twilio profile. Keep the output constant aligned with documented behavior.
Keep the immutable output export aligned with the command so consumers cannot
replace public metadata independently of runtime behavior.
Keep command description metadata covered by the command execution test so the
help surface remains reviewable.
Keep `bin/run` as the executable launcher and avoid permission churn in
packaging files, because broken launcher metadata can change how users run the
plugin scaffold.
Keep the Windows launcher wrapper as a quiet delegation to the adjacent Node
launcher so Windows installs run the same reviewed entry point as local tests.
Keep packaged launcher files included in `package.json` so published installs
match the reviewed local launcher behavior.
Keep the package description aligned with the credential-free Twilio CLI plugin
scaffold purpose so published metadata does not imply hidden account behavior.

## Safe Research Guidelines

Good-faith research is welcome when it stays within these boundaries:

- use only accounts, devices, data, and infrastructure that you own or have explicit permission to test
- avoid destructive actions, persistence, spam, phishing, social engineering, or denial-of-service testing
- minimize access to personal data and stop testing immediately if private data is exposed
- do not exfiltrate secrets or third-party data; report the minimum evidence needed to verify impact
- keep vulnerability details confidential until the maintainer has assessed the report

## Maintainer Response

The maintainer will review complete reports as availability allows, prioritize issues by exploitability and impact, and coordinate a fix or mitigation when the affected code is still maintained. For sample, archived, or educational repositories, the likely remediation may be documentation, dependency updates, or clearly marking unsupported code rather than a production-style patch release.
