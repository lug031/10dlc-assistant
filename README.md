# 10DLC Assistant

Asistente para registro manual de marcas y campañas 10DLC.

## Requisitos

- Node.js 20+
- Yarn 4 (Corepack)

## Inicio rápido

```bash
corepack enable
yarn install
yarn db:migrate
yarn dev
```

- API: http://127.0.0.1:3001/api/health
- Web: http://127.0.0.1:5173

## Estructura

- `apps/api` — Hono + SQLite + Drizzle
- `apps/web` — React + Vite + MUI
