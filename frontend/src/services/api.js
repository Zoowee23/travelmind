import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/register")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ──────────────────────────────────────────────
export const register = (data) => api.post("/auth/register", data);
export const login = (email, password) => {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);
  return api.post("/auth/login", form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
};

// ── Profile ───────────────────────────────────────────
export const getProfile = () => api.get("/profile/me");
export const updateProfile = (data) => api.put("/profile/me", data);

// ── Trips ─────────────────────────────────────────────
export const generateTrip = (data) => api.post("/trips/generate", data);
export const getTrips = () => api.get("/trips/");
export const getTrip = (id) => api.get(`/trips/${id}`);
export const updateTrip = (id, data) => api.put(`/trips/${id}`, data);
export const deleteTrip = (id) => api.delete(`/trips/${id}`);
export const getSharedTrip = (token) => api.get(`/trips/shared/${token}`);

// Share
export const generateShareLink = (id) => api.post(`/trips/${id}/share`);
export const revokeShareLink = (id) => api.delete(`/trips/${id}/share`);

// Notes
export const updateNotes = (id, notes) => api.put(`/trips/${id}/notes`, { notes });

// Photo
export const updatePhoto = (id, cover_photo) => api.put(`/trips/${id}/photo`, { cover_photo });

// Actual spend
export const updateSpend = (id, actual_spend) => api.put(`/trips/${id}/spend`, { actual_spend });

// ── Weather ───────────────────────────────────────────
export const getWeather = (destination) => api.get(`/weather/${destination}`);

// ── Ratings ───────────────────────────────────────────
export const submitRating = (data) => api.post("/ratings/", data);
export const getDestinationRatings = (dest) => api.get(`/ratings/destination/${dest}`);
export const getTrending = () => api.get("/ratings/trending");

// ── Chat ──────────────────────────────────────────────
export const sendChat = (messages, trip_context) =>
  api.post("/chat/", { messages, trip_context });

// ── Budget ────────────────────────────────────────────
export const convertCurrency = (amount, from, to) =>
  api.get("/budget/convert", { params: { amount, from_currency: from, to_currency: to } });
export const getAllRates = (base) => api.get(`/budget/rates/${base}`);

// ── Maps ──────────────────────────────────────────────
export const geocodeDestination = (dest) => api.get("/maps/geocode", { params: { destination: dest } });
export const getEmergencyServices = (lat, lon) => api.get("/maps/emergency", { params: { lat, lon } });

// ── Export ────────────────────────────────────────────
export const exportPDF = (tripId) =>
  api.get(`/export/${tripId}/pdf`, { responseType: "blob" });
export const exportJSON = (tripId) => api.get(`/export/${tripId}/json`);
export const exportText = (tripId) => api.get(`/export/${tripId}/text`);

// ── Wishlist ──────────────────────────────────────────
export const getWishlist = () => api.get("/wishlist/");
export const addToWishlist = (destination, notes) => api.post("/wishlist/", { destination, notes });
export const removeFromWishlist = (id) => api.delete(`/wishlist/${id}`);

// ── Reminders ─────────────────────────────────────────
export const getReminders = () => api.get("/reminders/");
export const createReminder = (data) => api.post("/reminders/", data);
export const markReminderRead = (id) => api.patch(`/reminders/${id}/read`);
export const deleteReminder = (id) => api.delete(`/reminders/${id}`);
