# AirWise AI — Delhi Air Quality & Public Health Companion

An AI-powered public health companion that turns live air quality, weather, and
routing data into actionable outdoor-activity decisions for Delhi residents:
"Should I run right now?", "Which route has the least pollution?", "Should my
child play outside?"

See [`ProjectGuide.md`](./ProjectGuide.md) for the full product spec and
[`CLAUDE.md`](./CLAUDE.md) for architecture notes.

## Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Framer Motion + React Router + Leaflet
- **Backend**: Express + TypeScript
- **Search / geo / time-series / vector search**: Elasticsearch (with an automatic in-memory fallback so the app runs without it)
- **Auth**: self-hosted email/password (bcrypt + JWT in an httpOnly cookie), users stored in Elasticsearch
- **AI chat**: Anthropic Claude API, RAG-grounded on an Elasticsearch-indexed health-advisory knowledge base (falls back to a rule-based responder without an API key)
- **AQI**: World Air Quality Index (WAQI) API, falls back to a realistic simulated model
- **Weather**: Open-Meteo (no API key required)
- **Map tiles**: Esri World Imagery satellite tiles via Leaflet (no API key, no signup, no card required)
- **Routing**: OSRM's free public demo server for driving directions, falls back to a synthetic router for all modes
- **Search / geocoding**: Nominatim (OpenStreetMap), falls back to a curated Delhi landmark list

Every external integration degrades gracefully to cached/simulated data if its
API key is missing or the request fails — the app is always fully demoable.
The map, routing, and search providers all require **zero API keys** — only
Elasticsearch, WAQI, and Anthropic are optional upgrades over their fallbacks.

## Getting started

```bash
npm install       # installs both workspaces (backend + frontend)
npm run dev       # runs backend (:4000) and frontend (:5173) together
```

Then open http://localhost:5173.

The app works out of the box with **zero configuration** — it falls back to
an in-memory data store and simulated AQI/weather/routing data. To enable the
full experience, copy the env examples and fill in keys:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

| Variable | Where | Needed for | Get one |
|---|---|---|---|
| `ELASTICSEARCH_NODE` (+ `ELASTICSEARCH_API_KEY` or user/pass) | backend | Real geo/time-series/vector search instead of the in-memory fallback | [Elastic Cloud free trial](https://www.elastic.co/cloud) |
| `WAQI_TOKEN` | backend | Live AQI readings instead of simulated data | [aqicn.org/data-platform/token](https://aqicn.org/data-platform/token/) (instant, free) |
| `ANTHROPIC_API_KEY` | backend | LLM-generated chat replies instead of the rule-based fallback | [console.anthropic.com](https://console.anthropic.com/) |

Weather (Open-Meteo), the map (Leaflet + Esri satellite tiles), routing
(OSRM), and search (Nominatim) all need no key at all — no signup, no card,
nothing to configure.

## Scripts

- `npm run dev` — run backend + frontend together
- `npm run dev:backend` / `npm run dev:frontend` — run one side only
- `npm run build` — typecheck and build both workspaces
- `npm run seed` — seed Delhi parks + health advisories into Elasticsearch directly (useful before first run against a fresh Elastic Cloud deployment; the server also seeds automatically on startup)

## Project layout

```
backend/   Express API — services/ have one file per external integration,
           each with a live-data path and a graceful fallback
frontend/  Vite React app — services/api/ mirrors the backend's route groups,
           contexts/ hold auth, geolocation, and health-profile state
```
