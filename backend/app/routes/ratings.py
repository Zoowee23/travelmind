from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional
from app.models.database import get_db
from app.models.models import Rating, User
from app.utils.auth import get_current_user

router = APIRouter(prefix="/ratings", tags=["Ratings"])

class RatingRequest(BaseModel):
    destination: str
    rating: float
    review: Optional[str] = None
    food_rating: Optional[float] = None
    safety_rating: Optional[float] = None
    nightlife_rating: Optional[float] = None

@router.post("/")
def submit_rating(data: RatingRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    r = Rating(user_id=current_user.id, **data.model_dump())
    db.add(r)
    db.commit()
    return {"message": "Rating submitted"}

@router.get("/destination/{destination}")
def get_destination_ratings(destination: str, db: Session = Depends(get_db)):
    ratings = db.query(Rating).filter(Rating.destination.ilike(f"%{destination}%")).all()
    if not ratings:
        return {"destination": destination, "average": None, "reviews": []}
    avg = sum(r.rating for r in ratings) / len(ratings)
    return {
        "destination": destination,
        "average_rating": round(avg, 2),
        "total_reviews": len(ratings),
        "reviews": [{"review": r.review, "rating": r.rating, "food": r.food_rating, "safety": r.safety_rating, "nightlife": r.nightlife_rating} for r in ratings],
    }

@router.get("/trending")
def trending_destinations(db: Session = Depends(get_db)):
    results = (
        db.query(Rating.destination, func.avg(Rating.rating).label("avg_rating"), func.count(Rating.id).label("count"))
        .group_by(Rating.destination)
        .order_by(func.avg(Rating.rating).desc())
        .limit(10)
        .all()
    )
    return [{"destination": r.destination, "avg_rating": round(r.avg_rating, 2), "reviews": r.count} for r in results]
