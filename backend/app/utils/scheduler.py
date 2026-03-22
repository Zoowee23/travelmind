from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime, timedelta
from app.models.database import SessionLocal
from app.models.models import Reminder, User
from app.utils.email import send_reminder_email

scheduler = AsyncIOScheduler()


async def _check_and_send_reminders():
    """Runs every minute. Finds reminders due within a ±90s window of local now."""
    db = SessionLocal()
    try:
        now = datetime.now()  # local time — matches how reminders are stored
        window_start = now - timedelta(seconds=30)
        window_end = now + timedelta(seconds=90)

        due = (
            db.query(Reminder)
            .filter(
                Reminder.remind_at >= window_start,
                Reminder.remind_at <= window_end,
                Reminder.is_read == False,  # noqa: E712
            )
            .all()
        )

        for reminder in due:
            user = db.query(User).filter(User.id == reminder.user_id).first()
            if not user:
                continue

            remind_at_str = reminder.remind_at.strftime("%d %b %Y at %I:%M %p")
            await send_reminder_email(
                to_email=user.email,
                user_name=user.name,
                title=reminder.title,
                message=reminder.message or "",
                remind_at=remind_at_str,
            )

            reminder.is_read = True
            db.commit()
            print(f"✅ Reminder fired for {user.email}: {reminder.title}")

    except Exception as e:
        print(f"❌ Scheduler error: {e}")
    finally:
        db.close()


def start_scheduler():
    scheduler.add_job(_check_and_send_reminders, "interval", minutes=1, id="reminder_check")
    scheduler.start()
    print("✅ Reminder scheduler started")


def stop_scheduler():
    scheduler.shutdown(wait=False)
