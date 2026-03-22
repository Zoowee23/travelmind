import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getWishlist, addToWishlist, removeFromWishlist } from "../services/api";
import toast from "react-hot-toast";
import { Heart, Plus, Trash2, Plane, MapPin, X } from "lucide-react";

export default function Wishlist() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ destination: "", notes: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getWishlist()
      .then((r) => setItems(r.data))
      .catch(() => toast.error("Failed to load wishlist"))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.destination.trim()) return;
    setSaving(true);
    try {
      const r = await addToWishlist(form.destination.trim(), form.notes.trim() || null);
      setItems((prev) => [r.data, ...prev]);
      setForm({ destination: "", notes: "" });
      setShowAdd(false);
      toast.success("Added to wishlist");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to add");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id) => {
    try {
      await removeFromWishlist(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Removed from wishlist");
    } catch {
      toast.error("Failed to remove");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart size={22} className="text-rose-500" /> Wishlist
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Places you want to visit someday</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15} /> Add Place
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="card mb-5 border-2" style={{ borderColor: "var(--accent)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Add a destination</h2>
            <button onClick={() => setShowAdd(false)} style={{ color: "var(--muted)" }}><X size={16} /></button>
          </div>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="label">Destination *</label>
              <input className="input" placeholder="e.g. Santorini, Greece" value={form.destination}
                onChange={(e) => setForm({ ...form, destination: e.target.value })} required />
            </div>
            <div>
              <label className="label">Notes (optional)</label>
              <textarea className="input resize-none" rows={2} placeholder="Why do you want to go?"
                value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn-primary text-sm flex items-center gap-1.5">
                <Heart size={14} /> {saving ? "Saving..." : "Add to Wishlist"}
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="card text-center py-16">
          <Heart size={40} className="mx-auto mb-3" style={{ color: "var(--muted)" }} />
          <p className="font-semibold text-lg mb-1">Your wishlist is empty</p>
          <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>Start adding places you dream of visiting.</p>
          <button onClick={() => setShowAdd(true)} className="btn-primary inline-flex items-center gap-2 text-sm">
            <Plus size={14} /> Add a place
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="card card-hover flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{item.destination}</p>
                  {item.notes && <p className="text-xs mt-0.5 truncate" style={{ color: "var(--muted)" }}>{item.notes}</p>}
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                    Added {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => navigate(`/plan?dest=${encodeURIComponent(item.destination)}`)}
                  className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                  <Plane size={12} /> Plan
                </button>
                <button onClick={() => handleRemove(item.id)}
                  className="p-2 rounded-xl transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 hover:text-red-600">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
