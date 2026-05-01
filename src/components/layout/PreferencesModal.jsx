import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faSlidersH,
  faBell,
  faTableColumns,
  faShield,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

const STORAGE_KEY = "PGTI_PREFS";

const defaultPrefs = {
  // Display
  sidebarCollapsed: false,
  compactTable: false,
  // Notifications
  emailNotifications: true,
  loginAlerts: true,
  // Table defaults
  defaultPageSize: "10",
  // Session
  sessionTimeout: "60",
};

const loadPrefs = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaultPrefs, ...JSON.parse(stored) } : { ...defaultPrefs };
  } catch {
    return { ...defaultPrefs };
  }
};

const Toggle = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    style={{
      width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
      background: checked ? "linear-gradient(135deg, #1e3a5f, #0369a1)" : "#e2e8f0",
      position: "relative", transition: "background 0.25s", flexShrink: 0,
    }}
  >
    <span style={{
      position: "absolute", top: 3, left: checked ? 23 : 3,
      width: 18, height: 18, borderRadius: "50%", background: "#fff",
      boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transition: "left 0.25s",
      display: "block",
    }} />
  </button>
);

const SectionHeader = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
    <div style={{
      width: 32, height: 32, borderRadius: 8,
      background: "rgba(30,58,95,0.08)", color: "#1e3a5f",
      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
    }}>
      <FontAwesomeIcon icon={icon} />
    </div>
    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{title}</h3>
  </div>
);

const Row = ({ label, desc, children }) => (
  <div style={{
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "12px 0", borderBottom: "1px solid #f1f5f9",
  }}>
    <div>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "#1f2937" }}>{label}</p>
      {desc && <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>{desc}</p>}
    </div>
    {children}
  </div>
);

const SelectInput = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    style={{
      padding: "6px 10px", borderRadius: 8, border: "1.5px solid #e2e8f0",
      fontSize: 13, fontWeight: 500, color: "#374151", background: "#f8fafc",
      cursor: "pointer", outline: "none",
    }}
  >
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

const PreferencesModal = ({ open, onClose }) => {
  const [prefs, setPrefs] = useState(loadPrefs);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open) { setPrefs(loadPrefs()); setSaved(false); }
  }, [open]);

  const set = (key, val) => setPrefs(p => ({ ...p, [key]: val }));

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 900);
  };

  const handleReset = () => {
    setPrefs({ ...defaultPrefs });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        style: {
          borderRadius: 20,
          boxShadow: "0 25px 60px rgba(0,0,0,0.15)",
          width: 520,
          overflow: "visible",
        },
      }}
    >
      {/* Header */}
      <div style={{
        padding: "24px 28px 20px",
        borderBottom: "1px solid #f1f5f9",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)",
        borderRadius: "20px 20px 0 0",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, color: "#fff",
          }}>
            <FontAwesomeIcon icon={faSlidersH} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#fff" }}>Preferences</h2>
            <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Customize your admin experience</p>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 32, height: 32, borderRadius: "50%", border: "none",
            background: "rgba(255,255,255,0.12)", color: "#fff",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
          }}
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: "24px 28px", maxHeight: "60vh", overflowY: "auto" }}>

        {/* Display */}
        <div style={{ marginBottom: 28 }}>
          <SectionHeader icon={faTableColumns} title="Display" />
          <Row label="Compact Table Rows" desc="Reduce row height in list tables">
            <Toggle checked={prefs.compactTable} onChange={v => set("compactTable", v)} />
          </Row>
          <Row label="Default Page Size" desc="Number of records shown per page by default">
            <SelectInput
              value={prefs.defaultPageSize}
              onChange={v => set("defaultPageSize", v)}
              options={[
                { value: "10", label: "10 per page" },
                { value: "20", label: "20 per page" },
                { value: "50", label: "50 per page" },
                { value: "100", label: "100 per page" },
              ]}
            />
          </Row>
        </div>

        {/* Notifications */}
        <div style={{ marginBottom: 28 }}>
          <SectionHeader icon={faBell} title="Notifications" />
          <Row label="Email Notifications" desc="Receive activity summaries via email">
            <Toggle checked={prefs.emailNotifications} onChange={v => set("emailNotifications", v)} />
          </Row>
          <Row label="Login Alerts" desc="Get notified when a new login occurs">
            <Toggle checked={prefs.loginAlerts} onChange={v => set("loginAlerts", v)} />
          </Row>
        </div>

        {/* Session */}
        <div style={{ marginBottom: 8 }}>
          <SectionHeader icon={faShield} title="Security" />
          <Row label="Session Timeout" desc="Auto-logout after inactivity">
            <SelectInput
              value={prefs.sessionTimeout}
              onChange={v => set("sessionTimeout", v)}
              options={[
                { value: "30",  label: "30 minutes" },
                { value: "60",  label: "1 hour" },
                { value: "120", label: "2 hours" },
                { value: "480", label: "8 hours" },
              ]}
            />
          </Row>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: "16px 28px",
        borderTop: "1px solid #f1f5f9",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "#fafafa",
        borderRadius: "0 0 20px 20px",
      }}>
        <button
          onClick={handleReset}
          style={{
            padding: "9px 18px", borderRadius: 8, border: "1.5px solid #e2e8f0",
            background: "#fff", color: "#64748b", fontSize: 13, fontWeight: 600,
            cursor: "pointer", transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#94a3b8"; e.currentTarget.style.color = "#1f2937"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; }}
        >
          Reset to Defaults
        </button>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              padding: "9px 18px", borderRadius: 8, border: "1.5px solid #e2e8f0",
              background: "#fff", color: "#374151", fontSize: 13, fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "9px 22px", borderRadius: 8, border: "none",
              background: saved
                ? "linear-gradient(135deg, #10b981, #059669)"
                : "linear-gradient(135deg, #1e3a5f, #0369a1)",
              color: "#fff", fontSize: 13, fontWeight: 600,
              cursor: "pointer", transition: "background 0.3s",
              display: "flex", alignItems: "center", gap: 8,
              boxShadow: "0 4px 12px rgba(30,58,95,0.3)",
            }}
          >
            {saved && <FontAwesomeIcon icon={faCheck} />}
            {saved ? "Saved!" : "Save Preferences"}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default PreferencesModal;
