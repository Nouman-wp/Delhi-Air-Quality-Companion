# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

**AirWise AI** — a Delhi air-quality and public-health companion (see [`ProjectGuide.md`](./ProjectGuide.md) for the full original spec, and [`README.md`](./README.md) for setup). It turns live AQI, weather, and routing data into actionable health decisions ("Should I run now?", "Which route has the least pollution exposure?"), not a bare AQI dashboard.

It's an npm workspaces monorepo: `backend/` (Express + TypeScript API) and `frontend/` (Vite + React + TypeScript).

## Commands

```bash
npm install              # installs both workspaces from the repo root
npm run dev               # runs backend (:4000) + frontend (:5173) concurrently
npm run dev:backend       # backend only — tsx watch, no build step
npm run dev:frontend      # frontend only — vite dev server, proxies /api to :4000
npm run build              # typecheck + build both workspaces
npm run seed               # seed Delhi parks + health advisories directly (backend/src/scripts/seed.ts)
```

No test suite or lint script exists yet. Typechecking is the correctness gate:
`npx tsc --noEmit -p tsconfig.json` in either `backend/` or `frontend/` (the
frontend's build script already runs this before `vite build`).

The app runs with **zero env vars configured** — every external integration
has a fallback (see below) — so `npm run dev` immediately after `npm install`
is a valid smoke test.

## Architecture: fallback-first external integrations

Every external dependency follows the same shape: try the live API, fall back
to something deterministic and still useful if the key is missing or the call
fails. This isn't incidental — it's the load-bearing design decision that lets
the app run and demo with zero configuration. When touching any of these,
preserve the fallback path; don't make it something that only works when a
key is present.

| Concern | Live path | Fallback |
|---|---|---|
| Data store | Elasticsearch (`backend/src/services/elasticStore.service.ts`) | In-memory store (`memoryStore.service.ts`), same `DataStore` interface |
| AQI | WAQI API | Deterministic simulated model keyed on lat/lon + hour-of-day (`aqi.service.ts`) |
| Weather | Open-Meteo (no key needed, always "live") | Static fallback reading if the request itself fails |
| Routing | Mapbox Directions | Synthetic bezier-offset routes with mode-based speed estimates (`routing.service.ts`) |
| Search/geocoding | Mapbox Geocoding | Curated `delhiLandmarks.ts` substring match |
| AI chat | Anthropic Claude API, RAG-grounded | Template-based responder using the same retrieved advisories (`ai.service.ts`) |
| Frontend map | Mapbox GL JS | `MapFallback.tsx` — list/grid view of AQI readings instead of a blank map |

`backend/src/services/dataStore.ts` picks Elasticsearch vs. memory once at
startup by pinging it; nothing downstream needs to know which backend is
live. If you add a new piece of data that needs persistence, add it to the
`DataStore` interface (`types/store.types.ts`) and implement it in *both*
`elasticStore.service.ts` and `memoryStore.service.ts` — not just one.

## Elasticsearch usage (the "why" behind each index)

- `airwise-aqi-cache` — geo_point + time-range query for "nearest recent reading" caching (`getCachedAqiNear`)
- `airwise-places` — geo_distance query for nearby-safe-places search
- `airwise-exposure` — date_histogram aggregation for the History page's daily exposure analytics
- `airwise-advisories` — `dense_vector` field, kNN search for RAG retrieval backing the AI chat

Embeddings are **not** from an external API — `backend/src/utils/embedding.util.ts`
implements a dependency-free hashing-trick embedding (256-dim, TF-weighted,
L2-normalized) specifically so RAG works without an embeddings API key or a
large model download. If a real embedding model is ever wired in, replace
just that file; the `dense_vector` mapping and kNN query shape already
expect a fixed-length float vector and don't need to change.

## Exposure Score

`backend/src/services/exposure.service.ts` computes the "how much pollution
will this route actually cost you" number: AQI × duration × a per-mode
ventilation-rate multiplier (walking 1.0 / cycling 1.7 / driving 0.35) × a
humidity adjustment, scaled onto roughly a 0–100+ band. `healthRatingForScore`
buckets it into recommended/moderate/avoid. The frontend's
`utils/scores.ts` (Dashboard's Running/Cycling/Outdoor scores) is a
*separate*, simpler "how good is right now" formula derived directly from
AQI — don't conflate the two when changing either.

## Frontend structure

- `contexts/` — `AuthContext` (cookie-based JWT session), `LocationContext`
  (exposes `useUserLocation`, deliberately **not** `useLocation` — that name
  collides with react-router's hook), `HealthProfileContext` (persists to
  localStorage for guests, syncs to the backend once logged in).
- `services/api/*.ts` — one file per backend route group, all going through
  the shared `apiClient` (axios, `withCredentials: true` for the auth cookie).
- `pages/*` other than `Landing` are lazy-loaded in `App.tsx` — `MapPage`
  pulls in `mapbox-gl`, which is large, so keep it off the main bundle.
- `components/map/MapView.tsx` switches between the real Mapbox map and
  `MapFallback.tsx` based on whether `VITE_MAPBOX_TOKEN` is set at build
  time — both branches must keep working.
- AQI color/category scale is duplicated intentionally in
  `backend/src/utils/aqi.util.ts` and `frontend/src/utils/aqi.ts` (network
  boundary between two independently deployable apps) — keep them in sync if
  the thresholds ever change.

## Conventions

- Dark-mode-only, glassmorphism (`.glass` / `.glass-strong` utility classes in
  `frontend/src/styles/index.css`), Tailwind color tokens defined in
  `tailwind.config.js` (`background`, `card`, `border`, `accent`, `aqi.*`).
- Strict TypeScript in both workspaces; `noUnusedLocals`/`noUnusedParameters`
  are off (not a license to leave dead code — just not a compiler error).
- Backend routes are thin: `routes/*.routes.ts` → `controllers/*.controller.ts`
  (zod validation + `HttpError`) → `services/*.service.ts` (all actual logic).
