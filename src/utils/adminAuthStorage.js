const ADMIN_AUTH_KEYS = [
  "TOKEN",
  "ADMIN-INFO",
  "ADMIN-PERMISSION",
  "SIDE-MENU",
];

const ADMIN_LAST_ACTIVITY_KEY = "ADMIN-LAST-ACTIVITY";
export const ADMIN_AUTH_CLEAR_EVENT = "ADMIN-AUTH-CLEAR-EVENT";

const canUseStorage = () => typeof window !== "undefined";

export const getAdminStorageItem = (key) => {
  if (!canUseStorage()) return null;
  return sessionStorage.getItem(key) || localStorage.getItem(key);
};

export const setAdminStorageItem = (key, value) => {
  if (!canUseStorage()) return;
  sessionStorage.setItem(key, value);
  localStorage.setItem(key, value);
};

export const removeAdminStorageItem = (key) => {
  if (!canUseStorage()) return;
  sessionStorage.removeItem(key);
  localStorage.removeItem(key);
};

export const clearAdminSessionStorage = () => {
  if (!canUseStorage()) return;
  ADMIN_AUTH_KEYS.forEach((key) => sessionStorage.removeItem(key));
  sessionStorage.removeItem(ADMIN_LAST_ACTIVITY_KEY);
};

export const clearAdminAuthStorage = () => {
  if (!canUseStorage()) return;
  ADMIN_AUTH_KEYS.forEach(removeAdminStorageItem);
  localStorage.removeItem(ADMIN_LAST_ACTIVITY_KEY);
  sessionStorage.removeItem(ADMIN_LAST_ACTIVITY_KEY);
  localStorage.setItem(ADMIN_AUTH_CLEAR_EVENT, String(Date.now()));
};

export const hydrateAdminSessionStorage = () => {
  if (!canUseStorage()) return;
  ADMIN_AUTH_KEYS.forEach((key) => {
    const localValue = localStorage.getItem(key);
    if (localValue && !sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, localValue);
    }
  });
};

export const markAdminActivity = () => {
  if (!canUseStorage()) return;
  localStorage.setItem(ADMIN_LAST_ACTIVITY_KEY, String(Date.now()));
};

export const getAdminLastActivity = () => {
  if (!canUseStorage()) return Date.now();
  const stored = Number(localStorage.getItem(ADMIN_LAST_ACTIVITY_KEY));
  return Number.isFinite(stored) && stored > 0 ? stored : Date.now();
};
