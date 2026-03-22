import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
import { geocodeDestination, getEmergencyServices } from "../services/api";

// Leaflet CSS must be imported
import "leaflet/dist/leaflet.css";

const TYPE_CONFIG = {
  hospital: { color: "#ef4444", emoji: "🏥", label: "Hospital" },
  pharmacy:  { color: "#22c55e", emoji: "💊", label: "Pharmacy" },
  police:    { color: "#3b82f6", emoji: "🚔", label: "Police" },
};

function getTypeConfig(type) {
  return TYPE_CONFIG[type] || { color: "#8b5cf6", emoji: "📍", label: type };
}

// Lazy-load Leaflet to avoid SSR issues
let L = null;
async function getLeaflet() {
  if (!L) L = (await import("leaflet")).default;
  return L;
}

function createIcon(leaflet, color) {
  return leaflet.divIcon({
    className: "",
    html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:13px;"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export default function MapView() {
  const { destination } = useParams();
  const [geo, setGeo] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    let map = null;

    async function init() {
      try {
        // 1. Geocode
        const geoRes = await geocodeDestination(destination);
        const { lat, lon, display_name } = geoRes.data;
        setGeo({ lat, lon, display_name });

        // 2. Emergency services
        const emRes = await getEmergencyServices(lat, lon);
        const fetchedPlaces = emRes.data.places || [];
        setPlaces(fetchedPlaces);
        setLoading(false);

        // 3. Build map
        const leaflet = await getLeaflet();

        // Fix default icon paths broken by bundlers
        delete leaflet.Icon.Default.prototype._getIconUrl;
        leaflet.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        const container = document.getElementById("map-container");
        if (!container) return;

        map = leaflet.map(container).setView([lat, lon], 13);

        leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        // Destination marker
        leaflet.marker([lat, lon])
          .addTo(map)
          .bindPopup(`<b>📍 ${destination}</b><br/>${display_name}`)
          .openPopup();

        // Emergency markers
        fetchedPlaces.forEach((p) => {
          const cfg = getTypeConfig(p.type);
          const icon = createIcon(leaflet, cfg.color);
          leaflet.marker([p.lat, p.lon], { icon })
            .addTo(map)
            .bindPopup(`<b>${cfg.emoji} ${p.name}</b><br/>${cfg.label} · ${p.distance_km} km away`);
        });

        setMapReady(true);
      } catch (e) {
        setError(e.response?.data?.detail || e.message || "Failed to load map");
        setLoading(false);
      }
    }

    init();

    return () => { if (map) map.remove(); };
  }, [destination]);

  const filtered = filter === "all" ? places : places.filter((p) => p.type === filter);

  const counts = places.reduce((acc, p) => {
    acc[p.type] = (acc[p.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Link to={-1} className="p-2 rounded-lg hover:opacity-70 transition" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MapPin size={22} className="text-blue-500" /> {destination}
          </h1>
          {geo && <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>{geo.display_name}</p>}
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-3" style={{ color: "var(--muted)" }}>
          <Loader2 size={32} className="animate-spin text-blue-500" />
          <p>Geocoding destination &amp; fetching emergency services...</p>
        </div>
      )}

      {error && (
        <div className="card flex items-center gap-3 text-red-500">
          <AlertTriangle size={20} />
          <div>
            <p className="font-semibold">Failed to load map</p>
            <p className="text-sm">{error}</p>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              Make sure OPENCAGE_API_KEY is set in backend/.env
            </p>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="card p-0 overflow-hidden" style={{ height: "520px" }}>
              <div id="map-container" style={{ width: "100%", height: "100%" }} />
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-3">
              {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
                <div key={type} className="flex items-center gap-1.5 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ background: cfg.color }} />
                  <span>{cfg.emoji} {cfg.label} ({counts[type] || 0})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
                <div key={type} className="card text-center p-3">
                  <p className="text-2xl">{cfg.emoji}</p>
                  <p className="text-xl font-bold mt-1">{counts[type] || 0}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{cfg.label}s</p>
                </div>
              ))}
            </div>

            {/* Filter */}
            <div className="card p-3">
              <p className="text-xs font-semibold mb-2" style={{ color: "var(--muted)" }}>FILTER BY TYPE</p>
              <div className="flex flex-wrap gap-2">
                {["all", "hospital", "pharmacy", "police"].map((f) => (
                  <button key={f} onClick={() => setFilter(f)}
                    className="px-3 py-1 rounded-full text-sm font-medium transition-all"
                    style={filter === f
                      ? { background: "var(--accent)", color: "#fff" }
                      : { background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }
                    }>
                    {f === "all" ? "All" : `${TYPE_CONFIG[f].emoji} ${TYPE_CONFIG[f].label}`}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="card p-0 overflow-hidden">
              <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
                <h3 className="font-semibold text-sm">Nearby Emergency Services</h3>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Within 5 km · {filtered.length} found</p>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: "340px" }}>
                {filtered.length === 0 ? (
                  <p className="text-sm text-center py-8" style={{ color: "var(--muted)" }}>No {filter} found nearby</p>
                ) : (
                  filtered.map((p, i) => {
                    const cfg = getTypeConfig(p.type);
                    return (
                      <div key={i} className="flex items-center gap-3 px-4 py-3 border-b last:border-0 hover:opacity-80 transition"
                        style={{ borderColor: "var(--border)" }}>
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0"
                          style={{ background: cfg.color + "22" }}>
                          {cfg.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{p.name}</p>
                          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                            {cfg.label} · {p.distance_km} km away
                          </p>
                        </div>
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cfg.color }} />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
