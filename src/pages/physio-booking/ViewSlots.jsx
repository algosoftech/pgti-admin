import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { notification, Select } from "antd";
import {
  CheckCircleOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import Top_navbar from "components/layout/TopNavbar";
import EnhancedTable from "components/table/EnhancedTable/EnhancedTable";
import LoadingEffect from "components/ui/Loading/LoadingEffect";
import { usePermissions } from "contexts/PermissionContext";
import { listPhysioSlots } from "services/physioBooking.service";
import "styles/admin-pages.css";

const PAGE_SIZE = 20;

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

export default function PhysioViewSlots() {
  const targetRef = useRef(null);
  const permission = usePermissions("physio_view_slots");
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTournament, setSelectedTournament] = useState(undefined);
  const [selectedDate, setSelectedDate] = useState(undefined);
  const [selectedStatus, setSelectedStatus] = useState(undefined);
  const [applied, setApplied] = useState({});
  const [tournaments, setTournaments] = useState([]);
  const [dates, setDates] = useState([]);

  const skip = (currentPage - 1) * PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE));

  const loadRows = useCallback(async () => {
    setIsLoading(true);
    const response = await listPhysioSlots({
      skip,
      limit: PAGE_SIZE,
      condition: applied,
    });
    if (response?.status) {
      setRows(response.result || []);
      setCount(response.count || 0);
      setTournaments(response.filters?.tournaments || []);
      setDates(response.filters?.dates || []);
    } else {
      notify("Oops!", response?.message || "Failed to load physio slots.");
    }
    setIsLoading(false);
  }, [applied, skip]);

  useEffect(() => {
    document.title = "PGTI || Admin || Physio View Slots";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "index",
        header: "#",
        cell: ({ row }) => row.index + skip + 1,
        size: 60,
        enableSorting: false,
      },
      { accessorKey: "tournament", header: "Tournament", size: 220 },
      { accessorKey: "booking_date_display", header: "Date", size: 140 },
      { accessorKey: "time_range_display", header: "Session Time", size: 180 },
      {
        accessorKey: "status",
        header: "Slot Status",
        cell: ({ row }) => (
          <span className={`status-badge ${row.original.status === "A" ? "active" : "inactive"}`}>
            {row.original.status === "A" ? "Active" : "Inactive"}
          </span>
        ),
        size: 120,
      },
      {
        accessorKey: "is_booked",
        header: "Booking Status",
        cell: ({ row }) => (
          <span className={`status-badge ${row.original.is_booked ? "active" : "inactive"}`}>
            {row.original.is_booked ? "Booked" : "Available"}
          </span>
        ),
        size: 130,
      },
      { accessorKey: "booked_player_name", header: "Booked By", size: 220 },
    ],
    [skip]
  );

  return (
    <div className="admin-page-container" ref={targetRef}>
      <Top_navbar title="Physio View Slots" />

      <div className="content-card">
        <div className="tabs-header">
          <div className="tabs-container">
            <button className="tab-item active">View Slots</button>
          </div>
          <div className="tabs-actions">
            <button className="action-button secondary" onClick={loadRows}>
              <ReloadOutlined /> Refresh
            </button>
          </div>
        </div>

        <div className="content-card-body">
          <div className="row g-3" style={{ marginBottom: 8 }}>
            <div className="col-lg-4 col-md-6">
              <label className="form-label">Tournament</label>
              <Select
                value={selectedTournament}
                onChange={setSelectedTournament}
                placeholder="All Tournaments"
                size="large"
                allowClear
                showSearch
                optionFilterProp="label"
                style={{ width: "100%" }}
                options={tournaments.map((item) => ({ value: item.id, label: item.title }))}
              />
            </div>
            <div className="col-lg-3 col-md-6">
              <label className="form-label">Date</label>
              <Select
                value={selectedDate}
                onChange={setSelectedDate}
                placeholder="All Dates"
                size="large"
                allowClear
                style={{ width: "100%" }}
                options={dates.map((item) => ({ value: item.value, label: item.label }))}
              />
            </div>
            <div className="col-lg-3 col-md-6">
              <label className="form-label">Status</label>
              <Select
                value={selectedStatus}
                onChange={setSelectedStatus}
                placeholder="All Slots"
                size="large"
                allowClear
                style={{ width: "100%" }}
                options={[
                  { value: "available", label: "Available" },
                  { value: "booked", label: "Booked" },
                  { value: "A", label: "Active" },
                  { value: "I", label: "Inactive" },
                ]}
              />
            </div>
            <div className="col-lg-2 col-md-6 d-flex align-items-end">
              <button
                className="action-button secondary"
                onClick={() => {
                  setCurrentPage(1);
                  setApplied({
                    ...(selectedTournament ? { event_id: selectedTournament } : {}),
                    ...(selectedDate ? { booking_date: selectedDate } : {}),
                    ...(selectedStatus ? { status: selectedStatus } : {}),
                  });
                }}
              >
                Apply
              </button>
            </div>
          </div>

          <EnhancedTable
            data={rows}
            columns={columns}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            limit={PAGE_SIZE}
            skip={skip}
            count={count}
            onPageChange={(page) => {
              setCurrentPage(page);
              targetRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
            onLimitChange={() => {}}
            onRefresh={loadRows}
            permission={permission}
            emptyStateMessage="No physio slots found"
            targetRef={targetRef}
            exportFileName="physio-slots"
          />
        </div>
      </div>

      <LoadingEffect isLoading={isLoading} text="Loading physio slots..." />
    </div>
  );
}
