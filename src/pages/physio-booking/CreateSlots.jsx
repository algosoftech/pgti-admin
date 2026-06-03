import React, { useCallback, useEffect, useMemo, useState } from "react";
import { notification, Select } from "antd";
import {
  CheckCircleOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  StopOutlined,
} from "@ant-design/icons";
import Top_navbar from "components/layout/TopNavbar";
import LoadingEffect from "components/ui/Loading/LoadingEffect";
import { usePermissions } from "contexts/PermissionContext";
import {
  changePhysioSlotStatus,
  createPhysioSlots,
  listPhysioSlots,
} from "services/physioBooking.service";
import "styles/admin-pages.css";

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

export default function PhysioCreateSlots() {
  const permission = usePermissions("physio_create_slots");
  const user = JSON.parse(sessionStorage.getItem("ADMIN-INFO") || "{}");
  const canEdit =
    user?.admin_type === "Super Admin" ||
    permission?.add_edit === "Y" ||
    permission?.fullAccess === "Y";

  const [filters, setFilters] = useState({
    event_id: undefined,
    booking_date: "",
    start_time: "11:00",
    end_time: "14:00",
    slot_minutes: 30,
    break_minutes: 0,
    replace_existing: false,
  });
  const [slots, setSlots] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadSlots = useCallback(async () => {
    setIsLoading(true);
    const response = await listPhysioSlots({
      skip: 0,
      limit: 200,
      condition: {
        ...(filters.event_id ? { event_id: filters.event_id } : {}),
        ...(filters.booking_date ? { booking_date: filters.booking_date } : {}),
      },
    });
    if (response?.status) {
      setSlots(response.result || []);
      setTournaments(response.filters?.tournaments || []);
    } else {
      notify("Oops!", response?.message || "Failed to load physio slots.");
    }
    setIsLoading(false);
  }, [filters.event_id, filters.booking_date]);

  useEffect(() => {
    document.title = "PGTI || Admin || Physio Create Slots";
    window.scrollTo({ top: 0, behavior: "smooth" });
    loadSlots();
  }, [loadSlots]);

  const dateSlots = useMemo(
    () =>
      slots.filter(
        (slot) =>
          (!filters.event_id || Number(slot.event_id) === Number(filters.event_id)) &&
          (!filters.booking_date || slot.booking_date === filters.booking_date)
      ),
    [slots, filters]
  );

  const handleCreate = async () => {
    if (!filters.event_id || !filters.booking_date) {
      notify("Oops!", "Please select a tournament and booking date.");
      return;
    }
    setIsSaving(true);
    const response = await createPhysioSlots({
      event_id: filters.event_id,
      booking_date: filters.booking_date,
      start_time: filters.start_time,
      end_time: filters.end_time,
      slot_minutes: filters.slot_minutes,
      break_minutes: filters.break_minutes,
      replace_existing: filters.replace_existing,
    });
    if (response?.status) {
      notify("Success", response.result?.message || "Physio slots created successfully.", true);
      setSlots(response.result?.slots || []);
    } else {
      notify("Oops!", response?.message || "Failed to create physio slots.");
    }
    setIsSaving(false);
  };

  const toggleSlotStatus = async (slot) => {
    const response = await changePhysioSlotStatus({
      slot_id: slot.id,
      status: slot.status === "A" ? "I" : "A",
    });
    if (response?.status) {
      notify("Success", "Physio slot updated successfully.", true);
      loadSlots();
    } else {
      notify("Oops!", response?.message || "Failed to update physio slot.");
    }
  };

  return (
    <div className="admin-page-container">
      <Top_navbar title="Physio Create Slots" />

      <div className="content-card">
        <div className="tabs-header">
          <div className="tabs-container">
            <button className="tab-item active">Create Slots</button>
          </div>
          <div className="tabs-actions">
            <button className="action-button secondary" onClick={loadSlots}>
              <ReloadOutlined /> Refresh
            </button>
          </div>
        </div>

        <div className="content-card-body">
          <div className="row g-3">
            <div className="col-lg-4 col-md-6">
              <label className="form-label">Tournament</label>
              <Select
                value={filters.event_id}
                onChange={(value) => setFilters((prev) => ({ ...prev, event_id: value }))}
                placeholder="Select Tournament"
                size="large"
                showSearch
                allowClear
                optionFilterProp="label"
                style={{ width: "100%" }}
                options={tournaments.map((item) => ({ value: item.id, label: item.title }))}
              />
            </div>
            <div className="col-lg-2 col-md-6">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={filters.booking_date}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, booking_date: event.target.value }))
                }
              />
            </div>
            <div className="col-lg-2 col-md-6">
              <label className="form-label">Start Time</label>
              <input
                type="time"
                className="form-input"
                value={filters.start_time}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, start_time: event.target.value }))
                }
              />
            </div>
            <div className="col-lg-2 col-md-6">
              <label className="form-label">End Time</label>
              <input
                type="time"
                className="form-input"
                value={filters.end_time}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, end_time: event.target.value }))
                }
              />
            </div>
            <div className="col-lg-1 col-md-6">
              <label className="form-label">Slot Min</label>
              <input
                type="number"
                className="form-input"
                value={filters.slot_minutes}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, slot_minutes: event.target.value }))
                }
              />
            </div>
            <div className="col-lg-1 col-md-6">
              <label className="form-label">Break</label>
              <input
                type="number"
                className="form-input"
                value={filters.break_minutes}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, break_minutes: event.target.value }))
                }
              />
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <label style={{ display: "inline-flex", gap: 10, alignItems: "center", fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={filters.replace_existing}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, replace_existing: event.target.checked }))
                }
              />
              Replace existing slots for this date
            </label>
            <button
              className="action-button primary"
              onClick={handleCreate}
              disabled={!canEdit || isSaving}
            >
              <PlusOutlined /> {isSaving ? "Creating..." : "Create Slots"}
            </button>
          </div>

          <div
            style={{
              marginTop: 18,
              padding: "14px 16px",
              borderRadius: 14,
              border: "1px solid #dbeafe",
              background: "#f8fbff",
              color: "#1e3a5f",
              fontSize: 13,
              lineHeight: 1.7,
            }}
          >
            Create physio sessions by selecting a tournament, date, time range, and slot duration.
            Only active slots are shown to players, and already booked slots cannot be disabled.
          </div>

          <div
            style={{
              overflowX: "auto",
              border: "1px solid #dbe7f2",
              borderRadius: 16,
              background: "#fff",
              marginTop: 18,
            }}
          >
            <table className="table" style={{ marginBottom: 0, minWidth: 980 }}>
              <thead>
                <tr style={{ background: "#0f4c81", color: "#fff" }}>
                  <th>Date</th>
                  <th>Session Time</th>
                  <th>Status</th>
                  <th>Booked By</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {dateSlots.map((slot) => (
                  <tr key={slot.id}>
                    <td>{slot.booking_date_display}</td>
                    <td>{slot.time_range_display}</td>
                    <td>
                      <span className={`status-badge ${slot.status === "A" ? "active" : "inactive"}`}>
                        {slot.status === "A" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>{slot.booked_player_name || "—"}</td>
                    <td>
                      <button
                        className="action-button secondary"
                        onClick={() => toggleSlotStatus(slot)}
                        disabled={!canEdit}
                      >
                        <StopOutlined /> {slot.status === "A" ? "Disable" : "Enable"}
                      </button>
                    </td>
                  </tr>
                ))}
                {!dateSlots.length && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: 28, color: "#64748b" }}>
                      No physio slots found for the selected tournament/date.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <LoadingEffect
        isLoading={isLoading || isSaving}
        text={isSaving ? "Creating physio slots..." : "Loading physio slots..."}
      />
    </div>
  );
}
