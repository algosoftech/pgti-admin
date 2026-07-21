import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { notification, Modal } from "antd";
import { 
  ArrowLeftOutlined, 
  SaveOutlined, 
  PlusOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  EyeInvisibleOutlined 
} from "@ant-design/icons";
import { addEditHeaderNav, listHeaderNav } from "services/headerNav.service";
import { FieldHint } from "components/ui/FieldHint";
import { TOUR_TYPE_OPTIONS } from "utils/tourType";
import "styles/admin-pages.css";

// Generate numeric-friendly unique IDs on the frontend
const createEmptyItem = (order, parentId = null) => ({
  id: Date.now() + Math.floor(Math.random() * 1000),
  title: "",
  slug: "",
  parent_id: parentId,
  sort_order: order,
  status: "A",
});

const parseContent = (raw) => {
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw || {};
    const items = Array.isArray(parsed.menu_items) 
      ? parsed.menu_items 
      : (Array.isArray(parsed) ? parsed : []);
    return {
      menu_items: items.map((item, index) => ({
        id: item?.id ? Number(item.id) : null,
        title: String(item?.title || ""),
        slug: String(item?.slug || "").trim(),
        parent_id: item?.parent_id !== undefined && item?.parent_id !== null && item?.parent_id !== ""
          ? Number(item.parent_id)
          : null,
        sort_order: Number.isFinite(Number(item?.sort_order)) ? Number(item.sort_order) : index + 1,
        status: ["A", "I"].includes(String(item?.status || "A").trim().toUpperCase())
          ? String(item.status || "A").trim().toUpperCase()
          : "A",
      })),
    };
  } catch {
    return { menu_items: [] };
  }
};

const normalizeMenuItems = (items) => {
  const mapped = items.map((item, index) => ({
    id: item.id ? Number(item.id) : null,
    title: String(item.title || ""),
    slug: String(item.slug || "").trim(),
    parent_id: item.parent_id === "" || item.parent_id === null || item.parent_id === undefined
      ? null
      : Number(item.parent_id),
    sort_order: Number.isFinite(Number(item.sort_order)) ? Number(item.sort_order) : index + 1,
    status: ["A", "I"].includes(String(item.status || "A").trim().toUpperCase())
      ? String(item.status || "A").trim().toUpperCase()
      : "A",
  }));

  const roots = mapped
    .filter((it) => it.parent_id === null)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((root, rootIdx) => ({
      ...root,
      sort_order: rootIdx + 1,
    }));

  const finalizedList = [];

  roots.forEach((parent) => {
    finalizedList.push(parent);
    const children = mapped
      .filter((it) => it.parent_id !== null && Number(it.parent_id) === Number(parent.id))
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((child, childIdx) => ({
        ...child,
        sort_order: childIdx + 1,
      }));
    finalizedList.push(...children);
  });

  mapped.forEach((item) => {
    if (!finalizedList.some((it) => it.id === item.id)) {
      finalizedList.push(item);
    }
  });

  return finalizedList;
};

