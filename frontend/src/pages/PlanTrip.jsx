import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { generateTrip } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Plane, Plus, X, Loader2, MapPin, Calendar, Wallet, Users, Sparkles, Globe, Home } from "lucide-react";

// ── Local images ──────────────────────────────────────────────────────────────
import tokyoImg     from "../assets/destinations/tokyo.jpg";
import baliImg      from "../assets/destinations/bali.jpg";
import parisImg     from "../assets/destinations/paris.jpg";
import dubaiImg     from "../assets/destinations/dubai.jpg";
import goaImg       from "../assets/destinations/goa.jpg";
import singaporeImg from "../assets/destinations/singapore.jpg";
import istanbulImg  from "../assets/destinations/istanbul.jpg";
import kyotoImg     from "../assets/destinations/kyoto.jpg";

const LOCAL_IMAGES = {
  tokyo: tokyoImg, bali: baliImg, paris: parisImg, dubai: dubaiImg,
  goa: goaImg, singapore: singaporeImg, istanbul: istanbulImg, kyoto: kyotoImg,
};

function getDestImg(dest) {
  return LOCAL_IMAGES[dest?.toLowerCase().trim()] || parisImg;
}

// ── Form options ──────────────────────────────────────────────────────────────
const ACTIVITY_OPTIONS = [
  { id: "Food",      icon: "🍜" }, { id: "Nightlife", icon: "🎉" },
  { id: "Nature",    icon: "🌿" }, { id: "History",   icon: "🏛️" },
  { id: "Shopping",  icon: "🛍️" }, { id: "Adventure", icon: "🧗" },
  { id: "Art",       icon: "🎨" }, { id: "Beaches",   icon: "🏖️" },
  { id: "Museums",   icon: "🖼️" }, { id: "Sports",    icon: "⚽" },
];
const TRAVEL_TYPES = [
  { id: "solo",   icon: "🧳", label: "Solo" },
  { id: "couple", icon: "💑", label: "Couple" },
  { id: "family", icon: "👨‍👩‍👧", label: "Family" },
  { id: "group",  icon: "👥", label: "Group" },
];
const CURRENCIES     = ["USD","EUR","GBP","INR","AED","JPY","AUD","CAD","SGD","CHF","CNY","MYR","THB","IDR","KRW","BRL","MXN","SEK","TRY","ZAR"];
const ACCOMMODATION  = ["","Budget hostel","Mid-range hotel","Luxury hotel","Airbnb / Apartment","Resort","Camping"];
const TRANSPORT_INTL = ["","Public transport","Rental car","Taxi / Rideshare","Walking","Mixed"];
const TRANSPORT_DOM  = ["","Train","Bus","Flight","Self-drive","Taxi / Rideshare","Mixed"];

// Domestic-specific extras
const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Andaman & Nicobar","Chandigarh","Delhi","Ladakh","Puducherry",
];

const COUNTRY_CURRENCY = {
  "India":"INR","United States":"USD","United Kingdom":"GBP","Germany":"EUR","France":"EUR",
  "Italy":"EUR","Spain":"EUR","Japan":"JPY","China":"CNY","South Korea":"KRW",
  "Australia":"AUD","Canada":"CAD","Mexico":"MXN","Brazil":"BRL","UAE":"AED",
  "Singapore":"SGD","Malaysia":"MYR","Thailand":"THB","Indonesia":"IDR",
  "Switzerland":"CHF","Sweden":"SEK","Turkey":"TRY","South Africa":"ZAR",
};

