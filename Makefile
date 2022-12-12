.PHONY: up up-all dev build
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
