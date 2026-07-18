# Cadlink Frontend

React SPA for the Cadlink / DesignLynk platform.

## Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS |
| Hosting | Netlify |
| API calls | `fetch` via `services/api.ts` |

## Production URLs

- App: `https://app.designlynk.co.za`
- Netlify: `https://designlynk.netlify.app`

## Running Locally

**Prerequisites:** Node.js 18+

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173` and calls `http://localhost:8080` for the API (via `.env.development`). The backend must be running locally, or temporarily point `.env.development` at the production API.

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API base URL |
| `GEMINI_API_KEY` | Google Gemini API key (AI features) |

| File | Used when |
|---|---|
| `.env.development` | `npm run dev` (local) — points to `http://localhost:8080` |
| `.env.production` | `npm run build` (deployed) — points to `https://api.designlynk.co.za` |

## Deployment (Netlify)

```bash
npm run build
npx netlify-cli deploy --prod --dir=dist
```

`public/_redirects` routes all paths to `index.html` for client-side routing. `vite.config.ts` uses `base: '/'` for Netlify (not GitHub Pages).

## Currency

All monetary values use `CurrencyContext` with `Intl.NumberFormat`. Users can switch currency (ZAR, USD, EUR, GBP) in Settings — preference is persisted to `localStorage`.

## API Layer

All backend calls go through `services/api.ts` using `VITE_API_BASE_URL` as the base. Currently wired up:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET/PUT /api/profile/me`
- `GET /api/profile/stats`
- `GET/PUT /api/designer-profile/me`
- `PUT /api/client-profile/me`
- `GET /api/designer-profile/all`
