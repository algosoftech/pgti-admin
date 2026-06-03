import React, { useCallback, useEffect, useMemo, useState } from "react";
import { notification } from "antd";
import {
  CheckCircleOutlined,
  DollarOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import Top_navbar from "components/layout/TopNavbar";
import LoadingEffect from "components/ui/Loading/LoadingEffect";
import { usePermissions } from "contexts/PermissionContext";
import {
  listQualifierBookingSettings,
  saveQualifierBookingSetting,
} from "services/qualifierBooking.service";
import "styles/admin-pages.css";

const toDatetimeLocalValue = (value = "") => {
  if (!value) return "";
  return String(value).replace(" ", "T").slice(0, 16);
};

const fromDatetimeLocalValue = (value = "") => {
  if (!value) return "";
  const normalized = value.replace("T", " ");
  return normalized.length === 16 ? `${normalized}:00` : normalized;
};

const notify = (message, description, isSuccess = false) =>
  notification.open({
    message,
    description,
    placement: "topRight",
    icon: isSuccess ? (
      <CheckCircleOutlined style={{ color: "green" }} />
    ) : (
      <InfoCircleOutlined style={{ color: "red" }} />
    ),
    duration: 3,
  });

const mapRow = (row = {}) => ({
  ...row,
  booking_fee: row.booking_fee || "",
  start_at_local: toDatetimeLocalValue(row.start_at),
  end_at_local: toDatetimeLocalValue(row.end_at),
  booking_enabled: Boolean(row.booking_enabled),
  isSaving: false,
});

export default function QualifierBookingSettings() {
  const permission = usePermissions("qualifier_booking");
  const user = JSON.parse(sessionStorage.getItem("ADMIN-INFO") || "{}");
  const canEdit =
    user?.admin_type === "Super Admin" ||
    permission?.add_edit === "Y" ||
    permission?.fullAccess === "Y";

  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadRows = useCallback(async () => {
    setIsLoading(true);
    const response = await listQualifierBookingSettings();
    if (response?.status) {
      setRows((response.result || []).map(mapRow));
    } else {
      notify("Oops!", response?.message || "Failed to load qualifier booking settings.");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    document.title = "PGTI || Admin || Qualifier Booking";
    window.scrollTo({ top: 0, behavior: "smooth" });
    loadRows();
  }, [loadRows]);

  const activeCount = useMemo(
    () => rows.filter((row) => row.booking_enabled && row.status === "A").length,
    [rows]
  );

  const handleRowChange = (eventId, key, value) => {
    setRows((prev) =>
      prev.map((row) => (row.event_id === eventId ? { ...row, [key]: value } : row))
    );
  };

  const handleSave = async (row) => {
    if (!row?.event_id) return;
    setRows((prev) =>
      prev.map((item) =>
        item.event_id === row.event_id ? { ...item, isSaving: true } : item
      )
    );

    const response = await saveQualifierBookingSetting({
      event_id: row.event_id,
      booking_fee: row.booking_fee,
      start_at: fromDatetimeLocalValue(row.start_at_local),
      end_at: fromDatetimeLocalValue(row.end_at_local),
      booking_enabled: row.booking_enabled,
      status: row.status || "A",
    });

    if (response?.status) {
      setRows((prev) =>
        prev.map((item) =>
          item.event_id === row.event_id ? mapRow(response.result || item) : item
        )
      );
      notify("Success", "Qualifier booking setting saved successfully.", true);
    } else {
      setRows((prev) =>
        prev.map((item) =>
          item.event_id === row.event_id ? { ...item, isSaving: false } : item
        )
      );
      notify("Oops!", response?.message || "Failed to save qualifier booking setting.");
      return;
    }

    setRows((prev) =>
      prev.map((item) =>
        item.event_id === row.event_id ? { ...item, isSaving: false } : item
      )
    );
  };

  return (
    <div className="admin-page-container">
      <Top_navbar title="Qualifier Booking" />

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <div
          style={{
            flex: "1 1 180px",
            background: "white",
            borderRadius: 14,
            border: "1px solid #e2e8f0",
            padding: "14px 18px",
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 800, color: "#1d4ed8" }}>
            {rows.length}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Tournaments Listed</div>
        </div>
        <div
          style={{
            flex: "1 1 180px",
            background: "white",
            borderRadius: 14,
            border: "1px solid #e2e8f0",
            padding: "14px 18px",
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 800, color: "#15803d" }}>
            {activeCount}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Booking Enabled</div>
        </div>
      </div>

      <div className="content-card">
        <div className="tabs-header">
          <div className="tabs-container">
            <button className="tab-item active">Qualifier Booking Settings</button>
          </div>
          <div className="tabs-actions">
            <button className="action-button secondary" onClick={loadRows}>
              <ReloadOutlined /> Refresh
            </button>
          </div>
        </div>

        <div className="content-card-body">
          <div
            style={{
              marginBottom: 18,
              padding: "14px 16px",
              borderRadius: 14,
              border: "1px solid #dbeafe",
              background: "#f8fbff",
              color: "#1e3a5f",
              fontSize: 13,
              lineHeight: 1.7,
            }}
          >
            Configure qualifier booking fee and booking window per tournament. Turn
            on booking only when both start and end date-time values are ready.
          </div>

          <div
            style={{
              overflowX: "auto",
              border: "1px solid #dbe7f2",
              borderRadius: 16,
              background: "#fff",
            }}
          >
            <table className="table" style={{ marginBottom: 0, minWidth: 1180 }}>
              <thead>
                <tr style={{ background: "#0f4c81", color: "#fff" }}>
                  <th style={{ minWidth: 320 }}>Tournament</th>
                  <th style={{ minWidth: 160 }}>Booking Fee</th>
                  <th style={{ minWidth: 220 }}>Start DateTime</th>
                  <th style={{ minWidth: 220 }}>End DateTime</th>
                  <th style={{ minWidth: 130 }}>Booking Enabled</th>
                  <th style={{ minWidth: 110 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.event_id}>
                    <td>
                      <div style={{ fontWeight: 700, color: "#0f172a", lineHeight: 1.5 }}>
                        {row.tournament || `Tournament ${row.event_id}`}
                      </div>
                    </td>
                    <td>
                      <div style={{ position: "relative" }}>
                        <DollarOutlined
                          style={{
                            position: "absolute",
                            left: 12,
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "#94a3b8",
                          }}
                        />
                        <input
                          type="text"
                          className="form-input"
                          style={{ paddingLeft: 34 }}
                          value={row.booking_fee}
                          onChange={(event) =>
                            handleRowChange(row.event_id, "booking_fee", event.target.value)
                          }
                          placeholder="5000"
                          disabled={!canEdit || row.isSaving}
                        />
                      </div>
                    </td>
                    <td>
                      <input
                        type="datetime-local"
                        className="form-input"
                        value={row.start_at_local}
                        onChange={(event) =>
                          handleRowChange(row.event_id, "start_at_local", event.target.value)
                        }
                        disabled={!canEdit || row.isSaving}
                      />
                    </td>
                    <td>
                      <input
                        type="datetime-local"
                        className="form-input"
                        value={row.end_at_local}
                        onChange={(event) =>
                          handleRowChange(row.event_id, "end_at_local", event.target.value)
                        }
                        disabled={!canEdit || row.isSaving}
                      />
                    </td>
                    <td>
                      <label
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 10,
                          fontWeight: 600,
                          color: "#334155",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={row.booking_enabled}
                          onChange={(event) =>
                            handleRowChange(
                              row.event_id,
                              "booking_enabled",
                              event.target.checked
                            )
                          }
                          disabled={!canEdit || row.isSaving}
                        />
                        Enabled
                      </label>
                    </td>
                    <td>
                      <button
                        className="action-button primary"
                        style={{ padding: "8px 14px" }}
                        onClick={() => handleSave(row)}
                        disabled={!canEdit || row.isSaving}
                      >
                        <SaveOutlined />
                        {row.isSaving ? "Saving..." : "Save"}
                      </button>
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: 30, color: "#64748b" }}>
                      No tournaments available for qualifier booking setup.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <LoadingEffect isLoading={isLoading} text="Loading qualifier booking settings..." />
    </div>
  );
}
