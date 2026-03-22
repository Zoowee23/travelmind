import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getTrips, deleteTrip, getTrending } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  Plane, Trash2, Eye, Plus, MapPin, Calendar, TrendingUp,
  Globe, Star, Compass, Wallet, Clock, ChevronRight, Sparkles,
  ArrowRight, BarChart3, Home
} from "lucide-react";

// ── Local images ──────────────────────────────────────────────────────────────
import tokyoImg     from "../assets/destinations/tokyo.jpg";
import baliImg      from "../assets/destinations/bali.jpg";
import parisImg     from "../assets/destinations/paris.jpg";
import dubaiImg     from "../assets/destinations/dubai.jpg";
import goaImg       from "../assets/destinations/goa.jpg";
import singaporeImg from "../assets/destinations/singapore.jpg";
import istanbulImg  from "../assets/destinations/istanbul.jpg";
import kyotoImg     from "../assets/destinations/kyoto.jpg";
import londonImg    from "../assets/destinations/london.jpg";
import romeImg      from "../assets/destinations/rome.jpg";

// ── Destination data ──────────────────────────────────────────────────────────
const INTERNATIONAL = [
  { name: "Tokyo",     country: "Japan",     tag: "Culture & Food",    img: tokyoImg },
  { name: "Bali",      country: "Indonesia", tag: "Beach & Nature",    img: baliImg },
  { name: "Paris",     country: "France",    tag: "Romance & Art",     img: parisImg },
  { name: "Dubai",     country: "UAE",       tag: "Luxury & Shopping", img: dubaiImg },
  { name: "Singapore", country: "Singapore", tag: "City & Food",       img: singaporeImg },
  { name: "Istanbul",  country: "Turkey",    tag: "History & Spice",   img: istanbulImg },
  { name: "Kyoto",     country: "Japan",     tag: "Temples & Zen",     img: kyotoImg },
  { name: "London",    country: "UK",        tag: "Culture & History", img: londonImg },
];

