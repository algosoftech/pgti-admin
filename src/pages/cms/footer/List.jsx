import React, { useEffect, useState } from "react";
import { notification } from "antd";
import {
  EditOutlined, AppstoreOutlined, PhoneOutlined,
  ShareAltOutlined, MobileOutlined, CopyrightOutlined,
  NotificationOutlined, CheckCircleOutlined, CloseCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { listFooter } from "services/footerCms.service";
import "styles/admin-pages.css";

const ICON_COLORS = [
  { bg: "#eff6ff", color: "#1d4ed8" },
  { bg: "#f0fdf4", color: "#16a34a" },
  { bg: "#fdf4ff", color: "#7e22ce" },
  { bg: "#fff7ed", color: "#c2410c" },
  { bg: "#f0f9ff", color: "#0369a1" },
  { bg: "#fef9c3", color: "#a16207" },
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

export default function FooterCmsList() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "PGTI || Footer CMS";
    const load = async () => {
      setIsLoading(true);
      const res = await listFooter();
      if (res?.status) setData(res.result || null);
      else notification.error({ message: res?.message || "Failed to load Footer data" });
      setIsLoading(false);
    };
    load();
  }, []);

  const content = (() => {
    if (!data?.content) return null;
    try { return typeof data.content === "string" ? JSON.parse(data.content) : data.content; }
    catch { return null; }
  })();

  const visibleCols = content?.linkColumns?.filter(c => c.is_visible) || [];
  const socialSet = ["facebook", "twitter", "linkedin", "instagram", "youtube", "google_plus"].filter(k => content?.socialLinks?.[k]);

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">Footer Management</h1>
            <p className="page-subtitle">Manage footer link columns, contact info, social links, and app download settings</p>
          </div>
          <button className="action-button primary" onClick={() => navigate("/admin/cms/footer/addeditdata", { state: data || {} })}>
            <EditOutlined /> {data ? "Edit Footer" : "Setup Footer"}
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
                icon={<AppstoreOutlined />} colorIdx={0} label="Link Columns"
                meta={content.linkColumns?.length
                  ? `${content.linkColumns.length} column${content.linkColumns.length !== 1 ? "s" : ""} · ${visibleCols.length} visible`
                  : "No link columns added"}
                isSet={!!(content.linkColumns?.length)}
              />
              <SectionRow
                icon={<PhoneOutlined />} colorIdx={1} label="Contact Info"
                meta={[content.contactInfo?.email, content.contactInfo?.phone].filter(Boolean).join(" · ") || "No contact info set"}
                isSet={!!(content.contactInfo?.email || content.contactInfo?.phone)}
              />
              <SectionRow
                icon={<ShareAltOutlined />} colorIdx={2} label="Social Links"
                meta={socialSet.length
                  ? `${socialSet.length} of 6 set: ${socialSet.map(k => k.charAt(0).toUpperCase() + k.slice(1)).join(", ")}`
                  : "No social links configured"}
                isSet={socialSet.length > 0}
              />
              <SectionRow
                icon={<NotificationOutlined />} colorIdx={3} label="Newsletter Section"
                meta={content.newsletter?.placeholder || "No newsletter text configured"}
                isSet={!!(content.newsletter?.placeholder || content.newsletter?.button_text)}
              />
              <SectionRow
                icon={<MobileOutlined />} colorIdx={4} label="App Download"
                meta={[
                  content.appDownload?.google_play_url ? "Google Play ✓" : "Google Play —",
                  content.appDownload?.app_store_url ? "App Store ✓" : "App Store —",
                  content.appDownload?.is_visible ? "Section visible" : "Section hidden",
                ].join("  ·  ")}
                isSet={!!(content.appDownload?.google_play_url || content.appDownload?.app_store_url)}
              />
              <SectionRow
                icon={<CopyrightOutlined />} colorIdx={5} label="Copyright Text"
                meta={content.copyright?.slice(0, 100) || "No copyright text set"}
                isSet={!!(content.copyright)}
              />

              {/* Link columns detail */}
              {content.linkColumns?.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 8, paddingLeft: 4 }}>
                    Link Columns
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
                    {content.linkColumns.map((col, i) => (
                      <div key={i} style={{
                        background: "white", border: "1px solid #e2e8f0",
                        borderRadius: 10, padding: "12px 16px",
                        opacity: col.is_visible ? 1 : 0.55,
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <span style={{ fontWeight: 600, fontSize: 13, color: "#1e3a5f" }}>{col.title || "Untitled"}</span>
                          {col.is_visible
                            ? <CheckCircleOutlined style={{ color: "#16a34a", fontSize: 13 }} />
                            : <CloseCircleOutlined style={{ color: "#cbd5e1", fontSize: 13 }} />}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>{col.links?.length || 0} links</div>
                        {col.links?.filter(l => l.is_visible).slice(0, 3).map((l, li) => (
                          <div key={li} style={{ fontSize: 11, color: "#94a3b8", padding: "1px 0" }}>· {l.label}</div>
                        ))}
                        {col.links?.filter(l => l.is_visible).length > 3 && (
                          <div style={{ fontSize: 11, color: "#cbd5e1" }}>+{col.links.filter(l => l.is_visible).length - 3} more</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                  Click "Edit Footer" to manage all settings
                </span>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "48px 20px", color: "#94a3b8" }}>
              <AppstoreOutlined style={{ fontSize: 40, marginBottom: 12, display: "block" }} />
              <div style={{ fontWeight: 600, color: "#64748b", fontSize: 15, marginBottom: 6 }}>Not configured yet</div>
              <div style={{ fontSize: 13 }}>Click "Setup Footer" to get started.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
