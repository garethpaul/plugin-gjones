# AGENTS.md

## Repository purpose

`garethpaul/plugin-gjones` is a credential-free Twilio CLI plugin scaffold with a single `gjones:mycommand` example command.

## Project structure

- `Makefile` - repository verification targets
- `scripts` - baseline checks and helper scripts
- `docs` - plans, notes, and generated README assets
- `src` - primary source code
- `tests` - tests and fixtures
- `package.json` - Node package metadata and scripts

## Development commands

- Install dependencies: `npm install`
- Full baseline: `make check`
- Combined verification: `make verify`
- Lint/static checks: `make lint`
- Tests: `make test`
- Build: `make build`
- package script `build`: `npm run build`
- package script `lint`: `npm run lint`
- package script `test`: `npm test`
- package script `check`: `npm run check`
- If a command above skips because a platform toolchain is missing, verify on a machine with that SDK before claiming platform behavior is tested.

## Coding conventions

- Language mix noted in the README: JavaScript (1).
- Use Node 24 or newer for package scripts; `.nvmrc` pins the hosted baseline.

## Testing guidance

- Test-related files detected: `docs/plans/2026-06-09-plugin-gjones-command-execution-test.md`, `tests/`, `tests/command-output.test.js`
- Start with the narrowest relevant test or Make target, then run `make check` before handing off if the change is not documentation-only.
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

## Agent workflow

1. Inspect the README, Makefile, manifests, and the files directly related to the request.
2. Make the smallest source or docs change that satisfies the task; avoid generated, vendored, or local-environment files unless required.
3. Run the narrowest useful validation first, then `make check` or the documented package/platform gate when available.
4. If a required SDK, service credential, or external runtime is unavailable, record the skipped command and why.
5. Summarize changed files, commands run, and remaining risks or follow-up validation.
