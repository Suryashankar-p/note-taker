SHELL := /bin/bash

all: help

DOCKER_COMPOSE=sudo --preserve-env docker compose
COMPOSE_FILE=./docker-compose/docker-compose.local.yml

help:
	@echo "Usage:"
	@echo "  make up        - Start services"
	@echo "  make down      - Stop and remove services"
	@echo "  make build     - Build or rebuild services"
	@echo "  make build_up  - Load env and build + start services"
	@echo "  make start     - Start stopped services"
	@echo "  make stop      - Stop services"
	@echo "  make restart  - Restart services"
	@echo "  make logs      - View logs"
	@echo "  make clean     - Clean the local database and python cache"

up:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) up -d

down:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) down

build:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) build

build_up:
	@echo "Loading environment variables from .env"
	@test -f .env || (echo ".env file not found!" && exit 1)
	@set -a && \
	source .env && \
	set +a && \
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) up --build

start:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) start

stop:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) stop

restart:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) restart

logs:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) logs -f