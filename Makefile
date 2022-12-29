.PHONY: up up-all dev build test test-update bench vendor
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
	cd ./server && deno run -A --check --import-map import_map.json --watch=static/,routes/ dev.ts

test:
	cd ./server && deno test --import-map import_map.json --allow-env --allow-read

test-update:
	cd ./server && deno test --import-map import_map.json --allow-env --allow-read --allow-write -- --update

bench:
	cd ./server && deno bench --import-map import_map.json --allow-env --allow-read

vendor:
	cd ./server && deno check --import-map import_map.json ./main.ts
	cd ./server && deno vendor --import-map import_map.json --force --reload main.ts vendor_extra.ts
