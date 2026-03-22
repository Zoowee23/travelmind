import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register, login, getProfile } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";
import { Plane, User, Mail, Lock, Globe, Eye, EyeOff, Sun, Moon, UserPlus, Map, Settings } from "lucide-react";

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Argentina","Australia","Austria","Bangladesh",
  "Belgium","Brazil","Canada","Chile","China","Colombia","Croatia","Czech Republic",
  "Denmark","Egypt","Ethiopia","Finland","France","Germany","Ghana","Greece",
  "Hungary","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Japan",
  "Jordan","Kenya","Malaysia","Mexico","Morocco","Netherlands","New Zealand",
  "Nigeria","Norway","Pakistan","Peru","Philippines","Poland","Portugal","Romania",
  "Russia","Saudi Arabia","Singapore","South Africa","South Korea","Spain",
  "Sri Lanka","Sweden","Switzerland","Thailand","Turkey","UAE","Ukraine",
  "United Kingdom","United States","Vietnam","Zimbabwe"
].sort();

const STEPS = [
  { icon: UserPlus,  title: "Create your account",      sub: "Free forever, no card needed" },
  { icon: Settings,  title: "Set your preferences",     sub: "Travel style, interests, budget" },
  { icon: Map,       title: "Get your itinerary",       sub: "Full day-by-day plan in seconds" },
];

export default function Register() {
  const [form, setForm]     = useState({ name: "", email: "", password: "", country: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser }  = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      const res = await login(form.email, form.password);
      localStorage.setItem("token", res.data.access_token);
      const profile = await getProfile();
      setUser(profile.data);
      toast.success(`Account created. Welcome, ${profile.data.name}!`);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[48%] relative flex-col justify-between p-14 text-white overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=85"
          alt="Travel"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/95 via-teal-900/85 to-emerald-800/60" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-14">
            <div className="p-2.5 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/20">
              <Plane size={22} />
            </div>
            <span className="text-2xl font-bold tracking-tight">TravelMind</span>
          </div>

          <h2 className="text-5xl font-bold leading-[1.15] mb-5">
            Your journey<br />starts here.
          </h2>
          <p className="text-emerald-200 text-lg mb-12 max-w-sm leading-relaxed">
            Join travelers planning unforgettable trips with personalized itineraries and real-time data.
          </p>

          <div className="space-y-5">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">How it works</p>
            {STEPS.map(({ icon: Icon, title, sub }, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white/12 border border-white/15 flex items-center justify-center shrink-0">
                  <Icon size={17} className="text-emerald-300" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{title}</p>
                  <p className="text-emerald-300 text-xs mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-emerald-300 text-sm">
          Free to use · No credit card required
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 relative">
        <button
          onClick={toggle}
          className="absolute top-6 right-6 p-2.5 rounded-xl shadow-sm border transition-colors"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          aria-label="Toggle theme"
        >
          {dark ? <Sun size={17} className="text-yellow-400" /> : <Moon size={17} style={{ color: "var(--muted)" }} />}
        </button>

        <div className="w-full max-w-[400px] page-enter">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 justify-center mb-8 lg:hidden" style={{ color: "var(--accent)" }}>
            <Plane size={24} />
            <span className="text-xl font-bold">TravelMind</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Create your account</h1>
            <p className="text-sm" style={{ color: "var(--muted)" }}>Free forever · No credit card needed</p>
          </div>

          <div className="card p-8 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
                  <input
                    type="text" name="name" className="input pl-10" value={form.name}
                    onChange={handleChange} placeholder="Your name" required
                  />
                </div>
              </div>

              <div>
                <label className="label">Email address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
                  <input
                    type="email" name="email" className="input pl-10" value={form.email}
                    onChange={handleChange} placeholder="you@example.com" required
                  />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
                  <input
                    type={showPw ? "text" : "password"} name="password"
                    className="input pl-10 pr-11" value={form.password}
                    onChange={handleChange} placeholder="Min. 6 characters" required minLength={6}
                  />
                  <button
                    type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: "var(--muted)" }}
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Country</label>
                <div className="relative">
                  <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--muted)" }} />
                  <select name="country" className="input pl-10" value={form.country} onChange={handleChange}>
                    <option value="">Select your country</option>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full py-3 font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95 text-white mt-2"
                style={{ background: "linear-gradient(135deg, #10b981, #0d9488)" }}
              >
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
                  : "Create Account"}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t text-center text-sm" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
              Already have an account?{" "}
              <Link to="/login" className="font-semibold hover:underline" style={{ color: "var(--accent)" }}>
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
