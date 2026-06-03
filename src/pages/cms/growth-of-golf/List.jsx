import React, { useEffect, useState } from "react";
import { Modal, notification } from "antd";
import {
  EditOutlined,
  FileTextOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  PictureOutlined,
  PlusOutlined,
  ReadOutlined,
  StarOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { listGrowthOfGolf } from "services/growthOfGolf.service";
import "styles/admin-pages.css";

const SECTION_LABELS = [
  {
    key: "heroBanner",
    label: "Hero Banner",
    desc: "Top banner image, title and subtitle shown on the Growth of Golf page",
    icon: <PictureOutlined />,
  },
  {
    key: "formationSection",
    label: "Formation of Indian Golf Union",
    desc: "Main historical introduction, side image, side title and side subtitle block",
    icon: <ReadOutlined />,
  },
  {
    key: "founderClubsSection",
    label: "Founder Clubs & Documents",
    desc: "Founder club cards, descriptions, optional image and PDF download attachment",
    icon: <FileTextOutlined />,
  },
  {
    key: "firstPresidentSection",
    label: "First President",
    desc: "Profile block with president name, biography and supporting image",
    icon: <StarOutlined />,
  },
  {
    key: "milestonesSection",
    label: "Milestones in Indian Golf",
    desc: "Year-wise cards and highlight panel for milestone content",
    icon: <HistoryOutlined />,
  },
  {
    key: "championsSection",
    label: "Legendary Amateur Champions",
    desc: "Champion rows shown near the bottom of the page",
    icon: <TrophyOutlined />,
  },
];

export default function GrowthOfGolfList() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [nextGenData, setNextGenData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sectionAction, setSectionAction] = useState({ open: false, key: "" });

  useEffect(() => {
    document.title = "PGTI || Growth of Golf CMS";
    const load = async () => {
      setIsLoading(true);
      const [mainRes, nextGenRes] = await Promise.all([
        listGrowthOfGolf({ tour_type: "M" }),
        listGrowthOfGolf({ tour_type: "F" }),
      ]);
      if (mainRes?.status) setData(mainRes.result || null);
      else notification.error({ message: mainRes?.message || "Failed to load Growth of Golf data" });
      if (nextGenRes?.status) setNextGenData(nextGenRes.result || null);
      setIsLoading(false);
    };
    load();
  }, []);

  const hasMainRecord = Boolean(data?.id);
  const hasNextGenRecord = Boolean(nextGenData?.id);
  const displayData = hasMainRecord ? data : (hasNextGenRecord ? nextGenData : null);
  const isConfigured = Boolean(displayData?.id);
  const selectedSection = SECTION_LABELS.find((item) => item.key === sectionAction.key) || null;

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">Growth of Golf</h1>
            <p className="page-subtitle">Manage the standalone Indian Golf History / Growth of Golf page setup</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button
              className="action-button secondary"
              onClick={() => navigate("/admin/cms/growth-of-golf/addeditdata", { state: hasMainRecord ? (hasNextGenRecord ? nextGenData : { tour_type: "F" }) : { tour_type: "M" } })}
            >
              <PlusOutlined /> {hasMainRecord ? (hasNextGenRecord ? "Edit NextGen Growth" : "Add NextGen Growth") : "Add Main Tour"}
            </button>
            <button
              className="action-button primary"
              onClick={() => navigate("/admin/cms/growth-of-golf/addeditdata", { state: hasMainRecord ? data : (hasNextGenRecord ? nextGenData : { tour_type: "M" }) })}
            >
              <EditOutlined /> {hasMainRecord ? "Edit Page" : (hasNextGenRecord ? "Edit NextGen Page" : "Setup Page")}
            </button>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="content-card-body">
          {isLoading ? (
            <div className="text-center" style={{ padding: 40, color: "#64748b" }}>Loading...</div>
          ) : isConfigured ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "14px 18px",
                  background: "#f8fafc",
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    flexShrink: 0,
                    background: "#eff6ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FileTextOutlined style={{ color: "#1d4ed8", fontSize: 17 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#1e3a5f" }}>Growth of Golf Page</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    Section-wise custom page setup for the separate Indian Golf History / Growth of Golf frontend page.
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#16a34a",
                    background: "#f0fdf4",
                    border: "1px solid #86efac",
                    padding: "3px 12px",
                    borderRadius: 20,
                    flexShrink: 0,
                  }}
                >
                  Configured
                </span>
              </div>

              <p style={{ fontSize: 13, color: "#64748b", marginBottom: 8, marginTop: 6 }}>
                <InfoCircleOutlined style={{ marginRight: 6 }} />
                Click any section below to jump directly into editing that section.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
                {SECTION_LABELS.map(({ key, label, desc, icon }) => (
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
                      {React.cloneElement(icon, { style: { color: "#1d4ed8", fontSize: 15 } })}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 12, color: "#1e3a5f" }}>{label}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{desc}</div>
                    </div>
                    <EditOutlined style={{ color: "#94a3b8" }} />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "48px 20px", color: "#94a3b8" }}>
              <StarOutlined style={{ fontSize: 40, marginBottom: 12, display: "block" }} />
              <div style={{ fontWeight: 600, color: "#64748b", fontSize: 15, marginBottom: 6 }}>Not configured yet</div>
              <div style={{ fontSize: 13 }}>Click "Setup Page" to configure the Growth of Golf page.</div>
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
                onClick={() =>
                  navigate("/admin/cms/growth-of-golf/addeditdata", {
                    state: { ...(displayData || {}), openSectionKey: selectedSection.key },
                  })
                }
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
