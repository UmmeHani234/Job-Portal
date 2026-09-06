# Job Portal — Full-Stack Application

A complete job portal covering authentication, job posting/search, a job scraper, REST APIs,
role-based dashboards, and a responsive frontend.

**Tech stack used:**
- Frontend: **Next.js 14 (App Router) + Tailwind CSS**
- Backend: **Node.js + Express** + **Sequelize** ORM
- Database: **PostgreSQL**
- Auth: **JWT**, role-based (Admin / Employer / Candidate)
- Bonus features implemented (3+): **Docker**, **Swagger/OpenAPI**, **Unit Tests (Jest)**, **Rate Limiting**, plus a scheduled scraper (node-cron)

> **Deployment note:** this was built in a sandboxed environment with no outbound network
> access, so I could not push to a live GitHub repo or deploy to Vercel/Render/Railway/AWS
> myself. Everything below is ready to deploy — see **"Deploying it yourself"** for exact,
> copy-pasteable steps for GitHub + Render (backend) + Vercel (frontend), which is the fastest
> free path to a live URL.

---

## 1. Project structure

```
job-portal/
├── backend/                 # Express API
│   ├── src/
│   │   ├── config/          # db connection, swagger, seed script
│   │   ├── models/          # Sequelize models + associations
│   │   ├── middleware/      # JWT auth, role guard, error handler
│   │   ├── controllers/     # business logic per module
│   │   ├── routes/          # route definitions + Swagger JSDoc
│   │   ├── scraper/         # RemoteOK scraper + cron scheduler
│   │   ├── utils/           # bcrypt/JWT helpers
│   │   ├── app.js           # Express app assembly
│   │   └── server.js        # entrypoint
│   ├── tests/                # Jest unit + integration tests
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── frontend/                 # Next.js app
│   ├── app/                  # pages: home, login, register, jobs, jobs/[id],
│   │                          #        employer/*, candidate/*, admin/*, profile
│   ├── components/           # Navbar, JobCard
│   ├── lib/                  # api.js (fetch wrapper), auth.js (session helper)
│   ├── Dockerfile
│   ├── package.json
│   └── .env.local.example
├── database/
│   ├── schema.sql            # full PostgreSQL DDL (tables, constraints, indexes, triggers)
│   └── ERD.md                # relationship diagram + indexing rationale
├── docs/
│   ├── API_DOCUMENTATION.md
│   └── postman_collection.json
├── docker-compose.yml        # postgres + backend + frontend, one command
└── README.md                 # this file
```

---

## 2. Running it locally

### Option A — Docker Compose (recommended, one command)

Requires Docker + Docker Compose installed.

```bash
git clone <your-repo-url> job-portal
cd job-portal
docker compose up --build
```

This starts:
- PostgreSQL on `localhost:5432` (schema auto-loaded from `database/schema.sql`)
- Backend API on `http://localhost:5000`
- Frontend on `http://localhost:3000`

Then seed an admin user (roles are pre-inserted by the schema; this adds the admin account):
```bash
docker compose exec backend npm run seed
# creates admin@jobportal.com / Admin@12345
```

### Option B — Run manually

**Prerequisites:** Node.js 18+, PostgreSQL 14+ running locally.

```bash
# 1. Create the database and load the schema
createdb jobportal
psql -d jobportal -f database/schema.sql

# 2. Backend
cd backend
cp .env.example .env        # edit DB_* and JWT_SECRET as needed
npm install
npm run seed                # creates roles (if not already) + admin user
npm run dev                 # http://localhost:5000

# 3. Frontend (in a new terminal)
cd frontend
cp .env.local.example .env.local
npm install
npm run dev                 # http://localhost:3000
```

### Running tests
```bash
cd backend
npm test
```
Covers: password hashing/JWT round-trip (unit), health check, 404 handler, and auth
registration validation (integration, via supertest — no live DB required for these).

---

## 3. Default accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@jobportal.com | Admin@12345 |
| Candidate/Employer | — | Register via `/register` in the UI, or `POST /auth/register` |

---

## 4. API documentation

