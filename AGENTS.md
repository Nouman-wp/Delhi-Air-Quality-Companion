# AGENTS.md — AirWise AI

## Quick commands

```bash
npm install          # both workspaces
npm run dev          # backend :4000 + frontend :5173
npm run build        # typecheck + build both workspaces
npm run seed         # seed Delhi parks + health advisories into data store
```

No test suite, no lint script. **Typecheck is the correctness gate:**
`npx tsc --noEmit -p tsconfig.json` in `backend/` or `frontend/`.
Frontend's build script already runs this before vite build.

## Architecture

npm workspaces monorepo: `backend/` (Express + TypeScript) and `frontend/` (Vite + React + TypeScript).

### Fallback-first design

Every external integration has a fallback and the app runs with **zero env vars**. When touching services, preserve the fallback path — don't make it require a live API key. Key integrations:

| Service | Live provider | Fallback |
|---|---|---|
| Data store | Elasticsearch | In-memory (`memoryStore.service.ts`) — same `DataStore` interface |
| AQI | WAQI API | Deterministic simulated model |
| Routing | OSRM (driving only) | Synthetic routes (always used for walking/cycling) |
| Search/geocoding | Nominatim | Curated `delhiLandmarks.ts` substring match |
| AI chat | OpenRouter | Rule-based responder using same retrieved advisories |
| Map tiles | Esri World Imagery (keyless) | N/A — no key needed |

Backend picks Elasticsearch vs. memory at startup via `dataStore.ts`.

### Backend structure

- Routes are thin: `routes/*.routes.ts` → `controllers/*.controller.ts` (zod + HttpError) → `services/*.service.ts` (all logic)
- If adding persistence, implement in **both** `elasticStore.service.ts` and `memoryStore.service.ts` via the `DataStore` interface in `types/store.types.ts`
- Embeddings use a hashing-trick utility (`utils/embedding.util.ts`), not an external API

### Frontend structure

- Pages lazy-loaded except `Landing`; `MapPage` pulls in leaflet (large)
- `contexts/` holds auth, geolocation, theme, health-profile state
- `services/api/*.ts` mirrors backend route groups; all go through shared `apiClient` (axios, withCredentials)
- AQI color/category scale is duplicated in backend `utils/aqi.util.ts` and frontend `utils/aqi.ts` — keep in sync

## Gotchas

- **Location hook**: Use `useUserLocation` (from `LocationContext`), NOT `useLocation` — that collides with react-router
- **Map markers**: Use `L.divIcon` with CSS classes (`.current-location-marker`, `.destination-marker`, `.recommended-marker` in `index.css`), not `L.Icon` — Leaflet's default-marker bundling has Vite issues
- **Theming**: CSS-variable driven with `.light`/`.dark` class toggle (persisted as `airwise-theme`). Colors are CSS vars surfaced through Tailwind as `rgb(var(--c-…) / <alpha-value>)`. `white` is remapped to the foreground var — existing `text-white` utilities invert automatically between themes; don't "fix" them
- **Backend ESM**: Backend uses `"type": "module"` + `NodeNext` module resolution. Frontend uses `"module": "ESNext"` + bundler resolution
- **No .env needed**: App works with zero configuration. `.env.example` files document optional upgrade keys (ELASTICSEARCH_NODE, WAQI_TOKEN, OPENROUTER_API_KEY)

## Reference

- `CLAUDE.md` — detailed architecture docs (fallback-first rationale, Elasticsearch index purposes, exposure score formula, heatmap implementation)
- `ProjectGuide.md` — full product spec
- `README.md` — setup and env var table
