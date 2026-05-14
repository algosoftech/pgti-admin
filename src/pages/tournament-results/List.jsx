import React, { useEffect, useRef, useMemo, useState, useCallback } from "react";
import { Dropdown, Modal, notification } from "antd";
import {
  faPlus, faEdit, faTrash, faEllipsis, faRefresh,
  faTrophy, faFilePdf, faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Top_navbar from "components/layout/TopNavbar";
import EnhancedTable from "components/table/EnhancedTable/EnhancedTable";
import { useNavigate } from "react-router-dom";
import {
  CheckCircleOutlined, InfoCircleOutlined, ExclamationCircleOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { usePermissions } from "contexts/PermissionContext";
import { useAppDispatch, useAppSelector } from "store/hooks";
import {
  fetchTournamentResultsList, deleteTournamentResultAction,
  setCurrentPage, setLimit,
} from "store/slices/tournamentResults.slice";
import { exportTournamentResultsPDF } from "services/tournamentResults.service";
import "styles/admin-pages.css";

const MONTHS = [
  { value: "", label: "All Months" },
  { value: "1",  label: "January" }, { value: "2",  label: "February" },
  { value: "3",  label: "March" },   { value: "4",  label: "April" },
  { value: "5",  label: "May" },     { value: "6",  label: "June" },
  { value: "7",  label: "July" },    { value: "8",  label: "August" },
  { value: "9",  label: "September" },{ value: "10", label: "October" },
  { value: "11", label: "November" },{ value: "12", label: "December" },
];

const STATUS_MAP = {
  WIN: { bg: "#f0fdf4", color: "#16a34a", border: "#86efac", label: "Win" },
  RU:  { bg: "#eff6ff", color: "#1d4ed8", border: "#93c5fd", label: "Runner-up" },
  CUT: { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5", label: "Cut" },
  MC:  { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5", label: "Missed Cut" },
  WD:  { bg: "#fffbeb", color: "#d97706", border: "#fcd34d", label: "Withdrew" },
  DQ:  { bg: "#fff1f2", color: "#be123c", border: "#fda4af", label: "Disqualified" },
  DNP: { bg: "#f8fafc", color: "#64748b", border: "#cbd5e1", label: "Did Not Play" },
};

const StatusChip = ({ status }) => {
  const s = STATUS_MAP[status?.toUpperCase()] || { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0", label: status || "—" };
  return (
    <span style={{ fontSize: 11, fontWeight: 600, background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: "3px 10px", borderRadius: 20 }}>
      {s.label}
    </span>
  );
};

const currentYear = new Date().getFullYear();
const SEASONS = Array.from({ length: 10 }, (_, i) => currentYear - i);

export default function TournamentResultList() {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const targetRef = useRef(null);
  const PERMISSION = usePermissions("tournament_results");

  const {
    listData: ALLLISTDATA, isLoading, currentPage,
    totalPages: TOTALPAGES, limit: LIMIT, skip: SKIP, count,
  } = useAppSelector((s) => s.tournamentResults);

  const [season,    setSeason]   = useState(String(currentYear));
  const [month,     setMonth]    = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [serverColumnFilters, setServerColumnFilters] = useState({ search: "" });
  const [pdfLoading, setPdfLoading] = useState(false);

  const getList = useCallback(() => {
    dispatch(fetchTournamentResultsList({
      skip: SKIP || 0,
      limit: LIMIT || 10,
      condition: {
        ...(season     ? { season }     : {}),
        ...(month      ? { month }      : {}),
        ...(dateRange.from ? { from_date: dateRange.from } : {}),
        ...(dateRange.to   ? { to_date:   dateRange.to   } : {}),
        ...(serverColumnFilters.search ? { search: serverColumnFilters.search } : {}),
      },
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SKIP, LIMIT, season, month, dateRange, serverColumnFilters]);

  useEffect(() => {
    getList();
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = "PGTI || Tournament Results";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, LIMIT]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (currentPage !== 1) dispatch(setCurrentPage(1));
      else getList();
    }, 400);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [season, month, dateRange, serverColumnFilters]);

  const handleDelete = (item) => {
    Modal.confirm({
      title: "Delete this result?",
      icon: <ExclamationCircleOutlined style={{ color: "#dc2626" }} />,
      content: `Remove "${item.tournament_name}" result for ${item.player_name || "player"}?`,
      okText: "Delete", okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: async () => {
        const res = await dispatch(deleteTournamentResultAction({ id: item.id }));
        notification.open({
          message: res.error ? "Oops!" : "Deleted",
          description: res.error ? (res.payload || "Failed to delete.") : "Result deleted.",
          placement: "topRight",
          icon: res.error ? <InfoCircleOutlined style={{ color: "red" }} /> : <CheckCircleOutlined style={{ color: "green" }} />,
          duration: 2,
        });
      },
    });
  };

  const handleExportPDF = async () => {
    setPdfLoading(true);
    const res = await exportTournamentResultsPDF({
      condition: {
        ...(season     ? { season }     : {}),
        ...(month      ? { month }      : {}),
        ...(dateRange.from ? { from_date: dateRange.from } : {}),
        ...(dateRange.to   ? { to_date:   dateRange.to   } : {}),
        ...(serverColumnFilters.search ? { search: serverColumnFilters.search } : {}),
      },
    });
    setPdfLoading(false);
    if (res.status && res.url) {
      window.open(res.url, "_blank");
    } else {
      notification.open({
        message: "Export Failed",
        description: res.message || "Could not generate PDF.",
        placement: "topRight",
        icon: <InfoCircleOutlined style={{ color: "red" }} />,
        duration: 2,
      });
    }
  };

  const totalPrizeMoney = useMemo(
    () => ALLLISTDATA.reduce((sum, r) => sum + (Number(r.prize_money) || 0), 0),
    [ALLLISTDATA]
  );
  const wins = useMemo(
    () => ALLLISTDATA.filter(r => r.status?.toUpperCase() === "WIN").length,
    [ALLLISTDATA]
  );

  const columns = useMemo(() => [
    {
      accessorKey: "index",
      header: "#",
      cell: ({ row }) => <span style={{ color: "#94a3b8", fontSize: 13 }}>{row.index + SKIP + 1}</span>,
      size: 60, enableSorting: false,
    },
    {
      accessorKey: "start_date",
      header: "Date",
      cell: ({ row }) => {
        const start = row.original.start_date;
        const end   = row.original.end_date;
        if (!start) return <span style={{ color: "#cbd5e1" }}>—</span>;
        const s = moment(start);
        const e = end ? moment(end) : null;
        return (
          <div style={{ fontSize: 12, color: "#334155" }}>
            {e && !s.isSame(e, "month")
              ? `${s.format("DD MMM")} – ${e.format("DD MMM, YYYY")}`
              : e
                ? `${s.format("DD")} – ${e.format("DD MMM, YYYY")}`
                : s.format("DD MMM, YYYY")}
          </div>
        );
      },
      size: 160, enableSorting: true,
    },
    {
      accessorKey: "tournament_name",
      header: "Tournament",
      cell: ({ getValue, row }) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: "#1e3a5f" }}>{getValue() || "—"}</div>
          {row.original.player_name && (
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{row.original.player_name}</div>
          )}
        </div>
      ),
      size: 260, enableColumnFilter: true,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => <StatusChip status={getValue()} />,
      size: 120,
    },
    {
      accessorKey: "position",
      header: "Pos",
      cell: ({ getValue }) => {
        const v = getValue();
        if (!v && v !== 0) return <span style={{ color: "#cbd5e1", fontSize: 13 }}>—</span>;
        return (
          <span style={{
            fontSize: 13, fontWeight: 700, color: "#1e3a5f",
            background: Number(v) <= 3 ? "#fef9c3" : "#f8fafc",
            padding: "2px 10px", borderRadius: 20, border: "1px solid #e2e8f0",
          }}>
            {v}
          </span>
        );
      },
      size: 80,
    },
    {
      accessorKey: "prize_money",
      header: "Prize Money",
      cell: ({ getValue }) => {
        const v = getValue();
        if (!v && v !== 0) return <span style={{ color: "#cbd5e1", fontSize: 13 }}>—</span>;
        return (
          <span style={{ fontSize: 13, fontWeight: 600, color: "#16a34a" }}>
            ₹{Number(v).toLocaleString("en-IN")}
          </span>
        );
      },
      size: 140,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <Dropdown
            overlay={
              <div className="action-dropdown-menu">
                {(PERMISSION?.edit === "Y" || PERMISSION?.fullAccess === "Y") && (
                  <button className="action-dropdown-item" onClick={() => navigate("/admin/tournament-results/addeditdata", { state: item })}>
                    <FontAwesomeIcon icon={faEdit} /><span>Edit</span>
                  </button>
                )}
                {(PERMISSION?.delete === "Y" || PERMISSION?.fullAccess === "Y") && (
                  <button className="action-dropdown-item danger" onClick={() => handleDelete(item)}>
                    <FontAwesomeIcon icon={faTrash} /><span>Delete</span>
                  </button>
                )}
              </div>
            }
            placement="bottomRight"
            trigger={["click"]}
          >
            <button className="action-dropdown-trigger"><FontAwesomeIcon icon={faEllipsis} /></button>
          </Dropdown>
        );
      },
      size: 80, enableSorting: false, enableResizing: false,
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [SKIP, PERMISSION]);

  return (
    <div className="admin-page-container" ref={targetRef}>
      <Top_navbar title="Tournament Results" />

      {/* Stats strip */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        {[
          { label: "Total Results",   value: count,    color: "#1d4ed8" },
          { label: "Wins (this page)", value: wins,     color: "#16a34a" },
          { label: "Prize (this page)", value: `₹${totalPrizeMoney.toLocaleString("en-IN")}`, color: "#d97706" },
        ].map(s => (
          <div key={s.label} style={{ flex: "1 1 160px", background: "white", borderRadius: 10, border: "1px solid #e2e8f0", padding: "14px 18px" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value ?? "—"}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16, alignItems: "flex-end" }}>
        <div className="form-group" style={{ margin: 0, minWidth: 120 }}>
          <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>Season</label>
          <select className="form-input" style={{ fontSize: 13 }} value={season} onChange={e => setSeason(e.target.value)}>
            <option value="">All Seasons</option>
            {SEASONS.map(y => <option key={y} value={String(y)}>{y}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ margin: 0, minWidth: 140 }}>
          <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>Month</label>
          <select className="form-input" style={{ fontSize: 13 }} value={month} onChange={e => setMonth(e.target.value)}>
            {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ margin: 0, minWidth: 140 }}>
          <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>From Date</label>
          <input type="date" className="form-input" style={{ fontSize: 13 }} value={dateRange.from} onChange={e => setDateRange(p => ({ ...p, from: e.target.value }))} />
        </div>
        <div className="form-group" style={{ margin: 0, minWidth: 140 }}>
          <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>To Date</label>
          <input type="date" className="form-input" style={{ fontSize: 13 }} value={dateRange.to} onChange={e => setDateRange(p => ({ ...p, to: e.target.value }))} />
        </div>
        {(season || month || dateRange.from || dateRange.to) && (
          <button className="action-button secondary" style={{ fontSize: 12, marginBottom: 0 }}
            onClick={() => { setSeason(String(currentYear)); setMonth(""); setDateRange({ from: "", to: "" }); }}>
            Clear
          </button>
        )}
      </div>

      <div className="content-card">
        <div className="tabs-header">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FontAwesomeIcon icon={faTrophy} style={{ color: "#d97706" }} />
            <span style={{ fontWeight: 600, color: "#1e3a5f", fontSize: 14 }}>Tournament Results</span>
          </div>
          <div className="tabs-actions">
            <button className="action-button secondary" style={{ fontSize: 12 }} onClick={handleExportPDF} disabled={pdfLoading}>
              <FontAwesomeIcon icon={pdfLoading ? faDownload : faFilePdf} />
              {pdfLoading ? "Generating…" : "Download PDF"}
            </button>
            <button className="action-button secondary" onClick={getList}>
              <FontAwesomeIcon icon={faRefresh} /> Refresh
            </button>
            {(PERMISSION?.add === "Y" || PERMISSION?.fullAccess === "Y") && (
              <button className="action-button primary" onClick={() => navigate("/admin/tournament-results/addeditdata")}>
                <FontAwesomeIcon icon={faPlus} /> Add Result
              </button>
            )}
          </div>
        </div>

        <div className="content-card-body">
          <EnhancedTable
            data={ALLLISTDATA}
            columns={columns}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={TOTALPAGES}
            limit={LIMIT}
            skip={SKIP}
            count={count}
            onPageChange={(page) => { dispatch(setCurrentPage(page)); targetRef.current?.scrollIntoView({ behavior: "smooth" }); }}
            onLimitChange={(n) => { dispatch(setLimit(Number(n))); }}
            serverColumnFilters={serverColumnFilters}
            onServerColumnFiltersChange={setServerColumnFilters}
            onRefresh={getList}
            permission={PERMISSION}
            emptyStateMessage="No tournament results found"
            targetRef={targetRef}
          />
        </div>
      </div>
    </div>
  );
}
