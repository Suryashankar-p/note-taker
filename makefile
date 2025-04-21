all: help

DOCKER_COMPOSE=sudo docker compose
DEV_COMPOSE_FILE=docker-compose.yml
PROD_COMPOSE_FILE=docker-compose-prod.yml

help:
	@echo "Usage:"
	@echo "  make up [env=dev|prod]       - Start and restart services (default: dev)"
	@echo "  make down [env=dev|prod]     - Stop and remove services (default: dev)"
	@echo "  make build [env=dev|prod]    - Build or rebuild services (default: dev)"
	@echo "  make build_up [env=dev|prod] - Build or rebuild services and start services (default: dev)"
	@echo "  make start [env=dev|prod]    - Start previously stopped services (default: dev)"
	@echo "  make stop [env=dev|prod]     - Stop services (default: dev)"
	@echo "  make restart [env=dev|prod]  - Restart services (default: dev)"
	@echo "  make logs [env=dev|prod]     - View logs from services (default: dev)"
	@echo "  make clean                   - Clean the local database and python cache"
	@echo ""
	@echo "Examples:"
	@echo "  make up env=dev     - Use development compose file"
	@echo "  make up env=prod    - Use production compose file"

# Default to development environment
env ?= dev

# Determine the compose file based on the environment
COMPOSE_FILE=$(if $(filter prod,$(env)),$(PROD_COMPOSE_FILE),$(DEV_COMPOSE_FILE))

up:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) up -d

down:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) down

build:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) build

build_up:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) up --build

start:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) start

stop:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) stop

restart:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) restart

logs:
	$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) logs -f

clean:
	bash ./backend/clean_db.sh
