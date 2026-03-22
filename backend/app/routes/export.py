from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from sqlalchemy.orm import Session
from io import BytesIO
import json
from app.models.database import get_db
from app.models.models import Trip
from app.utils.auth import get_current_user
from app.utils.pdf_export import generate_pdf

router = APIRouter(prefix="/export", tags=["Export"])

@router.get("/{trip_id}/pdf")
def export_pdf(trip_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    pdf_bytes = generate_pdf(trip.destination, trip.itinerary_json)
    return StreamingResponse(BytesIO(pdf_bytes), media_type="application/pdf",
                             headers={"Content-Disposition": f"attachment; filename=itinerary_{trip_id}.pdf"})

@router.get("/{trip_id}/json")
def export_json(trip_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return JSONResponse(content=trip.itinerary_json)

@router.get("/{trip_id}/text")
def export_text(trip_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    text = f"Trip to {trip.destination}\n\n"
    itinerary = trip.itinerary_json or {}
    for day in itinerary.get("days", []):
        text += f"Day {day.get('day', '')}\n"
        for slot in ["morning", "afternoon", "evening"]:
            activity = day.get(slot, "")
            if activity:
                text += f"  {slot.capitalize()}: {activity}\n"
        text += "\n"
    return {"text": text}
