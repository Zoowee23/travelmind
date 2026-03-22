from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.models.database import get_db
from app.models.models import Wishlist, User
from app.utils.auth import get_current_user

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])

class WishlistItem(BaseModel):
    destination: str
    notes: Optional[str] = None

@router.get("/")
def get_wishlist(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    items = db.query(Wishlist).filter(Wishlist.user_id == current_user.id).order_by(Wishlist.created_at.desc()).all()
    return [{"id": w.id, "destination": w.destination, "notes": w.notes, "created_at": w.created_at} for w in items]

@router.post("/")
def add_to_wishlist(data: WishlistItem, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(Wishlist).filter(Wishlist.user_id == current_user.id, Wishlist.destination == data.destination).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already in wishlist")
    item = Wishlist(user_id=current_user.id, destination=data.destination, notes=data.notes)
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"id": item.id, "destination": item.destination, "notes": item.notes, "created_at": item.created_at}

@router.delete("/{item_id}")
def remove_from_wishlist(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(Wishlist).filter(Wishlist.id == item_id, Wishlist.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(item)
    db.commit()
    return {"message": "Removed"}
