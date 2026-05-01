import React, { useEffect, useState } from "react";
import { notification } from "antd";
import {
  EditOutlined, PictureOutlined, ReadOutlined,
  UnorderedListOutlined, InfoCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { listGolfFacts } from "services/golfFacts.service";
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

export default function GolfFactsList() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "PGTI || Golf Facts CMS";
    const load = async () => {
      setIsLoading(true);
      const res = await listGolfFacts();
      if (res?.status) setData(res.result || null);
      else notification.error({ message: res?.message || "Failed to load Golf Facts data" });
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
            <h1 className="page-title">Golf Facts</h1>
            <p className="page-subtitle">Manage all sections of the Golf Facts page</p>
          </div>
          <button className="action-button primary" onClick={() => navigate("/admin/cms/golf-facts/addeditdata", { state: data || {} })}>
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
                icon={<ReadOutlined />} colorIdx={1} label="Introduction"
                meta={content.introSection?.heading || "No heading set"}
                isSet={!!(content.introSection?.heading || content.introSection?.description)}
              />
              <SectionRow
                icon={<UnorderedListOutlined />} colorIdx={2} label="Golf Facts"
                meta={content.facts?.length ? `${content.facts.length} fact${content.facts.length !== 1 ? "s" : ""} listed` : "No facts added yet"}
                isSet={!!(content.facts?.length)}
              />

              {/* Facts preview */}
              {content.facts?.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 8, paddingLeft: 4 }}>
                    Facts Preview
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {content.facts.slice(0, 5).map((fact, idx) => (
                      <div key={idx} style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "8px 14px", background: "white",
                        borderRadius: 8, border: "1px solid #e2e8f0",
                      }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: "#0369a1",
                          background: "#eff6ff", borderRadius: 6,
                          padding: "2px 7px", flexShrink: 0,
                        }}>
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <span style={{ fontSize: 13, color: "#334155", fontWeight: 500 }}>
                          {fact.title || "Untitled"}
                        </span>
                      </div>
                    ))}
                    {content.facts.length > 5 && (
                      <div style={{ fontSize: 12, color: "#94a3b8", paddingLeft: 14 }}>
                        + {content.facts.length - 5} more facts
                      </div>
                    )}
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
                  Click "Edit Page" to update all sections
                </span>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "48px 20px", color: "#94a3b8" }}>
              <UnorderedListOutlined style={{ fontSize: 40, marginBottom: 12, display: "block" }} />
              <div style={{ fontWeight: 600, color: "#64748b", fontSize: 15, marginBottom: 6 }}>Not configured yet</div>
              <div style={{ fontSize: 13 }}>Click "Setup Page" to configure the Golf Facts page.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
