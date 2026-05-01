import React, { useEffect, useState } from "react";
import { Modal, notification } from "antd";
import { EditOutlined, FileTextOutlined, InfoCircleOutlined, PictureOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { listAboutUs } from "services/aboutUs.service";
import { usePermissions } from "contexts/PermissionContext";
import "styles/admin-pages.css";

const SECTION_LABELS = [
  { key: "general", label: "General", desc: "Page status and record-level settings" },
  { key: "heroBanner", label: "Hero Banner", desc: "Banner background image, title, and subtitle" },
  { key: "about", label: "About PGTI", desc: "Hero text, image, and paragraph content" },
  { key: "keyMilestones", label: "Key Milestones", desc: "Journey timeline cards and intro text" },
  { key: "mission", label: "Our Mission", desc: "Mission heading, image, and four mission cards" },
  { key: "vision", label: "Our Vision", desc: "Vision heading, image, and four vision items" },
  { key: "legacy", label: "Legacy & Impact", desc: "Legacy heading, image, and description block" },
  { key: "team", label: "The Team Behind the Tour", desc: "Filters, team members, photos, and biographies" },
];

export default function AboutUsList() {
  const navigate = useNavigate();
  const PERMISSION = usePermissions("FULL");
  const user = JSON.parse(sessionStorage.getItem("ADMIN-INFO"));

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sectionAction, setSectionAction] = useState({ open: false, key: "" });

  useEffect(() => {
    document.title = "PGTI || About Us CMS";
    const load = async () => {
      setIsLoading(true);
      const res = await listAboutUs();
      if (res?.status) setData(res.result || null);
      else notification.error({ message: res?.message || "Failed to load About Us" });
      setIsLoading(false);
    };
    load();
  }, []);

  const canEdit = user?.admin_type === "Super Admin" || PERMISSION?.permissions?.about_us?.list === "Y";
  const selectedSection = SECTION_LABELS.find((item) => item.key === sectionAction.key) || null;

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">About Us</h1>
            <p className="page-subtitle">Single CMS entity to manage the full About Us page</p>
          </div>
          <button
            className="action-button primary"
            disabled={!canEdit}
            onClick={() => navigate("/admin/cms/about-us/addeditdata", { state: data || {} })}
          >
            <EditOutlined /> {data && Object.keys(data).length > 0 ? "Edit Page" : "Setup Page"}
          </button>
        </div>
      </div>

      <div className="content-card">
        <div className="content-card-body">
          {isLoading ? (
            <div className="text-center" style={{ padding: 40, color: "#64748b" }}>Loading...</div>
          ) : data && Object.keys(data).length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

              {/* Single status row */}
              <div style={{
                display: "flex", alignItems: "center", gap: 16,
                padding: "14px 18px", background: "#f8fafc",
                borderRadius: 10, border: "1px solid #e2e8f0",
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <FileTextOutlined style={{ color: "#1d4ed8", fontSize: 17 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#1e3a5f" }}>About Us Page</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    All sections are managed in the edit view. Click "Edit Page" to update content.
                  </div>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  color: "#16a34a", background: "#f0fdf4",
                  border: "1px solid #86efac",
                  padding: "3px 12px", borderRadius: 20, flexShrink: 0,
                }}>
                  ✓ Configured
                </span>
              </div>

              <p style={{ fontSize: 13, color: "#64748b", marginBottom: 8, marginTop: 6 }}>
                <InfoCircleOutlined style={{ marginRight: 6 }} />
                Click any About Us section below to jump straight into editing that section.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
                {SECTION_LABELS.map(({ key, label, desc }) => (
                  <button
                    type="button"
                    key={key}
                    onClick={() => canEdit && setSectionAction({ open: true, key })}
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
                      background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {key === "heroBanner"
                        ? <PictureOutlined style={{ color: "#1d4ed8", fontSize: 15 }} />
                        : <FileTextOutlined style={{ color: "#1d4ed8", fontSize: 15 }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 12, color: "#1e3a5f" }}>{label}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{desc}</div>
                    </div>
                    {canEdit && <EditOutlined style={{ color: "#94a3b8" }} />}
                  </button>
                ))}
              </div>

              {/* Footer bar */}
              <div style={{
                display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
                padding: "12px 4px 0", borderTop: "1px solid #e2e8f0", marginTop: 6,
              }}>
                <span className={`status-badge ${data?.status === "A" ? "active" : "inactive"}`}>
                  {data?.status === "A" ? "Active" : "Inactive"}
                </span>
                <span style={{ color: "#cbd5e1", fontSize: 14 }}>·</span>
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  Record ID: {data?.id || "Not available"}
                </span>
                <span style={{ color: "#cbd5e1", fontSize: 14 }}>·</span>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>
                  <InfoCircleOutlined style={{ marginRight: 4 }} />
                  Click "Edit Page" to update all sections
                </span>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "48px 20px", color: "#94a3b8" }}>
              <FileTextOutlined style={{ fontSize: 40, marginBottom: 12, display: "block" }} />
              <div style={{ fontWeight: 600, color: "#64748b", fontSize: 15, marginBottom: 6 }}>Not configured yet</div>
              <div style={{ fontSize: 13 }}>Click "Setup Page" to add all sections and create the About Us page.</div>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={sectionAction.open}
        onCancel={() => setSectionAction({ open: false, key: "" })}
        footer={null}
        width={420}
        centered
        destroyOnClose
      >
        {selectedSection && (
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
                onClick={() => setSectionAction({ open: false, key: "" })}
              >
                Cancel
              </button>
              <button
                type="button"
                className="action-button primary"
                onClick={() => navigate("/admin/cms/about-us/addeditdata", {
                  state: { ...(data || {}), openSectionKey: selectedSection.key },
                })}
              >
                <EditOutlined /> Edit Section
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
