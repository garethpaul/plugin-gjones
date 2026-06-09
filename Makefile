.PHONY: build check lint test verify

NPM ?= npm

lint:
	$(NPM) run lint

test:
	$(NPM) test

build:
	$(NPM) run build

verify: lint test build

check: verify
