export const PREFERENCES_STORAGE_KEY = "PGTI_PREFS";
export const PREFERENCES_CHANGED_EVENT = "pgti-preferences-changed";

export const defaultPreferences = {
  sidebarCollapsed: false,
  defaultPageSize: "10",
  sessionTimeout: "60",
};

const allowedPageSizes = [10, 20, 50, 100];
const allowedSessionTimeouts = [30, 60, 120, 480];

const sanitizePageSize = (value) => {
  const parsed = Number(value);
  return allowedPageSizes.includes(parsed) ? parsed : Number(defaultPreferences.defaultPageSize);
};

const sanitizeSessionTimeout = (value) => {
  const parsed = Number(value);
  return allowedSessionTimeouts.includes(parsed) ? parsed : Number(defaultPreferences.sessionTimeout);
};

export const loadPreferences = () => {
  try {
    const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    const merged = stored
      ? { ...defaultPreferences, ...JSON.parse(stored) }
      : { ...defaultPreferences };

    return {
      ...merged,
      defaultPageSize: String(sanitizePageSize(merged.defaultPageSize)),
      sessionTimeout: String(sanitizeSessionTimeout(merged.sessionTimeout)),
    };
  } catch {
    return { ...defaultPreferences };
  }
};

export const savePreferences = (preferences) => {
  const normalized = {
    ...defaultPreferences,
    ...preferences,
    defaultPageSize: String(sanitizePageSize(preferences?.defaultPageSize)),
    sessionTimeout: String(sanitizeSessionTimeout(preferences?.sessionTimeout)),
  };

  localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent(PREFERENCES_CHANGED_EVENT, { detail: normalized }));
  return normalized;
};

export const resetPreferences = () => savePreferences(defaultPreferences);

export const getPreferredPageSize = () => sanitizePageSize(loadPreferences().defaultPageSize);

export const getSessionTimeoutMs = () =>
  sanitizeSessionTimeout(loadPreferences().sessionTimeout) * 60 * 1000;
