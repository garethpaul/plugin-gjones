.PHONY: build check lint test verify

NPM ?= npm
override ROOT := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))

lint:
	cd "$(ROOT)" && $(NPM) run lint

test:
	cd "$(ROOT)" && $(NPM) test

build:
	cd "$(ROOT)" && $(NPM) run build

verify: lint test build

check: verify