- Swagger UI (live, once backend is running): `http://localhost:5000/api/docs`
- Written reference: [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md)
- Postman collection: [`docs/postman_collection.json`](docs/postman_collection.json)
  (import into Postman; set the `baseUrl` variable if not running on `localhost:5000`, then run
  "Login" first — it auto-saves the JWT into the `token` collection variable for every
  subsequent request)

---

## 5. Database schema

See [`database/schema.sql`](database/schema.sql) for the full DDL and
[`database/ERD.md`](database/ERD.md) for the relationship diagram and indexing rationale.

Tables: `roles`, `users`, `companies`, `jobs`, `applications`, `saved_jobs`, `scrape_logs`.

Key design choices:
- UUID primary keys throughout (avoids sequential-ID enumeration, plays well with distributed/scraped data)
- `jobs.skills` as a native Postgres `TEXT[]` with a GIN index, for fast skill-based filtering
- Full-text GIN indexes on `jobs.title`/`jobs.description` for the search endpoint
- A partial unique index on `jobs(source, source_url)` is what actually prevents duplicate
  scraped jobs (Module 5's requirement) — enforced at the DB layer, not just in application code
- `applications(job_id, candidate_id)` unique — a candidate can only apply once per job

---

## 6. The scraper (Module 5 & 6)

The scraper (`backend/src/scraper/remoteOkScraper.js`) pulls from **RemoteOK's public JSON API**
(`https://remoteok.com/api`) — a documented, intentionally public feed meant for programmatic
consumption, not an HTML scrape of a page that disallows bots. This satisfies the brief's
"public sources that permit automated access / publicly available feeds" requirement without
any ToS ambiguity. Swap `REMOTEOK_API_URL` in `.env` for any other public jobs feed — the
normalization/dedup/persistence logic is source-agnostic.

- **Trigger manually:** `POST /scrape/jobs` (Admin only) — also exposed as a button on the Admin Dashboard
- **Automatic:** a `node-cron` job runs every 6 hours by default (`SCRAPE_CRON_SCHEDULE` in `.env`, cron syntax)
- **Dedup:** enforced by the DB's unique `(source, source_url)` index — a second scrape run
  will skip anything already stored and report it under `duplicatesSkipped`
- **Reporting:** every run is logged to the `scrape_logs` table (`GET /scrape/logs`), and the
  triggering response itself returns `{ jobsAdded, duplicatesSkipped, errors, errorDetails }`

---

## 7. Deploying it yourself

### GitHub
```bash
cd job-portal
git init
git add .
git commit -m "Initial commit: full job portal"
git branch -M main
git remote add origin https://github.com/<your-username>/job-portal.git
git push -u origin main
```

### Backend → Render (or Railway)
1. New Web Service → connect your GitHub repo → root directory `backend`
2. Build command: `npm install` · Start command: `npm start`
3. Add a managed PostgreSQL instance (Render/Railway both offer one-click Postgres) and copy
   its connection details into the service's environment variables (`DB_HOST`, `DB_PORT`,
   `DB_NAME`, `DB_USER`, `DB_PASSWORD`), plus `JWT_SECRET` and `CLIENT_URL` (your Vercel URL,
   set after step below)
4. After first deploy, run the schema once against the managed DB:
   `psql "<connection-string>" -f database/schema.sql`, then `npm run seed` via the platform's shell/console

### Frontend → Vercel
1. Import the repo in Vercel → root directory `frontend`
2. Framework preset: Next.js (auto-detected)
3. Environment variable: `NEXT_PUBLIC_API_URL=https://<your-render-backend-url>/api`
4. Deploy — Vercel gives you the live URL

Once both are live, update the backend's `CLIENT_URL` env var to the Vercel URL and redeploy
the backend so CORS allows it.

---

## 8. Deliverables checklist

- [x] GitHub Repository — push using the commands above (not pushed automatically from here — no network access in this environment)
- [ ] Live Deployment URL — deploy using the steps above; I can't produce a live URL from this sandbox
- [x] Database Schema — `database/schema.sql`, `database/ERD.md`
- [x] API Documentation — `docs/API_DOCUMENTATION.md` + live Swagger at `/api/docs`
- [x] Postman Collection — `docs/postman_collection.json`
- [x] README — this file
