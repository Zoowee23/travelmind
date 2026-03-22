from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, profile, trips, ratings, weather, chatbot, export, budget, maps, wishlist, reminders

app = FastAPI(title="TravelMind AI", version="1.0.0")

@app.on_event("startup")
async def startup():
    # DB tables
    try:
        from app.models.database import engine
        from app.models.models import Base
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created/verified")
    except Exception as e:
        print(f"⚠️  DB connection failed (set DATABASE_URL in .env): {e}")

    # Reminder email scheduler
    try:
        from app.utils.scheduler import start_scheduler
        start_scheduler()
    except Exception as e:
        print(f"⚠️  Scheduler failed to start: {e}")

@app.on_event("shutdown")
def shutdown():
    try:
        from app.utils.scheduler import stop_scheduler
        stop_scheduler()
    except Exception:
        pass

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://your-vercel-app.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(trips.router)
app.include_router(ratings.router)
app.include_router(weather.router)
app.include_router(chatbot.router)
app.include_router(export.router)
app.include_router(budget.router)
app.include_router(maps.router)
app.include_router(wishlist.router)
app.include_router(reminders.router)

@app.get("/")
def root():
    return {"message": "TravelMind AI backend is running"}
