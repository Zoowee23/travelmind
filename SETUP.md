# TravelMind AI — Setup Guide

## 1. Fill in your API keys

Edit `backend/.env`:
```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/travelmind
SECRET_KEY=any_random_32_char_string
GROK_API_KEY=xai-...          # from x.ai/api
OPENWEATHER_API_KEY=...        # from openweathermap.org
GOOGLE_MAPS_API_KEY=...        # from console.cloud.google.com
```

## 2. Start the backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

## 3. Start the frontend

```bash
cd frontend
npm install        # if not done yet
npm run dev
```

App runs at: http://localhost:5173

## 4. Supabase (PostgreSQL)

- Create a project at supabase.com
- Copy the connection string into DATABASE_URL in .env
- Tables are auto-created on first backend startup (SQLAlchemy creates them)

## What's built

### Backend (FastAPI)
- POST /auth/register — create account
- POST /auth/login — get JWT token
- GET/PUT /profile/me — view/update profile
- POST /trips/generate — AI itinerary generation via Grok
- GET/PUT/DELETE /trips/{id} — manage trips
- GET /weather/{destination} — weather forecast
- POST /ratings/ — submit rating
- GET /ratings/trending — trending destinations
- POST /chat/ — AI chatbot
- GET /budget/convert — currency conversion
- GET /export/{id}/pdf|json|text — export itinerary

### Frontend (React + Tailwind)
- /login, /register — auth pages
- / — dashboard with all trips
- /plan — trip planning form (destination, budget, preferences)
- /trips/:id — full itinerary view with weather, chatbot, ratings, export
- /profile — edit profile & preferences
- /trending — top-rated destinations
- Light/Dark mode toggle

## What you still need to add (Phase 3 & 4)
- Google Maps embed on TripDetail page (needs GOOGLE_MAPS_API_KEY)
- Emergency mode (nearby hospitals/police via Google Places API)
- Memory agent (store past preferences in DB, feed to planner)
- Push notifications / email for trip reminders
