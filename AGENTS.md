# AGENTS.md

## Repository purpose

`garethpaul/plugin-gjones` is a credential-free Twilio CLI plugin scaffold with a single `gjones:mycommand` example command.

## Project structure

- `Makefile` - fail-closed redirect away from untrusted Make validation
- `scripts` - baseline checks and helper scripts
- `docs` - plans, notes, and generated README assets
- `src` - primary source code
- `tests` - tests and fixtures
- `package.json` - Node package metadata and scripts

## Development commands

- Install dependencies: `npm ci --ignore-scripts`
- Canonical repository-local test: `node scripts/verify-repository.js test`
- Convenience full baseline on a reviewed tree: `npm test`
- Package graph audit: `node scripts/check-audit.js`
- Package contents: `npm pack --dry-run`
- Packed consumer audit: `npm run audit:consumer`
- Real Twilio host compatibility: `npm run verify:twilio-host`
- Static checks: `npm run check`
- Lint/static alias: `npm run lint`
- Build/static alias: `npm run build`
- Combined verification: `npm run verify`
- package script `build`: `npm run build`
- package script `lint`: `npm run lint`
- package script `test`: `npm test`
- package script `check`: `npm run check`
- Make fails closed and is not a validation entrypoint.
- If a command above skips because a platform toolchain is missing, verify on a machine with that SDK before claiming platform behavior is tested.

## Coding conventions

- Language mix noted in the README: JavaScript (1).
- Use Node 20 or newer for package scripts; `.nvmrc` selects Node 24 for local
  maintenance, and hosted validation covers Node 20, 22, 24, and 25.

## Testing guidance

- Test-related files detected: `docs/plans/2026-06-09-plugin-gjones-command-execution-test.md`, `tests/`, `tests/command-output.test.js`
- Start with the narrowest relevant test or package script, then run `npm test` before handing off if the change is not documentation-only.
- Keep README verification notes in sync when commands, fixtures, or supported toolchains change.

## PR / change guidance

- Keep diffs focused on the requested repository and avoid unrelated modernization or formatting churn.
- Preserve public APIs, sample behavior, file formats, and documented environment variables unless the task explicitly changes them.
- Update tests, README notes, or docs/plans when behavior, security posture, or validation commands change.
- Call out skipped platform validation, legacy toolchain assumptions, and any risky files touched in the final summary.

## Safety and gotchas

- Detected references to Twilio. Keep API keys, OAuth credentials, tokens, and account-specific values in local configuration only.
- Do not commit Twilio credentials, Account SIDs, Auth Tokens, customer data, or profile-specific output.
- The current command is credential-free and has no account mutations. Keep that static baseline unless the README and security notes explicitly document a new Twilio account read or write.
- Keep the output constant aligned with the documented scaffold output.
- Keep command description metadata covered by the command execution test.
- Keep the package description aligned with the credential-free Twilio CLI plugin scaffold purpose.
- Keep installs lockfile-driven and lifecycle-script-disabled with
  `npm ci --ignore-scripts`; package scripts are convenience aliases, while the
  direct repository verifier is the canonical repository-local test entrypoint.
- The base-owned trusted-tree check validates only protected Git tree paths; it
  does not attest package behavior, consumer safety, or publication readiness.
- No contributor command publishes the package. Passing repository, package,
  consumer, or host checks does not authorize an npm release.

## Agent workflow

1. Inspect the README, Makefile, manifests, and the files directly related to the request.
2. Make the smallest source or docs change that satisfies the task; avoid generated, vendored, or local-environment files unless required.
3. Run the narrowest useful validation first, then
   `node scripts/verify-repository.js test` or the documented package/platform
   gate when available.
4. If a required SDK, service credential, or external runtime is unavailable, record the skipped command and why.
5. Summarize changed files, commands run, and remaining risks or follow-up validation.
