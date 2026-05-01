import React, { useEffect } from "react";
import "./App.css";
import { useLocation, useNavigate } from "react-router-dom";
import AppRoutes from "routes/AppRoutes";

const ADMIN_ROUTES = ["/admin", "/admin/accounts"];
const AUTH_ROUTES = ["/login", "/reset-password"];

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const path = location.pathname;
    const token = sessionStorage.getItem("TOKEN");

    // Already on an auth page — no redirect needed
    if (AUTH_ROUTES.some((r) => path.startsWith(r))) return;

    // Protected admin area — redirect to login if no token
    const isAdminRoute =
      path.startsWith("/admin") ||
      path.startsWith("/dashboard");

    if (isAdminRoute && !token) {
      navigate("/login", { replace: true });
    }
  }, [location]);

  return (
    <div className="App">
      <AppRoutes />
    </div>
  );
};

export default App;
