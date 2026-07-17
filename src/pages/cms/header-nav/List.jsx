import React, { useEffect, useState } from "react";
import { Modal, notification } from "antd";
import { EditOutlined, AppstoreOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { listHeaderNav } from "services/headerNav.service";
import { usePermissions } from "contexts/PermissionContext";
import "styles/admin-pages.css";

const parseContent = (raw) => {
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw || {};
    const items = Array.isArray(parsed.menu_items) 
      ? parsed.menu_items 
      : (Array.isArray(parsed) ? parsed : []);
    return { menu_items: items };
  } catch {
    return { menu_items: [] };
  }
};

export default function HeaderNavList() {
  const navigate = useNavigate();
  const PERMISSION = usePermissions("header_nav");
  const [data, setData] = useState(null);
  const [nextGenData, setNextGenData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sectionOpen, setSectionOpen] = useState(false);

  useEffect(() => {
    document.title = "PGTI || Header Navigation";
    const load = async () => {
      setIsLoading(true);
      const [mainRes, nextGenRes] = await Promise.all([
        listHeaderNav({ tour_type: "M" }),
        listHeaderNav({ tour_type: "F" }),
      ]);
      if (mainRes?.status) setData(mainRes.result || null);
      else notification.error({ message: mainRes?.message || "Failed to load Header Navigation" });
      if (nextGenRes?.status) setNextGenData(nextGenRes.result || null);
      setIsLoading(false);
    };
    load();
  }, []);

  const canEdit = PERMISSION?.list === "Y" || PERMISSION?.add_edit === "Y" || PERMISSION?.fullAccess === "Y";
  const hasMainRecord = Boolean(data?.id);
  const hasNextGenRecord = Boolean(nextGenData?.id);
  const displayData = hasMainRecord ? data : hasNextGenRecord ? nextGenData : null;
  const content = displayData ? parseContent(displayData.content || displayData) : { menu_items: [] };
  
  const rawMenuItems = Array.isArray(content.menu_items) ? content.menu_items : [];

  // Helper mapping to easily resolve parent item titles by ID
  const itemMap = React.useMemo(() => {
    const map = {};
    rawMenuItems.forEach((item) => {
      if (item.id) map[String(item.id)] = item.title;
    });
    return map;
  }, [rawMenuItems]);

  // Restructure, sort, and index items in parent-child hierarchy
  const processedMenuItems = React.useMemo(() => {
    // 1. Separate top-level items and children
    const parents = [];
    const childrenMap = {};

    rawMenuItems.forEach((item) => {
      const isChild = item.parent_id !== null && item.parent_id !== undefined && item.parent_id !== "";
      if (isChild) {
        const pId = String(item.parent_id);
        if (!childrenMap[pId]) {
          childrenMap[pId] = [];
        }
        childrenMap[pId].push(item);
      } else {
        parents.push(item);
      }
    });

    // 2. Sort parent items by sort_order
    parents.sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));

    // 3. Flatten tree structure and calculate index values
    const flattenedList = [];
    parents.forEach((parent, parentIdx) => {
      const parentDisplayIndex = `${parentIdx + 1}`;
      
      // Push parent with its structural index
      flattenedList.push({
        ...parent,
        displayIndex: parentDisplayIndex,
        isChild: false,
      });

      // Get and sort children of this parent
      const children = childrenMap[String(parent.id)] || [];
      children.sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));

      // Push children with nested index notation (e.g. 1.1, 1.2)
      children.forEach((child, childIdx) => {
        flattenedList.push({
          ...child,
          displayIndex: `${parentDisplayIndex}.${childIdx + 1}`,
          isChild: true,
        });
      });
    });

    return flattenedList;
  }, [rawMenuItems]);

  const topLevelCount = rawMenuItems.filter(
    (item) => item.parent_id === null || item.parent_id === undefined || item.parent_id === ""
  ).length;

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">Header Navigation</h1>
            <p className="page-subtitle">Manage the header navigation menu items.</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button
              className="action-button secondary"
              disabled={!canEdit}
              onClick={() => navigate("/admin/cms/header-nav/addeditdata", { state: hasMainRecord ? (hasNextGenRecord ? nextGenData : { tour_type: "F" }) : { tour_type: "M" } })}
            >
              <PlusOutlined /> {hasMainRecord ? (hasNextGenRecord ? "Edit NextGen Header Nav" : "Add NextGen Header Nav") : "Add Main Tour"}
            </button>
            <button
              className="action-button primary"
              disabled={!canEdit}
              onClick={() => navigate("/admin/cms/header-nav/addeditdata", { state: hasMainRecord ? data : (hasNextGenRecord ? nextGenData : { tour_type: "M" }) })}
            >
              <EditOutlined /> {hasMainRecord ? "Edit Header Nav" : (hasNextGenRecord ? "Edit NextGen Header Nav" : "Setup Header Nav")}
            </button>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="content-card-body">
          {isLoading ? (
            <div className="text-center" style={{ padding: 40, color: "#64748b" }}>Loading...</div>
          ) : displayData ? (
            <div style={{ display: "grid", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 18px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AppstoreOutlined style={{ color: "#1d4ed8", fontSize: 17 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#1e3a5f" }}>Header Navigation Settings</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    Currently displaying configured links for {displayData.tour_type === "M" ? "Main Tour" : "NextGen Tour"}.
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#16a34a", background: "#f0fdf4", border: "1px solid #86efac", padding: "3px 12px", borderRadius: 20 }}>
                  ✓ Configured
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
                <div style={{ padding: 18, background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>Total Menu Items</div>
                  <div style={{ fontWeight: 600, color: "#0f172a" }}>{rawMenuItems.length}</div>
                </div>
                <div style={{ padding: 18, background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>Top Level Items</div>
                  <div style={{ fontWeight: 600, color: "#0f172a" }}>{topLevelCount}</div>
                </div>
              </div>

              {/* Detailed Preview Table */}
              <div style={{ padding: 18, background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1e3a5f", marginBottom: 12 }}>Detailed Menu Structure</div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                        <th style={{ padding: "10px 8px", width: "80px" }}>No.</th>
                        <th style={{ padding: "10px 8px" }}>Menu Title</th>
                        <th style={{ padding: "10px 8px" }}>URL / Slug</th>
                        <th style={{ padding: "10px 8px" }}>Parent Item</th>
                        <th style={{ padding: "10px 8px", textAlign: "center" }}>Order</th>
                        <th style={{ padding: "10px 8px", textAlign: "center" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processedMenuItems.length > 0 ? (
                        processedMenuItems.map((item) => {
                          const hasParent = item.isChild;
                          const parentName = hasParent ? (itemMap[String(item.parent_id)] || "Unknown Parent") : "—";
                          
                          return (
                            <tr key={String(item.id) || item.slug || Math.random()} style={{ borderBottom: "1px solid #f1f5f9", background: hasParent ? "#fdfefe" : "transparent" }}>
                              {/* Display Index Column */}
                              <td style={{ padding: "12px 8px", fontWeight: 600, color: "#64748b", paddingLeft: hasParent ? "24px" : "8px" }}>
                                {item.displayIndex}
                              </td>
                              <td style={{ padding: "12px 8px", fontWeight: hasParent ? 400 : 600, color: "#0f172a" }}>
                                {hasParent ? (
                                  <span style={{ color: "#94a3b8", marginRight: 6 }}>↳ {item.title || "Untitled"}</span>
                                ) : (
                                  item.title || "Untitled"
                                )}
                              </td>
                              <td style={{ padding: "12px 8px", color: "#64748b", fontFamily: "monospace", fontSize: 12 }}>
                                {item.slug || "—"}
                              </td>
                              <td style={{ padding: "12px 8px", color: hasParent ? "#3b82f6" : "#94a3b8" }}>
                                {parentName}
                              </td>
                              <td style={{ padding: "12px 8px", textAlign: "center", fontWeight: 600, color: "#64748b" }}>
                                {item.sort_order ?? 0}
                              </td>
                              <td style={{ padding: "12px 8px", textAlign: "center" }}>
                                <span style={{
                                  fontSize: 11,
                                  fontWeight: 600,
                                  padding: "2px 8px",
                                  borderRadius: 12,
                                  border: item.status === "A" ? "1px solid #86efac" : "1px solid #fca5a5",
                                  background: item.status === "A" ? "#f0fdf4" : "#fef2f2",
                                  color: item.status === "A" ? "#16a34a" : "#dc2626"
                                }}>
                                  {item.status === "A" ? "Active" : "Inactive"}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} style={{ textAlign: "center", padding: "20px 0", color: "#94a3b8" }}>
                            No menu items configured yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "48px 20px", color: "#94a3b8" }}>
              <AppstoreOutlined style={{ fontSize: 40, marginBottom: 12, display: "block" }} />
              <div style={{ fontWeight: 600, color: "#64748b", fontSize: 15, marginBottom: 6 }}>Not configured yet</div>
              <div style={{ fontSize: 13 }}>Click "Setup Header Nav" to configure header navigation items.</div>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={sectionOpen}
        onCancel={() => setSectionOpen(false)}
        footer={null}
        width={420}
        centered
        destroyOnClose
      >
        <div style={{ paddingTop: 6 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>
            Header Navigation
          </div>
          <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7, marginBottom: 18 }}>
            Use this module to manage navigation items shown in the main header.
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
            <button type="button" className="action-button secondary" onClick={() => setSectionOpen(false)}>
              Close
            </button>
            <button
              type="button"
              className="action-button primary"
              onClick={() => {
                setSectionOpen(false);
                navigate("/admin/cms/header-nav/addeditdata", { state: displayData || { tour_type: "M" } });
              }}
            >
              <EditOutlined /> Edit
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}