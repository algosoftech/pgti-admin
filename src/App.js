import React, { useEffect, useRef } from "react";
import "./App.css";
import { useLocation, useNavigate } from "react-router-dom";
import AppRoutes from "routes/AppRoutes";
import {
  getSessionTimeoutMs,
  PREFERENCES_CHANGED_EVENT,
} from "utils/preferences";
import {
  ADMIN_AUTH_CLEAR_EVENT,
  clearAdminAuthStorage,
  clearAdminSessionStorage,
  getAdminLastActivity,
  getAdminStorageItem,
  hydrateAdminSessionStorage,
  markAdminActivity,
} from "utils/adminAuthStorage";

const AUTH_ROUTES = ["/login", "/reset-password"];

const App = () => {
  hydrateAdminSessionStorage();

  const location = useLocation();
  const navigate = useNavigate();
  const idleTimerRef = useRef(null);

  useEffect(() => {
    const path = location.pathname;
    const token = getAdminStorageItem("TOKEN");

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
    const handleAuthStorageChange = (event) => {
      if (event.key !== ADMIN_AUTH_CLEAR_EVENT) return;

      clearAdminSessionStorage();

      const isAuthRoute = AUTH_ROUTES.some((route) =>
        window.location.pathname.startsWith(route)
      );

      if (!isAuthRoute) {
        navigate("/login", { replace: true });
      }
    };

    window.addEventListener("storage", handleAuthStorageChange);
    return () => window.removeEventListener("storage", handleAuthStorageChange);
  }, [navigate]);

  useEffect(() => {
    const path = location.pathname;
    const isAuthRoute = AUTH_ROUTES.some((route) => path.startsWith(route));
    const token = getAdminStorageItem("TOKEN");

    if (isAuthRoute || !token) {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      return undefined;
    }

    const logoutForInactivity = () => {
      const inactiveMs = Date.now() - getAdminLastActivity();
      const timeoutMs = getSessionTimeoutMs();

      if (inactiveMs >= timeoutMs) {
        clearAdminAuthStorage();
        navigate("/login", { replace: true });
        return;
      }

      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(logoutForInactivity, Math.max(1000, timeoutMs - inactiveMs));
    };

    const resetIdleTimer = () => {
      markAdminActivity();
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
