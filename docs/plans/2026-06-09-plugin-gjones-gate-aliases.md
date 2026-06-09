# Plugin Gjones Gate Aliases Plan

status: completed

## Context

The plugin had `npm run check`, `npm test`, `npm run test:command`, and a root
`make check` wrapper, but it did not expose explicit lint or build aliases for
the repository gate contract.

## Objectives

- Add `npm run lint` as a static baseline alias.
- Add `npm run build` as a static build-through-baseline alias.
- Add `make lint` and `make build` wrappers around the npm aliases.
- Make `make verify` run lint, test, and build in order.
- Document the aliases in the README, security notes, and vision.

## Verification

- `make lint`
- `make test`
- `make build`
- `make check`
- `git diff --check`