export default function HeaderNavAddEditData() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location?.state || {};
  const [id, setId] = useState(state?.id ?? "");
  const [status, setStatus] = useState(state?.status ?? "A");
  const [tourType, setTourType] = useState(state?.tour_type ?? state?.result?.tour_type ?? "M");
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!Boolean(state?.id || state?.content || state?.result?.content));

  const rawContent = useMemo(() => state?.content ?? state?.result?.content ?? state, [state]);
  useEffect(() => {
    const parsed = parseContent(rawContent);
    if (parsed) {
      setMenuItems(parsed.menu_items.length ? parsed.menu_items : []);
    }
  }, [rawContent]);

  useEffect(() => {
    if (state?.id || state?.content || state?.result?.content) return;
    const load = async () => {
      setIsFetching(true);
      const res = await listHeaderNav({ tour_type: tourType });
      if (res?.status) {
        const record = res.result || {};
        setId(record.id || "");
        setStatus(record.status || "A");
        setMenuItems(parseContent(record.content || record).menu_items || []);
      }
      setIsFetching(false);
    };
    load();
  }, [state, tourType]);

  // Hierarchically sorted list for rendering
  const orderedMenuItems = useMemo(() => {
    return normalizeMenuItems(menuItems);
  }, [menuItems]);

  const handleAddItem = () => {
    setMenuItems((prev) => [...prev, createEmptyItem(prev.length + 1)]);
  };

  const handleAddChildItem = (parentId) => {
    setMenuItems((prev) => {
      // Find current children of this parent to calculate sort order
      const existingChildren = prev.filter((item) => Number(item.parent_id) === Number(parentId));
      const nextSortOrder = existingChildren.length + 1;
      const newChild = createEmptyItem(nextSortOrder, Number(parentId));
      return [...prev, newChild];
    });
  };

  const getChildCount = (itemId) => {
    return menuItems.filter((item) => Number(item.parent_id) === Number(itemId)).length;
  };

  const handleRemoveItem = (itemId) => {
    const childCount = getChildCount(itemId);

    const performDelete = () => {
      setMenuItems((prev) => {
        const filtered = prev.filter(
          (item) => item.id !== itemId && Number(item.parent_id) !== Number(itemId)
        );
        return normalizeMenuItems(filtered);
      });

      notification.success({
        message: childCount > 0 
          ? `Deleted item and its ${childCount} sub-menu item(s).` 
          : "Menu item deleted successfully."
      });
    };

    if (childCount > 0) {
      Modal.confirm({
        title: "Delete parent menu item?",
        content: `This item contains ${childCount} sub-menu item(s). Deleting this parent will also permanently delete all of its nested children. Are you sure you want to proceed?`,
        okText: "Yes, delete all",
        okType: "danger",
        cancelText: "Cancel",
        onOk() {
          performDelete();
        },
      });
    } else {
      performDelete();
    }
  };

  const handleItemChange = (itemId, field, value) => {
    setMenuItems((prev) => prev.map((item) => {
      if (item.id !== itemId) return item;
      return { ...item, [field]: value };
    }));
  };

  const handleMove = (currentIndex, direction) => {
    // Find the item we want to move from the hierarchically ordered list
    const itemToMove = orderedMenuItems[currentIndex];
    if (!itemToMove) return;

    // Isolate siblings (items sharing the exact same parent)
    const siblings = menuItems
      .filter((it) => 
        itemToMove.parent_id === null 
          ? it.parent_id === null 
          : Number(it.parent_id) === Number(itemToMove.parent_id)
      )
      .sort((a, b) => a.sort_order - b.sort_order);

    const siblingIndex = siblings.findIndex((it) => it.id === itemToMove.id);
    const targetSiblingIndex = siblingIndex + direction;

    if (targetSiblingIndex < 0 || targetSiblingIndex >= siblings.length) return;

    // Swap positions
    const temp = siblings[siblingIndex];
    siblings[siblingIndex] = siblings[targetSiblingIndex];
    siblings[targetSiblingIndex] = temp;

    // Update their individual sort sequences
    const updatedSiblings = siblings.map((item, idx) => ({
      ...item,
      sort_order: idx + 1,
    }));

    // Merge changes back into state
    setMenuItems((prev) => {
      const updatedMap = new Map(updatedSiblings.map((it) => [it.id, it]));
      return prev.map((item) => updatedMap.get(item.id) || item);
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!menuItems.length) {
      notification.error({ message: "Add at least one menu item." });
      return;
    }

    const invalidItem = menuItems.find((item) => !item.title);
    if (invalidItem) {
      notification.error({ message: "Each menu item requires a title." });
      return;
    }

  try {
      setIsLoading(true);
      const res = await addEditHeaderNav({
        edit_id: id || undefined,
        status,
        tour_type: tourType,
        menu_items: normalizeMenuItems(menuItems),
      });

      // Check if the save was successful
      if (res?.status) {
        notification.success({ 
          message: id ? "Header Navigation updated successfully." : "Header Navigation added successfully." 
        });
        // Redirect to the listing page
        navigate("/admin/cms/header-nav/list");
      } else {
        notification.error({ 
          message: res?.message || "Failed to save Header Navigation." 
        });
      }
    } catch (error) {
      notification.error({ message: "An error occurred while saving." });
    } finally {
      setIsLoading(false);
    }
  };
const handleCopyToNextGen = async () => {
  try {
    setIsFetching(true);
    // Fetch the navigation data belonging to the Main Tour ('M')
    const res = await listHeaderNav({ tour_type: "M" });
    if (res?.status) {
      const mainRecord = res.result || {};
      const mainItems = parseContent(mainRecord.content || mainRecord).menu_items || [];
      
      if (mainItems.length === 0) {
        notification.warning({ message: "No menu items found in Main Tour to copy." });
        setIsFetching(false);
        return;
      }

      // Deep copy the main tour items while generating fresh IDs to avoid frontend React conflicts
      const idMapping = {};
      
      // Step 1: Pre-generate new IDs for all copied items
      mainItems.forEach(item => {
        idMapping[item.id] = Date.now() + Math.floor(Math.random() * 10000) + Math.random();
      });

      const duplicatedItems = mainItems.map(item => ({
        ...item,
        id: idMapping[item.id],
        // Re-map the parent_id relation using the newly assigned parent ID mapping
        parent_id: item.parent_id ? idMapping[item.parent_id] : null,
      }));

      setMenuItems(duplicatedItems);
      notification.success({ message: "Successfully cloned navigation items from Main Tour!" });
    } else {
      notification.error({ message: "Failed to fetch Main Tour data for cloning." });
    }
  } catch (error) {
    notification.error({ message: "An error occurred while copying Main Tour data." });
  } finally {
    setIsFetching(false);
  }
};
  return (
    <div className="admin-page-container">
      {/* <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">{id ? "Edit Header Navigation" : "Setup Header Navigation"}</h1>
            <p className="page-subtitle">Configure header menu items shown in the public header.</p>
          </div>
          <Link to="/admin/cms/header-nav/list">
            <button className="action-button secondary" type="button">
              <ArrowLeftOutlined /> Back to Header Navigation
            </button>
          </Link>
        </div>
      </div> */}
<div className="page-header">
  <div className="d-flex justify-content-between align-items-center">
    <div>
      <h1 className="page-title">{id ? "Edit Header Navigation" : "Setup Header Navigation"}</h1>
      <p className="page-subtitle">Configure header menu items shown in the public header.</p>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
  {(tourType === "F" || state?.tour_type === "F" || state?.result?.tour_type === "F") && (
  <button 
    type="button" 
    className="action-button secondary" 
   
    onClick={handleCopyToNextGen}
  >
    Copy from Main Tour
  </button>
)}
      <Link to="/admin/cms/header-nav/list">
        <button className="action-button secondary" type="button">
          <ArrowLeftOutlined /> Back to Header Navigation
        </button>
      </Link>
    </div>
  </div>
</div>
      {isFetching ? (
        <div className="content-card">
          <div className="content-card-body text-center" style={{ padding: 40, color: "#64748b" }}>
            Loading...
          </div>
        </div>
      ) : (
        <div className="content-card">
          <div className="content-card-body">
            <form onSubmit={handleSubmit} className="modern-form">
              
              {/* Form Settings Header */}
              <div className="form-section" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
                <div className="form-group">
                  <label htmlFor="tour_type" className="form-label">Tour Type</label>
                  <select
                    id="tour_type"
                    className="form-input"
                    value={tourType}
                    onChange={(e) => setTourType(e.target.value)}
                  >
                    {TOUR_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <FieldHint text="Choose which tour navigation this header configuration belongs to." />
                </div>

                <div className="form-group">
                  <label htmlFor="status" className="form-label">Status</label>
                  <select
                    id="status"
                    className="form-input"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="A">Active</option>
                    <option value="I">Inactive</option>
                  </select>
                  <FieldHint text="Inactive header nav configuration will not be used on the public site." />
                </div>
              </div>

              {/* Menu Items Section */}
              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
                  <div>
                    <h3 className="form-section-title" style={{ marginBottom: 4, fontSize: 16, fontWeight: 700, color: "#1e3a5f" }}>Menu Items</h3>
                    <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
                      Manage menu items, URLs, sub-menus, visibility, and sorting. Use ↑↓ to reorder siblings.
                    </p>
                  </div>
                  <button type="button" className="action-button secondary" style={{ fontSize: 13 }} onClick={handleAddItem}>
                    <PlusOutlined /> Add Parent Item
                  </button>
                </div>

                {orderedMenuItems.length === 0 ? (
                  <div style={{ padding: 32, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, textAlign: "center", color: "#64748b" }}>
                    No menu items added yet. Click "Add Parent Item" to begin.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                    {orderedMenuItems.map((item, index) => {
                      const isChild = item.parent_id !== null;
                      const hasChildren = getChildCount(item.id) > 0;

                      // Find index of item in the flat raw state array to perform direct updates
                      const stateIndex = menuItems.findIndex((it) => it.id === item.id);

                      return (
                        <div 
                          key={item.id || index} 
                          style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: 8, 
                            padding: "8px 12px", 
                            background: item.status === "A" ? (isChild ? "#fcfcfc" : "#fff") : "#f8fafc", 
                            borderRadius: 10, 
                            border: `1px solid ${item.status === "A" ? "#e2e8f0" : "#cbd5e1"}`, 
                            opacity: item.status === "A" ? 1 : 0.65,
                            marginLeft: isChild ? 32 : 0, // Indent child items visually
                            position: "relative",
                            transition: "all 0.2s ease"
                          }}
                        >
                          {/* Visual hierarchical indicator line */}
                          {isChild && (
                            <div style={{
                              position: "absolute",
                              left: -18,
                              top: "50%",
                              width: 14,
                              height: 1,
                              background: "#cbd5e1"
                            }} />
                          )}

                          {/* Row Index Indicator */}
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", minWidth: 20, textAlign: "center" }}>
                            {isChild ? "↳" : index + 1}
                          </span>

                          {/* Title Field */}
                          <input 
                            className="form-input" 
                            value={item.title} 
                            onChange={(e) => handleItemChange(item.id, "title", e.target.value)} 
                            placeholder={isChild ? "Sub-menu Title" : "Menu Title (e.g. Tours)"} 
                            style={{ flex: "0 0 200px", fontSize: 13, padding: "6px 10px", margin: 0 }} 
                            required
                          />

                          {/* URL/Slug Field */}
                          <input 
                            className="form-input" 
                            value={item.slug} 
                            readOnly
  style={{
    flex: 1,
    fontSize: 13,
    padding: "6px 10px",
    margin: 0,
    backgroundColor: "#f5f5f5",
    cursor: "not-allowed",
  }}
                           
                          />

                          {/* Inline Parent Indicator or "+ Sub-item" trigger */}
                          <div style={{ flex: "0 0 160px", display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                            {isChild ? (
                              <span style={{ fontSize: 11, color: "#64748b", background: "#f1f5f9", padding: "4px 8px", borderRadius: 6 }}>
                                Sub-item
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="action-button secondary"
                                style={{ fontSize: 11, padding: "3px 8px", margin: 0 }}
                                onClick={() => handleAddChildItem(item.id)}
                              >
                                <PlusOutlined /> Add Sub-item
                              </button>
                            )}
                          </div>

                          {/* Sort Order Display */}
                          <input
                            type="number"
                            className="form-input"
                            min={1}
                            value={item.sort_order}
                            onChange={(e) => handleItemChange(item.id, "sort_order", Number(e.target.value))}
                            style={{ width: 65, fontSize: 13, padding: "6px 5px", textAlign: "center", margin: 0 }}
                          />

                         {/* Visibility Toggle Action */}
{/* Visually Explicit Status Toggle Button */}
<button 
  type="button" 
  onClick={() => handleItemChange(item.id, "status", item.status === "A" ? "I" : "A")} 
  style={{
    fontSize: "11px",
    fontWeight: "bold",
    padding: "4px 8px",
    borderRadius: "6px",
    border: "1px solid",
    cursor: "pointer",
    minWidth: "75px",
    textAlign: "center",
    backgroundColor: item.status === "A" ? "#dcfce7" : "#f1f5f9",
    borderColor: item.status === "A" ? "#bbf7d0" : "#cbd5e1",
    color: item.status === "A" ? "#16a34a" : "#475569",
    transition: "all 0.2s ease"
  }}
>
  {item.status === "A" ? "Active" : "Inactive"}
</button>

                          {/* Reordering Controls (Only sorts among local siblings) */}
                          <button 
                            type="button" 
                            className="action-button secondary" 
                            style={{ fontSize: 11, padding: "3px 8px" }} 
                            onClick={() => handleMove(index, -1)} 
                          >
                            ↑
                          </button>
                          <button 
                            type="button" 
                            className="action-button secondary" 
                            style={{ fontSize: 11, padding: "3px 8px" }} 
                            onClick={() => handleMove(index, 1)} 
                          >
                            ↓
                          </button>

                          {/* Cascade Delete Control */}
                          <button 
                            type="button" 
                            className="action-button danger" 
                            style={{ fontSize: 11, padding: "4px 8px" }} 
                            onClick={() => handleRemoveItem(item.id)}
                            title={hasChildren ? `Delete item and its sub-items` : `Delete item`}
                          >
                            <DeleteOutlined />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="form-actions" style={{ display: "flex", gap: 10, flexWrap: "wrap", borderTop: "1px solid #e2e8f0", paddingTop: 20 }}>
                <button type="button" className="action-button secondary" onClick={() => navigate("/admin/cms/header-nav/list")}>Cancel</button>
                <button type="submit" className="action-button primary" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="loading-spinner small" /> Saving...
                    </>
                  ) : (
                    <>
                      <SaveOutlined /> Save Header Nav
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}