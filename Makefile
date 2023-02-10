.PHONY: up up-all dev build test test-update clients
compose_command = docker-compose

up:
	commit=$(shell git rev-parse head) \
	${compose_command} up

up-all: compose_command = docker-compose -f docker-compose.yml -f server.docker-compose.yml
up-all: up

build:
	commit=$(shell git rev-parse head) \
	docker-compose -f docker-compose.yml -f server.docker-compose.yml build

dev:
	cd ./server && make dev

test:
	cd ./server && make test

test-update:
	cd ./server && make test-update

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
