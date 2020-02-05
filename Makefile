.PHONY: build compile test clean
default: build
.ONESHELL:

SHELL:=/bin/bash
UNAME_S := $(shell uname -s)
VER ?= patch

node_modules: yarn.lock
	yarn install
compile: node_modules clean tsbuild
build: compile
clean:
	rm -rf ./bin
tsbuild: 
	npx tsc  -p tsconfig.json