/**
 * FieldHint — reusable helper component for form fields.
 * Shows:
 *   - guideline hint text under a field
 *   - character counter with colour-coded status
 *   - inline image spec guidance
 */
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleInfo,
  faTriangleExclamation,
  faImage,
} from "@fortawesome/free-solid-svg-icons";

/* ── Character counter ──────────────────────────────────────────────────── */
export const CharCounter = ({ value = "", min, max }) => {
  const len = (value || "").length;
  const tooShort = min && len < min && len > 0;
  const tooLong  = max && len > max;
  const ok       = len >= (min || 0) && (!max || len <= max);
  const color    = tooLong ? "#ef4444" : tooShort ? "#f59e0b" : len === 0 ? "#94a3b8" : "#10b981";

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 5 }}>
      {min && len < min && len > 0 ? (
        <span style={{ fontSize: 12, color: "#f59e0b", display: "flex", alignItems: "center", gap: 4 }}>
          <FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: 11 }} />
          {min - len} more characters required (min {min})
        </span>
      ) : tooLong ? (
        <span style={{ fontSize: 12, color: "#ef4444", display: "flex", alignItems: "center", gap: 4 }}>
          <FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: 11 }} />
          {len - max} characters over limit (max {max})
        </span>
      ) : (
        <span />
      )}
      <span style={{ fontSize: 12, fontWeight: 600, color, marginLeft: "auto" }}>
        {len}{max ? `/${max}` : ""}
      </span>
    </div>
  );
};

/* ── Hint text below a field ─────────────────────────────────────────────── */
export const FieldHint = ({ text, icon = faCircleInfo, color = "#6b7280" }) => (
  <p style={{
    margin: "5px 0 0",
    fontSize: 12,
    color,
    display: "flex",
    alignItems: "flex-start",
    gap: 5,
    lineHeight: 1.5,
  }}>
    <FontAwesomeIcon icon={icon} style={{ marginTop: 2, flexShrink: 0, fontSize: 11 }} />
    <span>{text}</span>
  </p>
);

/* ── Image upload spec hint ──────────────────────────────────────────────── */
export const ImageHint = ({ recommended, maxSize = "2MB", formats = "JPG, PNG, WebP", note }) => (
  <div style={{
    marginTop: 8,
    padding: "10px 12px",
    background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
    borderRadius: 8,
    border: "1px solid #bae6fd",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
      <FontAwesomeIcon icon={faImage} style={{ color: "#0369a1", fontSize: 12 }} />
      <span style={{ fontSize: 12, fontWeight: 700, color: "#0369a1" }}>Image Guidelines</span>
    </div>
    <ul style={{ margin: 0, padding: "0 0 0 16px", fontSize: 12, color: "#1e40af", lineHeight: 1.7 }}>
      {recommended && <li><strong>Recommended size:</strong> {recommended}</li>}
      <li><strong>Max file size:</strong> {maxSize}</li>
      <li><strong>Accepted formats:</strong> {formats}</li>
      {note && <li>{note}</li>}
    </ul>
  </div>
);

export default FieldHint;
