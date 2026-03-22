import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile, getTrips } from "../services/api";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  User, Save, Mail, Globe, Wallet, Compass, Star, Shield,
  Plane, MapPin, Calendar, Clock, Eye, TrendingUp, Award
} from "lucide-react";
import profileBg from "../assets/destinations/profile-bg.jpg";

const TRAVEL_STYLES = [
  { id: "Budget",      desc: "Hostels, street food, local transport" },
  { id: "Backpacking", desc: "Adventure, flexibility, off-the-beaten-path" },
  { id: "Luxury",      desc: "5-star hotels, fine dining, premium experiences" },
];
const PREF_OPTIONS = [
  { id: "Food" }, { id: "Nightlife" }, { id: "Nature" }, { id: "History" },
  { id: "Shopping" }, { id: "Adventure" }, { id: "Art" }, { id: "Beaches" },
  { id: "Museums" }, { id: "Sports" },
];
const CURRENCIES = ["USD","EUR","GBP","INR","AED","JPY","AUD","CAD","SGD","THB"];
const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Argentina","Australia","Austria","Bangladesh",
  "Belgium","Brazil","Canada","Chile","China","Colombia","Denmark","Egypt",
  "France","Germany","Ghana","Greece","India","Indonesia","Iran","Ireland",
  "Israel","Italy","Japan","Kenya","Malaysia","Mexico","Morocco","Netherlands",
  "New Zealand","Nigeria","Norway","Pakistan","Peru","Philippines","Poland",
  "Portugal","Russia","Saudi Arabia","Singapore","South Africa","South Korea",
  "Spain","Sri Lanka","Sweden","Switzerland","Thailand","Turkey","UAE",
  "United Kingdom","United States","Vietnam"
].sort();

