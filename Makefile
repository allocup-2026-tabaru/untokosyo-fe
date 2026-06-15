.PHONY: up down logs build deploy

up:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f

build:
	docker compose build

deploy:
	@set -a; . ./.env.local; set +a; \
	vercel --prod \
		--token $$VERCEL_TOKEN \
		--scope $$VERCEL_ORG_ID \
		--yes
