import React, { useEffect, useState } from "react";
import { Collapse, notification } from "antd";
import { EditOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandshake } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

import { listTourPartners } from "services/tourPartners.service";
import { usePermissions } from "contexts/PermissionContext";
import "styles/admin-pages.css";

const SectionPreviewCard = ({ icon, title, value }) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      padding: "14px 16px",
      borderRadius: 8,
      background: "#f8fafc",
      border: "1px solid #e2e8f0",
      marginBottom: 10,
    }}
  >
    <span style={{ fontSize: 18, color: "#0369a1", marginTop: 1 }}>{icon}</span>
    <div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: 2,
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 13, color: "#334155" }}>{value || <span style={{ color: "#94a3b8" }}>Not set</span>}</div>
    </div>
  </div>
);

export default function TourPartnersList() {
  const navigate = useNavigate();
  const PERMISSION = usePermissions("FULL");
  const user = JSON.parse(sessionStorage.getItem("ADMIN-INFO"));

  const [data, setData] = useState(null);
  const [nextGenData, setNextGenData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "PGTI || Admin || Tour Partners CMS";
    const load = async () => {
      setIsLoading(true);
      const [mainRes, nextGenRes] = await Promise.all([
        listTourPartners({ tour_type: "M" }),
        listTourPartners({ tour_type: "F" }),
      ]);
      if (mainRes?.status) {
        setData(mainRes.result || {});
      } else {
        notification.error({ message: mainRes?.message || "Failed to load Tour Partners data" });
      }
      if (nextGenRes?.status) setNextGenData(nextGenRes.result || null);
      setIsLoading(false);
    };
    load();
  }, []);

  const canEdit = user?.admin_type === "Super Admin" || PERMISSION?.permissions?.tour_partners?.list === "Y";
  const hasMainRecord = Boolean(data?.id);
  const hasNextGenRecord = Boolean(nextGenData?.id);
  const displayData = hasMainRecord ? data : (hasNextGenRecord ? nextGenData : null);

  const content =
    displayData?.content && typeof displayData.content === "string"
      ? (() => {
          try {
            return JSON.parse(displayData.content);
          } catch {
            return {};
          }
        })()
      : displayData?.content || {};

  const tourPartnerCards = content?.tourPartnersSection?.partners || [];
  const pgtiPartnerCards = content?.pgtiPartnersSection?.partners || [];
  const tourLogos = content?.tourPartnersSection?.logos || [];
  const pgtiLogos = content?.pgtiPartners?.logos || [];

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">Tour Partners Page</h1>
            <p className="page-subtitle">
              Manage the updated Tour Partners page: hero and Tour/PGTI partner cards. The bottom logo strips are derived automatically from those rows.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button
              className="action-button secondary"
              disabled={isLoading}
              onClick={() => navigate("/admin/cms/tour-partners/addeditdata", { state: hasMainRecord ? (hasNextGenRecord ? nextGenData : { tour_type: "F" }) : { tour_type: "M" } })}
            >
              <PlusOutlined /> {hasMainRecord ? (hasNextGenRecord ? "Edit NextGen Tour Partners" : "Add NextGen Tour Partners") : "Add Main Tour"}
            </button>
            <button
              className="action-button primary"
              disabled={isLoading}
              onClick={() => navigate("/admin/cms/tour-partners/addeditdata", { state: hasMainRecord ? data : (hasNextGenRecord ? nextGenData : { tour_type: "M" }) })}
            >
              {hasMainRecord ? (
                <>
                  <EditOutlined /> Edit Page
                </>
              ) : hasNextGenRecord ? (
                <>
                  <EditOutlined /> Edit NextGen Page
                </>
              ) : (
                <>
                  <PlusOutlined /> Setup Page
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="content-card-body">
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <div className="loading-text">Loading page data...</div>
            </div>
          ) : displayData && displayData.id ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <span className={`status-badge ${displayData.status === "A" ? "active" : "inactive"}`}>
                  {displayData.status === "A" ? "Active" : "Inactive"}
                </span>
                <span style={{ color: "#94a3b8", fontSize: 13 }}>Record ID: {displayData.id}</span>
                {nextGenData?.id && (
                  <span style={{ color: "#94a3b8", fontSize: 13 }}>NextGen Record ID: {nextGenData.id}</span>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
                <SectionPreviewCard icon="🎯" title="Hero Banner" value={content?.heroBanner?.title || "Not set"} />
                <SectionPreviewCard
                  icon="🤝"
                  title="Tour Partners Content"
                  value={`Heading: "${content?.tourPartnersSection?.heading || "Not set"}" — ${tourPartnerCards.length} partner card(s)`}
                />
                <SectionPreviewCard
                  icon="🏌️"
                  title="PGTI Partners Content"
                  value={`${pgtiPartnerCards.length} partner card(s)`}
                />
                <SectionPreviewCard
                  icon="🔗"
                  title="PGTI Partners Strip"
                  value={`${pgtiLogos.length} auto-derived logo(s)`}
                />
                <SectionPreviewCard
                  icon="🎗"
                  title="Tour Partners Strip"
                  value={`${tourLogos.length} auto-derived logo(s)`}
                />
              </div>

              <div style={{ marginTop: 18 }}>
                <Collapse
                  bordered={false}
                  style={{ background: "#fff" }}
                  items={[
                    {
                      key: "tour-partners",
                      label: `Tour Partners rows (${tourPartnerCards.length})`,
                      children: (
                        <div style={{ display: "grid", gap: 10 }}>
                          {tourPartnerCards.map((partner, index) => (
                            <div
                              key={`tour-${index}`}
                              style={{ padding: "12px 14px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#f8fafc" }}
                            >
                              <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
                                {partner?.title || `Tour Partner ${index + 1}`}
                              </div>
                              <div style={{ fontSize: 12, color: "#64748b" }}>
                                {(partner?.descriptions || []).filter(Boolean).length} paragraph(s)
                              </div>
                            </div>
                          ))}
                        </div>
                      ),
                    },
                    {
                      key: "pgti-partners",
                      label: `PGTI Partners rows (${pgtiPartnerCards.length})`,
                      children: (
                        <div style={{ display: "grid", gap: 10 }}>
                          {pgtiPartnerCards.map((partner, index) => (
                            <div
                              key={`pgti-${index}`}
                              style={{ padding: "12px 14px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#f8fafc" }}
                            >
                              <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
                                {partner?.title || `PGTI Partner ${index + 1}`}
                              </div>
                              <div style={{ fontSize: 12, color: "#64748b" }}>
                                {(partner?.descriptions || []).filter(Boolean).length} paragraph(s)
                              </div>
                            </div>
                          ))}
                        </div>
                      ),
                    },
                  ]}
                />
              </div>

              <div
                style={{
                  marginTop: 20,
                  padding: "12px 16px",
                  background: "#f0f9ff",
                  borderRadius: 8,
                  borderLeft: "3px solid #0ea5e9",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <EyeOutlined style={{ color: "#0369a1" }} />
                <span style={{ fontSize: 13, color: "#0369a1" }}>
                  Click <strong>"Edit Page"</strong> to update the partner cards. The bottom strips update from those rows automatically.
                </span>
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ padding: "40px 0" }}>
              <div className="empty-state-icon">
                <FontAwesomeIcon icon={faHandshake} />
              </div>
              <h3 className="empty-state-title">Tour Partners page not configured yet</h3>
              <p className="empty-state-description">
                Click "Setup Page" to add the hero and the Tour/PGTI partner cards. The bottom partner logo strips will be generated automatically.
              </p>
              {canEdit && (
                <button
                  className="action-button primary"
                  style={{ marginTop: 16 }}
                  onClick={() => navigate("/admin/cms/tour-partners/addeditdata", { state: { tour_type: "M" } })}
                >
                  <PlusOutlined /> Setup Page
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
