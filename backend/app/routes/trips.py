import secrets
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from app.models.database import get_db
from app.models.models import Trip, User
from app.utils.auth import get_current_user
from app.agents.planner import run_planner_agent

router = APIRouter(prefix="/trips", tags=["Trips"])

class TripRequest(BaseModel):
    destination: str
    budget: float
    travel_type: str
    duration_days: int
    activity_preferences: List[str] = []
    exclusions: List[str] = []
    currency: str = "USD"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    accommodation_type: Optional[str] = None
    transport_mode: Optional[str] = None
    trip_mode: Optional[str] = "international"
    origin_city: Optional[str] = None
    state: Optional[str] = None

class TripUpdate(BaseModel):
    itinerary_json: dict

class NotesUpdate(BaseModel):
    notes: str

class PhotoUpdate(BaseModel):
    cover_photo: str  # base64 data URL

class ActualSpendUpdate(BaseModel):
    actual_spend: dict  # {"accommodation": 200, "food": 150, ...}

def trip_to_dict(t):
    return {
        "id": t.id,
        "destination": t.destination,
        "created_at": t.created_at,
        "itinerary": t.itinerary_json,
        "share_token": t.share_token,
        "cover_photo": t.cover_photo,
        "notes": t.notes,
        "actual_spend": t.actual_spend or {},
    }

@router.post("/generate")
async def generate_trip(data: TripRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    itinerary = await run_planner_agent(
        destination=data.destination,
        budget=data.budget,
        travel_type=data.travel_type,
        duration_days=data.duration_days,
        activity_preferences=data.activity_preferences,
        exclusions=data.exclusions,
        currency=data.currency,
        user_preferences=current_user.preferences or {},
        start_date=data.start_date,
        accommodation_type=data.accommodation_type,
        transport_mode=data.transport_mode,
    )
    trip = Trip(user_id=current_user.id, destination=data.destination, itinerary_json=itinerary)
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return {"trip_id": trip.id, "itinerary": itinerary}

@router.get("/")
def get_my_trips(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trips = db.query(Trip).filter(Trip.user_id == current_user.id).order_by(Trip.created_at.desc()).all()
    return [trip_to_dict(t) for t in trips]

@router.get("/shared/{token}")
def get_shared_trip(token: str, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.share_token == token).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Shared trip not found")
    return trip_to_dict(trip)

@router.get("/{trip_id}")
def get_trip(trip_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip_to_dict(trip)

@router.put("/{trip_id}")
def update_trip(trip_id: int, data: TripUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    trip.itinerary_json = data.itinerary_json
    db.commit()
    return {"message": "Trip updated"}

@router.delete("/{trip_id}")
def delete_trip(trip_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    db.delete(trip)
    db.commit()
    return {"message": "Trip deleted"}

# ── Share ──────────────────────────────────────────────────────────────────────
@router.post("/{trip_id}/share")
def generate_share_link(trip_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if not trip.share_token:
        trip.share_token = secrets.token_urlsafe(16)
        db.commit()
    return {"share_token": trip.share_token}

@router.delete("/{trip_id}/share")
def revoke_share_link(trip_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    trip.share_token = None
    db.commit()
    return {"message": "Share link revoked"}

# ── Notes ──────────────────────────────────────────────────────────────────────
@router.put("/{trip_id}/notes")
def update_notes(trip_id: int, data: NotesUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    trip.notes = data.notes
    db.commit()
    return {"message": "Notes saved"}

# ── Photo ──────────────────────────────────────────────────────────────────────
@router.put("/{trip_id}/photo")
def update_photo(trip_id: int, data: PhotoUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    trip.cover_photo = data.cover_photo
    db.commit()
    return {"message": "Photo saved"}

# ── Actual Spend ───────────────────────────────────────────────────────────────
@router.put("/{trip_id}/spend")
def update_spend(trip_id: int, data: ActualSpendUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    trip.actual_spend = data.actual_spend
    db.commit()
    return {"message": "Spend updated"}
