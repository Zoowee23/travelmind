import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, getProfile } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";
import { Plane, Mail, Lock, Eye, EyeOff, Sun, Moon, Map, CloudSun, ArrowLeftRight, Backpack } from "lucide-react";

const FEATURES = [
  { icon: Map,            title: "Smart Itineraries", desc: "Day-by-day plans built around your budget" },
  { icon: CloudSun,       title: "Live Weather",       desc: "Real-time forecasts for your destination" },
  { icon: ArrowLeftRight, title: "Currency Tools",     desc: "Live exchange rates for 20+ currencies" },
  { icon: Backpack,       title: "Packing Lists",      desc: "Weather-based packing suggestions" },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);
      localStorage.setItem("token", res.data.access_token);
      const profile = await getProfile();
      setUser(profile.data);
      toast.success(`Welcome back, ${profile.data.name}!`);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[52%] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-white"
              style={{ width: `${(i + 1) * 120}px`, height: `${(i + 1) * 120}px`, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
          ))}
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="p-2 bg-white/20 rounded-xl"><Plane size={24} /></div>
            <span className="text-2xl font-bold">TravelMind</span>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4">Plan smarter.<br />Travel better.</h2>
          <p className="text-blue-100 text-lg mb-12">
            Your personal travel planner — personalized itineraries with real-time data.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/10 backdrop-blur rounded-xl p-4">
                <Icon size={20} className="mb-2 text-blue-200" />
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-blue-200 text-xs mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-blue-200 text-sm">
          Real-time data · Personalized itineraries · Smart planning
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 relative">
        <button
          onClick={toggle}
          className="absolute top-6 right-6 p-2 rounded-lg shadow border transition-colors"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          {dark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} style={{ color: "var(--muted)" }} />}
        </button>

        <div className="w-full max-w-md page-enter">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 justify-center mb-8 lg:hidden" style={{ color: "var(--accent)" }}>
            <Plane size={26} /><span className="text-2xl font-bold">TravelMind</span>
          </div>

          <div className="card p-8 shadow-xl">
            <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
            <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>Sign in to continue planning your adventures</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
                  <input type="email" className="input pl-9" value={email}
                    onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
                  <input type={showPw ? "text" : "password"} className="input pl-9 pr-10" value={password}
                    onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: "var(--muted)" }}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</>
                  : "Sign In"}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t text-center text-sm" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
              No account?{" "}
              <Link to="/register" className="font-medium hover:underline" style={{ color: "var(--accent)" }}>
                Create one free
              </Link>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            {[["🌍", "50+", "Countries"], ["✈️", "Fast", "Planning"], ["⚡", "Live", "Data"]].map(([icon, val, lbl]) => (
              <div key={lbl} className="card rounded-xl p-3">
                <div className="text-lg">{icon}</div>
                <div className="font-bold text-sm">{val}</div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
