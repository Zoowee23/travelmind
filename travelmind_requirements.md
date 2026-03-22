# TravelMind AI -- Requirements Document

## Project Overview

TravelMind AI is an agentic AI-powered travel planning platform that
generates personalized itineraries, adapts to user preferences, and
integrates real-time services like weather, maps, and emergency
assistance.

------------------------------------------------------------------------

## Core Features

### 1. Authentication

-   User Registration (Email + Password, bcrypt hashing)
-   Login (JWT-based authentication)
-   Logout
-   Profile Management

### 2. User Profile

-   Name
-   Country
-   Preferred Currency
-   Travel Style (Luxury / Budget / Backpacking)
-   Travel Preferences (Food, Nightlife, Nature, etc.)

### 3. Personalization Engine

-   Budget input
-   Travel type (solo, couple, family)
-   Activity preferences
-   Exclusions (e.g., no trekking)
-   Adaptive itinerary editing

### 4. Agentic AI System (Grok API)

-   Planner Agent (itinerary generation)
-   Weather Agent (OpenWeatherMap API)
-   Budget Agent (cost estimation + currency conversion)
-   Food Agent (local cuisine + restaurants)
-   Stay Agent (hotels + areas)
-   Packing Agent (checklist)
-   Emergency Agent (nearby hospitals, police)
-   Memory Agent (stores preferences and past trips)

### 5. Itinerary System

-   Day-wise breakdown (morning/afternoon/evening)
-   Budget estimates
-   Travel time
-   Editable and regeneratable

### 6. Maps Integration

-   Google Maps embedding
-   Route navigation (hotel → attraction)

### 7. Food Explorer

-   Local dishes
-   Categories: street food, cafes, fine dining
-   Cost estimates

### 8. Stay Suggestions

-   Budget / luxury filtering
-   Area recommendations
-   Map links

### 9. Emergency Mode

-   Nearby hospitals, pharmacies, police stations
-   Contact details + directions

### 10. Rating System

-   User ratings (1--5 stars)
-   Reviews
-   Category ratings (food, safety, nightlife)
-   Trending destinations

### 11. Chatbot

-   Context-aware follow-up queries
-   Modify itinerary dynamically

### 12. Dashboard

-   Previous trips
-   Saved itineraries
-   Ratings
-   Insights (AI-based)

### 13. Weather + Packing

-   Forecast display
-   Packing checklist

### 14. Theme

-   Light/Dark mode (Tailwind + localStorage)

### 15. Export Options

-   Download itinerary as:
    -   PDF (reportlab)
    -   Text
    -   JSON

------------------------------------------------------------------------

## Tech Stack

### Frontend

-   React.js
-   Tailwind CSS

### Backend

-   FastAPI

### Database

-   PostgreSQL (Supabase)

### AI

-   Grok API

### APIs

-   OpenWeatherMap
-   Google Maps
-   Currency API (Frankfurter)

### Hosting

-   Frontend: Vercel
-   Backend: Render
-   Database: Supabase

------------------------------------------------------------------------

## Folder Structure

backend/ app/ main.py routes/ services/ agents/ models/ utils/

frontend/ src/ components/ pages/ services/ context/

------------------------------------------------------------------------

## Database Tables

Users: - id - name - email - password - country - preferences

Trips: - id - user_id - destination - itinerary_json - created_at

Ratings: - id - user_id - destination - rating - review

------------------------------------------------------------------------

## Development Phases

Phase 1: - Auth + basic itinerary

Phase 2: - Weather + food + ratings

Phase 3: - Maps + emergency

Phase 4: - Chatbot + memory

------------------------------------------------------------------------

## Notes

-   Use modular agent design
-   Use structured JSON between agents
-   Keep UI clean and minimal
-   Focus on usability for hackathon

------------------------------------------------------------------------

Generated on: 2026-03-17 10:11:18.439208
