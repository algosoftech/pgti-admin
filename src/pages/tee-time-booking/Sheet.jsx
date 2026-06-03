import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircleOutlined,
  CopyOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { notification, Select, Switch } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faClone,
  faGolfBallTee,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useLocation } from "react-router-dom";

import Top_navbar from "components/layout/TopNavbar";
import { FieldHint } from "components/ui/FieldHint";
import LoadingEffect from "components/ui/Loading/LoadingEffect";
import { usePermissions } from "contexts/PermissionContext";
import { list as listEvents } from "services/events.service";
import {
  copyTeeTimeSheet,
  exportTeeTimeSheet,
  getTeeTimeSheet,
  getTeeTimeWindowsByEvent,
  saveTeeTimeSheet,
} from "services/teeTimeBooking.service";
import "styles/admin-pages.css";

const makeSlot = (index = 0) => ({
  id: "",
  nine_hole_only: false,
  match_no: index + 1,
  tee_time: "",
  tee_no: "",
  player_1_name: "",
  player_2_name: "",
  player_3_name: "",
  player_4_name: "",
  status: "A",
});

const nextTimeValue = (current = "") => {
  const raw = String(current || "").replace(/\D/g, "");
  if (raw.length !== 4) return "";
  const hour = Number(raw.slice(0, 2));
  const minute = Number(raw.slice(2, 4));
  const total = hour * 60 + minute + 10;
  const nextHour = Math.floor(total / 60);
  const nextMinute = total % 60;
  return `${String(nextHour).padStart(2, "0")}${String(nextMinute).padStart(2, "0")}`;
};

const validateSlotsBeforeSave = (incomingSlots = []) => {
  if (!incomingSlots.length) {
    return "Add at least one tee-time row before saving.";
  }

  for (let index = 0; index < incomingSlots.length; index += 1) {
    const slot = incomingSlots[index] || {};
    const rowNumber = index + 1;
    const teeTime = String(slot.tee_time || "").replace(/\D/g, "").trim();
    const teeNo = String(slot.tee_no || "").trim();

    if (!teeTime) {
      return `Row ${rowNumber}: add a tee time in HHMM format, for example 0700 or 0710.`;
    }

    if (teeTime.length !== 4) {
      return `Row ${rowNumber}: tee time must be 4 digits in HHMM format, for example 0700.`;
    }

    if (!teeNo) {
      return `Row ${rowNumber}: select the starting tee, usually 1 or 10.`;
    }
  }

  return null;
};

