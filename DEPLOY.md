# Deploying UTM Borrow

UTM Borrow is **two apps** that must be hosted separately:

| Part | Tech | Host | Why |
|------|------|------|-----|
| **Frontend** | React (CRA) | **Vercel** | Static SPA — Vercel's sweet spot. |
| **Backend** | FastAPI + MongoDB + SSE | **Render** + **MongoDB Atlas** | Needs a long-lived server (Server-Sent-Events keep a connection open and the realtime broadcaster lives in-process). Vercel's serverless functions can't do this, and there's no database on Vercel. |

The frontend talks to the backend over `REACT_APP_BACKEND_URL`. Deploy the **backend first**, then point the frontend at it.

> You'll create three free accounts: **MongoDB Atlas**, **Render**, **Vercel**. Everything else (config files) is already in this repo.

---

## Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "UTM Borrow"
git branch -M main
git remote add origin https://github.com/<you>/utm-borrow.git
git push -u origin main
```

`.gitignore` already excludes `node_modules`, `.venv`, `build/`, caches and **all `.env` files**, so no secrets or heavy folders are pushed. (Confirm with `git status` before the first commit — you should NOT see `.env`, `.venv`, or `node_modules`.)

---

## Step 2 — Database: MongoDB Atlas (free)

1. Create a free **M0** cluster at <https://www.mongodb.com/cloud/atlas>.
2. **Database Access** → add a user (username + password). Save them.
3. **Network Access** → Add IP → `0.0.0.0/0` (allow from anywhere — Render's IPs are dynamic).
4. **Connect → Drivers** → copy the SRV string, e.g.
   `mongodb+srv://USER:PASSWORD@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority`
   Replace `USER`/`PASSWORD` with your credentials. This is your `MONGO_URL`.

On first boot the backend seeds demo data (4 users, 8 items, sample transactions) automatically — see `backend/seed.py`.

---

## Step 3 — Backend: Render

1. Generate two secrets locally:
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"   # run twice
   ```
2. At <https://render.com> → **New → Blueprint** → connect this repo. Render reads [`render.yaml`](render.yaml) and creates the `utm-borrow-api` web service.
   *(Or **New → Web Service** manually: Root Directory `backend`, Build `pip install -r requirements.txt`, Start `uvicorn server:app --host 0.0.0.0 --port $PORT`.)*
3. Set the environment variables (the `sync: false` ones from the blueprint):
   - `MONGO_URL` → your Atlas SRV string
   - `JWT_SECRET` → first generated secret
   - `QR_HMAC_SECRET` → second generated secret
   - `CORS_ORIGINS` → leave as a placeholder for now (e.g. `https://example.com`); you'll set the real value in Step 5.
   - `DB_NAME` → `utm_borrow` (already in the blueprint)
4. Deploy. When live, note the URL, e.g. `https://utm-borrow-api.onrender.com`.
5. Verify: open `https://utm-borrow-api.onrender.com/api/health` → `{"status":"ok"}`.

> **Free-tier note:** the service sleeps after ~15 min idle and cold-starts (~30s) on the next request. Fine for a portfolio demo. The realtime stream reconnects automatically after a wake.

---

## Step 4 — Frontend: Vercel

1. At <https://vercel.com> → **Add New → Project** → import this repo.
2. **Root Directory: `frontend`** (important — the React app lives in a subfolder). Framework preset auto-detects **Create React App**.
3. **Environment Variables** → add:
   - `REACT_APP_BACKEND_URL` = your Render URL **with no trailing slash** (e.g. `https://utm-borrow-api.onrender.com`).
   - *(Backstop)* If the build ever fails on "Failed to parse source map" warnings, add `GENERATE_SOURCEMAP` = `false`. This is already set in [`frontend/vercel.json`](frontend/vercel.json), so you normally don't need to.
4. Deploy. [`frontend/vercel.json`](frontend/vercel.json) already adds the SPA rewrite so deep links like `/catalog` and `/login` don't 404.

> `REACT_APP_*` is baked in **at build time**. If you change the backend URL later, **redeploy** the frontend.

---

## Step 5 — Connect them (CORS)

On **Render**, set `CORS_ORIGINS` to your real frontend origins (comma-separated, no spaces, no trailing slash) and redeploy:

```
https://your-app.vercel.app,https://alsakkaf.site,https://www.alsakkaf.site
```

Do **not** use `*` — the API sends credentials, and browsers reject wildcard origins with credentials.

Now open the Vercel URL → you should land on the marketing page → **Get started** → log in with a demo account.

---

## Step 6 — Custom domain `alsakkaf.site`

In **Vercel → Project → Settings → Domains**, add `alsakkaf.site` (and `www.alsakkaf.site`) and follow Vercel's DNS instructions at your registrar (an `A`/`CNAME` record, or change nameservers). After it verifies, make sure that domain is included in the backend's `CORS_ORIGINS` (Step 5).

---

## Demo logins (seeded on the live site)

Password for all: `Test1234`

- Student: `alsakkaf@graduate.utm.my`
- Student: `muaz@graduate.utm.my`
- Student: `ahmat@graduate.utm.my`
- Admin: `admin@utm.my`

---

## Run locally

```powershell
# Backend (needs local MongoDB on :27017, or set MONGO_URL to Atlas)
cd backend
copy .env.example .env        # then fill in values
py -3.14 -m uvicorn server:app --reload

# Frontend
cd frontend
copy .env.example .env        # REACT_APP_BACKEND_URL=http://localhost:8000
npm install
npm start
```

Or just run **`START APP.bat`** from the repo root.

---

## Troubleshooting

- **Login/data calls fail in production, UI loads fine** → backend isn't reachable. Check `REACT_APP_BACKEND_URL` (redeploy frontend after changing it) and that the Render service is awake (`/api/health`).
- **CORS error in the console** → the frontend origin isn't in the backend's `CORS_ORIGINS`. Add it on Render exactly (scheme + host, no trailing slash) and redeploy.
- **Live "Connecting…" never turns green** → SSE blocked by CORS or the free instance is cold. It auto-retries; reload after the backend wakes.
- **Deep link 404 on Vercel** → ensure Root Directory is `frontend` so `vercel.json` is picked up.
