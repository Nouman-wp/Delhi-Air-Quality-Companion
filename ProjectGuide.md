## Important Development Instructions

- Think through the overall architecture before generating code.
- Create a clear implementation plan and execute it sequentially.
- Do not stop after scaffolding; continue implementing features until the project is functional.
- Keep commits/features incremental and avoid rewriting completed code unless necessary.
- Prefer stable, well-maintained libraries with generous free tiers.
- Use environment variables for all API keys and secrets.
- Produce production-quality code rather than hackathon-only code where practical.
- If an API requires payment, automatically choose a comparable free alternative.
- If live data is temporarily unavailable, gracefully fall back to cached or sample data instead of breaking the UI.


# ProjectGuide.md

# AirWise AI - Delhi Air Quality & Public Health Companion

## Overview

You are building a production-quality Buildathon project, not an MVP or prototype UI.

The goal is to create an AI-powered public health companion that helps users make healthier outdoor decisions using real-time environmental data, maps, routing, weather, and conversational AI.

This project should feel like a combination of:

- Google Maps
- Strava
- Perplexity AI
- Google Weather
- Apple Health

The focus is not showing AQI numbers.

The focus is helping users make better real-world decisions.

Examples:

- Should I go for a run right now?
- Which route exposes me to the least pollution?
- Should I wear an N95?
- Is it safe for my child to play outside?
- Should I turn on my air purifier?
- Can I cycle to this destination?
- Which nearby park has the cleanest air?

The application must answer these questions intelligently using live environmental data.

---

# Buildathon Constraints

This project MUST be completed in a **single Claude session**.

Claude should avoid unnecessary iterations, excessive refactoring, repeated rewrites, or repeatedly regenerating the same files.

Priorities:

1. Build working features first.
2. Keep architecture clean but practical.
3. Avoid overengineering.
4. Do not waste context window.
5. Make decisions independently whenever possible.
6. If multiple good solutions exist, choose one and continue instead of asking.
7. Generate complete files instead of repeatedly editing the same file.
8. Finish the project before polishing.

Assume time is limited.

---

# Tech Stack

Frontend

- React
- TypeScript
- Vite
- TailwindCSS
- Framer Motion
- React Router

Maps

Preferred:

Mapbox GL JS

Fallback:

Google Maps JS API

Backend

Claude may choose:

- Express
- Fastify
- Hono
- NestJS

whichever results in the cleanest architecture.

Database / Search

Elastic is **mandatory**.

Claude may use:

- Elasticsearch
- Elastic Cloud
- Elastic Maps
- Elastic Vector Search

Authentication

Use a free authentication provider.

Preferred:

- Better Auth
- Clerk Free
- Firebase Auth
- Supabase Auth

Claude may choose whichever has the best developer experience.

AI

Claude may freely choose:

- OpenAI
- Gemini
- Claude API
- Groq
- OpenRouter

Whichever provides the best experience.

Weather APIs

Claude may freely choose.

AQI APIs

Claude may freely choose.

Routing APIs

Claude may freely choose.

Deployment

Can be chosen freely.

---

# Elastic Requirement

Elastic is NOT optional.

The project should actually benefit from Elastic instead of simply storing data.

Possible Elastic usage:

- AQI indexing
- Weather indexing
- Historical environmental data
- Geospatial search
- Time-series analytics
- Route pollution search
- Vector search for health advisory retrieval
- Semantic search
- RAG for chatbot
- Exposure history
- Live search
- Fast geo queries

Claude should decide the best implementation.

---

# Main User Flow

User opens app.

↓

User grants location.

↓

Current location appears on satellite map.

↓

Nearby regions display live AQI overlay.

↓

User can tap anywhere on map.

OR

Search any destination.

↓

Application generates multiple routes.

↓

Each route displays:

- ETA
- Distance
- Average AQI
- Exposure Score
- Health Rating
- Recommendation

↓

User can ask AI anything.

↓

AI answers using current environmental conditions.

---

# Core Features

## 1. Live AQI Map

The homepage should immediately display:

- Satellite map
- Current location
- AQI overlay

Color scheme:

Green

Yellow

Orange

Red

Purple

Overlay should resemble Strava Heatmaps.

---

## 2. Search

Search bar like Google Maps.

Search any location.

No office/home limitation.

Search should autocomplete.

---

## 3. Route Comparison

Generate multiple routes.

Each route should include:

Distance

ETA

Average AQI

Maximum AQI encountered

Exposure Score

Recommendation

