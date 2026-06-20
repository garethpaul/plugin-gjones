# Plugin Gjones Deep Review

status: implementation-complete

## Scope

Deep-review PR #1, PR #2, PR #3, and PR #4 as one linear stack. Preserve the
credential-free `gjones:mycommand` behavior while reviewing Node 20, 22, and 24,
oclif metadata, Twilio CLI Core 8 compatibility, packaging, dependency audits,
CI permissions, and hostile argument handling. Make no live Twilio calls and do
not publish the plugin.

## Findings and fixes

- The Node 24-only engine excluded Node 20 and 22 even though Twilio CLI 6 and
  CLI Core 8 support Node 20+. Engines now match the host boundary while Node 24
  remains the default `.nvmrc` toolchain.
- `gjones:mycommand` silently accepted unexpected argv. It now rejects every
  argument and flag with one generic message that does not echo credential-like
  input.
- Root npm overrides and the js-yaml preload made the repository audit green,
  but a packed consumer ignored those overrides and reported the upstream
  `GHSA-h67p-54hq-rp68` chain. The shim and overrides are removed. Root and
  packed consumer audits now fail closed around only the exact reviewed chain.
- Hosted validation covers Linux on Node 20, 22, and 24, Windows on Node 24,
  locked installs with scripts disabled, tests, package dry runs, and a packed
  consumer install/audit.

## Evidence before hosted validation

- Existing PR checks were green, but they exercised only the PR-local Node 24
  graph and did not audit a downstream packed install.
- A real Twilio CLI 6.2.4 host linked the plugin and ran command/topic help and
  `gjones:mycommand` without credentials or provider calls.
- Engine-strict installation failed on Node 20 before the engine correction.
- Hostile credential-like argv returned success before the command correction.
- The packed consumer audit reported six moderate findings in the exact oclif
  1.x / Twilio CLI Core 8 / js-yaml chain.

## Remaining verification

Hosted validation will supply clean npm installation, root and packed consumer
audits, multi-Node execution, Windows launcher coverage, packaging, and CodeQL
evidence before merge.
