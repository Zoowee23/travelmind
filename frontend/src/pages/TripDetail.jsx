import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getTrip, getWeather, sendChat, submitRating, exportPDF, exportJSON, exportText,
  generateShareLink, revokeShareLink, updateNotes, updatePhoto, updateSpend,
} from "../services/api";
import EmergencyModal from "../components/EmergencyModal";
import toast from "react-hot-toast";
import {
  Sun, MapPin, Utensils, Hotel, Backpack, MessageCircle,
  Star, Send, Loader2, ChevronDown, ChevronUp,
  Wind, Droplets, Thermometer, Calendar, Wallet, Clock,
  FileText, FileJson, File, AlertTriangle, Share2, Link2, X,
  NotebookPen, Camera, BarChart3, Check, Copy,
} from "lucide-react";

// ── Day Card ──────────────────────────────────────────────────────────────────
function DayCard({ day, currency }) {
  const [open, setOpen] = useState(day.day <= 2);
  const slots = [
    { key: "morning", icon: "🌅", color: "text-amber-500" },
    { key: "afternoon", icon: "☀️", color: "text-orange-500" },
    { key: "evening", icon: "🌙", color: "text-indigo-500" },
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
          {day.travel_time && <span className="flex items-center gap-1 hidden sm:flex"><Clock size={13} />{day.travel_time}</span>}
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>
      {open && (
        <div className="mt-4 space-y-3 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
          {slots.map(({ key, icon, color }) => day[key] ? (
            <div key={key} className="flex gap-3">
              <span className="text-lg shrink-0">{icon}</span>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wider mb-0.5 ${color}`}>{key}</p>
                <p className="text-sm">{day[key]}</p>
              </div>
            </div>
          ) : null)}
        </div>
      )}
    </div>
  );
}

// ── Weather Widget ────────────────────────────────────────────────────────────
function WeatherWidget({ destination }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getWeather(destination)
      .then((r) => setWeather(r.data))
      .catch((e) => setError(e.response?.data?.detail || "Weather unavailable"))
      .finally(() => setLoading(false));
  }, [destination]);

  if (loading) return (
    <div className="card animate-pulse">
      <div className="h-4 rounded w-1/2 mb-3" style={{ background: "var(--border)" }} />
      <div className="h-12 rounded mb-2" style={{ background: "var(--border)" }} />
      <div className="h-4 rounded w-3/4" style={{ background: "var(--border)" }} />
    </div>
  );

  if (error || !weather) return (
    <div className="card text-sm" style={{ color: "var(--muted)" }}>
      ⚠️ {error || "Weather unavailable — check your OpenWeatherMap API key."}
    </div>
  );

  const iconUrl = weather.icon ? `https://openweathermap.org/img/wn/${weather.icon}@2x.png` : null;

  return (
    <div className="card">
      <h3 className="font-semibold flex items-center gap-2 mb-4">
        <Sun size={16} className="text-yellow-500" /> Live Weather · {destination}
      </h3>
      {/* Current */}
      <div className="flex items-center gap-4 mb-4 p-3 rounded-xl" style={{ background: "var(--bg)" }}>
        {iconUrl && <img src={iconUrl} alt={weather.description} className="w-14 h-14" />}
        <div>
          <p className="text-3xl font-bold">{weather.temperature}°C</p>
          <p className="text-sm capitalize" style={{ color: "var(--muted)" }}>{weather.description}</p>
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { icon: <Droplets size={14} className="text-blue-400" />, label: "Humidity", val: `${weather.humidity}%` },
          { icon: <Wind size={14} className="text-cyan-400" />, label: "Wind", val: `${weather.wind_speed} m/s` },
          { icon: <Thermometer size={14} className="text-red-400" />, label: "Feels like", val: `${weather.feels_like}°C` },
        ].map((s) => (
          <div key={s.label} className="text-center p-2 rounded-lg" style={{ background: "var(--bg)" }}>
            <div className="flex justify-center mb-1">{s.icon}</div>
            <p className="text-xs font-semibold">{s.val}</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>{s.label}</p>
          </div>
        ))}
      </div>
      {/* Forecast */}
      {weather.forecast?.length > 0 && (
        <>
          <p className="text-xs font-semibold mb-2" style={{ color: "var(--muted)" }}>5-DAY FORECAST</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {weather.forecast.slice(0, 5).map((f) => (
              <div key={f.date} className="text-center shrink-0 rounded-xl px-3 py-2 min-w-[64px]" style={{ background: "var(--bg)" }}>
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  {new Date(f.date + "T12:00:00").toLocaleDateString("en", { weekday: "short" })}
                </p>
                {f.icon && <img src={`https://openweathermap.org/img/wn/${f.icon}.png`} alt="" className="w-8 h-8 mx-auto" />}
                <p className="text-xs font-bold">{f.avg_temp_c}°</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Budget Breakdown ──────────────────────────────────────────────────────────
function BudgetBreakdown({ breakdown, currency, total }) {
  if (!breakdown) return null;
  const items = Object.entries(breakdown).filter(([, v]) => v > 0);
  const colors = ["bg-blue-500", "bg-emerald-500", "bg-purple-500", "bg-orange-500", "bg-pink-500"];
  return (
    <div className="card">
      <h3 className="font-semibold flex items-center gap-2 mb-4"><Wallet size={16} className="text-blue-500" />Budget Breakdown</h3>
      <div className="space-y-3">
        {items.map(([key, val], i) => {
          const pct = total > 0 ? Math.round((val / total) * 100) : 0;
          return (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="capitalize font-medium">{key}</span>
                <span style={{ color: "var(--muted)" }}>{currency} {val?.toLocaleString()} · {pct}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                <div className={`h-full rounded-full ${colors[i % colors.length]}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-3 border-t flex justify-between font-semibold" style={{ borderColor: "var(--border)" }}>
        <span>Total</span><span>{currency} {total?.toLocaleString()}</span>
      </div>
    </div>
  );
}

// ── Rating Form ───────────────────────────────────────────────────────────────
function RatingForm({ destination }) {
  const [form, setForm] = useState({ rating: 5, review: "", food_rating: "", safety_rating: "", nightlife_rating: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitRating({ destination, ...form, rating: parseFloat(form.rating) });
      toast.success("Rating submitted!");
      setSubmitted(true);
    } catch { toast.error("Failed to submit rating"); }
  };

  if (submitted) return (
    <div className="card text-center py-6">
      <Star size={28} className="mx-auto mb-2 text-yellow-400 fill-yellow-400" />
      <p className="font-semibold">Thanks for rating {destination}!</p>
      <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Your review helps other travelers.</p>
    </div>
  );

  return (
    <div className="card">
      <h3 className="font-semibold flex items-center gap-2 mb-4"><Star size={16} className="text-yellow-500" />Rate {destination}</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: "rating", label: "Overall" },
            { key: "food_rating", label: "Food" },
            { key: "safety_rating", label: "Safety" },
            { key: "nightlife_rating", label: "Nightlife" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="label text-xs">{label}</label>
              <input type="number" min="1" max="5" step="0.5" className="input text-sm"
                value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required={key === "rating"} placeholder="1–5" />
            </div>
          ))}
        </div>
        <div>
          <label className="label text-xs">Review</label>
          <textarea className="input resize-none text-sm" rows={2} placeholder="Share your experience..."
            value={form.review} onChange={(e) => setForm({ ...form, review: e.target.value })} />
        </div>
        <button type="submit" className="btn-primary w-full text-sm">Submit Rating</button>
      </form>
    </div>
  );
}

// ── Chatbot ───────────────────────────────────────────────────────────────────
function Chatbot({ trip }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Hi! Ask me anything about your trip to ${trip?.destination} — activities, food, transport, or anything else.` },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await sendChat(newMessages, trip?.itinerary);
      setMessages([...newMessages, { role: "assistant", content: res.data.reply }]);
    } catch { toast.error("Chat failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="card flex flex-col" style={{ height: "360px" }}>
      <h3 className="font-semibold flex items-center gap-2 mb-3 shrink-0">
        <MessageCircle size={16} className="text-blue-500" /> Trip Assistant
      </h3>
      <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1">
        {messages.map((m, i) => (
          <div key={i} className={`text-sm px-3 py-2 rounded-xl max-w-[88%] ${
            m.role === "user" ? "ml-auto text-white" : ""
          }`} style={m.role === "user" ? { background: "var(--accent)" } : { background: "var(--bg)" }}>
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="text-sm px-3 py-2 rounded-xl w-fit flex items-center gap-2" style={{ background: "var(--bg)", color: "var(--muted)" }}>
            <Loader2 size={13} className="animate-spin" /> Thinking...
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 shrink-0">
        <input className="input text-sm" placeholder="Ask about your trip..."
          value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()} />
        <button onClick={send} className="btn-primary px-3" disabled={loading}><Send size={14} /></button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEmergency, setShowEmergency] = useState(false);

  // Feature state
  const [shareToken, setShareToken] = useState(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);
  const [actualSpend, setActualSpend] = useState({});
  const [spendSaving, setSpendSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoSaving, setPhotoSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    getTrip(id)
      .then((r) => {
        setTrip(r.data);
        setShareToken(r.data.share_token || null);
        setNotes(r.data.notes || "");
        setActualSpend(r.data.actual_spend || {});
        setPhotoPreview(r.data.cover_photo || null);
      })
      .catch(() => toast.error("Trip not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const dl = async (fn, name, type) => {
    try {
      const res = await fn(id);
      const data = type === "json" ? JSON.stringify(res.data, null, 2) : (type === "text" ? res.data.text : res.data);
      const blob = new Blob([data], { type: type === "pdf" ? "application/pdf" : type === "json" ? "application/json" : "text/plain" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click();
    } catch { toast.error("Export failed"); }
  };

  const handleShare = async () => {
    setShareLoading(true);
    try {
      if (shareToken) {
        await revokeShareLink(id);
        setShareToken(null);
        toast.success("Share link removed");
      } else {
        const r = await generateShareLink(id);
        setShareToken(r.data.share_token);
        toast.success("Share link created");
      }
    } catch { toast.error("Failed"); }
    finally { setShareLoading(false); }
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}/shared/${shareToken}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied");
  };

  const handleSaveNotes = async () => {
    setNotesSaving(true);
    try {
      await updateNotes(id, notes);
      toast.success("Notes saved");
    } catch { toast.error("Failed to save notes"); }
    finally { setNotesSaving(false); }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2MB"); return; }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      setPhotoPreview(dataUrl);
      setPhotoSaving(true);
      try {
        await updatePhoto(id, dataUrl);
        toast.success("Cover photo saved");
      } catch { toast.error("Failed to save photo"); }
      finally { setPhotoSaving(false); }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSpend = async () => {
    setSpendSaving(true);
    try {
      await updateSpend(id, actualSpend);
      toast.success("Spend updated");
    } catch { toast.error("Failed to save"); }
    finally { setSpendSaving(false); }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: "var(--surface)" }} />)}
    </div>
  );
  if (!trip) return <div className="text-center py-20" style={{ color: "var(--muted)" }}>Trip not found.</div>;

  const itin = trip.itinerary || {};
  const totalActual = Object.values(actualSpend).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const budgetCategories = itin.budget_breakdown ? Object.keys(itin.budget_breakdown).filter((k) => itin.budget_breakdown[k] > 0) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="card mb-6 border-0 overflow-hidden relative" style={{ background: "linear-gradient(135deg, #2563eb, #4338ca)" }}>
        {photoPreview && (
          <img src={photoPreview} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        )}
        <div className="relative z-10 text-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-blue-200 text-sm mb-1 flex items-center gap-1"><MapPin size={13} />Trip Itinerary</p>
              <h1 className="text-3xl font-bold">{trip.destination}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-blue-100 text-sm">
                {itin.duration_days && <span className="flex items-center gap-1"><Calendar size={13} />{itin.duration_days} days</span>}
                {itin.total_budget && <span className="flex items-center gap-1"><Wallet size={13} />{itin.currency} {itin.total_budget?.toLocaleString()}</span>}
                {itin.weather_summary && <span className="flex items-center gap-1"><Sun size={13} />{itin.weather_summary}</span>}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setShowEmergency(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-white text-sm transition-colors font-medium">
                <AlertTriangle size={14} /> Emergency
              </button>
              <button onClick={handleShare} disabled={shareLoading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm transition-colors">
                <Share2 size={14} /> {shareToken ? "Unshare" : "Share"}
              </button>
              {shareToken && (
                <button onClick={copyShareLink}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm transition-colors">
                  <Copy size={14} /> Copy Link
                </button>
              )}
              <button onClick={() => dl(exportPDF, `trip_${id}.pdf`, "pdf")} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm transition-colors">
                <File size={14} /> PDF
              </button>
              <button onClick={() => dl(exportJSON, `trip_${id}.json`, "json")} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm transition-colors">
                <FileJson size={14} /> JSON
              </button>
              <button onClick={() => dl(exportText, `trip_${id}.txt`, "text")} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm transition-colors">
                <FileText size={14} /> Text
              </button>
            </div>
          </div>
          {shareToken && (
            <div className="mt-3 flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 text-sm">
              <Link2 size={13} className="shrink-0" />
              <span className="truncate text-blue-100">{window.location.origin}/shared/{shareToken}</span>
              <button onClick={copyShareLink} className="shrink-0 hover:text-white text-blue-200"><Copy size={13} /></button>
            </div>
          )}
        </div>
      </div>

      {/* Cover photo upload */}
      <div className="card mb-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border-2" style={{ borderColor: "var(--border)" }}>
          {photoPreview
            ? <img src={photoPreview} alt="Cover" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center" style={{ background: "var(--bg)" }}>
                <Camera size={20} style={{ color: "var(--muted)" }} />
              </div>}
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">Cover Photo</p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>Add a photo to personalise this trip</p>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
        <button onClick={() => fileInputRef.current?.click()} disabled={photoSaving}
          className="btn-secondary text-sm flex items-center gap-1.5 shrink-0">
          <Camera size={14} /> {photoSaving ? "Saving..." : photoPreview ? "Change" : "Upload"}
        </button>
        {photoPreview && (
          <button onClick={async () => { setPhotoPreview(null); await updatePhoto(id, ""); }}
            className="p-2 rounded-xl text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Local currency info */}
      {itin.local_currency_info && (
        <div className="card mb-6 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: "var(--bg)" }}>
              <Wallet size={16} style={{ color: "var(--muted)" }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--muted)" }}>Local Currency</p>
              <p className="font-bold">{itin.local_currency_info.local_currency}</p>
            </div>
          </div>
          <div>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Exchange Rate</p>
            <p className="font-bold">1 {itin.currency} = {itin.local_currency_info.rate} {itin.local_currency_info.local_currency}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Budget in Local</p>
            <p className="font-bold">{itin.local_currency_info.local_currency} {itin.local_currency_info.budget_in_local?.toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Itinerary */}
        <div className="lg:col-span-2 space-y-4">
          {(itin.days || []).length > 0 && (
            <div>
              <h2 className="font-semibold text-lg mb-3 flex items-center gap-2"><Calendar size={18} className="text-blue-500" />Day-by-Day Itinerary</h2>
              {itin.days.map((day) => <DayCard key={day.day} day={day} currency={itin.currency} />)}
            </div>
          )}

          <BudgetBreakdown breakdown={itin.budget_breakdown} currency={itin.currency} total={itin.total_budget} />

          {/* Actual Spend Tracker */}
          {budgetCategories.length > 0 && (
            <div className="card">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <BarChart3 size={16} className="text-emerald-500" />Actual Spend Tracker
                <span className="ml-auto text-xs font-normal" style={{ color: "var(--muted)" }}>
                  Planned: {itin.currency} {itin.total_budget?.toLocaleString()}
                </span>
              </h3>
              <div className="space-y-3 mb-4">
                {budgetCategories.map((cat) => {
                  const planned = itin.budget_breakdown[cat] || 0;
                  const actual = parseFloat(actualSpend[cat] || 0);
                  const over = actual > planned;
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="capitalize font-medium">{cat}</span>
                        <span className="text-xs" style={{ color: "var(--muted)" }}>Planned: {itin.currency} {planned}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="number" className="input text-sm py-1.5"
                          placeholder={`Actual (${itin.currency})`}
                          value={actualSpend[cat] || ""}
                          onChange={(e) => setActualSpend((s) => ({ ...s, [cat]: e.target.value }))}
                          min="0" />
                        {actual > 0 && (
                          <span className={`text-xs font-semibold shrink-0 ${over ? "text-red-500" : "text-emerald-500"}`}>
                            {over ? `+${itin.currency} ${(actual - planned).toFixed(0)} over` : `${itin.currency} ${(planned - actual).toFixed(0)} saved`}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between pt-3 border-t mb-3" style={{ borderColor: "var(--border)" }}>
                <span className="text-sm font-semibold">Total Actual</span>
                <span className={`font-bold ${totalActual > itin.total_budget ? "text-red-500" : "text-emerald-500"}`}>
                  {itin.currency} {totalActual.toLocaleString()}
                </span>
              </div>
              <button onClick={handleSaveSpend} disabled={spendSaving} className="btn-primary w-full text-sm flex items-center justify-center gap-2">
                <Check size={14} /> {spendSaving ? "Saving..." : "Save Spend"}
              </button>
            </div>
          )}

          {itin.food_suggestions?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold flex items-center gap-2 mb-4"><Utensils size={16} className="text-orange-500" />Food & Dining</h3>
              <div className="space-y-3">
                {itin.food_suggestions.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--bg)" }}>
                    <div>
                      <p className="font-medium text-sm">{f.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{f.type}</p>
                    </div>
                    <span className="text-sm font-semibold">~{itin.currency} {f.estimated_cost}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {itin.stay_suggestions?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold flex items-center gap-2 mb-4"><Hotel size={16} className="text-purple-500" />Where to Stay</h3>
              <div className="space-y-3">
                {itin.stay_suggestions.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--bg)" }}>
                    <div>
                      <p className="font-medium text-sm">{s.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{s.area} · {s.type}</p>
                    </div>
                    <span className="text-sm font-semibold">~{itin.currency} {s.estimated_cost_per_night}/night</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {itin.packing_list?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <Backpack size={16} className="text-green-500" />Packing List
                <span className="ml-auto text-xs font-normal" style={{ color: "var(--muted)" }}>{itin.packing_list.length} items</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {itin.packing_list.map((item, i) => (
                  <span key={i} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border"
                    style={{ background: "var(--bg)", borderColor: "var(--border)" }}>
                    ✓ {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Trip Notes */}
          <div className="card">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <NotebookPen size={16} className="text-blue-500" />Trip Notes
            </h3>
            <textarea className="input resize-none w-full text-sm" rows={5}
              placeholder="Jot down anything — visa info, packing reminders, contacts, ideas..."
              value={notes} onChange={(e) => setNotes(e.target.value)} />
            <button onClick={handleSaveNotes} disabled={notesSaving}
              className="btn-primary mt-3 text-sm flex items-center gap-2">
              <Check size={14} /> {notesSaving ? "Saving..." : "Save Notes"}
            </button>
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-4">
          <WeatherWidget destination={trip.destination} />
          <Chatbot trip={trip} />
          <RatingForm destination={trip.destination} />
        </div>
      </div>

      {showEmergency && (
        <EmergencyModal destination={trip.destination} onClose={() => setShowEmergency(false)} />
      )}
    </div>
  );
}

export default TripDetail;

