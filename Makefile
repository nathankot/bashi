.PHONY: up dev build

up:
ifndef OPENAI_KEY
	@echo "OPENAI_KEY must be declared"
	@exit 1
else
	commit=$(shell git rev-parse head) \
	openai_key=${OPENAI_KEY} docker-compose up
endif

build:
	commit=$(shell git rev-parse head) \
	docker-compose build

dev:
	deno task --cwd ./server -c ./server/deno.json start
