import React from "react";
import {
  AppstoreOutlined,
  CloseOutlined,
  DownOutlined,
  EditOutlined,
  InfoCircleOutlined,
  RightOutlined,
  SaveOutlined,
} from "@ant-design/icons";

export const normalizeSectionKey = (sectionKeys, value = "") =>
  sectionKeys.includes(value) ? value : "";

export const buildSectionOpenState = (sectionKeys, { openKey = "" } = {}) => {
  const normalized = normalizeSectionKey(sectionKeys, openKey);
  return sectionKeys.reduce((acc, key) => {
    acc[key] = normalized ? key === normalized : false;
    return acc;
  }, {});
};

const getQuickJumpCurveOffset = (index, total) => {
  if (total <= 1) return 0;
  const center = (total - 1) / 2;
  const distance = Math.abs(index - center);
  return Math.round(distance * 10);
};

export function SectionEditorCard({
  number,
  title,
  icon,
  children,
  isOpen,
  onToggleOpen,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  isSaving,
  onLockedClick,
}) {
  const isLocked = !isEditing;

  return (
    <div className="content-card" style={{ marginBottom: 24 }}>
      <div className="content-card-body">
        <div className="form-section" style={{ marginBottom: 0 }}>
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              textAlign: "left",
            }}
          >
            <button
              type="button"
              onClick={onToggleOpen}
              style={{
                border: "none",
                background: "transparent",
                padding: 0,
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flex: 1,
              }}
            >
              <h3 className="form-section-title" style={{ marginBottom: 0 }}>
                {icon}
                &nbsp;
                <span style={{ fontSize: 13, color: "#94a3b8", marginRight: 6 }}>{number}.</span>
                {title}
              </h3>
              <span style={{ color: "#64748b", fontSize: 14, flexShrink: 0 }}>
                {isOpen ? <DownOutlined /> : <RightOutlined />}
              </span>
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              {isEditing ? (
                <>
                  <button type="button" className="action-button secondary" onClick={onCancel} disabled={isSaving}>
                    <CloseOutlined /> Cancel
                  </button>
                  <button type="button" className="action-button primary" onClick={onSave} disabled={isSaving}>
                    <SaveOutlined /> {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              ) : (
                <button type="button" className="action-button secondary" onClick={onEdit}>
                  <EditOutlined /> Edit
                </button>
              )}
            </div>
          </div>
          {isOpen && (
            <div style={{ paddingTop: 16, position: "relative" }}>
              {children}
              {isLocked && (
                <button
                  type="button"
                  onClick={onLockedClick}
                  style={{
                    position: "absolute",
                    inset: 0,
                    border: "none",
                    background: "rgba(248, 250, 252, 0.28)",
                    cursor: "not-allowed",
                    borderRadius: 12,
                  }}
                  aria-label={`This ${title} section is read-only until you click edit`}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function SectionListGrid({
  sections,
  onSelect,
  canEdit = true,
  infoText = 'Click any section below to jump straight into editing that section.',
}) {
  return (
    <>
      <p style={{ fontSize: 13, color: "#64748b", marginBottom: 8, marginTop: 6 }}>
        <InfoCircleOutlined style={{ marginRight: 6 }} />
        {infoText}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
        {sections.map(({ key, label, desc, icon }) => (
          <button
            type="button"
            key={key}
            onClick={() => canEdit && onSelect(key)}
            disabled={!canEdit}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              width: "100%",
              padding: "12px 14px",
              background: "#f8fafc",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              cursor: canEdit ? "pointer" : "not-allowed",
              textAlign: "left",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                flexShrink: 0,
                background: "#eff6ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 12, color: "#1e3a5f" }}>{label}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{desc}</div>
            </div>
            {canEdit && <EditOutlined style={{ color: "#94a3b8" }} />}
          </button>
        ))}
      </div>
    </>
  );
}

export function SectionActionModal({
  selectedSection,
  open,
  onCancel,
  onEdit,
}) {
  if (!open || !selectedSection) return null;

  return (
    <div style={{ paddingTop: 6 }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>
        Edit {selectedSection.label}
      </div>
      <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7, marginBottom: 18 }}>
        {selectedSection.desc}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          className="action-button secondary"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className="action-button primary"
          onClick={onEdit}
        >
          <EditOutlined /> Edit Section
        </button>
      </div>
    </div>
  );
}

export function SectionStatusFooter({ data, message = 'Click "Edit Page" to update all sections' }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
        padding: "12px 4px 0",
        borderTop: "1px solid #e2e8f0",
        marginTop: 6,
      }}
    >
      <span className={`status-badge ${data?.status === "A" ? "active" : "inactive"}`}>
        {data?.status === "A" ? "Active" : "Inactive"}
      </span>
      <span style={{ color: "#cbd5e1", fontSize: 14 }}>·</span>
      <span style={{ fontSize: 12, color: "#64748b" }}>Record ID: {data?.id || "Not available"}</span>
      <span style={{ color: "#cbd5e1", fontSize: 14 }}>·</span>
      <span style={{ fontSize: 12, color: "#94a3b8" }}>
        <InfoCircleOutlined style={{ marginRight: 4 }} />
        {message}
      </span>
    </div>
  );
}

export function SectionQuickJump({
  items,
  openSections,
  focusSection,
  quickJumpOpen,
  setQuickJumpOpen,
}) {
  return (
    <div
      style={{
        position: "fixed",
        right: 20,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 1200,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      {quickJumpOpen && (
        <div
          style={{
            width: 240,
            maxHeight: "70vh",
            overflowY: "auto",
            background: "#ffffff",
            border: "1px solid #dbe7f5",
            borderRadius: 24,
            boxShadow: "0 18px 44px rgba(15, 23, 42, 0.16)",
            padding: "14px 12px",
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#1e3a8a",
              marginBottom: 10,
              paddingLeft: 4,
            }}
          >
            Quick Jump
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {items.map((item, index) => {
              const isActive = !!openSections[item.key];
              const offset = getQuickJumpCurveOffset(index, items.length);
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => focusSection(item.key)}
                  style={{
                    border: "1px solid #d7e3f4",
                    background: isActive ? "#e8f0ff" : "#ffffff",
                    color: isActive ? "#2563eb" : "#0f172a",
                    borderRadius: 999,
                    padding: "12px 14px",
                    textAlign: "left",
                    fontSize: 14,
                    fontWeight: isActive ? 700 : 600,
                    cursor: "pointer",
                    boxShadow: isActive ? "0 8px 20px rgba(37, 99, 235, 0.12)" : "none",
                    marginLeft: offset,
                    marginRight: offset,
                    transition: "all 0.2s ease",
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setQuickJumpOpen((prev) => !prev)}
        style={{
          width: 58,
          height: 58,
          borderRadius: "50%",
          border: "none",
          background: "#1e3a8a",
          color: "#ffffff",
          boxShadow: "0 14px 30px rgba(30, 58, 138, 0.26)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: 22,
        }}
        aria-label="Open quick jump for page sections"
        title="Quick Jump"
      >
        <AppstoreOutlined />
      </button>
    </div>
  );
}
