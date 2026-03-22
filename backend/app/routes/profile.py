from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict
from app.models.database import get_db
from app.models.models import User
from app.utils.auth import get_current_user

router = APIRouter(prefix="/profile", tags=["Profile"])

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    country: Optional[str] = None
    preferred_currency: Optional[str] = None
    travel_style: Optional[str] = None
    preferences: Optional[Dict] = None

@router.get("/me")
def get_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "country": current_user.country,
        "preferred_currency": current_user.preferred_currency,
        "travel_style": current_user.travel_style,
        "preferences": current_user.preferences,
    }

@router.put("/me")
def update_profile(data: ProfileUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return {"message": "Profile updated"}