export default function TeeTimeSheet() {
  const location = useLocation();
  const PERMISSION = usePermissions("tee_time_booking");
  const user = JSON.parse(sessionStorage.getItem("ADMIN-INFO") || "{}");

  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState(location.state?.event_id || undefined);
  const [windowId, setWindowId] = useState(location.state?.window_id || undefined);
  const [windows, setWindows] = useState([]);
  const [slots, setSlots] = useState([]);
  const [sourceEventId, setSourceEventId] = useState(undefined);
  const [sourceWindows, setSourceWindows] = useState([]);
  const [sourceWindowId, setSourceWindowId] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeWindow, setActiveWindow] = useState(null);

  const canEdit =
    user?.admin_type === "Super Admin" ||
    PERMISSION?.add_edit === "Y" ||
    PERMISSION?.fullAccess === "Y";
  const canExport =
    user?.admin_type === "Super Admin" ||
    PERMISSION?.export === "Y" ||
    PERMISSION?.fullAccess === "Y";

  const toast = (message, description, success = false) =>
    notification.open({
      message,
      description,
      placement: "topRight",
      icon: success ? (
        <CheckCircleOutlined style={{ color: "green" }} />
      ) : (
        <InfoCircleOutlined style={{ color: "red" }} />
      ),
      duration: 3,
    });

  const eventOptions = useMemo(
    () =>
      (events || []).map((item) => ({
        value: item.id,
        label: item.title || `Tournament ${item.id}`,
      })),
    [events]
  );

  const windowOptions = useMemo(
    () =>
      (windows || []).map((item) => ({
        value: item.id,
        label: item.title || item.range_display || `Window ${item.id}`,
      })),
    [windows]
  );

  const sourceWindowOptions = useMemo(
    () =>
      (sourceWindows || []).map((item) => ({
        value: item.id,
        label: item.title || item.range_display || `Window ${item.id}`,
      })),
    [sourceWindows]
  );

  const loadEvents = useCallback(async () => {
    const response = await listEvents({
      skip: 0,
      limit: 1000,
      condition: { status: "A" },
    });
    if (response?.status) {
      setEvents(response.result || []);
    } else {
      toast("Oops!", response?.message || "Failed to load tournaments.");
    }
  }, []);

  const loadSheet = useCallback(async (selectedEventId, selectedWindowId) => {
    if (!selectedEventId) return;
    setIsLoading(true);
    const response = await getTeeTimeSheet({
      event_id: selectedEventId,
      ...(selectedWindowId ? { window_id: selectedWindowId } : {}),
    });
    if (response?.status) {
      setWindows(response.windows || []);
      setActiveWindow(response.active_window || null);
      if (!selectedWindowId && response.active_window?.id) {
        setWindowId(response.active_window.id);
      }
      setSlots((response.slots || []).length ? response.slots : [makeSlot(0)]);
    } else {
      toast("Oops!", response?.message || "Failed to load tee sheet.");
      setSlots([makeSlot(0)]);
      setWindows([]);
      setActiveWindow(null);
    }
    setIsLoading(false);
  }, []);

  const loadSourceWindows = useCallback(async (selectedEventId) => {
    if (!selectedEventId) {
      setSourceWindows([]);
      setSourceWindowId(undefined);
      return;
    }
    const response = await getTeeTimeWindowsByEvent(selectedEventId);
    if (response?.status) {
      setSourceWindows(response.windows || []);
      setSourceWindowId(undefined);
    } else {
      toast("Oops!", response?.message || "Failed to load source booking windows.");
    }
  }, []);

  useEffect(() => {
    document.title = "PGTI || Admin || Tee Time Sheet";
    window.scrollTo({ top: 0, behavior: "smooth" });
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    if (eventId) {
      loadSheet(eventId, windowId);
    }
  }, [eventId, windowId, loadSheet]);

  const handleSlotChange = (index, key, value) => {
    setSlots((prev) =>
      prev.map((slot, slotIndex) =>
        slotIndex === index
          ? {
              ...slot,
              [key]: value,
            }
          : slot
      )
    );
  };

  const addRow = () => {
    setSlots((prev) => {
      const last = prev[prev.length - 1] || makeSlot(0);
      const next = makeSlot(prev.length);
      next.match_no = (last.match_no || prev.length) + 1;
      next.tee_no = last.tee_no || "";
      next.tee_time = nextTimeValue(last.tee_time);
      return [...prev, next];
    });
  };

  const duplicateRow = (index) => {
    setSlots((prev) => {
      const source = prev[index];
      if (!source) return prev;
      const clone = {
        ...source,
        id: "",
        match_no: (source.match_no || index + 1) + 1,
        tee_time: nextTimeValue(source.tee_time),
      };
      return [...prev.slice(0, index + 1), clone, ...prev.slice(index + 1)];
    });
  };

  const removeRow = (index) => {
    setSlots((prev) =>
      prev.length === 1 ? prev : prev.filter((_, slotIndex) => slotIndex !== index)
    );
  };

  const handleSave = async () => {
    if (!eventId || !windowId) {
      toast("Oops!", "Please select a tournament and booking window first.");
      return;
    }
    const validationMessage = validateSlotsBeforeSave(slots);
    if (validationMessage) {
      toast("Incomplete tee sheet", validationMessage);
      return;
    }
    setIsSaving(true);
    const response = await saveTeeTimeSheet({
      event_id: eventId,
      window_id: windowId,
      slots: slots.map((slot) => ({
        ...slot,
        match_no: slot.match_no || null,
      })),
    });

    if (response?.status) {
      setSlots(
        (response.result?.slots || []).length
          ? response.result.slots
          : [makeSlot(0)]
      );
      toast("Success", "Tee sheet saved successfully.", true);
    } else {
      toast("Oops!", response?.message || "Failed to save tee sheet.");
    }
    setIsSaving(false);
  };

  const handleCopy = async () => {
    if (!eventId || !windowId) {
      toast(
        "Missing target selection",
        "Choose the tournament and tee time window you want to fill before copying tee times."
      );
      return;
    }
    if (!sourceEventId) {
      toast(
        "Source tournament required",
        "Select the tournament you want to copy tee times from."
      );
      return;
    }
    if (!sourceWindowId) {
      toast(
        "Source booking window required",
        "Select the source booking window you want to copy from."
      );
      return;
    }
    setIsSaving(true);
    const response = await copyTeeTimeSheet({
      event_id: eventId,
      window_id: windowId,
      source_event_id: sourceEventId,
      source_window_id: sourceWindowId,
    });
    if (response?.status) {
      setSlots(
        (response.result?.slots || []).length
          ? response.result.slots
          : [makeSlot(0)]
      );
      toast(
        "Success",
        "Tee sheet copied successfully. Player names were cleared for the new tournament.",
        true
      );
    } else {
      toast("Oops!", response?.message || "Failed to copy tee sheet.");
    }
    setIsSaving(false);
  };

  const handleExport = async () => {
    if (!eventId || !windowId) {
      toast("Oops!", "Please select a tournament and booking window first.");
      return;
    }
    const response = await exportTeeTimeSheet({
      event_id: eventId,
      window_id: windowId,
    });
    if (response?.status && response.result?.file_url) {
      window.open(response.result.file_url, "_blank", "noopener,noreferrer");
    } else {
      toast("Oops!", response?.message || "Failed to export tee sheet.");
    }
  };

  return (
    <div className="admin-page-container">
      <Top_navbar title="Tee Time Sheet" />

      <div className="content-card" style={{ marginBottom: 20 }}>
        <div className="content-card-body">
          <div
            className="d-flex justify-content-between align-items-center flex-wrap gap-3"
            style={{ marginBottom: 18 }}
          >
            <div>
              <h3 className="form-section-title" style={{ marginBottom: 6 }}>
                <FontAwesomeIcon
                  icon={faGolfBallTee}
                  style={{ marginRight: 8 }}
                />
                Tee Sheet Builder
              </h3>
              <p className="page-subtitle" style={{ margin: 0 }}>
                Assign tee times, tees, and grouped players for the selected
                tournament booking window.
              </p>
            </div>
            <Link to="/admin/tee-time-booking/windows">
              <button className="action-button secondary">
                <FontAwesomeIcon icon={faArrowLeft} /> Back to Booking Windows
              </button>
            </Link>
          </div>

          <div className="row">
            <div className="col-lg-6 col-12 mb-3">
              <label className="form-label required">Select Tournament</label>
              <Select
                value={eventId}
                onChange={(value) => {
                  setEventId(value);
                  setWindowId(undefined);
                  setSlots([makeSlot(0)]);
                }}
                placeholder="Search tournament"
                showSearch
                size="large"
                style={{ width: "100%" }}
                optionFilterProp="label"
                options={eventOptions}
              />
            </div>
            <div className="col-lg-6 col-12 mb-3">
              <label className="form-label required">Tee Time Window</label>
              <Select
                value={windowId}
                onChange={setWindowId}
                placeholder="Select booking window"
                size="large"
                style={{ width: "100%" }}
                options={windowOptions}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-lg-4 col-12 mb-3">
              <label className="form-label">Copy From Tournament</label>
              <Select
                value={sourceEventId}
                onChange={(value) => {
                  setSourceEventId(value);
                  loadSourceWindows(value);
                }}
                placeholder="Select source tournament"
                showSearch
                size="large"
                style={{ width: "100%" }}
                optionFilterProp="label"
                options={eventOptions.filter((item) => item.value !== eventId)}
              />
            </div>
            <div className="col-lg-4 col-12 mb-3">
              <label className="form-label">Source Booking Window</label>
              <Select
                value={sourceWindowId}
                onChange={setSourceWindowId}
                placeholder="Select source booking window"
                size="large"
                style={{ width: "100%" }}
                options={sourceWindowOptions}
              />
            </div>
            <div className="col-lg-4 col-12 mb-3 d-flex align-items-end">
              <button
                className="action-button secondary"
                onClick={handleCopy}
                disabled={!canEdit}
              >
                <CopyOutlined /> Copy Tee Times
              </button>
            </div>
          </div>

          <FieldHint text="Copy keeps Match, Time, Tee, and Nine Hole Only values from another tournament window. Player names are cleared so you can assign the new field." />

          {activeWindow && (
            <div
              style={{
                marginTop: 16,
                marginBottom: 8,
                border: "1px solid #dbeafe",
                background: "#f8fbff",
                borderRadius: 14,
                padding: 14,
                display: "flex",
                flexWrap: "wrap",
                gap: 16,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#64748b",
                    marginBottom: 4,
                  }}
                >
                  ACTIVE WINDOW
                </div>
                <strong>{activeWindow.title}</strong>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#64748b",
                    marginBottom: 4,
                  }}
                >
                  DATE RANGE
                </div>
                <strong>{activeWindow.range_display}</strong>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#64748b",
                    marginBottom: 4,
                  }}
                >
                  CURRENT SLOT COUNT
                </div>
                <strong>{slots.length}</strong>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="content-card">
        <div className="content-card-body">
          <div
            className="d-flex justify-content-between align-items-center flex-wrap gap-3"
            style={{ marginBottom: 16 }}
          >
            <div>
              <h4 style={{ margin: 0, color: "#0f172a", fontWeight: 700 }}>
                Tee Sheet Rows
              </h4>
              <div
                style={{ color: "#64748b", fontSize: 13, marginTop: 6 }}
              >
                Each row represents one group teeing off at a specific time and
                tee.
              </div>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <button
                className="action-button secondary"
                onClick={addRow}
                disabled={!canEdit}
              >
                <PlusOutlined /> Add Row
              </button>
              <button
                className="action-button secondary"
                onClick={handleExport}
                disabled={!canExport}
              >
                <DownloadOutlined /> Download Tee Time Booking
              </button>
              <button
                className="action-button primary"
                onClick={handleSave}
                disabled={!canEdit || isSaving}
              >
                <SaveOutlined /> Save Tee Sheet
              </button>
            </div>
          </div>

          <div
            style={{
              overflowX: "auto",
              border: "1px solid #dbe7f2",
              borderRadius: 16,
            }}
          >
            <table className="table" style={{ marginBottom: 0, minWidth: 1200 }}>
              <thead>
                <tr style={{ background: "#0f4c81", color: "#fff" }}>
                  <th style={{ minWidth: 120 }}>Nine Hole Only</th>
                  <th style={{ minWidth: 90 }}>Match</th>
                  <th style={{ minWidth: 110 }}>Time</th>
                  <th style={{ minWidth: 90 }}>Tee</th>
                  <th style={{ minWidth: 220 }}>Player 1</th>
                  <th style={{ minWidth: 220 }}>Player 2</th>
                  <th style={{ minWidth: 220 }}>Player 3</th>
                  <th style={{ minWidth: 220 }}>Player 4</th>
                  <th style={{ minWidth: 90 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((slot, index) => (
                  <tr key={slot.id || `slot-${index}`}>
                    <td>
                      <Switch
                        checked={slot.nine_hole_only}
                        onChange={(checked) =>
                          handleSlotChange(index, "nine_hole_only", checked)
                        }
                        disabled={!canEdit}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-input"
                        value={slot.match_no ?? ""}
                        onChange={(event) =>
                          handleSlotChange(index, "match_no", event.target.value)
                        }
                        disabled={!canEdit}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="0700"
                        value={slot.tee_time || ""}
                        onChange={(event) =>
                          handleSlotChange(
                            index,
                            "tee_time",
                            event.target.value.replace(/\D/g, "").slice(0, 4)
                          )
                        }
                        disabled={!canEdit}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="1 or 10"
                        value={slot.tee_no || ""}
                        onChange={(event) =>
                          handleSlotChange(index, "tee_no", event.target.value)
                        }
                        disabled={!canEdit}
                      />
                    </td>
                    {[
                      "player_1_name",
                      "player_2_name",
                      "player_3_name",
                      "player_4_name",
                    ].map((field) => (
                      <td key={field}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Player name"
                          value={slot[field] || ""}
                          onChange={(event) =>
                            handleSlotChange(index, field, event.target.value)
                          }
                          disabled={!canEdit}
                        />
                      </td>
                    ))}
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className="action-button secondary"
                          onClick={() => duplicateRow(index)}
                          disabled={!canEdit}
                          title="Duplicate row"
                        >
                          <FontAwesomeIcon icon={faClone} />
                        </button>
                        <button
                          className="action-button secondary"
                          onClick={() => removeRow(index)}
                          disabled={!canEdit || slots.length === 1}
                          title="Remove row"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 12 }}>
            <FieldHint text="Time uses legacy golf tee-sheet format like 0700, 0710, 0720. Tee typically uses 1 or 10. Player names are stored as snapshots for export and slot visibility." />
          </div>
        </div>
      </div>

      <LoadingEffect
        isLoading={isLoading || isSaving}
        text={isSaving ? "Saving tee sheet..." : "Loading tee sheet..."}
      />
    </div>
  );
}
