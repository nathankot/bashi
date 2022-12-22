.PHONY: up up-all dev build test test-update bench check lock
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
	cd ./server && deno task start

test:
	cd ./server && deno test --allow-env --allow-read

test-update:
	cd ./server && deno test --allow-env --allow-read --allow-write -- --update

bench:
	cd ./server && deno bench --allow-env --allow-read

check:
	cd ./server && deno check ./main.ts

lock:
	rm -f ./server/deno.lock
	cd ./server && deno cache --check --lock-write ./main.ts
