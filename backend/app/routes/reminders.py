from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.database import get_db
from app.models.models import Reminder, User
from app.utils.auth import get_current_user
from app.utils.email import send_reminder_email

router = APIRouter(prefix="/reminders", tags=["Reminders"])


class ReminderCreate(BaseModel):
    title: str
    message: Optional[str] = None
    remind_at: str  # ISO datetime string from frontend (local time)
    trip_id: Optional[int] = None


def _reminder_dict(r: Reminder):
    return {
        "id": r.id,
        "title": r.title,
        "message": r.message,
        "remind_at": r.remind_at,
        "is_read": r.is_read,
        "trip_id": r.trip_id,
        "created_at": r.created_at,
    }


@router.get("/")
def get_reminders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    items = (
        db.query(Reminder)
        .filter(Reminder.user_id == current_user.id)
        .order_by(Reminder.remind_at)
        .all()
    )
    return [_reminder_dict(r) for r in items]


@router.post("/")
async def create_reminder(
    data: ReminderCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Parse the datetime string as-is (local time) — strip any timezone info
    # so it's stored as a naive local datetime, matching what the scheduler uses
    raw = data.remind_at.replace("Z", "").split("+")[0].split(".")[0]
    remind_at = datetime.fromisoformat(raw)

    r = Reminder(
        user_id=current_user.id,
        title=data.title,
        message=data.message,
        remind_at=remind_at,
        trip_id=data.trip_id,
    )
    db.add(r)
    db.commit()
    db.refresh(r)

    # Confirmation email in background
    remind_at_str = remind_at.strftime("%d %b %Y at %I:%M %p")
    background_tasks.add_task(
        send_reminder_email,
        to_email=current_user.email,
        user_name=current_user.name,
        title=data.title,
        message=data.message or "",
        remind_at=remind_at_str,
    )

    return _reminder_dict(r)


@router.patch("/{reminder_id}/read")
def mark_read(reminder_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    r = db.query(Reminder).filter(Reminder.id == reminder_id, Reminder.user_id == current_user.id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Not found")
    r.is_read = True
    db.commit()
    return {"message": "Marked as read"}


@router.delete("/{reminder_id}")
def delete_reminder(reminder_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    r = db.query(Reminder).filter(Reminder.id == reminder_id, Reminder.user_id == current_user.id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(r)
    db.commit()
    return {"message": "Deleted"}
