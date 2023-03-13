.PHONY: dev test test-update bench check update-deps

dev: export REDIS_URL=redis://localhost:6379
dev: export WHISPER_TRANSCRIBE_ENDPOINT=http://localhost:9000/asr
dev:
	./dev.ts

test:
	deno test --allow-env --allow-read

test-update:
	deno test --allow-env --allow-read --allow-write -- --update

bench:
	deno bench --allow-env --allow-read

check:
	deno check --lock deno.prod.lock ./main.ts

update-deps:
	deno cache --check --lock deno.prod.lock --lock-write --reload main.ts cache_imports.ts
	deno cache --check --lock deno.lock --lock-write --reload main.ts cache_imports.ts dev.ts
