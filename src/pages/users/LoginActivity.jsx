import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { notification } from "antd";
import {
  faShieldHalved, faRefresh, faDesktop, faMobileScreen,
  faTablet, faGlobe, faCircleCheck, faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Top_navbar from "components/layout/TopNavbar";
import EnhancedTable from "components/table/EnhancedTable/EnhancedTable";
import { InfoCircleOutlined, UserOutlined } from "@ant-design/icons";
import moment from "moment";
import { listLoginActivity } from "services/loginActivity.service";
import "styles/admin-pages.css";

const PAGE_SIZE = 20;

const deviceIcon = (device = "") => {
  const d = device.toLowerCase();
  if (d.includes("mobile") || d.includes("android") || d.includes("iphone")) return faMobileScreen;
  if (d.includes("tablet") || d.includes("ipad")) return faTablet;
  if (d.includes("desktop") || d.includes("windows") || d.includes("mac")) return faDesktop;
  return faGlobe;
};

const StatusChip = ({ status }) => {
  const ok = status === "success" || status === "S" || status === 1 || status === true;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 12, fontWeight: 600,
      background: ok ? "#f0fdf4" : "#fef2f2",
      color: ok ? "#16a34a" : "#dc2626",
      border: `1px solid ${ok ? "#86efac" : "#fca5a5"}`,
      padding: "3px 10px", borderRadius: 20,
    }}>
      <FontAwesomeIcon icon={ok ? faCircleCheck : faCircleXmark} style={{ fontSize: 11 }} />
      {ok ? "Success" : "Failed"}
    </span>
  );
};

