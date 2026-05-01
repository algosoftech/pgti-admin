import React, { useEffect, useState } from "react";
import { notification } from "antd";
import {
  EditOutlined, PictureOutlined, TeamOutlined,
  BookOutlined, MobileOutlined, InfoCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { listAntiDoping } from "services/antiDoping.service";
import "styles/admin-pages.css";

const ICON_COLORS = [
  { bg: "#eff6ff", color: "#1d4ed8" },
  { bg: "#f0fdf4", color: "#16a34a" },
  { bg: "#fdf4ff", color: "#7e22ce" },
  { bg: "#fff7ed", color: "#c2410c" },
];

const SectionRow = ({ icon, label, meta, isSet, colorIdx = 0 }) => {
  const c = ICON_COLORS[colorIdx % ICON_COLORS.length];
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 16,
      padding: "14px 18px", background: "#f8fafc",
      borderRadius: 10, border: "1px solid #e2e8f0",
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        background: c.bg, display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {React.cloneElement(icon, { style: { color: c.color, fontSize: 17 } })}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: "#1e3a5f" }}>{label}</div>
        {meta && <div style={{ fontSize: 12, color: "#64748b", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{meta}</div>}
      </div>
      <span style={{
        fontSize: 11, fontWeight: 600, flexShrink: 0,
        color: isSet ? "#16a34a" : "#94a3b8",
        background: isSet ? "#f0fdf4" : "#f1f5f9",
        border: `1px solid ${isSet ? "#86efac" : "#e2e8f0"}`,
        padding: "3px 12px", borderRadius: 20,
      }}>
        {isSet ? "✓ Set" : "Not set"}
      </span>
    </div>
  );
};

export default function AntiDopingList() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "PGTI || Anti-Doping CMS";
    const load = async () => {
      setIsLoading(true);
      const res = await listAntiDoping();
      if (res?.status) setData(res.result || null);
      else notification.error({ message: res?.message || "Failed to load Anti-Doping data" });
      setIsLoading(false);
    };
    load();
  }, []);

  const content = (() => {
    if (!data?.content) return null;
    try { return typeof data.content === "string" ? JSON.parse(data.content) : data.content; }
    catch { return null; }
  })();

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">Anti-Doping</h1>
            <p className="page-subtitle">Manage all sections of the Anti-Doping page</p>
          </div>
          <button className="action-button primary" onClick={() => navigate("/admin/cms/anti-doping/addeditdata", { state: data || {} })}>
            <EditOutlined /> {data ? "Edit Page" : "Setup Page"}
          </button>
        </div>
      </div>

      <div className="content-card">
        <div className="content-card-body">
          {isLoading ? (
            <div className="text-center" style={{ padding: 40, color: "#64748b" }}>Loading...</div>
          ) : content ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

              <SectionRow
                icon={<PictureOutlined />} colorIdx={0} label="Hero Banner"
                meta={[content.heroBanner?.title, content.heroBanner?.subtitle?.slice(0, 60)].filter(Boolean).join(" · ") || "No content"}
                isSet={!!(content.heroBanner?.title)}
              />
              <SectionRow
                icon={<TeamOutlined />} colorIdx={1} label="Members Section"
                meta={content.membersSection?.heading
                  ? `${content.membersSection.heading} · ${content.membersSection.tabs?.length || 0} tab(s)`
                  : "No heading set"}
                isSet={!!(content.membersSection?.heading)}
              />
              <SectionRow
                icon={<BookOutlined />} colorIdx={2} label="Resources"
                meta={content.resourcesSection?.heading
                  ? `${content.resourcesSection.heading} · ${content.resourcesSection.resources?.length || 0} resource(s)`
                  : "No resources added"}
                isSet={!!(content.resourcesSection?.resources?.length)}
              />
              <SectionRow
                icon={<MobileOutlined />} colorIdx={3} label="Mobile App"
                meta={[
                  content.mobileApp?.google_play_url ? "Google Play ✓" : "Google Play —",
                  content.mobileApp?.app_store_url ? "App Store ✓" : "App Store —",
                ].join("  ·  ")}
                isSet={!!(content.mobileApp?.google_play_url || content.mobileApp?.app_store_url)}
              />

              {/* Footer bar */}
              <div style={{
                display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
                padding: "12px 4px 0", borderTop: "1px solid #e2e8f0", marginTop: 6,
              }}>
                <span className={`status-badge ${data?.status === "A" ? "active" : "inactive"}`}>
                  {data?.status === "A" ? "Active" : "Inactive"}
                </span>
                <span style={{ color: "#cbd5e1", fontSize: 14 }}>·</span>
                <span style={{ fontSize: 12, color: "#64748b" }}>Record ID: {data?.id}</span>
                <span style={{ color: "#cbd5e1", fontSize: 14 }}>·</span>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>
                  <InfoCircleOutlined style={{ marginRight: 4 }} />
                  Click "Edit Page" to update all sections
                </span>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "48px 20px", color: "#94a3b8" }}>
              <BookOutlined style={{ fontSize: 40, marginBottom: 12, display: "block" }} />
              <div style={{ fontWeight: 600, color: "#64748b", fontSize: 15, marginBottom: 6 }}>Not configured yet</div>
              <div style={{ fontSize: 13 }}>Click "Setup Page" to configure all Anti-Doping sections.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
