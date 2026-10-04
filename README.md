# Amiros Football Analytics

Professional football match analysis, statistical insights and daily prediction
content — delivered as a **Telegram Bot** and a **Telegram Mini App**.

- 🤖 Bot: [@Amirostailbot](https://t.me/Amirostailbot)
- 📢 Channel: [t.me/Amiros_1](https://t.me/Amiros_1)
- 📞 Admin: [@Amiros10](https://t.me/Amiros10)

Hosting: **GitHub + Railway only**. No Render, Vercel, Netlify, Firebase, Supabase or AWS.

---

## 1. Features

- Telegram bot with `/start`, `/help`, `/matches`, `/predictions`, `/stats`,
  `/premium`, `/channel`, `/contact`
- Persistent reply keyboard + inline buttons
- **"Open Mini App"** button inside the bot (uses Telegram Web App)
- **"Join Channel"** button pointing to `https://t.me/Amiros_1`
- **"Contact Admin"** button pointing to `@Amiros10`
- Telegram Mini App with tabs:
  - 🏠 Home — Featured matches
  - 🏆 Matches — Today's fixtures
  - 🔥 Predictions — Filterable by market
  - 📊 Stats — Overview per match
  - ⭐ Premium — Premium content cards
  - 📞 Contact — Admin + channel
- Server-side Telegram `initData` validation (HMAC-SHA256)
- Admin-protected REST endpoints (`/api/admin/*`)
- SQLite storage (portable service layer, easy to swap for PostgreSQL later)
- Demo/development seed data — clearly labelled and easy to replace

---

## 2. Technology

- **Backend**: Node.js, TypeScript, Express, grammY, better-sqlite3, Zod
- **Frontend**: HTML, CSS, Vanilla JavaScript (no framework)
- **Database**: SQLite
- **Hosting**: Railway
- **Repo**: GitHub

---

## 3. Architecture

```
Telegram User
     │
     ├──► Bot (@Amirostailbot) ── long polling via grammY
     │
     └──► Mini App (WEB_APP_URL) ── static files served by Express
                 │
                 ▼
         /api/* (Express + SQLite)
```

The Mini App is served by the same Express process as the API.
Railway runs one service: `npm start`.

---

## 4. Project Structure

```
amiros-football-analytics/
├── src/
│   ├── bot/              # Telegram bot (grammY)
│   ├── api/              # Express app, routes, middleware
│   ├── database/         # SQLite connection, schema, seed
│   ├── services/         # Business logic + Telegram auth
│   ├── config/           # Environment config
│   ├── types/            # Shared TypeScript types
│   └── index.ts          # Entry point (API + bot)
├── web/                  # Mini App (HTML/CSS/JS)
├── data/                 # SQLite file at runtime
├── railway.json
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## 5. Environment Variables

| Variable | Required | Notes |
|---|---|---|
| `BOT_TOKEN` | yes | From @BotFather |
| `ADMIN_TELEGRAM_ID` | yes | Numeric Telegram ID of the admin |
| `ADMIN_USERNAME` | no | Defaults to `Amiros10` |
| `CHANNEL_USERNAME` | no | Defaults to `Amiros_1` |
| `WEB_APP_URL` | yes in prod | Public HTTPS URL of the Mini App |
| `PORT` | no | Railway injects this automatically |
| `DATABASE_PATH` | no | Defaults to `./data/amiros.sqlite` |
| `NODE_ENV` | no | `production` on Railway |
| `INIT_DATA_MAX_AGE_SECONDS` | no | Defaults to `86400` |

**Never** commit a real `.env`.

---

## 6. Local Development

```bash
git clone <your-repo-url>
cd amiros-football-analytics
npm install
cp .env.example .env
# edit .env — at minimum set BOT_TOKEN and ADMIN_TELEGRAM_ID
npm run dev
```

Server: `http://localhost:3000`  
Health: `http://localhost:3000/api/health`

To test the Mini App locally you need an HTTPS tunnel (Telegram requires HTTPS).
Use any HTTPS tunnel you prefer and set `WEB_APP_URL` to it in `.env`.

---

## 7. Database

SQLite file lives at `DATABASE_PATH`. On first start the app:

1. Creates the directory and file.
2. Creates the schema.
3. Seeds demo/development data **only if empty**.

Re-seed manually:

```bash
npm run seed          # add demo data if empty
npm run seed -- --reset   # wipe matches/predictions/stats/premium and re-seed
```

> Demo data is clearly marked with `(Demo)` in every league name and a visible
> notice appears in the Mini App while demo data is present. Replace it with
> real data before public use.

### Railway persistence

SQLite is only persistent across deploys if the file is on a **Railway Volume**.

1. Railway project → your service → **Volumes** → **Add Volume**
2. Mount path: `/data`
3. Set env var: `DATABASE_PATH=/data/amiros.sqlite`
4. Redeploy

Without a volume the database is rebuilt on each deploy (which triggers a
re-seed of demo data). This is expected behaviour.

---

## 8. GitHub Setup

```bash
git init
git add .
git commit -m "Initial Amiros Football Analytics"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual repository URL.

---

## 9. Railway Deployment

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**.
2. Select your repository.
3. Railway auto-detects the Nixpacks build. `railway.json` already defines:
   - Build: `npm install && npm run build`
   - Start: `npm start`
   - Healthcheck: `/api/health`
4. Add the environment variables below in **Variables**.
5. Deploy. Wait for the healthcheck to pass.
6. Copy the public domain — it looks like
   `https://<something>.up.railway.app`.
7. Set `WEB_APP_URL` to that exact HTTPS URL and redeploy.

### Environment variables on Railway

```
BOT_TOKEN=...
ADMIN_TELEGRAM_ID=...
ADMIN_USERNAME=Amiros10
CHANNEL_USERNAME=Amiros_1
WEB_APP_URL=https://<your-railway-domain>
NODE_ENV=production
DATABASE_PATH=/data/amiros.sqlite   # only if you mounted a volume at /data
```

Do **not** set `PORT` — Railway injects it.

---

## 10. BotFather Configuration

1. Open [@BotFather](https://t.me/BotFather) → `/mybots` → select **@Amirostailbot**.
2. **API Token** → copy it into Railway as `BOT_TOKEN`.
3. **Edit Bot** → **Edit Description**:
   ```
   Professional football match analysis, statistical insights, and daily prediction content.
   ```
4. **Edit About Text**:
   ```
   Football analysis, match statistics and daily prediction insights.
   ```
5. **Edit Commands** → paste:
   ```
   start - Start / open the Mini App
   help - Show available features
   matches - Today's matches
   predictions - Today's predictions
   stats - Statistics
   premium - Premium analysis
   channel - Join our Telegram channel
   contact - Contact the administrator
   ```
6. **Bot Settings → Menu Button** → **Configure Menu Button** →
   - Text: `Open Mini App`
   - URL: your Railway `WEB_APP_URL`
   *(The bot also sets this automatically when `WEB_APP_URL` is set.)*
7. **Bot Settings → Configure Mini App** → enable and set the same URL.

---

## 11. Mini App Configuration

- Must be **HTTPS**. Railway domains are HTTPS by default.
- The page uses `window.Telegram.WebApp` and calls `ready()` and `expand()`.
- Theme colours are handled with safe dark defaults — the app looks correct even
  if Telegram theme parameters are missing.
- `initData` is sent to `/api/users` and validated server-side; the raw value is
  never trusted.

---

## 12. Admin Configuration

1. Get your numeric Telegram ID from [@userinfobot](https://t.me/userinfobot).
2. Set `ADMIN_TELEGRAM_ID` on Railway.
3. Redeploy.
4. All `/api/admin/*` routes require:
   - a valid Telegram `initData` (header `x-telegram-init-data` or body `initData`),
   - the resolved user ID matching `ADMIN_TELEGRAM_ID`.

Non-admins receive **403**. If `ADMIN_TELEGRAM_ID` is missing, admin routes
return **503**.

Example admin call (from a Telegram client, e.g. via the Mini App console):

```js
fetch('/api/admin/matches', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-telegram-init-data': window.Telegram.WebApp.initData,
  },
  body: JSON.stringify({
    league: 'Premier League',
    homeTeam: 'Arsenal',
    awayTeam: 'Chelsea',
    matchDate: '2025-01-01',
    matchTime: '19:30',
    featured: true,
  }),
});
```

---

## 13. Local Testing

```bash
npm install
npm run typecheck
npm run build
npm start
```

Then:

```bash
curl http://localhost:3000/api/health
# {"status":"ok","service":"Amiros Football Analytics"}

curl http://localhost:3000/api/config
curl http://localhost:3000/api/matches
curl http://localhost:3000/api/predictions
curl http://localhost:3000/api/premium
```

**What cannot be tested locally without extra tooling:**

- Telegram `initData` validation (needs a real Mini App session).
- `Open Mini App` button (needs `WEB_APP_URL` = HTTPS URL configured in BotFather).
- `Join Channel` and `Contact Admin` buttons open in the Telegram client.

Mark these as **manual tests** and run them on the deployed Mini App.

---

## 14. Production Testing Checklist

After deploying to Railway:

- [ ] `/api/health` returns `{"status":"ok","service":"Amiros Football Analytics"}`
- [ ] `/api/config` returns your `adminUsername`, `channelUsername`, `channelUrl`
- [ ] `/api/matches` returns demo matches on a fresh deploy
- [ ] Send `/start` to **@Amirostailbot** — welcome text + reply keyboard appear
- [ ] Tap **🚀 Open Mini App** — Mini App loads with the header and tabs
- [ ] Tap **📢 Join Channel** — opens `https://t.me/Amiros_1`
- [ ] Tap **📞 Contact Admin** — opens `@Amiros10`
- [ ] Home tab shows Featured Matches
- [ ] Matches tab shows today's fixtures
- [ ] Predictions tab filters correctly
- [ ] View Analysis modal opens with stats
- [ ] Premium tab shows cards + buttons
- [ ] Contact tab works
- [ ] Mini App works at 320 / 375 / 390 / 430 / 768 px without horizontal scroll
- [ ] Non-admin requests to `/api/admin/matches` return 403
- [ ] Invalid `initData` returns 401

---

## 15. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Healthcheck fails on Railway | Build error or missing `PORT` | Check Railway deploy logs |
| Bot does not reply | `BOT_TOKEN` missing/invalid | Set it on Railway, redeploy |
| Mini App blank | `WEB_APP_URL` missing or not HTTPS | Set HTTPS Railway domain |
| "Open Mini App" button missing in bot | `WEB_APP_URL` not HTTPS | Same fix |
| Admin endpoints return 503 | `ADMIN_TELEGRAM_ID` missing/invalid | Set numeric Telegram ID |
| Admin endpoints return 403 | Logged-in user isn't the admin | Confirm ID via @userinfobot |
| Data resets each deploy | No Railway Volume mounted | Add volume at `/data`, set `DATABASE_PATH=/data/amiros.sqlite` |
| `initData` expired | Session too old | Reduce `INIT_DATA_MAX_AGE_SECONDS` or re-open the Mini App |

---

## 16. Security

- `BOT_TOKEN`, `ADMIN_TELEGRAM_ID` and DB credentials are **never** sent to the browser.
- Telegram `initData` is validated with HMAC-SHA256 server-side.
- Helmet, CORS, rate limiting, Zod input validation, centralised error handling.
- Admin routes require verified Telegram identity.
- Errors never leak stack traces.

---

## 17. Telegram Ads Compliance

This project is designed as a **transparent** landing experience for Telegram Ads:

**Do:**
- Describe the service accurately (analysis, statistics, insights, trends).
- Match the ad content with the Mini App content.
- Provide a working contact (@Amiros10) and a channel link (t.me/Amiros_1).

**Do not:**
- Claim guaranteed wins, profit or risk-free outcomes.
- Use fake urgency, fake user counts, fake testimonials or fake screenshots.
- Use hidden redirects, cloaking or automatic unrelated redirects.
- Bypass Telegram's ad review.

All copy in this repo follows these rules.

---

## 18. Future Upgrades

- Swap SQLite for PostgreSQL by replacing `src/database/database.ts`.
- Add a small admin web panel inside the Mini App for the configured admin.
- Add real match data ingestion (external API → database).
- Add user subscription flags for premium gating.
- Add automated backups of the SQLite volume.

---

## 19. Commands Reference

```bash
npm run dev          # local development (tsx watch)
npm run build        # compile TypeScript -> dist/
npm start            # run the compiled server
npm run typecheck    # TypeScript checks only
npm run seed         # insert demo data if DB empty
npm run seed -- --reset   # wipe + re-seed demo data
```

---

## 20. License

MIT — see [LICENSE](./LICENSE). Analysis-only content; no outcomes guaranteed.
