.PHONY: dev build test lint migrate seed typecheck

dev:
	docker compose -f infra/docker-compose.yml up -d
	pnpm turbo dev

build:
	pnpm turbo build

test:
	pnpm turbo test

lint:
	pnpm biome check .

migrate:
	pnpm --filter @repo/db-adapter migrate

seed:
	pnpm --filter @repo/db-adapter seed

typecheck:
	pnpm turbo typecheck