const DOMESTIC = [
  { name: "Goa",          country: "India", tag: "Beaches & Nightlife", img: goaImg },
  { name: "Jaipur",       country: "India", tag: "Heritage & Culture",  img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400&q=80" },
  { name: "Kerala",       country: "India", tag: "Backwaters & Nature", img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&q=80" },
  { name: "Manali",       country: "India", tag: "Mountains & Snow",    img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&q=80" },
  { name: "Varanasi",     country: "India", tag: "Spiritual & Culture", img: "https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=400&q=80" },
  { name: "Andaman",      country: "India", tag: "Islands & Diving",    img: "https://images.unsplash.com/photo-1586500036706-41963de24d8b?w=400&q=80" },
  { name: "Rishikesh",    country: "India", tag: "Adventure & Yoga",    img: "https://images.unsplash.com/photo-1591018533408-a8d1e2e3e4e5?w=400&q=80" },
  { name: "Darjeeling",   country: "India", tag: "Tea & Mountains",     img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&q=80" },
];

const TIPS = [
  "Set your travel style in Profile for smarter trip suggestions.",
  "Add exclusions to avoid activities you dislike.",
  "Use the chat assistant on any trip to tweak your itinerary.",
  "Check the Currency Converter before budgeting international trips.",
  "Rate destinations after your trip to help other travelers.",
  "Pick start & end dates for a more accurate day-by-day plan.",
];

function StatCard({ icon, label, value, sub, gradient }) {
  return (
    <div className="card card-hover flex items-center gap-4">
      <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} shrink-0`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm" style={{ color: "var(--muted)" }}>{label}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{sub}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tipIdx] = useState(() => Math.floor(Math.random() * TIPS.length));
  const [destTab, setDestTab] = useState("international"); // "international" | "domestic"

  useEffect(() => {
    Promise.all([getTrips(), getTrending()])
      .then(([tripsRes, trendRes]) => {
        setTrips(tripsRes.data);
        setTrending(trendRes.data.slice(0, 5));
      })
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this trip?")) return;
    try {
      await deleteTrip(id);
      setTrips((prev) => prev.filter((t) => t.id !== id));
      toast.success("Trip deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const totalBudget  = trips.reduce((s, t) => s + (t.itinerary?.total_budget || 0), 0);
  const totalDays    = trips.reduce((s, t) => s + (t.itinerary?.duration_days || 0), 0);
  const destinations = [...new Set(trips.map((t) => t.destination))].length;
  const avgDays      = trips.length ? Math.round(totalDays / trips.length) : 0;
  const hour         = new Date().getHours();
  const greeting     = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const shownDests   = destTab === "international" ? INTERNATIONAL : DOMESTIC;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 page-enter">

      {/* ── Hero ── */}
      <div className="relative rounded-3xl overflow-hidden text-white shadow-2xl" style={{ minHeight: 220 }}>
        <img src={parisImg} alt="Travel" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/85 via-indigo-900/70 to-transparent" />
        <div className="relative z-10 p-8 md:p-10">
          <p className="text-blue-200 text-sm font-medium mb-1">{greeting}</p>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{user?.name || "Traveler"}</h1>
          <p className="text-blue-100 mb-6 max-w-lg text-sm md:text-base">
            {trips.length === 0
              ? "Ready to plan your first adventure? Pick a destination below."
              : `You've planned ${trips.length} trip${trips.length > 1 ? "s" : ""} across ${destinations} destination${destinations > 1 ? "s" : ""}. Where next?`}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/plan?type=international"
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-all text-sm shadow-lg active:scale-95">
              <Globe size={16} /> International Trip
            </Link>
            <Link to="/plan?type=domestic"
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur text-white font-medium px-5 py-2.5 rounded-xl transition-all text-sm border border-white/20">
              <Home size={16} /> Domestic Trip
            </Link>
          </div>
        </div>
        <Compass size={200} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/5 hidden lg:block float" />
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Plane size={20} className="text-white" />}    label="Total Trips"  value={trips.length}                                         gradient="from-blue-500 to-blue-600" />
        <StatCard icon={<Globe size={20} className="text-white" />}    label="Destinations" value={destinations}                                         gradient="from-emerald-500 to-teal-600" />
        <StatCard icon={<Calendar size={20} className="text-white" />} label="Days Planned" value={totalDays} sub={avgDays ? `avg ${avgDays}/trip` : null} gradient="from-purple-500 to-indigo-600" />
        <StatCard icon={<Wallet size={20} className="text-white" />}   label="Total Budget" value={totalBudget > 0 ? totalBudget.toLocaleString() : "—"} gradient="from-orange-500 to-amber-600" />
      </div>

      {/* ── Destination Ideas ── */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Sparkles size={18} className="text-yellow-500" /> Popular Destinations
          </h2>
          {/* International / Domestic toggle */}
          <div className="flex items-center gap-1 p-1 rounded-2xl" style={{ background: "var(--border)" }}>
            <button
              onClick={() => setDestTab("international")}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-semibold transition-all"
              style={destTab === "international"
                ? { background: "var(--surface)", color: "var(--accent)", boxShadow: "0 1px 4px var(--shadow)" }
                : { color: "var(--muted)" }}>
              <Globe size={14} /> International
            </button>
            <button
              onClick={() => setDestTab("domestic")}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-semibold transition-all"
              style={destTab === "domestic"
                ? { background: "var(--surface)", color: "var(--accent)", boxShadow: "0 1px 4px var(--shadow)" }
                : { color: "var(--muted)" }}>
              <Home size={14} /> Domestic
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {shownDests.map((d) => (
            <button key={d.name}
              onClick={() => navigate(`/plan?dest=${encodeURIComponent(d.name)}&type=${destTab}`)}
              className="relative rounded-2xl overflow-hidden text-left group shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 active:scale-95"
              style={{ aspectRatio: "4/3" }}>
              <img src={d.img} alt={d.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="font-bold text-white text-sm leading-tight">{d.name}</p>
                <p className="text-white/70 text-xs">{d.country}</p>
                <span className="mt-1.5 inline-block text-xs bg-white/20 backdrop-blur px-2 py-0.5 rounded-full text-white">{d.tag}</span>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 backdrop-blur rounded-full p-1">
                <ArrowRight size={12} className="text-white" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Trips list ── */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Your Trips</h2>
            <Link to="/plan" className="btn-primary text-sm flex items-center gap-1 py-1.5 px-3">
              <Plus size={14} /> New Trip
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
            </div>
          ) : trips.length === 0 ? (
            <div className="card text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                <Plane size={28} className="text-blue-500" />
              </div>
              <p className="font-semibold text-lg mb-1">No trips yet</p>
              <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>Pick a destination above or start fresh!</p>
              <Link to="/plan" className="btn-primary inline-flex items-center gap-2 text-sm">
                <Plus size={14} /> Plan a Trip
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {trips.map((trip) => (
                <div key={trip.id} className="card card-hover flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md">
                      <MapPin size={18} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{trip.destination}</p>
                      <p className="text-xs flex items-center gap-2 mt-0.5" style={{ color: "var(--muted)" }}>
                        <Clock size={11} />
                        {trip.itinerary?.duration_days || "?"} days
                        {trip.itinerary?.currency && trip.itinerary?.total_budget
                          ? ` · ${trip.itinerary.currency} ${trip.itinerary.total_budget?.toLocaleString()}` : ""}
                        {" · "}{new Date(trip.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link to={`/trips/${trip.id}`} className="btn-primary text-sm px-3 py-1.5 flex items-center gap-1">
                      <Eye size={13} /> View
                    </Link>
                    <button onClick={() => handleDelete(trip.id)}
                      className="p-2 rounded-xl transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 hover:text-red-600">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <TrendingUp size={18} className="text-orange-500" /> Trending
            </h2>
            {trending.length === 0 ? (
              <div className="card text-center py-6 text-sm" style={{ color: "var(--muted)" }}>No ratings yet</div>
            ) : (
              <div className="space-y-2">
                {trending.map((d, i) => (
                  <div key={d.destination} className="card card-hover flex items-center gap-3 py-3 cursor-pointer"
                    onClick={() => navigate(`/plan?dest=${encodeURIComponent(d.destination)}`)}>
                    <span className={`text-lg font-bold w-6 text-center ${i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : ""}`}>
                      {i < 3 ? ["🥇","🥈","🥉"][i] : `#${i+1}`}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{d.destination}</p>
                      <div className="flex items-center gap-1 text-xs text-yellow-500">
                        <Star size={10} className="fill-yellow-400" />
                        <span>{d.avg_rating}</span>
                        <span className="ml-1" style={{ color: "var(--muted)" }}>({d.reviews})</span>
                      </div>
                    </div>
                    <ChevronRight size={14} style={{ color: "var(--muted)" }} />
                  </div>
                ))}
                <Link to="/trending" className="btn-secondary text-sm w-full text-center block">View All →</Link>
              </div>
            )}
          </div>

          <div className="card" style={{ background: "color-mix(in srgb, var(--accent) 8%, var(--surface))", borderColor: "color-mix(in srgb, var(--accent) 20%, transparent)" }}>
            <p className="text-xs font-bold mb-2 flex items-center gap-1" style={{ color: "var(--accent)" }}>
              <Sparkles size={12} /> TRAVEL TIP
            </p>
            <p className="text-sm">{TIPS[tipIdx]}</p>
          </div>

          <div className="card">
            <p className="text-sm font-bold mb-3 flex items-center gap-2"><BarChart3 size={15} className="text-purple-500" />Quick Actions</p>
            <div className="space-y-1">
              {[
                { to: "/plan?type=international", icon: <Globe size={14} />,       label: "Plan international trip" },
                { to: "/plan?type=domestic",      icon: <Home size={14} />,        label: "Plan domestic trip" },
                { to: "/currency",                icon: <Wallet size={14} />,      label: "Convert currency" },
                { to: "/trending",                icon: <TrendingUp size={14} />,  label: "Browse trending" },
              ].map((a) => (
                <Link key={a.to} to={a.to}
                  className="flex items-center gap-2 text-sm py-2 px-2 rounded-xl transition-colors"
                  style={{ color: "var(--muted)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "color-mix(in srgb, var(--accent) 8%, transparent)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  {a.icon}{a.label}<ChevronRight size={12} className="ml-auto" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
