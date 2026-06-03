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
import { listPhysioBookings } from "services/physioBooking.service";
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

export default function PhysioBookings() {
  const targetRef = useRef(null);
  const permission = usePermissions("physio_bookings");
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTournament, setSelectedTournament] = useState(undefined);
  const [selectedStatus, setSelectedStatus] = useState(undefined);
  const [applied, setApplied] = useState({});
  const [tournaments, setTournaments] = useState([]);

  const skip = (currentPage - 1) * PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE));

  const loadRows = useCallback(async () => {
    setIsLoading(true);
    const response = await listPhysioBookings({
      skip,
      limit: PAGE_SIZE,
      condition: applied,
    });
    if (response?.status) {
      setRows(response.result || []);
      setCount(response.count || 0);
      setTournaments(response.filters?.tournaments || []);
    } else {
      notify("Oops!", response?.message || "Failed to load physio bookings.");
    }
    setIsLoading(false);
  }, [applied, skip]);

  useEffect(() => {
    document.title = "PGTI || Admin || Physio Bookings";
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
      { accessorKey: "player_name", header: "Player Name", size: 180 },
      { accessorKey: "membership_id", header: "Member Code", size: 140 },
      { accessorKey: "tournament", header: "Tournament", size: 220 },
      { accessorKey: "session_display", header: "Booking Date & Time", size: 240 },
      { accessorKey: "booked_at_display", header: "Booked On", size: 180 },
      {
        accessorKey: "booking_status_display",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={`status-badge ${
              row.original.booking_status_display === "upcoming"
                ? "active"
                : row.original.booking_status_display === "complete"
                  ? "inactive"
                  : "inactive"
            }`}
          >
            {row.original.booking_status_display}
          </span>
        ),
        size: 120,
      },
    ],
    [skip]
  );

  return (
    <div className="admin-page-container" ref={targetRef}>
      <Top_navbar title="Physio Bookings" />

      <div className="content-card">
        <div className="tabs-header">
          <div className="tabs-container">
            <button className="tab-item active">Physio Bookings</button>
          </div>
          <div className="tabs-actions">
            <button className="action-button secondary" onClick={loadRows}>
              <ReloadOutlined /> Refresh
            </button>
          </div>
        </div>

        <div className="content-card-body">
          <div className="row g-3" style={{ marginBottom: 8 }}>
            <div className="col-lg-5 col-md-6">
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
              <label className="form-label">Booking Status</label>
              <Select
                value={selectedStatus}
                onChange={setSelectedStatus}
                placeholder="All"
                size="large"
                allowClear
                style={{ width: "100%" }}
                options={[
                  { value: "upcoming", label: "Upcoming" },
                  { value: "complete", label: "Complete" },
                  { value: "cancelled", label: "Cancelled" },
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
            emptyStateMessage="No physio bookings found"
            targetRef={targetRef}
            exportFileName="physio-bookings"
          />
        </div>
      </div>

      <LoadingEffect isLoading={isLoading} text="Loading physio bookings..." />
    </div>
  );
}
