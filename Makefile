.PHONY: up

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
