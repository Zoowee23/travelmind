import { useEffect, useState, useRef } from "react";
import { X, Loader2, AlertTriangle, Phone, MapPin } from "lucide-react";
import { geocodeDestination, getEmergencyServices } from "../services/api";
import "leaflet/dist/leaflet.css";

const TYPE_CONFIG = {
  hospital: { color: "#ef4444", emoji: "🏥", label: "Hospital" },
  clinic:   { color: "#f97316", emoji: "🩺", label: "Clinic" },
  pharmacy: { color: "#22c55e", emoji: "💊", label: "Pharmacy" },
  police:   { color: "#3b82f6", emoji: "🚔", label: "Police" },
};

function cfg(type) {
  return TYPE_CONFIG[type] || { color: "#8b5cf6", emoji: "📍", label: type };
}

export default function EmergencyModal({ destination, onClose }) {
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [error, setError] = useState(null);
  const [places, setPlaces] = useState([]);
  const [filter, setFilter] = useState("all");
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        // 1. Geocode
        const geoRes = await geocodeDestination(destination);
        const { lat, lon } = geoRes.data;

        // 2. Emergency services
        const emRes = await getEmergencyServices(lat, lon);
        const fetched = emRes.data.places || [];
        if (!mounted) return;
        setPlaces(fetched);
        setStatus("ready");

        // 3. Build Leaflet map after DOM is ready
        setTimeout(async () => {
          if (!mapRef.current || mapInstanceRef.current) return;
          const L = (await import("leaflet")).default;

          // Fix broken default icons from bundler
          delete L.Icon.Default.prototype._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
            iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          });

          const map = L.map(mapRef.current).setView([lat, lon], 14);
          mapInstanceRef.current = map;

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
          }).addTo(map);

          // Destination pin
          L.marker([lat, lon])
            .addTo(map)
            .bindPopup(`<b>📍 ${destination}</b>`)
            .openPopup();

          // Emergency markers
          fetched.forEach((p) => {
            const c = cfg(p.type);
            const icon = L.divIcon({
              className: "",
              html: `<div style="width:26px;height:26px;border-radius:50%;background:${c.color};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;font-size:12px;">${c.emoji}</div>`,
              iconSize: [26, 26],
              iconAnchor: [13, 13],
            });
            const popup = `<b>${c.emoji} ${p.name}</b><br/>${c.label} · ${p.distance_km} km${p.phone ? `<br/>📞 ${p.phone}` : ""}`;
            L.marker([p.lat, p.lon], { icon }).addTo(map).bindPopup(popup);
          });
        }, 100);
      } catch (e) {
        if (!mounted) return;
        setError(e.response?.data?.detail || e.message || "Failed to load");
        setStatus("error");
      }
    }

    init();
    return () => {
      mounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [destination]);

  const filtered = filter === "all" ? places : places.filter((p) => p.type === filter);
  const counts = places.reduce((a, p) => ({ ...a, [p.type]: (a[p.type] || 0) + 1 }), {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", maxHeight: "90vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0"
          style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚨</span>
            <div>
              <h2 className="font-bold text-lg">Emergency Services</h2>
              <p className="text-xs" style={{ color: "var(--muted)" }}>Nearby hospitals, clinics, pharmacies &amp; police · {destination}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:opacity-70 transition"
            style={{ background: "var(--bg)" }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center py-20 gap-3" style={{ color: "var(--muted)" }}>
              <Loader2 size={32} className="animate-spin text-red-500" />
              <p className="text-sm">Locating emergency services near {destination}...</p>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-3 m-5 p-4 rounded-xl text-red-500"
              style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
              <AlertTriangle size={20} className="shrink-0" />
              <div>
                <p className="font-semibold">Could not load emergency services</p>
                <p className="text-sm mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {status === "ready" && (
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
              {/* Map */}
              <div className="lg:w-3/5 shrink-0" style={{ height: "420px" }}>
                <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
              </div>

              {/* Sidebar */}
              <div className="flex-1 flex flex-col overflow-hidden border-t lg:border-t-0 lg:border-l"
                style={{ borderColor: "var(--border)" }}>
                {/* Stats + filter */}
                <div className="px-4 py-3 border-b shrink-0" style={{ borderColor: "var(--border)" }}>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {Object.entries(TYPE_CONFIG).map(([type, c]) => (
                      <div key={type} className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                        style={{ background: c.color + "22", color: c.color }}>
                        {c.emoji} {counts[type] || 0}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {["all", "hospital", "clinic", "pharmacy", "police"].map((f) => (
                      <button key={f} onClick={() => setFilter(f)}
                        className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                        style={filter === f
                          ? { background: "var(--accent)", color: "#fff" }
                          : { background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }
                        }>
                        {f === "all" ? "All" : `${TYPE_CONFIG[f]?.emoji} ${TYPE_CONFIG[f]?.label}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* List */}
                <div className="overflow-y-auto flex-1">
                  {filtered.length === 0 ? (
                    <p className="text-sm text-center py-10" style={{ color: "var(--muted)" }}>
                      No {filter === "all" ? "services" : filter} found nearby
                    </p>
                  ) : (
                    filtered.map((p, i) => {
                      const c = cfg(p.type);
                      return (
                        <div key={i} className="flex items-start gap-3 px-4 py-3 border-b last:border-0"
                          style={{ borderColor: "var(--border)" }}>
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 mt-0.5"
                            style={{ background: c.color + "22" }}>
                            {c.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{p.name}</p>
                            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                              {c.label} · {p.distance_km} km away
                            </p>
                            {p.phone && (
                              <a href={`tel:${p.phone}`}
                                className="inline-flex items-center gap-1 text-xs mt-1 font-medium"
                                style={{ color: "var(--accent)" }}>
                                <Phone size={11} /> {p.phone}
                              </a>
                            )}
                          </div>
                          <div className="w-2 h-2 rounded-full shrink-0 mt-2" style={{ background: c.color }} />
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