export default function LoginActivity() {
  const targetRef = useRef(null);

  const [data,        setData]        = useState([]);
  const [count,       setCount]       = useState(0);
  const [isLoading,   setIsLoading]   = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [activeTab,   setActiveTab]   = useState("all");
  const [dateRange,   setDateRange]   = useState({ from: "", to: "" });
  const [serverColumnFilters, setServerColumnFilters] = useState({ search: "" });

  const skip = (currentPage - 1) * PAGE_SIZE;

  const getList = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await listLoginActivity({
        skip,
        limit: PAGE_SIZE,
        condition: {
          ...(activeTab !== "all" ? { status: activeTab } : {}),
          ...(dateRange.from     ? { from_date: dateRange.from } : {}),
          ...(dateRange.to       ? { to_date:   dateRange.to   } : {}),
          ...(serverColumnFilters.search ? { search: serverColumnFilters.search } : {}),
        },
      });
      if (res.status) {
        setData(res.result);
        setCount(res.count);
        setTotalPages(Math.max(1, Math.ceil(res.count / PAGE_SIZE)));
      } else {
        notification.open({ message: "Oops!", description: res.message || "Failed to load login activity.", placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
      }
    } finally {
      setIsLoading(false);
    }
  }, [skip, activeTab, dateRange, serverColumnFilters]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (currentPage !== 1) setCurrentPage(1);
      else getList();
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverColumnFilters, activeTab, dateRange]);

  useEffect(() => {
    getList();
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = "PGTI || Login Activity";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const columns = useMemo(() => [
    {
      accessorKey: "index",
      header: "#",
      cell: ({ row }) => <span style={{ color: "#94a3b8", fontSize: 13 }}>{row.index + skip + 1}</span>,
      size: 60, enableSorting: false,
    },
    {
      accessorKey: "player_name",
      header: "Player",
      cell: ({ row }) => {
        const item = row.original;
        const name = item.player_name || item.full_name || item.name || "Unknown";
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#1e3a5f,#0369a1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 12, fontWeight: 700, color: "white" }}>
              {name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || <UserOutlined />}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#1e3a5f" }}>{name}</div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>{item.email || item.mobile || "—"}</div>
            </div>
          </div>
        );
      },
      size: 200, enableColumnFilter: true,
    },
    {
      accessorKey: "login_at",
      header: "Login Time",
      cell: ({ getValue }) => {
        const v = getValue();
        return v ? (
          <div>
            <div style={{ fontSize: 13, color: "#334155", fontWeight: 500 }}>{moment(v).format("DD MMM YYYY, hh:mm A")}</div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>{moment(v).fromNow()}</div>
          </div>
        ) : <span style={{ color: "#cbd5e1" }}>—</span>;
      },
      size: 180, enableSorting: true,
    },
    {
      accessorKey: "ip_address",
      header: "IP Address",
      cell: ({ getValue }) => (
        <span style={{ fontSize: 12, fontFamily: "monospace", background: "#f8fafc", padding: "2px 8px", borderRadius: 6, border: "1px solid #e2e8f0", color: "#475569" }}>
          {getValue() || "—"}
        </span>
      ),
      size: 140,
    },
    {
      accessorKey: "device",
      header: "Device",
      cell: ({ getValue, row }) => {
        const device  = getValue() || "";
        const browser = row.original.browser || "";
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <FontAwesomeIcon icon={deviceIcon(device)} style={{ color: "#64748b", fontSize: 14, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 12, color: "#334155" }}>{device || "Unknown"}</div>
              {browser && <div style={{ fontSize: 11, color: "#94a3b8" }}>{browser}</div>}
            </div>
          </div>
        );
      },
      size: 170,
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ getValue }) => (
        <span style={{ fontSize: 12, color: "#64748b" }}>{getValue() || "—"}</span>
      ),
      size: 150,
    },
    {
      accessorKey: "login_method",
      header: "Method",
      cell: ({ getValue }) => {
        const v = getValue();
        const methodMap = {
          email:    { bg: "#eff6ff", color: "#1d4ed8", label: "Email" },
          mobile:   { bg: "#f0fdf4", color: "#16a34a", label: "Mobile" },
          username: { bg: "#fdf4ff", color: "#7e22ce", label: "Username" },
        };
        const m = methodMap[v?.toLowerCase()] || { bg: "#f1f5f9", color: "#475569", label: v || "—" };
        return <span style={{ fontSize: 11, fontWeight: 600, background: m.bg, color: m.color, padding: "2px 8px", borderRadius: 20 }}>{m.label}</span>;
      },
      size: 110,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => <StatusChip status={getValue()} />,
      size: 110,
    },
    {
      accessorKey: "failure_reason",
      header: "Failure Reason",
      cell: ({ getValue, row }) => {
        const ok = row.original.status === "success" || row.original.status === "S";
        if (ok) return <span style={{ color: "#cbd5e1", fontSize: 12 }}>—</span>;
        return <span style={{ fontSize: 12, color: "#dc2626" }}>{getValue() || "Invalid credentials"}</span>;
      },
      size: 180,
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [skip]);

  return (
    <div className="admin-page-container" ref={targetRef}>
      <Top_navbar title="Login Activity" />

      {/* Stats strip */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        {[
          { label: "Total Logins",    value: count,                                        color: "#1d4ed8" },
          { label: "Successful",      value: data.filter(d => d.status === "success" || d.status === "S").length, color: "#16a34a" },
          { label: "Failed Attempts", value: data.filter(d => d.status !== "success" && d.status !== "S").length, color: "#dc2626" },
        ].map(s => (
          <div key={s.label} style={{ flex: "1 1 140px", background: "white", borderRadius: 10, border: "1px solid #e2e8f0", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value ?? "—"}</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>{s.label}</div>
          </div>
        ))}

        {/* Date range filter */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "2 1 300px" }}>
          <div className="form-group" style={{ margin: 0, flex: 1 }}>
            <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>From Date</label>
            <input type="date" className="form-input" value={dateRange.from} onChange={e => setDateRange(p => ({ ...p, from: e.target.value }))} style={{ fontSize: 13 }} />
          </div>
          <div className="form-group" style={{ margin: 0, flex: 1 }}>
            <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>To Date</label>
            <input type="date" className="form-input" value={dateRange.to} onChange={e => setDateRange(p => ({ ...p, to: e.target.value }))} style={{ fontSize: 13 }} />
          </div>
          {(dateRange.from || dateRange.to) && (
            <button className="action-button secondary" style={{ fontSize: 12, marginTop: 16 }} onClick={() => setDateRange({ from: "", to: "" })}>
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="content-card">
        <div className="tabs-header">
          <div className="tabs-container">
            {[
              { key: "all",     label: "All Logins" },
              { key: "success", label: "Successful" },
              { key: "failed",  label: "Failed" },
            ].map(t => (
              <button key={t.key} className={`tab-item ${activeTab === t.key ? "active" : ""}`} onClick={() => { setActiveTab(t.key); setCurrentPage(1); }}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="tabs-actions">
            <button className="action-button secondary" onClick={() => getList()}>
              <FontAwesomeIcon icon={faRefresh} /> Refresh
            </button>
          </div>
        </div>

        {/* Security note */}
        <div style={{ padding: "10px 20px", background: "#f0f9ff", borderBottom: "1px solid #e0f2fe", display: "flex", alignItems: "center", gap: 8 }}>
          <FontAwesomeIcon icon={faShieldHalved} style={{ color: "#0369a1", fontSize: 13 }} />
          <span style={{ fontSize: 12, color: "#0369a1" }}>
            Login logs are retained for <strong>90 days</strong>. Multiple failed attempts from the same IP may indicate a brute-force attack.
          </span>
        </div>

        <div className="content-card-body">
          <EnhancedTable
            data={data}
            columns={columns}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            limit={PAGE_SIZE}
            skip={skip}
            count={count}
            onPageChange={(page) => { setCurrentPage(page); targetRef.current?.scrollIntoView({ behavior: "smooth" }); }}
            onLimitChange={() => {}}
            serverColumnFilters={serverColumnFilters}
            onServerColumnFiltersChange={setServerColumnFilters}
            onRefresh={getList}
            emptyStateMessage="No login activity found"
            targetRef={targetRef}
          />
        </div>
      </div>
    </div>
  );
}
