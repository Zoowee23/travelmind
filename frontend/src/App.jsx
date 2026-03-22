import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PlanTrip from "./pages/PlanTrip";
import TripDetail from "./pages/TripDetail";
import Profile from "./pages/Profile";
import Trending from "./pages/Trending";
import CurrencyConverter from "./pages/CurrencyConverter";
import Wishlist from "./pages/Wishlist";
import Reminders from "./pages/Reminders";
import SharedTrip from "./pages/SharedTrip";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/shared/:token" element={<SharedTrip />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/plan" element={<PrivateRoute><PlanTrip /></PrivateRoute>} />
        <Route path="/trips/:id" element={<PrivateRoute><TripDetail /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/trending" element={<PrivateRoute><Trending /></PrivateRoute>} />
        <Route path="/currency" element={<PrivateRoute><CurrencyConverter /></PrivateRoute>} />
        <Route path="/wishlist" element={<PrivateRoute><Wishlist /></PrivateRoute>} />
        <Route path="/reminders" element={<PrivateRoute><Reminders /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}
