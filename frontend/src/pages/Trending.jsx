import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTrending, getDestinationRatings } from "../services/api";
import toast from "react-hot-toast";
import { TrendingUp, Star, Loader2, ChevronDown, ChevronUp, Plane, Utensils, Shield, Moon, MapPin } from "lucide-react";

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
import bangkokImg   from "../assets/destinations/bankok.jpg";
import newyorkImg   from "../assets/destinations/newyork.jpg";
import trendingBg   from "../assets/destinations/trending-bg.jpg";

const DEST_IMAGES = {
  paris: parisImg, tokyo: tokyoImg, bali: baliImg, dubai: dubaiImg,
  goa: goaImg, singapore: singaporeImg, istanbul: istanbulImg, kyoto: kyotoImg,
  london: londonImg, rome: romeImg, bangkok: bangkokImg, "new york": newyorkImg,
};
const getImg = (dest) => DEST_IMAGES[dest?.toLowerCase()] || parisImg;

function StarRow({ label, value, icon }) {
  if (!value) return null;
  const v = parseFloat(value);
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-1.5" style={{ color: "var(--muted)" }}>{icon}{label}</span>
      <div className="flex items-center gap-1">
        {[1,2,3,4,5].map((s) => (
          <Star key={s} size={11} className={s <= Math.round(v) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
        ))}
        <span className="text-xs ml-1 font-semibold">{v.toFixed(1)}</span>
      </div>
    </div>
  );
}

export default function Trending() {
  const navigate = useNavigate();
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    getTrending()
      .then((r) => setTrending(r.data))
      .catch(() => toast.error("Failed to load trending"))
      .finally(() => setLoading(false));
  }, []);

  const loadReviews = async (dest) => {
    if (selected === dest) { setSelected(null); setReviews(null); return; }
    setSelected(dest);
    setReviewLoading(true);
    try {
      const r = await getDestinationRatings(dest);
      setReviews(r.data);
    } catch { toast.error("Failed to load reviews"); }
    finally { setReviewLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 page-enter">
      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden mb-8 shadow-xl text-white" style={{ height: 180 }}>
        <img src={trendingBg} alt="Trending"
          className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-900/85 to-pink-900/70" />
        <div className="relative z-10 p-8 flex items-end justify-between h-full">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2"><TrendingUp size={26} />Trending Destinations</h1>
            <p className="text-orange-100 text-sm mt-1">Rated by real travelers · Updated live</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold">{trending.length}</p>
            <p className="text-orange-200 text-sm">destinations rated</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 gap-3" style={{ color: "var(--muted)" }}>
          <Loader2 size={24} className="animate-spin" /> Loading trending destinations...
        </div>
      ) : trending.length === 0 ? (
        <div className="card text-center py-20">
          <TrendingUp size={48} className="mx-auto mb-4" style={{ color: "var(--muted)" }} />
          <p className="font-semibold text-lg mb-2">No ratings yet</p>
          <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>Generate a trip and rate your destination to see it here!</p>
          <button onClick={() => navigate("/plan")} className="btn-primary inline-flex items-center gap-2">
            <Plane size={16} /> Plan a Trip
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {trending.map((dest, i) => (
            <div key={dest.destination}>
              <div className="card card-hover cursor-pointer overflow-hidden" onClick={() => loadReviews(dest.destination)}>
                <div className="flex items-center gap-4">
                  {/* Rank badge */}
                  <div className="text-2xl w-8 text-center shrink-0">
                    {i < 3 ? ["🥇","🥈","🥉"][i] : <span className="text-base font-bold" style={{ color: "var(--muted)" }}>#{i+1}</span>}
                  </div>

                  {/* Destination image */}
                  <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 shadow-md">
                    <img src={getImg(dest.destination)} alt={dest.destination} className="w-full h-full object-cover" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-base">{dest.destination}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--bg)", color: "var(--muted)" }}>
                        {dest.reviews} review{dest.reviews !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} size={13} className={s <= Math.round(dest.avg_rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                      ))}
                      <span className="text-sm font-bold ml-1">{dest.avg_rating}</span>
                      <span className="text-xs ml-1" style={{ color: "var(--muted)" }}>/ 5.0</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); navigate("/plan?dest=" + encodeURIComponent(dest.destination)); }}
                      className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                      <Plane size={12} /> Plan
                    </button>
                    {selected === dest.destination
                      ? <ChevronUp size={16} style={{ color: "var(--muted)" }} />
                      : <ChevronDown size={16} style={{ color: "var(--muted)" }} />}
                  </div>
                </div>
              </div>

              {/* Reviews panel */}
              {selected === dest.destination && (
                <div className="card mt-1 ml-4 border-l-4 border-orange-400">
                  {reviewLoading ? (
                    <div className="flex items-center gap-2 text-sm py-2" style={{ color: "var(--muted)" }}>
                      <Loader2 size={14} className="animate-spin" /> Loading reviews...
                    </div>
                  ) : !reviews?.reviews?.length ? (
                    <p className="text-sm" style={{ color: "var(--muted)" }}>No written reviews yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {reviews.reviews.map((r, j) => (
                        <div key={j} className="pb-4 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-orange-400 to-pink-500">
                              {j + 1}
                            </div>
                            <div className="flex items-center gap-1">
                              {[1,2,3,4,5].map((s) => (
                                <Star key={s} size={12} className={s <= Math.round(r.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                              ))}
                              <span className="text-sm font-semibold ml-1">{r.rating}</span>
                            </div>
                          </div>
                          {r.review && <p className="text-sm mb-2">{r.review}</p>}
                          <div className="grid grid-cols-3 gap-2">
                            <StarRow label="Food"     value={r.food_rating}      icon={<Utensils size={11} />} />
                            <StarRow label="Safety"   value={r.safety_rating}    icon={<Shield size={11} />} />
                            <StarRow label="Nightlife" value={r.nightlife_rating} icon={<Moon size={11} />} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
