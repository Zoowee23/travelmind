import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "travelmind.db")
conn = sqlite3.connect(db_path)
cur = conn.cursor()

# ── trips table: add new columns ──────────────────────────────────────────────
cur.execute("PRAGMA table_info(trips)")
trip_cols = [row[1] for row in cur.fetchall()]
print("Current trips columns:", trip_cols)

new_trip_cols = {
    "share_token": "TEXT",
    "cover_photo": "TEXT",
    "notes": "TEXT",
    "actual_spend": 'TEXT DEFAULT "{}"',
}
for col, typ in new_trip_cols.items():
    if col not in trip_cols:
        cur.execute(f"ALTER TABLE trips ADD COLUMN {col} {typ}")
        print(f"  Added trips.{col}")
    else:
        print(f"  trips.{col} already exists")

# ── wishlist table ─────────────────────────────────────────────────────────────
cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='wishlist'")
if not cur.fetchone():
    cur.execute("""
        CREATE TABLE wishlist (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id),
            destination TEXT NOT NULL,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    print("Created wishlist table")
else:
    print("wishlist table already exists")

# ── reminders table ────────────────────────────────────────────────────────────
cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='reminders'")
if not cur.fetchone():
    cur.execute("""
        CREATE TABLE reminders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id),
            trip_id INTEGER REFERENCES trips(id),
            title TEXT NOT NULL,
            message TEXT,
            remind_at DATETIME NOT NULL,
            is_read INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    print("Created reminders table")
else:
    print("reminders table already exists")

conn.commit()
conn.close()
print("\nMigration complete.")
