.PHONY: up up-all dev build test test-update bench check
up_command = docker-compose up

up:
ifndef OPENAI_KEY
	@echo "OPENAI_KEY must be declared"
	@exit 1
else
	commit=$(shell git rev-parse head) \
	openai_key=${OPENAI_KEY} ${up_command}
endif

up-all: up_command = docker-compose -f docker-compose.yml -f server.docker-compose.yml up
up-all: up

build:
	commit=$(shell git rev-parse head) \
	docker-compose build

dev:
	deno task --cwd ./server -c ./server/deno.json start

test:
	cd ./server && deno test --allow-env --allow-read

test-update:
	cd ./server && deno test --allow-env --allow-read --allow-write -- --update

bench:
	cd ./server && deno bench --allow-env --allow-read

check:
	cd ./server && deno check ./main.ts
