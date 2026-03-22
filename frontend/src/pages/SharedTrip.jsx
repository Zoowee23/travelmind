import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getSharedTrip } from "../services/api";
import { Plane, MapPin, Calendar, Wallet, Sun, ChevronDown, ChevronUp, Clock } from "lucide-react";

function DayCard({ day, currency }) {
  const [open, setOpen] = useState(day.day <= 2);
  const slots = [
    { key: "morning", label: "Morning", color: "text-amber-500" },
    { key: "afternoon", label: "Afternoon", color: "text-orange-500" },
    { key: "evening", label: "Evening", color: "text-indigo-500" },
  ];
  return (
    <div className="card overflow-hidden">
      <button className="w-full flex items-center justify-between text-left" onClick={() => setOpen((o) => !o)}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {day.day}
          </div>
          <span className="font-semibold">Day {day.day}</span>
        </div>
        <div className="flex items-center gap-3 text-sm" style={{ color: "var(--muted)" }}>
          {day.estimated_cost > 0 && <span className="flex items-center gap-1"><Wallet size={13} />{currency} {day.estimated_cost}</span>}
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>
      {open && (
        <div className="mt-4 space-y-3 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
          {slots.map(({ key, label, color }) => day[key] ? (
            <div key={key} className="flex gap-3">
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wider mb-0.5 ${color}`}>{label}</p>
                <p className="text-sm">{day[key]}</p>
              </div>
            </div>
          ) : null)}
        </div>
      )}
    </div>
  );
}

export default function SharedTrip() {
  const { token } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getSharedTrip(token)
      .then((r) => setTrip(r.data))
      .catch(() => setError("This trip link is invalid or has been removed."))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4" style={{ background: "var(--bg)" }}>
      <Plane size={40} style={{ color: "var(--muted)" }} />
      <p className="font-semibold text-lg">{error}</p>
      <Link to="/login" className="btn-primary text-sm">Go to TravelMind</Link>
    </div>
  );

  const itin = trip.itinerary || {};

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-lg">
          <Plane size={20} /> TravelMind
        </div>
        <Link to="/register" className="text-sm bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-lg transition-colors">
          Create your own trip
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 page-enter">
        {/* Header */}
        <div className="card mb-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-0">
          <p className="text-blue-200 text-sm mb-1 flex items-center gap-1"><MapPin size={13} />Shared Itinerary</p>
          <h1 className="text-3xl font-bold">{trip.destination}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-blue-100 text-sm">
            {itin.duration_days && <span className="flex items-center gap-1"><Calendar size={13} />{itin.duration_days} days</span>}
            {itin.total_budget && <span className="flex items-center gap-1"><Wallet size={13} />{itin.currency} {itin.total_budget?.toLocaleString()}</span>}
            {itin.weather_summary && <span className="flex items-center gap-1"><Sun size={13} />{itin.weather_summary}</span>}
          </div>
        </div>

        {/* Days */}
        {(itin.days || []).length > 0 && (
          <div className="space-y-3 mb-6">
            <h2 className="font-semibold text-lg flex items-center gap-2"><Calendar size={18} className="text-blue-500" />Day-by-Day Itinerary</h2>
            {itin.days.map((day) => <DayCard key={day.day} day={day} currency={itin.currency} />)}
          </div>
        )}

        {/* Notes */}
        {trip.notes && (
          <div className="card mb-6">
            <h3 className="font-semibold mb-2">Trip Notes</h3>
            <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--muted)" }}>{trip.notes}</p>
          </div>
        )}

        <div className="card text-center py-8">
          <Plane size={32} className="mx-auto mb-3 text-blue-500" />
          <p className="font-semibold mb-1">Plan your own trip</p>
          <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>Get a personalized itinerary with live weather and budget planning.</p>
          <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-sm">
            Get started free
          </Link>
        </div>
      </div>
    </div>
  );
}
