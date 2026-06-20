# Live-Default Host Isolation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use test-driven-development to implement this plan task-by-task.

**Goal:** Produce one fresh child of live default `0a41db45e373e8881cf51bc947310c8913aa04c1` whose packed plugin owns no vulnerable runtime dependency path, does not weaken YAML APIs, and still runs inside the real Twilio CLI/Oclif host.

**Architecture:** Publish only the command source and package metadata. Treat Oclif and Twilio CLI Core as optional peer contracts supplied by the loading host, resolve Oclif from that host rather than shipping a private launcher/runtime, and make every repository and packed-consumer audit fail closed on any advisory. Keep host-owned Twilio CLI advisories separate from the plugin package's zero-finding graph.

**Tech Stack:** Node.js 20/22/24/25, npm package tarballs, Oclif/Twilio CLI, Node's built-in assertion/test utilities, npm audit, OSV-Scanner, Trivy, Semgrep, Gitleaks, actionlint.

---

### Task 1: Prove the landed packed-consumer vulnerability

**Files:**
- Create: `tests/packed-consumer-security.test.js`
- Modify: `package.json`

1. Pack the exact repository into a temporary directory.
2. Install the tarball in a fresh consumer with lifecycle scripts disabled.
3. Assert the installed plugin owns no runtime dependencies, nested `node_modules`, launcher, preload, or advisory allowance.
4. Run the test against live default and confirm it fails because the tarball installs Oclif/Twilio dependencies and resolves vulnerable `js-yaml 3.14.2` paths.

### Task 2: Prove the unsafe YAML mutation

**Files:**
- Create: `tests/unsafe-yaml-payload.test.js`
- Modify: `package.json`

1. Load the packed consumer's host `js-yaml` API identities before any plugin module.
2. Load every shipped plugin module.
3. Assert `safeLoad` and `safeDump` identities remain unchanged.
4. Assert `safeLoad` rejects a `!!js/function` payload.
5. Run the test against live default and confirm it fails because `src/js-yaml-compat.js` overwrites both safe APIs and constructs the payload.

### Task 3: Remove plugin-owned runtime paths

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/commands/gjones/mycommand.js`
- Delete: `bin/run`
- Delete: `bin/run.cmd`
- Delete: `src/js-yaml-compat.js`

1. Remove runtime dependencies, overrides, launcher publication, and preload code.
2. Express compatible host packages as optional peers only.
3. Resolve the Oclif `Command` export from the actual loading host.
4. Regenerate the lockfile without adding runtime dependency ownership.
5. Run the two regressions and existing command tests until green.

### Task 4: Make audit policy fail closed

**Files:**
- Modify: `scripts/check-audit.js`
- Modify: `scripts/check-consumer-audit.js`
- Modify: `tests/audit-policy.test.js`
- Modify: `tests/consumer-audit.test.js`

1. Delete every expected-advisory map and consumer allowance.
2. Require zero vulnerabilities and an empty vulnerable-package map for every graph.
3. Require the packed consumer to contain no plugin-owned nested dependencies.
4. Run policy unit tests and the real packed-consumer audit until green.

### Task 5: Preserve real host behavior

**Files:**
- Modify: `tests/oclif-command-smoke.test.js`
- Modify: `tests/twilio-cli-host-compatibility.test.js`
- Modify: `.github/workflows/check.yml`
- Modify: `README.md`
- Modify: `CHANGES.md`

1. Test command loading from a real Oclif/Twilio host rather than the removed launcher.
2. Install Twilio CLI 6.2.4 in isolated homes across the supported Node matrix and run `gjones:mycommand` from the packed plugin.
3. Report Twilio CLI's independent advisory graph as host-owned and never treat it as plugin audit success.
4. Keep Ubuntu and Windows hosted lanes configured for the same checks.

### Task 6: Verify and commit once

**Files:**
- Modify only files required by Tasks 1-5.

1. Run Node 20/22/24/25 tests, lint, build, package, packed-consumer audit, and real Twilio CLI execution.
2. Verify package contents, npm audit/signatures, OSV, Trivy including development dependencies, Semgrep, Gitleaks, actionlint, `git diff --check`, and `git fsck --strict`.
3. Confirm stale sibling `57270f304e0e0c75b68141de67d9c63240013e4d` is not an ancestor and the worktree is exactly one commit ahead of live default.
4. Create one local commit; leave the push URL disabled and perform no GitHub write.
