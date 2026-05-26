import React, { useEffect, useRef } from "react";
import "./App.css";
import { useLocation, useNavigate } from "react-router-dom";
import AppRoutes from "routes/AppRoutes";
import {
  getSessionTimeoutMs,
  PREFERENCES_CHANGED_EVENT,
} from "utils/preferences";

const AUTH_ROUTES = ["/login", "/reset-password"];

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const idleTimerRef = useRef(null);

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
  }, [location, navigate]);

  useEffect(() => {
    const path = location.pathname;
    const isAuthRoute = AUTH_ROUTES.some((route) => path.startsWith(route));
    const token = sessionStorage.getItem("TOKEN");

    if (isAuthRoute || !token) {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      return undefined;
    }

    const logoutForInactivity = () => {
      sessionStorage.clear();
      navigate("/login", { replace: true });
    };

    const resetIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(logoutForInactivity, getSessionTimeoutMs());
    };

    const activityEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    activityEvents.forEach((eventName) =>
      window.addEventListener(eventName, resetIdleTimer, { passive: true })
    );
    window.addEventListener(PREFERENCES_CHANGED_EVENT, resetIdleTimer);

    resetIdleTimer();

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      activityEvents.forEach((eventName) =>
        window.removeEventListener(eventName, resetIdleTimer)
      );
      window.removeEventListener(PREFERENCES_CHANGED_EVENT, resetIdleTimer);
    };
  }, [location.pathname, navigate]);

  return (
    <div className="App">
      <AppRoutes />
    </div>
  );
};

export default App;
