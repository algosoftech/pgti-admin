import React from "react";
import { CopyOutlined, SaveOutlined } from "@ant-design/icons";

export default function CmsSetupTopActions({
  tourType = "M",
  onCopyFromMain,
  onSaveAll,
  saveAllDisabled = true,
  isWorking = false,
}) {
  const isNextGen = String(tourType || "M").toUpperCase() === "F";

  return (
    <div className="content-card" style={{ marginBottom: 20 }}>
      <div className="content-card-body">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
              Tour Page Actions
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
              Copy Main Tour content into this draft, or save the currently edited section from here.
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button
              type="button"
              className="action-button secondary"
              onClick={onCopyFromMain}
              disabled={!isNextGen || isWorking}
              title={isNextGen ? "Copy content from Main Tour into this NextGen draft" : "Available only while editing NextGen"}
            >
              <CopyOutlined /> Copy from Main Tour
            </button>
            <button
              type="button"
              className="action-button primary"
              onClick={onSaveAll}
              disabled={saveAllDisabled || isWorking}
              title={saveAllDisabled ? "No unsaved section is currently in edit mode" : "Save the currently edited section"}
            >
              <SaveOutlined /> Save All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
