import aiosmtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.config import settings


async def send_reminder_email(to_email: str, user_name: str, title: str, message: str, remind_at: str):
    """Send a reminder email via Gmail SMTP. Skips if credentials not configured."""
    if not settings.EMAIL_ADDRESS or not settings.EMAIL_APP_PASSWORD:
        print("⚠️  Email not configured — skipping")
        return

    message_block = (
        f'<p style="color:#64748b;font-size:14px;margin:0 0 16px;">{message}</p>'
        if message else ""
    )

    html = f"""
    <div style="font-family:sans-serif;max-width:520px;margin:auto;background:#f8fafc;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#2563eb,#4338ca);padding:32px 28px;color:white;">
        <h1 style="margin:0;font-size:22px;">TravelMind Reminder</h1>
        <p style="margin:6px 0 0;opacity:.85;font-size:14px;">Hey {user_name}, you have a reminder!</p>
      </div>
      <div style="padding:28px;">
        <h2 style="margin:0 0 8px;font-size:18px;color:#1e293b;">{title}</h2>
        {message_block}
        <div style="background:#eff6ff;border-radius:10px;padding:12px 16px;display:inline-block;">
          <p style="margin:0;font-size:13px;color:#2563eb;font-weight:600;">Scheduled for: {remind_at}</p>
        </div>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
        <p style="color:#94a3b8;font-size:12px;margin:0;">
          This reminder was set in TravelMind. Open the app to manage your reminders.
        </p>
      </div>
    </div>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Reminder: {title}"
    msg["From"] = f"TravelMind <{settings.EMAIL_ADDRESS}>"
    msg["To"] = to_email
    msg.attach(MIMEText(html, "html"))

    try:
        await aiosmtplib.send(
            msg,
            hostname="smtp.gmail.com",
            port=587,
            start_tls=True,
            username=settings.EMAIL_ADDRESS,
            password=settings.EMAIL_APP_PASSWORD,
        )
        print(f"✅ Email sent to {to_email}")
    except Exception as e:
        print(f"❌ Failed to send email to {to_email}: {e}")
