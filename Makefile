.PHONY: up up-all dev build test test-update bench vendor check
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
	cd ./server && deno check --lock-write ./main.ts

vendor: check
	cd ./server && cp ./deno.json ./deno.vendored.json
	cd ./server && rm -rf vendor
	cd ./server && deno vendor -c ./deno.vendored.json --import-map ./import_map.json --force --reload main.ts vendor_extra.ts
