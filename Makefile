.PHONY: up up-all dev build test test-update bench update-lock check clients
compose_command = docker-compose

up:
ifndef OPENAI_KEY
	@echo "OPENAI_KEY must be declared"
	@exit 1
else
	commit=$(shell git rev-parse head) \
	openai_key=${OPENAI_KEY} ${compose_command} up
endif

up-all: compose_command = docker-compose -f docker-compose.yml -f server.docker-compose.yml
up-all: up

build:
	commit=$(shell git rev-parse head) \
	docker-compose -f docker-compose.yml -f server.docker-compose.yml build

dev:
	cd ./server && ./dev.ts

test:
	cd ./server && deno test --allow-env --allow-read

test-update:
	cd ./server && deno test --allow-env --allow-read --allow-write -- --update

bench:
	cd ./server && deno bench --allow-env --allow-read

check:
	cd ./server && deno check --lock deno.prod.lock ./main.ts

update:
	cd ./server && deno cache --check --lock deno.prod.lock --lock-write --reload main.ts cache_imports.ts

clients:
	-rm -rf ./assist/BashiClient
	cd ./assist/vendor/SwagGen; swift run swaggen generate \
		../../../server/static/openapi.json \
		-d ../../BashiClient \
		-l swift \
		-o name:BashiClient \
		-o 'authors:Nathan Kot' \
		-o 'homepage:http://localhost' \
		-o 'modelNames.Session:BashiSession'
	git apply assist.client.Package.swift.patch
