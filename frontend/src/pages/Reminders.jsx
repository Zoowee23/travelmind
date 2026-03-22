import { useState, useEffect } from "react";
import { getReminders, createReminder, markReminderRead, deleteReminder, getTrips } from "../services/api";
import toast from "react-hot-toast";
import { Bell, Plus, Trash2, Check, X, Calendar, Clock, Mail } from "lucide-react";

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", remind_at: "", trip_id: "" });

  useEffect(() => {
    Promise.all([getReminders(), getTrips()])
      .then(([rRes, tRes]) => { setReminders(rRes.data); setTrips(tRes.data); })
      .catch(() => toast.error("Failed to load reminders"))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.remind_at) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        message: form.message.trim() || null,
        remind_at: form.remind_at,
        trip_id: form.trip_id ? parseInt(form.trip_id) : null,
      };
      const r = await createReminder(payload);
      setReminders((prev) => [...prev, r.data].sort((a, b) => new Date(a.remind_at) - new Date(b.remind_at)));
      setForm({ title: "", message: "", remind_at: "", trip_id: "" });
      setShowAdd(false);
      toast.success("Reminder set");
    } catch {
      toast.error("Failed to create reminder");
    } finally {
      setSaving(false);
    }
  };

  const handleRead = async (id) => {
    try {
      await markReminderRead(id);
      setReminders((prev) => prev.map((r) => r.id === id ? { ...r, is_read: true } : r));
    } catch { toast.error("Failed to update"); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteReminder(id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
      toast.success("Reminder deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const now = new Date();
  const upcoming = reminders.filter((r) => !r.is_read && new Date(r.remind_at) >= now);
  const past = reminders.filter((r) => r.is_read || new Date(r.remind_at) < now);

  const minDateTime = new Date(now.getTime() + 60000).toISOString().slice(0, 16);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 page-enter">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell size={22} className="text-blue-500" /> Reminders
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Stay on top of your travel plans</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15} /> New Reminder
        </button>
      </div>

      {/* Email notice */}
      <div className="card mb-5 flex items-start gap-3" style={{ background: "color-mix(in srgb, var(--accent) 6%, var(--surface))", borderColor: "color-mix(in srgb, var(--accent) 20%, transparent)" }}>
        <Mail size={16} className="mt-0.5 shrink-0" style={{ color: "var(--accent)" }} />
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          You'll receive an email confirmation when a reminder is set, and another email when it fires at the scheduled time.
          Make sure your email is configured in <code className="text-xs px-1 py-0.5 rounded" style={{ background: "var(--bg)" }}>backend/.env</code>.
        </p>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="card mb-5 border-2" style={{ borderColor: "var(--accent)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">New Reminder</h2>
            <button onClick={() => setShowAdd(false)} style={{ color: "var(--muted)" }}><X size={16} /></button>
          </div>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="label">Title *</label>
              <input className="input" placeholder="e.g. Book flights for Tokyo trip" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Date & Time *</label>
                <input type="datetime-local" className="input" value={form.remind_at} min={minDateTime}
                  onChange={(e) => setForm({ ...form, remind_at: e.target.value })} required />
              </div>
              <div>
                <label className="label">Link to Trip (optional)</label>
                <select className="input" value={form.trip_id} onChange={(e) => setForm({ ...form, trip_id: e.target.value })}>
                  <option value="">No trip</option>
                  {trips.map((t) => <option key={t.id} value={t.id}>{t.destination}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Note (optional)</label>
              <textarea className="input resize-none" rows={2} placeholder="Any extra details..."
                value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn-primary text-sm flex items-center gap-1.5">
                <Bell size={14} /> {saving ? "Saving..." : "Set Reminder"}
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}
        </div>
      ) : reminders.length === 0 ? (
        <div className="card text-center py-16">
          <Bell size={40} className="mx-auto mb-3" style={{ color: "var(--muted)" }} />
          <p className="font-semibold text-lg mb-1">No reminders yet</p>
          <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>Set reminders for bookings, packing, or anything trip-related.</p>
          <button onClick={() => setShowAdd(true)} className="btn-primary inline-flex items-center gap-2 text-sm">
            <Plus size={14} /> Add a reminder
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>Upcoming</p>
              <div className="space-y-2">
                {upcoming.map((r) => <ReminderCard key={r.id} r={r} trips={trips} onRead={handleRead} onDelete={handleDelete} />)}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>Past / Done</p>
              <div className="space-y-2 opacity-60">
                {past.map((r) => <ReminderCard key={r.id} r={r} trips={trips} onRead={handleRead} onDelete={handleDelete} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReminderCard({ r, trips, onRead, onDelete }) {
  const trip = trips.find((t) => t.id === r.trip_id);
  const isPast = new Date(r.remind_at) < new Date();
  return (
    <div className={`card flex items-center gap-4 ${!r.is_read && !isPast ? "border-l-4" : ""}`}
      style={!r.is_read && !isPast ? { borderLeftColor: "var(--accent)" } : {}}>
      <div className={`p-2.5 rounded-xl shrink-0 ${r.is_read || isPast ? "bg-gray-100 dark:bg-gray-800" : "bg-blue-100 dark:bg-blue-900/30"}`}>
        <Bell size={16} className={r.is_read || isPast ? "text-gray-400" : "text-blue-500"} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm ${r.is_read ? "line-through" : ""}`}>{r.title}</p>
        {r.message && <p className="text-xs mt-0.5 truncate" style={{ color: "var(--muted)" }}>{r.message}</p>}
        <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: "var(--muted)" }}>
          <span className="flex items-center gap-1">
            <Calendar size={10} />
            {new Date(r.remind_at).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {new Date(r.remind_at).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
          </span>
          {trip && <span className="px-1.5 py-0.5 rounded-full" style={{ background: "var(--bg)" }}>{trip.destination}</span>}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {!r.is_read && (
          <button onClick={() => onRead(r.id)}
            className="p-1.5 rounded-lg transition-colors hover:bg-green-50 dark:hover:bg-green-900/20 text-green-500">
            <Check size={14} />
          </button>
        )}
        <button onClick={() => onDelete(r.id)}
          className="p-1.5 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
