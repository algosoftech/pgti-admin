import React, { useEffect, useState } from "react";
import { Modal, notification } from "antd";
import {
  EditOutlined,
  FileTextOutlined,
  FontSizeOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import { listDisclaimer } from "services/disclaimer.service";
import "styles/admin-pages.css";

const SECTION_LABELS = [
  { key: "header", label: "Page Header", desc: "Title and subtitle shown at the top of the Disclaimer page." },
  { key: "content", label: "Page Content", desc: "Full rich-text Disclaimer content shown on the page body." },
];

export default function DisclaimerList() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sectionAction, setSectionAction] = useState({ open: false, key: "" });

  useEffect(() => {
    document.title = "PGTI || Disclaimer CMS";
    const load = async () => {
      setIsLoading(true);
      const res = await listDisclaimer();
      if (res?.status) setData(res.result || null);
      else notification.error({ message: res?.message || "Failed to load data" });
      setIsLoading(false);
    };
    load();
  }, []);

  const content = (() => {
    if (!data?.content) return null;
    try { return typeof data.content === "string" ? JSON.parse(data.content) : data.content; }
    catch { return null; }
  })();

  const selectedSection = SECTION_LABELS.find((item) => item.key === sectionAction.key) || null;

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">Disclaimer</h1>
            <p className="page-subtitle">Manage the Disclaimer page content</p>
          </div>
          <button className="action-button primary" onClick={() => navigate("/admin/cms/disclaimer/addeditdata", { state: data || {} })}>
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
              <p style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
                <InfoCircleOutlined style={{ marginRight: 6 }} />
                Click any Disclaimer section below to jump straight into editing that section.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
                {SECTION_LABELS.map(({ key, label, desc }) => (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setSectionAction({ open: true, key })}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      width: "100%",
                      padding: "12px 14px",
                      background: "#f8fafc",
                      borderRadius: 10,
                      border: "1px solid #e2e8f0",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                      background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {key === "header"
                        ? <FontSizeOutlined style={{ color: "#1d4ed8", fontSize: 15 }} />
                        : <FileTextOutlined style={{ color: "#1d4ed8", fontSize: 15 }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 12, color: "#1e3a5f" }}>{label}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{desc}</div>
                    </div>
                    <EditOutlined style={{ color: "#94a3b8" }} />
                  </button>
                ))}
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
              <div style={{ fontSize: 13 }}>Click "Setup Page" to configure the Disclaimer page.</div>
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
                onClick={() => navigate("/admin/cms/disclaimer/addeditdata", {
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
