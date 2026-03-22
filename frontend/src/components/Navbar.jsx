import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, Plane, LogOut, User, TrendingUp, LayoutDashboard, ArrowLeftRight, Palette, Menu, X, Heart, Bell } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle, theme, setNamedTheme, themes } = useTheme();
  const navigate = useNavigate();
  const [showThemes, setShowThemes] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const themeRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (themeRef.current && !themeRef.current.contains(e.target)) setShowThemes(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => { logout(); navigate("/login"); setMobileOpen(false); };

  const NAV_LINKS = [
    { to: "/",          icon: <LayoutDashboard size={15} />, label: "Dashboard" },
    { to: "/plan",      icon: <Plane size={15} />,           label: "Plan Trip" },
    { to: "/trending",  icon: <TrendingUp size={15} />,      label: "Trending" },
    { to: "/currency",  icon: <ArrowLeftRight size={15} />,  label: "Currency" },
    { to: "/wishlist",  icon: <Heart size={15} />,           label: "Wishlist" },
    { to: "/reminders", icon: <Bell size={15} />,            label: "Reminders" },
    { to: "/profile",   icon: <User size={15} />,            label: "Profile" },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 shadow-sm" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-lg" style={{ color: "var(--accent)" }}>
            <div className="p-1.5 rounded-xl" style={{ background: "color-mix(in srgb, var(--accent) 12%, transparent)" }}>
              <Plane size={18} />
            </div>
            <span className="hidden sm:inline">TravelMind</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {user && NAV_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="nav-link flex items-center gap-1.5">{l.icon}{l.label}</Link>
            ))}
            {user && (
              <button onClick={handleLogout} className="nav-link flex items-center gap-1.5 text-red-400 hover:text-red-500">
                <LogOut size={15} />Logout
              </button>
            )}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1">
            {/* Theme picker */}
            <div className="relative" ref={themeRef}>
              <button onClick={() => setShowThemes(!showThemes)}
                className="p-2 rounded-xl transition-colors"
                style={{ background: showThemes ? "var(--border)" : "transparent" }}
                aria-label="Change theme">
                <Palette size={17} style={{ color: "var(--muted)" }} />
              </button>

              {showThemes && (
                <div className="absolute right-0 top-12 rounded-2xl shadow-2xl p-3 z-50"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", width: 220 }}>
                  <p className="text-xs font-bold uppercase tracking-widest px-1 pb-2" style={{ color: "var(--muted)" }}>Choose Theme</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {themes.map((t) => (
                      <button key={t.id}
                        onClick={() => { setNamedTheme(t.id); setShowThemes(false); }}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-sm transition-all"
                        style={{
                          background: theme === t.id ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "var(--bg)",
                          border: theme === t.id ? "1.5px solid var(--accent)" : "1.5px solid transparent",
                          color: "var(--text)",
                          fontWeight: theme === t.id ? 600 : 400,
                        }}>
                        {/* Color swatch */}
                        <span className="flex gap-0.5 shrink-0">
                          <span className="w-3 h-3 rounded-full border border-white/30 shadow-sm"
                            style={{ background: t.preview[0] }} />
                          <span className="w-3 h-3 rounded-full border border-white/30 shadow-sm"
                            style={{ background: t.preview[1] }} />
                        </span>
                        <span className="truncate">{t.label}</span>
                        {theme === t.id && <span className="ml-auto text-xs" style={{ color: "var(--accent)" }}>✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Light/dark toggle */}
            <button onClick={toggle}
              className="p-2 rounded-xl transition-colors"
              style={{ color: "var(--muted)" }}
              aria-label="Toggle dark mode">
              {dark ? <Sun size={17} className="text-yellow-400" /> : <Moon size={17} />}
            </button>

            {/* Mobile menu toggle */}
            {user && (
              <button onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-xl transition-colors"
                style={{ color: "var(--muted)" }}>
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && user && (
          <div className="md:hidden px-4 pb-4 pt-1 space-y-1 border-t" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            {NAV_LINKS.map((l) => (
              <Link key={l.to} to={l.to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors"
                style={{ color: "var(--text)" }}>
                {l.icon}{l.label}
              </Link>
            ))}
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm w-full text-red-400">
              <LogOut size={15} />Logout
            </button>
          </div>
        )}
      </nav>
    </>
  );
}
