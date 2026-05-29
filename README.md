Monorepo for Hotel Retro showcase (Vite SPA + Laravel + Node Gateway)

Structure:
- apps/web: Vite + React + TypeScript SPA
- services/laravel: Laravel app (headless)
- services/node-gateway: Node + WS gateway
- infra: docker-compose and Traefik configs

Next steps (local):
1. cd apps/web && npm install
2. cd ../../services/node-gateway && npm install
3. Configure services/laravel with composer (not scaffolded here) or copy an existing Laravel app into services/laravel
4. Update infra/docker-compose.yml cert email and ensure acme.json is writeable (chmod 600)

When ready to deploy on the VPS with Docker installed:
1. Clone this repo into /srv/hotel
2. Ensure DNS A records point to the VPS (you said they do)
3. On the VPS: cd infra; docker compose up -d
4. Build frontend: locally run cd apps/web && npm run build then copy dist to infra/../apps/web/dist or build inside a container
5. Run migrations and seeders inside laravel container (php artisan migrate --seed)