export default function PlanTrip() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Read type from URL: ?type=domestic or ?type=international
  const urlType = searchParams.get("type");
  const [tripMode, setTripMode] = useState(urlType === "domestic" ? "domestic" : "international");

  const defaultCurrency = user?.preferred_currency || (user?.country && COUNTRY_CURRENCY[user.country]) || "USD";

  const [form, setForm] = useState({
    destination:        searchParams.get("dest") || "",
    budget:             "",
    travel_type:        "solo",
    duration_days:      3,
    currency:           tripMode === "domestic" ? "INR" : defaultCurrency,
    start_date:         "",
    end_date:           "",
    accommodation_type: "",
    transport_mode:     "",
    activity_preferences: [],
    exclusions:         [],
    // domestic extras
    origin_city:        "",
    state:              "",
  });
  const [exclusionInput, setExclusionInput] = useState("");

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const switchMode = (mode) => {
    setTripMode(mode);
    setForm((f) => ({
      ...f,
      currency:       mode === "domestic" ? "INR" : defaultCurrency,
      transport_mode: "",
      destination:    "",
    }));
  };

  const handleDateChange = (key, val) => {
    const updated = { ...form, [key]: val };
    if (updated.start_date && updated.end_date) {
      const diff = Math.round((new Date(updated.end_date) - new Date(updated.start_date)) / 86400000);
      if (diff > 0) updated.duration_days = diff;
    }
    setForm(updated);
  };

  const toggleActivity = (act) =>
    set("activity_preferences", form.activity_preferences.includes(act)
      ? form.activity_preferences.filter((a) => a !== act)
      : [...form.activity_preferences, act]);

  const addExclusion = () => {
    const val = exclusionInput.trim();
    if (val && !form.exclusions.includes(val)) {
      set("exclusions", [...form.exclusions, val]);
      setExclusionInput("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.destination || !form.budget) return toast.error("Fill in destination and budget");
    setLoading(true);
    try {
      const payload = { ...form, budget: parseFloat(form.budget), trip_mode: tripMode };
      const res = await generateTrip(payload);
      toast.success("Itinerary ready!");
      navigate("/trips/" + res.data.trip_id);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to generate itinerary");
    } finally {
      setLoading(false);
    }
  };

  const destImg = getDestImg(form.destination);
  const isDomestic = tripMode === "domestic";
  const transportOptions = isDomestic ? TRANSPORT_DOM : TRANSPORT_INTL;

  // Mode accent colors
  const modeColor   = isDomestic ? "#16a34a" : "#4f6ef7";
  const modeBg      = isDomestic ? "from-green-600 to-emerald-700" : "from-blue-600 to-indigo-700";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 page-enter">

      {/* ── Mode toggle ── */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl mb-6 shadow-sm" style={{ background: "var(--border)" }}>
        <button onClick={() => switchMode("international")}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
          style={!isDomestic
            ? { background: "var(--surface)", color: "var(--accent)", boxShadow: "0 2px 8px var(--shadow)" }
            : { color: "var(--muted)" }}>
          <Globe size={16} /> International
        </button>
        <button onClick={() => switchMode("domestic")}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
          style={isDomestic
            ? { background: "var(--surface)", color: modeColor, boxShadow: "0 2px 8px rgba(22,163,74,0.15)" }
            : { color: "var(--muted)" }}>
          <Home size={16} /> Domestic
        </button>
      </div>

      {/* ── Dynamic header image ── */}
      <div className="relative rounded-3xl overflow-hidden mb-6 shadow-xl" style={{ height: 180 }}>
        <img src={destImg} alt={form.destination || "Travel"}
          className="w-full h-full object-cover transition-all duration-700" />
        <div className={`absolute inset-0 bg-gradient-to-t ${modeBg} opacity-70`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 text-white">
          <div className="flex items-center gap-2 mb-1">
            {isDomestic
              ? <><Home size={14} className="text-green-300" /><span className="text-xs font-semibold text-green-200 uppercase tracking-wider">Domestic Trip</span></>
              : <><Sparkles size={14} className="text-yellow-400" /><span className="text-xs font-semibold text-yellow-300 uppercase tracking-wider">International Trip</span></>}
          </div>
          <h1 className="text-2xl font-bold">
            {form.destination || (isDomestic ? "Where in India?" : "Where are you going?")}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Destination & Budget ── */}
        <div className="card space-y-4">
          <h2 className="font-bold flex items-center gap-2 text-base">
            <MapPin size={16} style={{ color: modeColor }} /> Destination & Budget
          </h2>

          {/* Domestic: origin city + state */}
          {isDomestic && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Travelling from</label>
                <input className="input" placeholder="e.g. Mumbai" value={form.origin_city}
                  onChange={(e) => set("origin_city", e.target.value)} />
              </div>
              <div>
                <label className="label">State / Region</label>
                <select className="input" value={form.state} onChange={(e) => set("state", e.target.value)}>
                  <option value="">Any state</option>
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="label">{isDomestic ? "Destination city / place *" : "Where do you want to go? *"}</label>
            <input className="input" placeholder={isDomestic ? "e.g. Goa, Manali, Kerala" : "e.g. Tokyo, Japan"}
              value={form.destination} onChange={(e) => set("destination", e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Total Budget *</label>
              <input type="number" className="input" placeholder={isDomestic ? "15000" : "1500"}
                value={form.budget} onChange={(e) => set("budget", e.target.value)} min="1" required />
            </div>
            <div>
              <label className="label">Currency</label>
              <select className="input" value={form.currency} onChange={(e) => set("currency", e.target.value)}>
                {isDomestic
                  ? <option value="INR">INR — Indian Rupee</option>
                  : CURRENCIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── Dates & Duration ── */}
        <div className="card space-y-4">
          <h2 className="font-bold flex items-center gap-2 text-base">
            <Calendar size={16} className="text-purple-500" /> Travel Dates
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date</label>
              <input type="date" className="input" value={form.start_date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => handleDateChange("start_date", e.target.value)} />
            </div>
            <div>
              <label className="label">End Date</label>
              <input type="date" className="input" value={form.end_date}
                min={form.start_date || new Date().toISOString().split("T")[0]}
                onChange={(e) => handleDateChange("end_date", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Duration (days){form.start_date && form.end_date ? " — auto calculated" : ""}</label>
            <input type="number" className="input" value={form.duration_days}
              onChange={(e) => set("duration_days", parseInt(e.target.value))} min="1" max="30" />
          </div>
        </div>

        {/* ── Trip Style ── */}
        <div className="card space-y-4">
          <h2 className="font-bold flex items-center gap-2 text-base">
            <Users size={16} className="text-emerald-500" /> Trip Style
          </h2>
          <div>
            <label className="label">Travelling as</label>
            <div className="grid grid-cols-4 gap-2">
              {TRAVEL_TYPES.map((t) => (
                <button key={t.id} type="button" onClick={() => set("travel_type", t.id)}
                  className="flex flex-col items-center gap-1 py-3 rounded-xl border-2 text-sm font-medium transition-all"
                  style={form.travel_type === t.id
                    ? { borderColor: modeColor, background: `${modeColor}15`, color: modeColor }
                    : { borderColor: "var(--border)", color: "var(--muted)" }}>
                  <span className="text-xl">{t.icon}</span>
                  <span className="text-xs">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Accommodation</label>
              <select className="input" value={form.accommodation_type}
                onChange={(e) => set("accommodation_type", e.target.value)}>
                {ACCOMMODATION.map((a) => <option key={a} value={a}>{a || "Any"}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Transport</label>
              <select className="input" value={form.transport_mode}
                onChange={(e) => set("transport_mode", e.target.value)}>
                {transportOptions.map((t) => <option key={t} value={t}>{t || "Any"}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── Activities ── */}
        <div className="card space-y-3">
          <h2 className="font-bold flex items-center gap-2 text-base">
            <Sparkles size={16} className="text-yellow-500" /> What interests you?
          </h2>
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_OPTIONS.map((act) => (
              <button key={act.id} type="button" onClick={() => toggleActivity(act.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all"
                style={form.activity_preferences.includes(act.id)
                  ? { background: modeColor, color: "#fff", borderColor: modeColor, boxShadow: `0 4px 12px ${modeColor}40` }
                  : { borderColor: "var(--border)", color: "var(--text)" }}>
                <span>{act.icon}</span>{act.id}
              </button>
            ))}
          </div>
        </div>

        {/* ── Exclusions ── */}
        <div className="card space-y-3">
          <h2 className="font-bold text-base">
            Things to avoid <span className="text-sm font-normal" style={{ color: "var(--muted)" }}>(optional)</span>
          </h2>
          <div className="flex gap-2">
            <input className="input" placeholder="e.g. trekking, spicy food" value={exclusionInput}
              onChange={(e) => setExclusionInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addExclusion())} />
            <button type="button" onClick={addExclusion} className="btn-secondary px-3 shrink-0"><Plus size={16} /></button>
          </div>
          {form.exclusions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.exclusions.map((ex) => (
                <span key={ex} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm"
                  style={{ background: "#fee2e2", color: "#b91c1c" }}>
                  {ex}
                  <button type="button" onClick={() => set("exclusions", form.exclusions.filter((e) => e !== ex))}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Submit ── */}
        <button type="submit" disabled={loading}
          className="w-full py-4 text-white font-bold rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-base active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${modeColor}, ${isDomestic ? "#059669" : "#4338ca"})`,
            boxShadow: `0 8px 24px ${modeColor}40`,
          }}>
          {loading
            ? <><Loader2 size={20} className="animate-spin" /> Building your itinerary...</>
            : <><Plane size={20} /> Generate {isDomestic ? "Domestic" : "International"} Itinerary</>}
        </button>

        {loading && (
          <div className="card text-center py-6 space-y-2">
            <div className="flex justify-center gap-1">
              {(isDomestic ? ["🚂","🗺️","🏨","🍛","🎒"] : ["🌤️","🗺️","🏨","🍽️","🎒"]).map((e, i) => (
                <span key={i} className="text-2xl" style={{ animation: `float ${1 + i * 0.2}s ease-in-out infinite` }}>{e}</span>
              ))}
            </div>
            <p className="font-semibold">Crafting your perfect {isDomestic ? "Indian" : ""} trip...</p>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              {isDomestic
                ? "Checking weather, train routes & building your day-by-day plan"
                : "Checking weather, exchange rates & building your day-by-day plan"}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
