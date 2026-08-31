# Makefile for NestJS Boilerplate

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

# TypeORM Database Migrations
.PHONY: migrate-show migrate-run migrate-revert migrate-generate

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

# Database Seeding Placeholder
.PHONY: seed
seed:
	@echo "Database seeding placeholder. Configure your seeding scripts inside package.json first."
	# npm run seed
