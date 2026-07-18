# Guía de despliegue — 10dlc-assistant (100% gratis)

Arquitectura para producción, toda en planes gratuitos:

- **Frontend** (`apps/web`, React + Vite) → **Vercel** (sitio estático).
- **API** (`apps/api`, Hono + Node) → **Render** (Free Web Service).
- **Base de datos** → **Turso** (libSQL): SQLite gestionado en la nube, gratis.

> ¿Por qué Turso? El plan Free de Render tiene disco **efímero** (se borra en cada
> redeploy) y el servicio "duerme" tras inactividad. Al poner la BD en Turso, los
> datos viven fuera del servidor y no se pierden. Además Turso es SQLite, así que
> el código del proyecto casi no cambió (solo el driver).

---

## 1. Crear la base de datos en Turso (gratis)

1. Crea una cuenta en [turso.tech](https://turso.tech) e instala su CLI:
   ```bash
   curl -sSfL https://get.tur.so/install.sh | bash
   turso auth login
   ```
2. Crea la base y obtén credenciales:
   ```bash
   turso db create 10dlc
   turso db show 10dlc --url            # -> libsql://10dlc-xxxx.turso.io  (DATABASE_URL)
   turso db tokens create 10dlc         # -> token largo               (DATABASE_AUTH_TOKEN)
   ```
   Guarda ambos valores; los usarás en Render.

> Las tablas se crean solas: al arrancar, el API ejecuta las migraciones
> (`runMigrations()`) contra Turso.

---

## 2. Subir el proyecto a GitHub

```bash
cd 10dlc-assistant
git init            # si aún no es repo
git add .
git commit -m "chore: preparar despliegue gratuito (Turso + Render + Vercel)"
git branch -M main
git remote add origin https://github.com/<tu-usuario>/10dlc-assistant.git
git push -u origin main
```

El `.gitignore` ya excluye `node_modules`, `dist`, `.env` y `*.db`.

---

## 3. Desplegar el API en Render (Free)

1. En [Render](https://render.com) → **New** → **Blueprint** y selecciona el repo.
   Render leerá `render.yaml` (servicio `10dlc-api`, plan **free**).
2. Cuando pida las variables marcadas como *sync: false*, define:
   - `DATABASE_URL` = tu `libsql://...` de Turso
   - `DATABASE_AUTH_TOKEN` = el token de Turso
   - `CORS_ORIGIN` = la URL de tu frontend en Vercel (paso 4; puedes volver luego)
3. Deploy. Obtendrás una URL tipo `https://10dlc-api.onrender.com`.
   Prueba `https://10dlc-api.onrender.com/api/health` → `{"status":"ok"}`.

> Free duerme tras ~15 min sin uso; la primera petición luego tarda ~30s.

---

## 4. Desplegar el Frontend en Vercel (Free)

1. En [Vercel](https://vercel.com) → **Add New** → **Project**, selecciona el repo.
2. Configuración:
   - **Root Directory**: `apps/web`
   - Framework: **Vite** (autodetectado; también en `apps/web/vercel.json`)
3. **Environment Variables**:
   - `VITE_API_URL` = `https://10dlc-api.onrender.com` (tu URL del API, **sin** `/api`)
4. Deploy → obtendrás `https://tu-app.vercel.app`.

---

## 5. Conectar ambos (CORS)

En Render → `10dlc-api` → **Environment** → define/ajusta:

```
CORS_ORIGIN=https://tu-app.vercel.app
```

Guarda (Render redeploya). Listo: app online de punta a punta, gratis.

Para dominio propio, agrégalo separado por coma:
```
CORS_ORIGIN=https://tu-app.vercel.app,https://tudominio.com
```

---

## Variables de entorno (resumen)

| Variable              | Dónde        | Ejemplo producción                 |
| --------------------- | ------------ | ---------------------------------- |
| `NODE_ENV`            | API (Render) | `production`                       |
| `HOST`                | API (Render) | `0.0.0.0`                          |
| `PORT`                | API (Render) | (lo inyecta Render, no lo fuerces) |
| `DATABASE_URL`        | API (Render) | `libsql://10dlc-xxxx.turso.io`     |
| `DATABASE_AUTH_TOKEN` | API (Render) | `eyJhbGciOi...` (token de Turso)   |
| `CORS_ORIGIN`         | API (Render) | `https://tu-app.vercel.app`        |
| `VITE_API_URL`        | Web (Vercel) | `https://10dlc-api.onrender.com`   |

---

## Ejecutar en local

```bash
corepack enable
yarn install
cp .env.example .env    # deja DATABASE_URL vacío para usar SQLite local por archivo
yarn dev                # levanta API (3001) y Web (5173)
```

En local no necesitas Turso: si `DATABASE_URL` está vacío, se usa un archivo
SQLite en `apps/api/data/10dlc.db` mediante el mismo driver libSQL.
