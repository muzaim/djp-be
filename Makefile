# Makefile for DJP Backend Project

.PHONY: install build start dev lint format test test-e2e

# Dependency Installation
install:
	npm install

# Build compiled javascript files
build:
	npm run build

# Application runtime commands
start:
	npm run start

dev:
	npm run start:dev

# Code quality utilities
lint:
	npm run lint

format:
	npm run format

# Test runners
test:
	npm run test

test-e2e:
	npm run test:e2e

# TypeORM Database Migrations & Seeding
.PHONY: migrate-show migrate-run migrate-revert migrate-generate seed fresh-db

migrate-show:
	npm run migration:show

migrate-run:
	npm run migration:run

migrate-revert:
	npm run migration:revert

# Usage: make migrate-generate name=CreateUserTable
migrate-generate:
	@if [ -z "$(name)" ]; then \
		echo "Error: name parameter is required. Usage: make migrate-generate name=CreateUserTable"; \
		exit 1; \
	fi
	npm run migration:generate -- src/database/migrations/$(name)

# Database Seeding
seed:
	npm run seed

# Run Migrations and Seed Database Fresh
fresh-db:
	npm run migration:run
	npm run seed
