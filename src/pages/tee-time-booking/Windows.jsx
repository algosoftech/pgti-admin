import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { notification, Select, Dropdown } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import {
  faCalendarDays,
  faEllipsis,
  faGolfBallTee,
  faRefresh,
  faRightLong,
  faThumbsDown,
  faThumbsUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";

import Top_navbar from "components/layout/TopNavbar";
import EnhancedTable from "components/table/EnhancedTable/EnhancedTable";
import { FieldHint } from "components/ui/FieldHint";
import LoadingEffect from "components/ui/Loading/LoadingEffect";
import { usePermissions } from "contexts/PermissionContext";
import { list as listEvents } from "services/events.service";
import {
  changeTeeTimeWindowStatus,
  getTeeTimeWindowsByEvent,
  listTeeTimeWindows,
  saveTeeTimeWindows,
} from "services/teeTimeBooking.service";
import "styles/admin-pages.css";

const makeWindowRow = (index = 0) => ({
  id: "",
  title: `Booking Day ${index + 1}`,
  start_at: "",
  end_at: "",
  status: "A",
});

const toDatetimeLocalValue = (value = "") => {
  if (!value) return "";
  return String(value).replace(" ", "T").slice(0, 16);
};

const fromDatetimeLocalValue = (value = "") => (value ? `${value.replace("T", " ")}:00` : "");

export default function TeeTimeWindows() {
  const navigate = useNavigate();
  const targetRef = useRef(null);
  const PERMISSION = usePermissions("tee_time_booking");
  const user = JSON.parse(sessionStorage.getItem("ADMIN-INFO") || "{}");

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(undefined);
  const [enableOption, setEnableOption] = useState("enable_now");
  const [windowRows, setWindowRows] = useState([makeWindowRow(0)]);
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [count, setCount] = useState(0);
  const [activeTab, setActiveTab] = useState("all");
  const [serverColumnFilters, setServerColumnFilters] = useState({ event_title: "" });

  const canEdit = user?.admin_type === "Super Admin" || PERMISSION?.add_edit === "Y" || PERMISSION?.fullAccess === "Y";
  const canStatus = user?.admin_type === "Super Admin" || PERMISSION?.change_status === "Y" || PERMISSION?.fullAccess === "Y";

  const toast = (message, description, success = false) =>
    notification.open({
      message,
      description,
      placement: "topRight",
      icon: success ? <CheckCircleOutlined style={{ color: "green" }} /> : <InfoCircleOutlined style={{ color: "red" }} />,
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

  const loadEvents = useCallback(async () => {
    const response = await listEvents({ skip: 0, limit: 1000, condition: { status: "A" } });
    if (response?.status) {
      setEvents(response.result || []);
    } else {
      toast("Oops!", response?.message || "Failed to load tournaments.");
    }
  }, []);

  const getList = useCallback(
    async (page = currentPage, pageLimit = limit) => {
      setIsLoading(true);
      const response = await listTeeTimeWindows({
        skip: (page - 1) * pageLimit,
        limit: pageLimit,
        condition: {
          ...(serverColumnFilters.event_title ? { event_title: serverColumnFilters.event_title } : {}),
          ...(activeTab !== "all" ? { status: activeTab } : {}),
        },
      });
      if (response?.status) {
        setRows(response.result || []);
        setCount(response.count || 0);
      } else {
        toast("Oops!", response?.message || "Failed to load tee-time windows.");
      }
      setIsLoading(false);
    },
    [activeTab, currentPage, limit, serverColumnFilters.event_title]
  );

  const loadEventWindows = useCallback(async (eventId) => {
    if (!eventId) {
      setWindowRows([makeWindowRow(0)]);
      return;
    }
    setIsLoading(true);
    const response = await getTeeTimeWindowsByEvent(eventId);
    if (response?.status) {
      const nextRows = (response.windows || []).map((item) => ({
        id: item.id,
        title: item.title,
        start_at: toDatetimeLocalValue(item.start_at),
        end_at: toDatetimeLocalValue(item.end_at),
        status: item.status || "A",
      }));
      setWindowRows(nextRows.length ? nextRows : [makeWindowRow(0)]);
      setEnableOption(response.windows?.[0]?.enable_option || "enable_now");
    } else {
      toast("Oops!", response?.message || "Failed to load tee-time windows for this tournament.");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    document.title = "PGTI || Admin || Tee Time Booking";
    window.scrollTo({ top: 0, behavior: "smooth" });
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    const timer = setTimeout(() => getList(currentPage, limit), 300);
    return () => clearTimeout(timer);
  }, [currentPage, limit, getList]);

  const handleWindowChange = (index, key, value) => {
    setWindowRows((prev) =>
      prev.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row))
    );
  };

  const addWindowRow = () => setWindowRows((prev) => [...prev, makeWindowRow(prev.length)]);
  const removeWindowRow = (index) =>
    setWindowRows((prev) => (prev.length === 1 ? prev : prev.filter((_, rowIndex) => rowIndex !== index)));

  const handleSave = async () => {
    if (!selectedEventId) {
      toast("Oops!", "Please select a tournament first.");
      return;
    }
    setIsSaving(true);
    const response = await saveTeeTimeWindows({
      event_id: selectedEventId,
      enable_option: enableOption,
      windows: windowRows.map((row, index) => ({
        id: row.id || undefined,
        title: row.title || `Booking Day ${index + 1}`,
        start_at: fromDatetimeLocalValue(row.start_at),
        end_at: fromDatetimeLocalValue(row.end_at),
        status: row.status || "A",
      })),
    });

    if (response?.status) {
      const savedRows = response.result?.windows || [];
      setWindowRows(
        savedRows.length
          ? savedRows.map((item) => ({
              id: item.id,
              title: item.title,
              start_at: toDatetimeLocalValue(item.start_at),
              end_at: toDatetimeLocalValue(item.end_at),
              status: item.status || "A",
            }))
          : [makeWindowRow(0)]
      );
      toast("Success", "Tee-time booking windows saved successfully.", true);
      setCurrentPage(1);
      getList(1, limit);
    } else {
      toast("Oops!", response?.message || "Failed to save tee-time windows.");
    }
    setIsSaving(false);
  };

  const handleStatusChange = async (item, nextStatus) => {
    const response = await changeTeeTimeWindowStatus({ id: item.id, status: nextStatus });
    if (response?.status) {
      toast("Success", "Booking window status updated.", true);
      getList();
      if (selectedEventId === item.event_id) {
        loadEventWindows(selectedEventId);
      }
    } else {
      toast("Oops!", response?.message || "Failed to update booking window status.");
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "index",
        header: "#",
        cell: ({ row }) => row.index + (currentPage - 1) * limit + 1,
        size: 60,
        enableSorting: true,
        enableGlobalFilter: false,
      },
      {
        accessorKey: "event_title",
        header: "Tournament",
        cell: ({ getValue }) => getValue() || "Untitled Tournament",
        size: 280,
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: "title",
        header: "Booking Window",
        size: 220,
      },
      {
        accessorKey: "start_at_display",
        header: "Start Date & Time",
        size: 180,
      },
      {
        accessorKey: "end_at_display",
        header: "End Date & Time",
        size: 180,
      },
      {
        accessorKey: "slot_count",
        header: "Slots",
        size: 80,
      },
      {
        accessorKey: "status",
        header: "Status",
        accessorFn: (row) => (row.status === "A" ? "Active" : "Inactive"),
        cell: ({ row }) => (
          <span className={`status-badge ${row.original.status === "A" ? "active" : "inactive"}`}>
            {row.original.status === "A" ? "Active" : "Inactive"}
          </span>
        ),
        size: 110,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Dropdown
            menu={{
              items: [
                {
                  key: "sheet",
                  label: "Open Tee Sheet",
                  icon: <FontAwesomeIcon icon={faRightLong} />,
                  onClick: () =>
                    navigate("/admin/tee-time-booking/sheet", {
                      state: { event_id: row.original.event_id, window_id: row.original.id },
                    }),
                },
                ...(canStatus
                  ? [
                      row.original.status === "A"
                        ? {
                            key: "disable",
                            label: "Disable",
                            icon: <FontAwesomeIcon icon={faThumbsDown} />,
                            onClick: () => handleStatusChange(row.original, "I"),
                          }
                        : {
                            key: "enable",
                            label: "Enable",
                            icon: <FontAwesomeIcon icon={faThumbsUp} />,
                            onClick: () => handleStatusChange(row.original, "A"),
                          },
                    ]
                  : []),
              ],
            }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <button className="action-dropdown-trigger">
              <FontAwesomeIcon icon={faEllipsis} />
            </button>
          </Dropdown>
        ),
        size: 110,
        enableSorting: false,
        enableGlobalFilter: false,
      },
    ],
    [canStatus, currentPage, limit, navigate]
  );

  return (
    <div className="admin-page-container" ref={targetRef}>
      <Top_navbar title="Tee Time Booking" />

      <div className="content-card" style={{ marginBottom: 20 }}>
        <div className="content-card-body">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3" style={{ marginBottom: 18 }}>
            <div>
              <h3 className="form-section-title" style={{ marginBottom: 6 }}>
                <ClockCircleOutlined /> Configure Booking Windows
              </h3>
              <p className="page-subtitle" style={{ margin: 0 }}>
                Enable one or more booking windows for a tournament before assigning tee-sheet slots.
              </p>
            </div>
            <button className="action-button secondary" onClick={() => navigate("/admin/tee-time-booking/sheet")}>
              <FontAwesomeIcon icon={faGolfBallTee} /> Open Tee Sheet
            </button>
          </div>

          <div className="row">
            <div className="col-lg-6 col-12 mb-3">
              <label className="form-label required">Select Tournament</label>
              <Select
                value={selectedEventId}
                onChange={(value) => {
                  setSelectedEventId(value);
                  loadEventWindows(value);
                }}
                placeholder="Select tournament"
                size="large"
                showSearch
                style={{ width: "100%" }}
                optionFilterProp="label"
                options={eventOptions}
              />
            </div>
            <div className="col-lg-3 col-12 mb-3">
              <label className="form-label">Enable Option</label>
              <Select
                value={enableOption}
                onChange={setEnableOption}
                size="large"
                style={{ width: "100%" }}
                options={[
                  { value: "enable_now", label: "Enable Now" },
                  { value: "schedule_disable", label: "Schedule Disable" },
                ]}
              />
            </div>
            <div className="col-lg-3 col-12 mb-3 d-flex align-items-end">
              <button className="action-button primary" onClick={addWindowRow} disabled={!canEdit}>
                <PlusOutlined /> Add Booking Day
              </button>
            </div>
          </div>

          {windowRows.map((row, index) => (
            <div
              key={row.id || `window-row-${index}`}
              style={{ border: "1px solid #dbe7f2", borderRadius: 16, padding: 16, background: "#fff", marginBottom: 14 }}
            >
              <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap" style={{ marginBottom: 12 }}>
                <strong style={{ color: "#0f172a" }}>{row.title || `Booking Day ${index + 1}`}</strong>
                {windowRows.length > 1 && (
                  <button className="action-button secondary" onClick={() => removeWindowRow(index)} disabled={!canEdit}>
                    Remove
                  </button>
                )}
              </div>

              <div className="row">
                <div className="col-lg-3 col-md-6 col-12 mb-3">
                  <label className="form-label">Label</label>
                  <input
                    type="text"
                    className="form-input"
                    value={row.title}
                    onChange={(event) => handleWindowChange(index, "title", event.target.value)}
                    placeholder={`Booking Day ${index + 1}`}
                    disabled={!canEdit}
                  />
                </div>
                <div className="col-lg-4 col-md-6 col-12 mb-3">
                  <label className="form-label required">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={row.start_at}
                    onChange={(event) => handleWindowChange(index, "start_at", event.target.value)}
                    disabled={!canEdit}
                  />
                </div>
                <div className="col-lg-4 col-md-6 col-12 mb-3">
                  <label className="form-label required">End Date & Time</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={row.end_at}
                    onChange={(event) => handleWindowChange(index, "end_at", event.target.value)}
                    disabled={!canEdit}
                  />
                </div>
                <div className="col-lg-1 col-md-6 col-12 mb-3">
                  <label className="form-label">Status</label>
                  <Select
                    value={row.status}
                    onChange={(value) => handleWindowChange(index, "status", value)}
                    size="large"
                    style={{ width: "100%" }}
                    disabled={!canEdit}
                    options={[
                      { value: "A", label: "A" },
                      { value: "I", label: "I" },
                    ]}
                  />
                </div>
              </div>
            </div>
          ))}

          <FieldHint text="Create multiple booking windows when a tournament accepts tee-time booking across multiple days or waves." />

          <div className="form-actions" style={{ marginTop: 18 }}>
            <button className="action-button secondary" onClick={() => selectedEventId && loadEventWindows(selectedEventId)} disabled={!selectedEventId}>
              <FontAwesomeIcon icon={faRefresh} /> Reload Event Windows
            </button>
            <button className="action-button primary" onClick={handleSave} disabled={!canEdit || isSaving}>
              <SaveOutlined /> Save Windows
            </button>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="tabs-header">
          <div className="tabs-container">
            <button className={`tab-item ${activeTab === "all" ? "active" : ""}`} onClick={() => { setActiveTab("all"); setCurrentPage(1); }}>
              All
            </button>
            <button className={`tab-item ${activeTab === "A" ? "active" : ""}`} onClick={() => { setActiveTab("A"); setCurrentPage(1); }}>
              Active
            </button>
            <button className={`tab-item ${activeTab === "I" ? "active" : ""}`} onClick={() => { setActiveTab("I"); setCurrentPage(1); }}>
              Inactive
            </button>
          </div>
        </div>

        <div className="content-card-body">
          <EnhancedTable
            data={rows}
            columns={columns}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={Math.max(1, Math.ceil((count || 0) / limit))}
            limit={limit}
            skip={(currentPage - 1) * limit}
            count={count}
            onPageChange={(page) => {
              setCurrentPage(page);
              targetRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
            onLimitChange={(newLimit) => {
              setLimit(Number(newLimit));
              setCurrentPage(1);
            }}
            serverColumnFilters={serverColumnFilters}
            onServerColumnFiltersChange={(filters) => {
              setServerColumnFilters({ event_title: filters.event_title || "" });
              setCurrentPage(1);
            }}
            onRefresh={() => getList()}
            permission={PERMISSION}
            emptyStateMessage="No tee-time windows found"
            activeTab={activeTab}
            targetRef={targetRef}
            exportFileName="tee-time-windows"
          />

          <div style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "center", color: "#64748b", fontSize: 13 }}>
            <FontAwesomeIcon icon={faCalendarDays} />
            <span>Each row here is one booking window. Open the Tee Sheet action to assign times, tees, and player groups.</span>
          </div>
        </div>
      </div>

      <LoadingEffect isLoading={isSaving} text="Saving tee-time windows..." />
    </div>
  );
}