const AVATAR_COLORS = [
  "from-blue-500 to-indigo-600","from-emerald-500 to-teal-600","from-purple-500 to-pink-600",
  "from-orange-500 to-red-600","from-cyan-500 to-blue-600","from-rose-500 to-pink-600",
];

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    country: user?.country || "",
    preferred_currency: user?.preferred_currency || "USD",
    travel_style: user?.travel_style || "Budget",
    preferences: user?.preferences || {},
  });
  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(true);

  useEffect(() => {
    getTrips()
      .then((r) => setTrips(r.data))
      .catch(() => {})
      .finally(() => setTripsLoading(false));
  }, []);

  const togglePref = (key) =>
    setForm((f) => ({ ...f, preferences: { ...f.preferences, [key]: !f.preferences[key] } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(form);
      setUser({ ...user, ...form });
      toast.success("Profile updated");
    } catch { toast.error("Failed to update profile"); }
    finally { setLoading(false); }
  };

  const activePrefCount = Object.values(form.preferences).filter(Boolean).length;
  const avatarGradient = AVATAR_COLORS[(user?.name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

  // Trip stats
  const totalDays    = trips.reduce((s, t) => s + (t.itinerary?.duration_days || 0), 0);
  const totalBudget  = trips.reduce((s, t) => s + (t.itinerary?.total_budget || 0), 0);
  const destinations = [...new Set(trips.map((t) => t.destination))].length;
  const recentTrips  = [...trips].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 3);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 page-enter">
      {/* Profile header */}
      <div className="relative rounded-3xl overflow-hidden mb-6 shadow-xl text-white" style={{ minHeight: 200 }}>
        <img src={profileBg} alt="Profile" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-indigo-900/80" />
        <div className="relative z-10 p-8 flex items-center gap-6">
          <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-4xl font-bold shadow-xl shrink-0`}>
            {user?.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.name}</h1>
            <p className="text-blue-200 text-sm flex items-center gap-1 mt-1"><Mail size={13} />{user?.email}</p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-blue-200">
              {user?.country && <span className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full"><Globe size={11} />{user.country}</span>}
              {user?.travel_style && <span className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full"><Compass size={11} />{user.travel_style}</span>}
              <span className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full"><Star size={11} />{activePrefCount} interests</span>
            </div>
          </div>
        </div>
      </div>

      {/* Travel stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: <Plane size={16} className="text-white" />, label: "Trips", value: trips.length, gradient: "from-blue-500 to-blue-600" },
          { icon: <MapPin size={16} className="text-white" />, label: "Destinations", value: destinations, gradient: "from-emerald-500 to-teal-600" },
          { icon: <Calendar size={16} className="text-white" />, label: "Days Planned", value: totalDays, gradient: "from-purple-500 to-indigo-600" },
        ].map((s) => (
          <div key={s.label} className="card card-hover flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${s.gradient} shrink-0`}>{s.icon}</div>
            <div>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent trips */}
      <div className="card mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold flex items-center gap-2"><Clock size={16} className="text-blue-500" />Recent Trips</h2>
          <Link to="/" className="text-xs font-medium hover:underline" style={{ color: "var(--accent)" }}>View all</Link>
        </div>
        {tripsLoading ? (
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
          </div>
        ) : recentTrips.length === 0 ? (
          <div className="text-center py-8">
            <Plane size={28} className="mx-auto mb-2" style={{ color: "var(--muted)" }} />
            <p className="text-sm" style={{ color: "var(--muted)" }}>No trips yet.</p>
            <Link to="/plan" className="btn-primary inline-flex items-center gap-1.5 text-sm mt-3">
              Plan your first trip
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTrips.map((trip) => (
              <div key={trip.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--bg)" }}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                    <MapPin size={14} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{trip.destination}</p>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                      {trip.itinerary?.duration_days || "?"} days
                      {trip.itinerary?.total_budget ? ` · ${trip.itinerary.currency} ${trip.itinerary.total_budget?.toLocaleString()}` : ""}
                    </p>
                  </div>
                </div>
                <Link to={`/trips/${trip.id}`}
                  className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors shrink-0"
                  style={{ background: "color-mix(in srgb, var(--accent) 10%, transparent)", color: "var(--accent)" }}>
                  <Eye size={12} /> View
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Achievements */}
      {trips.length > 0 && (
        <div className="card mb-5">
          <h2 className="font-bold flex items-center gap-2 mb-4"><Award size={16} className="text-yellow-500" />Travel Milestones</h2>
          <div className="flex flex-wrap gap-2">
            {trips.length >= 1 && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border"
                style={{ background: "color-mix(in srgb, #f59e0b 10%, var(--surface))", borderColor: "#f59e0b40", color: "#b45309" }}>
                First Trip
              </span>
            )}
            {trips.length >= 3 && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border"
                style={{ background: "color-mix(in srgb, #3b82f6 10%, var(--surface))", borderColor: "#3b82f640", color: "#1d4ed8" }}>
                Explorer
              </span>
            )}
            {trips.length >= 5 && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border"
                style={{ background: "color-mix(in srgb, #8b5cf6 10%, var(--surface))", borderColor: "#8b5cf640", color: "#6d28d9" }}>
                Globetrotter
              </span>
            )}
            {totalDays >= 7 && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border"
                style={{ background: "color-mix(in srgb, #10b981 10%, var(--surface))", borderColor: "#10b98140", color: "#065f46" }}>
                Week Away
              </span>
            )}
            {destinations >= 3 && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border"
                style={{ background: "color-mix(in srgb, #ec4899 10%, var(--surface))", borderColor: "#ec489940", color: "#9d174d" }}>
                Multi-Destination
              </span>
            )}
            {totalBudget > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border"
                style={{ background: "color-mix(in srgb, #f97316 10%, var(--surface))", borderColor: "#f9731640", color: "#9a3412" }}>
                Budget Tracker
              </span>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Personal Info */}
        <div className="card space-y-4">
          <h2 className="font-bold flex items-center gap-2"><User size={16} className="text-blue-500" />Personal Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
            </div>
            <div>
              <label className="label">Country</label>
              <select className="input" value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}>
                <option value="">Select country</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Preferred Currency</label>
              <select className="input" value={form.preferred_currency}
                onChange={(e) => setForm({ ...form, preferred_currency: e.target.value })}>
                {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Travel Style */}
        <div className="card space-y-3">
          <h2 className="font-bold flex items-center gap-2"><Compass size={16} className="text-purple-500" />Travel Style</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TRAVEL_STYLES.map((s) => (
              <button key={s.id} type="button" onClick={() => setForm({ ...form, travel_style: s.id })}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  form.travel_style === s.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                }`}>
                <p className="font-semibold text-sm mb-1">{s.id}</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>{s.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="card space-y-3">
          <h2 className="font-bold flex items-center gap-2">
            <Star size={16} className="text-yellow-500" />Travel Interests
            <span className="ml-auto text-xs font-normal px-2 py-0.5 rounded-full" style={{ background: "var(--bg)", color: "var(--muted)" }}>
              {activePrefCount} selected
            </span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {PREF_OPTIONS.map((p) => (
              <button key={p.id} type="button" onClick={() => togglePref(p.id)}
                className={`px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                  form.preferences[p.id]
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                }`}>
                {p.id}
              </button>
            ))}
          </div>
        </div>

        {/* Account */}
        <div className="card">
          <h2 className="font-bold flex items-center gap-2 mb-3"><Shield size={16} className="text-green-500" />Account</h2>
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--bg)" }}>
            <Mail size={16} style={{ color: "var(--muted)" }} />
            <div>
              <p className="text-xs" style={{ color: "var(--muted)" }}>Email address</p>
              <p className="text-sm font-medium">{user?.email}</p>
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-base font-bold shadow-lg shadow-blue-500/20">
          <Save size={18} />
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