Example

Route A

18 min

AQI 198

Exposure 82

Avoid

Route B

20 min

AQI 102

Exposure 31

Recommended

---

## 4. Exposure Score

Instead of only AQI.

Estimate total pollution exposure.

Factors may include:

PM2.5

PM10

Travel duration

Walking speed

Cycling

Vehicle

Wind

Humidity

Claude should choose an appropriate formula.

---

## 5. AI Health Companion

Chat interface.

User can ask natural language questions.

Examples

"Can I run now?"

"Is it safe for my child?"

"Can I open windows?"

"Should I wear a mask?"

"Can I go cycling?"

"What is the safest nearby park?"

"Which route is healthier?"

"Should I turn on my purifier?"

The chatbot should use RAG where appropriate using Elasticsearch Vector Search.

---

## 6. Health Profiles

Allow users to select:

Adult

Child

Senior Citizen

Asthma

COPD

Pregnant

Athlete

Recommendations should adapt.

---

## 7. Nearby Safe Places

Recommend nearby:

Parks

Walking paths

Running routes

Cycling routes

Cleaner areas

Sorted by air quality.

---

## 8. Smart Notifications

Examples

AQI rising rapidly.

Outdoor exercise not recommended.

Wind conditions improving.

Good time for running.

Poor conditions expected in 30 minutes.

---

## 9. Timeline

Maintain user history.

Example

Today's exposure

Weekly exposure

Best air day

Average AQI encountered

Distance walked

---

## 10. Dashboard

Cards including:

Current AQI

Feels Like

Weather

Wind

Humidity

UV

Health Recommendation

Running Score

Cycling Score

Outdoor Score

---

# UI Style

Modern.

Premium.

Minimal.

Not government-looking.

Think:

Apple

Linear

Vercel

Stripe

Not Bootstrap.

Animations should be smooth.

Glassmorphism is acceptable.

Dark mode first.

Responsive.

---

# Suggested Color Palette

Background

Near black

Cards

Dark gray

Accent

Blue

AQI colors

Green

Yellow

Orange

Red

Purple

---

# Pages

Landing

Dashboard

Map

AI Chat

History

Settings

Authentication

---

# Components

Navbar

Map

Sidebar

Floating search

AQI cards

Weather cards

Chat panel

Bottom mobile navigation

Notification panel

Profile selector

---

# Suggested Folder Structure

src/

components/

pages/

hooks/

services/

contexts/

types/

utils/

api/

assets/

styles/

---

# API Layer

Separate all API calls.

Do NOT mix API logic into components.

Create services for:

AQI

Weather

Maps

Search

Elastic

AI

Authentication

---

# AI System Prompt

The AI assistant should always prioritize health.

Never fabricate data.

Use live information whenever available.

Ground responses using Elastic Vector Search and indexed advisories when possible.

Keep answers concise and actionable.

---

# Performance

Use lazy loading.

Code splitting.

Memoization where useful.

Avoid unnecessary re-renders.

Optimize map rendering.

---

# Nice-to-Have Features

These are optional if time allows.

- AQI prediction for next few hours
- Indoor AQI estimation
- Air purifier scheduling
- Route replay
- Pollution playback timeline
- Shareable route cards
- AQI widgets
- Progressive Web App
- Voice chat
- Offline cache
- Multi-language support

---

# Code Quality

Use:

Strict TypeScript

Reusable components

Clean architecture

Readable naming

Minimal comments

No dead code

No duplicated logic

---

# Deliverables

The finished application should include:

✔ Authentication

✔ Interactive map

✔ Live AQI overlay

✔ Current location

✔ Destination search

✔ Route comparison

✔ AI chatbot

✔ Weather integration

✔ Elastic integration

✔ Responsive UI

✔ Modern UX

✔ Clean architecture

---

# Decision Making

Claude has full freedom to select:

- APIs
- SDKs
- Services
- Libraries
- Authentication
- AI model
- Weather provider
- AQI provider
- Routing provider

provided they:

- have generous free tiers,
- are reliable,
- integrate cleanly,
- and help complete the project efficiently.

Avoid asking the user to choose between equivalent options unless absolutely necessary.

---

# Primary Goal

Build something that feels like a polished consumer application that could realistically be launched for Delhi residents.

When judges open the app, they should immediately understand that it is an intelligent public health companion—not just another AQI dashboard.

The application should emphasize actionable recommendations, beautiful visualization, fast interactions, and meaningful use of Elasticsearch throughout the product.