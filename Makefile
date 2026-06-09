.PHONY: test verify check

NPM ?= npm

test:
	$(NPM) test

verify: test

check: verify
