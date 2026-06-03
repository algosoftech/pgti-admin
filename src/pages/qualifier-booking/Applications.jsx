import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { notification, Select } from "antd";
import {
  CheckCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import Top_navbar from "components/layout/TopNavbar";
import EnhancedTable from "components/table/EnhancedTable/EnhancedTable";
import LoadingEffect from "components/ui/Loading/LoadingEffect";
import { usePermissions } from "contexts/PermissionContext";
import {
  exportQualifierBookingApplications,
  listQualifierBookingApplications,
} from "services/qualifierBooking.service";
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

export default function QualifierBookingApplications() {
  const targetRef = useRef(null);
  const permission = usePermissions("qualifier_booking_applications");
  const user = JSON.parse(sessionStorage.getItem("ADMIN-INFO") || "{}");
  const canExport =
    user?.admin_type === "Super Admin" ||
    permission?.export === "Y" ||
    permission?.fullAccess === "Y";

  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTournament, setSelectedTournament] = useState(undefined);
  const [appliedTournament, setAppliedTournament] = useState(undefined);
  const [tournaments, setTournaments] = useState([]);

  const skip = (currentPage - 1) * PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE));

  const loadRows = useCallback(async () => {
    setIsLoading(true);
    const response = await listQualifierBookingApplications({
      skip,
      limit: PAGE_SIZE,
      condition: {
        ...(appliedTournament ? { event_id: appliedTournament } : {}),
      },
    });

    if (response?.status) {
      setRows(response.result || []);
      setCount(response.count || 0);
      setTournaments(response.filters?.tournaments || []);
    } else {
      notify("Oops!", response?.message || "Failed to load qualifier booking applications.");
    }
    setIsLoading(false);
  }, [appliedTournament, skip]);

  useEffect(() => {
    document.title = "PGTI || Admin || Qualifier Booking Applications";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const handleExport = async () => {
    setIsExporting(true);
    const response = await exportQualifierBookingApplications({
      ...(appliedTournament ? { event_id: appliedTournament } : {}),
    });

    if (response?.status && response.result?.file_url) {
      window.open(response.result.file_url, "_blank", "noopener,noreferrer");
    } else {
      notify("Oops!", response?.message || "Failed to export qualifier booking applications.");
    }
    setIsExporting(false);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "index",
        header: "#",
        cell: ({ row }) => row.index + skip + 1,
        size: 60,
        enableSorting: false,
      },
      {
        accessorKey: "player_name",
        header: "Player Name",
        size: 180,
        enableColumnFilter: true,
      },
      {
        accessorKey: "mobile_no",
        header: "Mobile No.",
        size: 140,
      },
      {
        accessorKey: "email",
        header: "Email",
        size: 220,
      },
      {
        accessorKey: "member_address",
        header: "Member Address",
        cell: ({ getValue }) => (
          <div style={{ whiteSpace: "normal", lineHeight: 1.6 }}>
            {getValue() || "—"}
          </div>
        ),
        size: 300,
      },
      {
        accessorKey: "tournament",
        header: "Tournament",
        size: 180,
      },
      {
        accessorKey: "booking_fee",
        header: "Booking Fee",
        size: 110,
      },
      {
        accessorKey: "booking_date_display",
        header: "Booking Date",
        size: 160,
      },
      {
        accessorKey: "payment_slip_url",
        header: "Payment Slip",
        cell: ({ row }) =>
          row.original.payment_slip_url ? (
            <div className="d-flex gap-2 flex-wrap">
              <a
                href={row.original.payment_slip_url}
                target="_blank"
                rel="noreferrer"
                className="action-button secondary"
                style={{ padding: "6px 12px", fontSize: 12 }}
              >
                Link
              </a>
              <a
                href={row.original.payment_slip_url}
                target="_blank"
                rel="noreferrer"
                className="action-button secondary"
                style={{ padding: "6px 12px", fontSize: 12 }}
              >
                <EyeOutlined /> Preview
              </a>
            </div>
          ) : (
            "—"
          ),
        size: 150,
      },
      {
        accessorKey: "payment_received",
        header: "Payment Received",
        cell: ({ row }) => (
          <span className={`status-badge ${row.original.payment_received ? "active" : "inactive"}`}>
            {row.original.payment_received ? "Yes" : "No"}
          </span>
        ),
        size: 140,
      },
    ],
    [skip]
  );

  return (
    <div className="admin-page-container" ref={targetRef}>
      <Top_navbar title="Qualifier Booking Applications" />

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
          <div style={{ fontSize: 24, fontWeight: 800, color: "#1d4ed8" }}>{count}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Visible Applications</div>
        </div>
      </div>

      <div className="content-card">
        <div className="tabs-header">
          <div className="tabs-container">
            <button className="tab-item active">Qualifier Bookings</button>
          </div>
          <div className="tabs-actions">
            <button className="action-button secondary" onClick={loadRows}>
              <ReloadOutlined /> Refresh
            </button>
            <button
              className="action-button primary"
              onClick={handleExport}
              disabled={!canExport || isExporting}
            >
              <DownloadOutlined /> Download Bookings
            </button>
          </div>
        </div>

        <div className="content-card-body">
          <div className="row" style={{ marginBottom: 8 }}>
            <div className="col-lg-8 col-md-9 col-12 mb-3">
              <label className="form-label">Filter by Tournament</label>
              <Select
                value={selectedTournament}
                onChange={setSelectedTournament}
                placeholder="-- All Tournaments --"
                size="large"
                allowClear
                style={{ width: "100%" }}
                options={(tournaments || []).map((item) => ({
                  value: item.id,
                  label: item.title,
                }))}
              />
            </div>
            <div className="col-lg-4 col-md-3 col-12 mb-3 d-flex align-items-end">
              <button
                className="action-button secondary"
                onClick={() => {
                  setCurrentPage(1);
                  setAppliedTournament(selectedTournament || undefined);
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
            emptyStateMessage="No qualifier booking applications found"
            targetRef={targetRef}
            exportFileName="qualifier-booking-applications"
          />
        </div>
      </div>

      <LoadingEffect
        isLoading={isLoading || isExporting}
        text={isExporting ? "Exporting qualifier booking applications..." : "Loading qualifier booking applications..."}
      />
    </div>
  );
}
