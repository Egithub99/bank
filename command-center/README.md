# Business Command Center — demo prototype

A single-screen command-center game for founder-led B2B SaaS / B2B services,
plus an optional **read-only bol.com Retailer API connector** for marketplace
sellers.

## Run it

Mock mode (no credentials, no external calls) — recommended first:

```bash
node server/server.js
# open http://localhost:8137
```

`command-center/index.html` also opens standalone in a browser (pure mock; the
bol.com card shows an "offline preview" hint because there's no backend).

## Connect the bol.com API (read-only)

The browser can't call bol.com directly — the OAuth flow needs your client
*secret* (never put that in frontend code) and bol.com blocks cross-origin
browser calls. So a tiny Node backend (`server/`) does the token exchange and
proxies **GET-only** reads.

1. In the bol.com seller dashboard: **Instellingen → API-instellingen →
   Nieuwe API-credentials**. You get a client id + secret.
2. Copy `.env.example` to `.env` and fill in:
   ```
   BOL_CLIENT_ID=your_id
   BOL_CLIENT_SECRET=your_secret
   BOL_LIVE=true
   ```
3. Start with the env file loaded:
   ```bash
   node --env-file=.env server/server.js
   ```
4. In the app, toggle the **bol.com** connector on. The Finance Base building
   and the connector card show your live open-order count and value.

### Safety model

- **Nothing is sent to bol.com** unless credentials are present **and**
  `BOL_LIVE=true`. Otherwise the connector serves mock data.
- The server is **read-only**: it refuses any non-GET request (returns 405),
  and the bol.com client only implements GET reads (`/orders`, `/returns`).
  No writes, no order mutations, no shipping/label actions.
- `.env` is git-ignored; secrets never enter the repo.
- Want to test against bol.com without touching real data? Point
  `BOL_API_BASE` at the demo environment
  (`https://api.bol.com/retailer-demo`).

## Endpoints

| Method | Path               | What it does                                        |
|--------|--------------------|-----------------------------------------------------|
| GET    | `/api/bol/status`  | Config only — reports mock/live. Never calls bol.com.|
| GET    | `/api/bol/summary` | Read-only pull: open orders, value, open returns.    |

## Files

- `command-center/index.html` — the whole front-end (self-contained).
- `server/server.js` — static host + read-only JSON API.
- `server/bol-client.js` — OAuth2 + read-only GET client (mock fallback).
- `server/mock-data.js` — mock bol.com summary.
- `.env.example` — configuration template.
