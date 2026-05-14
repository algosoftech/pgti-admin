import React, { useEffect, useState } from "react";
import { Modal, notification } from "antd";
import { EditOutlined, HomeOutlined, InfoCircleOutlined, PoweroffOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { addEditHomepageSettings, listHomepageSettings } from "services/homepageSettings.service";
import { usePermissions } from "contexts/PermissionContext";
import "styles/admin-pages.css";

const SECTION_LABELS = [
  { key: "hero",            label: "Hero Banner",              desc: "Background image, title, subtitle, live scores toggle" },
  { key: "featuredMatch",   label: "Featured Match Bar",       desc: "League promo strip below hero — enable/disable & configure" },
  { key: "pgtiRanking",     label: "PGTI Ranking Section",     desc: "Heading, description, player cards count shown" },
  { key: "quickLinks",      label: "Quick-Link Banners",       desc: "OWGR India & PGTI Ranking quick-link cards" },
  { key: "latestNews",      label: "Latest News",              desc: "Heading, count of cards — content managed in CMS → News" },
  { key: "league72",        label: "72 The League Bar",        desc: "Full-width promo banner with link & background image" },
  { key: "eventsSection",   label: "Events / Tournaments",     desc: "Heading, count of cards — content managed in Events module" },
  { key: "highlightVideos", label: "Highlight Videos",         desc: "Heading, count of videos — content managed in CMS → Highlights" },
  { key: "socialMedia",     label: "Social Media Section",     desc: "Heading, Instagram URL, Facebook page URL" },
  { key: "aboutPgti",       label: "About PGTI",               desc: "Show/hide & button — content managed in CMS → About Us" },
  { key: "pgtiPartners",    label: "PGTI Partners",            desc: "Heading & visibility — logos managed in CMS → Tour Partners" },
  { key: "tourPartners",    label: "Tour Partners",            desc: "Heading & visibility — logos managed in CMS → Tour Partners" },
];

const getSectionToggleField = (key) => {
  if (key === "hero" || key === "featuredMatch" || key === "league72") return "enabled";
  return "show_section";
};

const getSectionEnabled = (content, key) => {
  const section = content?.[key] || {};
  const toggleField = getSectionToggleField(key);
  return section?.[toggleField] !== false;
};

const normalizeOpenSectionKey = (key) => {
  if (key === "pgtiPartners" || key === "tourPartners") return "partnersSections";
  return key;
};

export default function HomepageSettingsList() {
  const navigate = useNavigate();
  const PERMISSION = usePermissions("FULL");
  const user = JSON.parse(sessionStorage.getItem("ADMIN-INFO"));
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sectionAction, setSectionAction] = useState({ open: false, key: "" });
  const [isUpdatingSection, setIsUpdatingSection] = useState(false);

  useEffect(() => {
    document.title = "PGTI || Homepage Settings";
    const load = async () => {
      setIsLoading(true);
      const res = await listHomepageSettings();
      if (res?.status) setData(res.result || null);
      else notification.error({ message: res?.message || "Failed to load Homepage Settings" });
      setIsLoading(false);
    };
    load();
  }, []);

  const canEdit = user?.admin_type === "Super Admin" || PERMISSION?.permissions?.homepage_settings?.list === "Y";
  const content = (() => {
    if (!data?.content) return null;
    try { return typeof data.content === "string" ? JSON.parse(data.content) : data.content; }
    catch { return null; }
  })();
  const selectedSection = SECTION_LABELS.find((item) => item.key === sectionAction.key) || null;

  const openSectionPopup = (key) => {
    if (!content || !canEdit) return;
    setSectionAction({ open: true, key });
  };

  const closeSectionPopup = () => {
    if (isUpdatingSection) return;
    setSectionAction({ open: false, key: "" });
  };

  const handleSectionEdit = () => {
    if (!selectedSection) return;
    navigate("/admin/cms/homepage/addeditdata", {
      state: { ...(data || {}), openSectionKey: normalizeOpenSectionKey(selectedSection.key) },
    });
  };

  const handleSectionToggle = async () => {
    if (!selectedSection || !content || !data?.id) return;

    const toggleField = getSectionToggleField(selectedSection.key);
    const currentEnabled = getSectionEnabled(content, selectedSection.key);
    const nextEnabled = !currentEnabled;
    const updatedContent = {
      ...content,
      [selectedSection.key]: {
        ...(content[selectedSection.key] || {}),
        [toggleField]: nextEnabled,
      },
    };

    try {
      setIsUpdatingSection(true);
      const res = await addEditHomepageSettings({
        editId: data.id,
        status: data.status || "A",
        content: JSON.stringify(updatedContent),
      });

      if (!res?.status) {
        notification.error({ message: res?.message || "Failed to update section." });
        return;
      }

      setData((prev) => (prev ? { ...prev, content: updatedContent } : prev));
      notification.success({
        message: `${selectedSection.label} ${nextEnabled ? "enabled" : "disabled"}.`,
      });
      setSectionAction({ open: false, key: "" });
    } finally {
      setIsUpdatingSection(false);
    }
  };

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">Homepage Settings</h1>
            <p className="page-subtitle">Control every section of the public homepage from one place</p>
          </div>
          <button
            className="action-button primary"
            disabled={!canEdit}
            onClick={() => navigate("/admin/cms/homepage/addeditdata", { state: data || {} })}
          >
            <EditOutlined /> {content ? "Edit Homepage" : "Setup Homepage"}
          </button>
        </div>
      </div>

      <div className="content-card">
        <div className="content-card-body">
          {isLoading ? (
            <div className="text-center" style={{ padding: 40, color: "#64748b" }}>Loading...</div>
          ) : content ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <p style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
                <InfoCircleOutlined style={{ marginRight: 6 }} />
                All homepage sections are configured. Click any section card to edit that section directly or switch it on and off.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
                {SECTION_LABELS.map(({ key, label, desc }) => {
                  const isOn = getSectionEnabled(content, key);
                  return (
                    <button
                      type="button"
                      key={key}
                      onClick={() => openSectionPopup(key)}
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
                      <div style={{
                        width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                        background: isOn ? "#eff6ff" : "#f1f5f9",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <HomeOutlined style={{ color: isOn ? "#1d4ed8" : "#94a3b8", fontSize: 15 }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 12, color: "#1e3a5f" }}>{label}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{desc}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 600,
                          color: isOn ? "#16a34a" : "#dc2626",
                          background: isOn ? "#f0fdf4" : "#fef2f2",
                          border: `1px solid ${isOn ? "#86efac" : "#fca5a5"}`,
                          padding: "2px 8px", borderRadius: 20,
                        }}>
                          {isOn ? "ON" : "OFF"}
                        </span>
                        {canEdit && <EditOutlined style={{ color: "#94a3b8" }} />}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
                padding: "12px 4px 0", borderTop: "1px solid #e2e8f0", marginTop: 6,
              }}>
                <span className={`status-badge ${data?.status === "A" ? "active" : "inactive"}`}>
                  {data?.status === "A" ? "Active" : "Inactive"}
                </span>
                <span style={{ color: "#cbd5e1", fontSize: 14 }}>·</span>
                <span style={{ fontSize: 12, color: "#64748b" }}>Record ID: {data?.id}</span>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "48px 20px", color: "#94a3b8" }}>
              <HomeOutlined style={{ fontSize: 40, marginBottom: 12, display: "block" }} />
              <div style={{ fontWeight: 600, color: "#64748b", fontSize: 15, marginBottom: 6 }}>Not configured yet</div>
              <div style={{ fontSize: 13 }}>Click "Setup Homepage" to configure all homepage sections.</div>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={sectionAction.open}
        onCancel={closeSectionPopup}
        footer={null}
        width={460}
        centered
        destroyOnClose
      >
        {selectedSection && (
          <div style={{ paddingTop: 6 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>
              Manage {selectedSection.label}
            </div>
            <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7, marginBottom: 18 }}>
              {selectedSection.desc}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "12px 14px",
                borderRadius: 10,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                marginBottom: 20,
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Current status</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                  {getSectionEnabled(content, selectedSection.key) ? "Enabled on homepage" : "Hidden from homepage"}
                </div>
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: getSectionEnabled(content, selectedSection.key) ? "#15803d" : "#b91c1c",
                  background: getSectionEnabled(content, selectedSection.key) ? "#dcfce7" : "#fee2e2",
                  borderRadius: 999,
                  padding: "4px 10px",
                }}
              >
                {getSectionEnabled(content, selectedSection.key) ? "ON" : "OFF"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                className="action-button secondary"
                onClick={closeSectionPopup}
                disabled={isUpdatingSection}
              >
                Cancel
              </button>
              <button
                type="button"
                className="action-button secondary"
                onClick={handleSectionToggle}
                disabled={isUpdatingSection}
              >
                <PoweroffOutlined />
                {getSectionEnabled(content, selectedSection.key) ? "Turn Off Section" : "Turn On Section"}
              </button>
              <button
                type="button"
                className="action-button primary"
                onClick={handleSectionEdit}
                disabled={isUpdatingSection}
              >
                <EditOutlined />
                Edit Section
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
