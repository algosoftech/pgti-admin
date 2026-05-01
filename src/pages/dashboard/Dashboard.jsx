import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faMedal,
  faFileAlt,
  faUserShield,
  faLayerGroup,
  faEnvelope,
  faGolfBallTee,
  faArrowRight,
  faChartLine,
  faUserPlus,
  faTrophy,
  faPenToSquare,
  faSpinner,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import Top_navbar from "components/layout/TopNavbar";
import { fetchDashboardStats } from "store/slices/dashboard.slice";
import "components/layout/dashboard.css";
import dayjs from "dayjs";

/* ─── Status chip colours for tournament results ─── */
const STATUS_COLORS = {
  WIN: "#10b981",
  RU:  "#3b82f6",
  T3:  "#8b5cf6",
  T5:  "#f59e0b",
  T10: "#f97316",
  CUT: "#ef4444",
  MC:  "#ef4444",
  WD:  "#f59e0b",
  DQ:  "#dc2626",
  DNP: "#94a3b8",
};

/* ─── Quick Actions ─── */
const QUICK_ACTIONS = [
  { label: "Add Player",           desc: "Create a new professional golfer profile", icon: faUserPlus,    color: "#1e3a5f",  bg: "rgba(30,58,95,0.1)",    to: "/admin/users/addeditdata" },
  { label: "Add Tournament Result",desc: "Record a player's tournament finish",       icon: faTrophy,      color: "#f59e0b",  bg: "rgba(245,158,11,0.1)",  to: "/admin/tournament-results/addeditdata" },
  // HIDDEN - Events module not shown on dashboard.
  // { label: "Create Event",         desc: "Schedule a new golf event",                 icon: faCalendarPlus,color: "#3b82f6",  bg: "rgba(59,130,246,0.1)",  to: "/admin/events/addeditdata" },
  { label: "Write Article",        desc: "Publish news or editorial content",         icon: faPenToSquare, color: "#10b981",  bg: "rgba(16,185,129,0.1)",  to: "/admin/articles/addeditdata" },
];

/* ─── Module links ─── */
const MODULE_LINKS = [
  { label: "Players",          icon: faUsers,       color: "#1e3a5f", to: "/admin/users/list" },
  { label: "Tournament Results", icon: faMedal,     color: "#f59e0b", to: "/admin/tournament-results/list" },
  // HIDDEN - Events module not shown on dashboard.
  // { label: "Events",           icon: faCalendarAlt, color: "#3b82f6", to: "/admin/events/list" },
  { label: "Articles",         icon: faFileAlt,     color: "#10b981", to: "/admin/articles/list" },
  { label: "CMS",              icon: faLayerGroup,  color: "#8b5cf6", to: "/admin/cms/banners/list" },
  { label: "Email Templates",  icon: faEnvelope,    color: "#0ea5e9", to: "/admin/email-templates/list" },
  { label: "Sub Admins",       icon: faUserShield,  color: "#64748b", to: "/admin/accounts/list" },
];

/* ─── Fallback mock data if API not ready ─── */
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const FALLBACK_MONTHLY = MONTHS_SHORT.map(m => ({ month: m, players: 0 }));

const Dashboard = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { stats, isLoading } = useSelector((s) => s.dashboard);

  useEffect(() => { dispatch(fetchDashboardStats()); }, [dispatch]);

  /* derive values with safe fallbacks */
  const totalPlayers         = stats?.totalPlayers         ?? "—";
  const activePlayers        = stats?.activePlayers        ?? "—";
  const inactivePlayers      = stats?.inactivePlayers      ?? "—";
  // HIDDEN - Events module not shown on dashboard.
  // const totalEvents          = stats?.totalEvents          ?? "—";
  // const upcomingEvents       = stats?.upcomingEvents?.slice(0, 5) ?? [];
  const totalResults         = stats?.totalTournamentResults ?? "—";
  const totalArticles        = stats?.totalArticles        ?? "—";
  const recentPlayers        = stats?.recentPlayers?.slice(0, 5) ?? [];
  const monthlyPlayers       = stats?.monthlyPlayers       ?? FALLBACK_MONTHLY;
  const resultsByStatus      = stats?.resultsByStatus      ?? [];

  const statCards = [
    { title: "Total Players",      value: totalPlayers,   sub: "all time",       icon: faUsers,       color: "#1e3a5f", bg: "rgba(30,58,95,0.12)",   to: "/admin/users/list" },
    { title: "Active Players",     value: activePlayers,  sub: "currently active",icon: faGolfBallTee,color: "#10b981", bg: "rgba(16,185,129,0.12)", to: "/admin/users/list" },
    { title: "Inactive Players",   value: inactivePlayers,sub: "currently inactive",icon: faUserShield,color: "#ef4444",bg: "rgba(239,68,68,0.10)",  to: "/admin/users/list" },
    // HIDDEN - Events module not shown on dashboard.
    // { title: "Events",             value: totalEvents,    sub: "total events",   icon: faCalendarAlt, color: "#3b82f6", bg: "rgba(59,130,246,0.12)", to: "/admin/events/list" },
    { title: "Tournament Results", value: totalResults,   sub: "all seasons",    icon: faMedal,       color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", to: "/admin/tournament-results/list" },
  ];

  const adminInfo = JSON.parse(sessionStorage.getItem("ADMIN-INFO") || "{}");
  const adminName = adminInfo?.name || "Admin";

  return (
    <>
      <Top_navbar />
      <div className="dashboard-container">

        {/* ─── Welcome bar ─── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#1f2937" }}>
              Welcome back, {adminName}
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#6b7280" }}>
              {dayjs().format("dddd, MMMM D, YYYY")} — PGTI Admin Portal
            </p>
          </div>
          <button
            onClick={() => dispatch(fetchDashboardStats())}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 500 }}
          >
            <FontAwesomeIcon icon={isLoading ? faSpinner : faRotateRight} spin={isLoading} />
            Refresh
          </button>
        </div>

        {/* ─── Stats cards ─── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 32 }}>
          {statCards.map((card, i) => (
            <div
              key={i}
              onClick={() => navigate(card.to)}
              className="stat-card"
              style={{ cursor: "pointer" }}
            >
              <div className="stat-card-header">
                <div className="stat-icon" style={{ backgroundColor: card.bg, color: card.color }}>
                  <FontAwesomeIcon icon={card.icon} />
                </div>
                <FontAwesomeIcon icon={faChartLine} style={{ color: "#cbd5e1", fontSize: 18 }} />
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{isLoading ? "…" : card.value}</h3>
                <p className="stat-title">{card.title}</p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>{card.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ─── Main content row ─── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24, marginBottom: 24 }}>

          {/* Monthly Player Registrations chart */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, border: "1px solid #e5e7eb", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "#1f2937" }}>Player Growth</h2>
                <p style={{ margin: "3px 0 0", fontSize: 13, color: "#9ca3af" }}>Monthly new players added — {dayjs().year()}</p>
              </div>
              <button
                onClick={() => navigate("/admin/users/list")}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "rgba(30,58,95,0.08)", color: "#1e3a5f", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500 }}
              >
                View All <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 11 }} />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthlyPlayers} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="pgtiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1e3a5f" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: 13 }}
                  formatter={(v) => [v, "New Players"]}
                />
                <Area type="monotone" dataKey="players" stroke="#1e3a5f" strokeWidth={2.5} fill="url(#pgtiGrad)" dot={{ r: 4, fill: "#1e3a5f", strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* HIDDEN - Events module not shown on dashboard. */}
          {/* Upcoming Events */}
          {/*
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e5e7eb", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "#1f2937" }}>Upcoming Events</h2>
              <button
                onClick={() => navigate("/admin/events/list")}
                style={{ background: "none", border: "none", color: "#1e3a5f", cursor: "pointer", fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}
              >
                View all <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 10 }} />
              </button>
            </div>
            {isLoading ? (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 14 }}>
                <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: 8 }} /> Loading…
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#cbd5e1" }}>
                <FontAwesomeIcon icon={faCalendarAlt} style={{ fontSize: 36, marginBottom: 10 }} />
                <p style={{ margin: 0, fontSize: 13, color: "#9ca3af" }}>No upcoming events</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, overflowY: "auto" }}>
                {upcomingEvents.map((ev, i) => (
                  <div key={i} style={{ padding: "12px 14px", borderRadius: 10, background: "#f8fafc", border: "1px solid #f1f5f9", cursor: "pointer" }} onClick={() => navigate("/admin/events/list")}>
                    <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: "#1f2937", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.title || ev.event_name || "—"}</p>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "#6b7280" }}>
                        <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: 4, color: "#1e3a5f" }} />
                        {ev.start_date ? dayjs(ev.start_date).format("D MMM YYYY") : "TBD"}
                      </span>
                      {ev.location && (
                        <span style={{ fontSize: 11, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}>
                          📍 {ev.location}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          */}
        </div>

        {/* ─── Second content row ─── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>

          {/* Quick Actions */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e5e7eb", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <h2 style={{ margin: "0 0 18px", fontSize: 17, fontWeight: 600, color: "#1f2937" }}>Quick Actions</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {QUICK_ACTIONS.map((a, i) => (
                <div
                  key={i}
                  onClick={() => navigate(a.to)}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 12, border: "1px solid #e5e7eb", cursor: "pointer", transition: "all 0.2s", background: "#fafafa" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.background = a.bg; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.background = "#fafafa"; e.currentTarget.style.transform = "none"; }}
                >
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: a.bg, color: a.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                    <FontAwesomeIcon icon={a.icon} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#1f2937" }}>{a.label}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#9ca3af", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tournament Results by Status (Pie) */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e5e7eb", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "#1f2937" }}>Results by Status</h2>
                <p style={{ margin: "3px 0 0", fontSize: 13, color: "#9ca3af" }}>Breakdown of all tournament finishes</p>
              </div>
              <button
                onClick={() => navigate("/admin/tournament-results/list")}
                style={{ background: "none", border: "none", color: "#1e3a5f", cursor: "pointer", fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}
              >
                View all <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 10 }} />
              </button>
            </div>
            {isLoading ? (
              <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 14 }}>
                <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: 8 }} /> Loading…
              </div>
            ) : resultsByStatus.length === 0 ? (
              <div style={{ height: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#cbd5e1" }}>
                <FontAwesomeIcon icon={faMedal} style={{ fontSize: 36, marginBottom: 10 }} />
                <p style={{ margin: 0, fontSize: 13, color: "#9ca3af" }}>No results data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={resultsByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={75} innerRadius={40} paddingAngle={3}>
                    {resultsByStatus.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.status] || "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={10} formatter={(v) => <span style={{ fontSize: 12, color: "#374151" }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ─── Bottom row: Recent Players + Module Links ─── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* Recent Players */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e5e7eb", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "#1f2937" }}>Recent Players</h2>
              <button
                onClick={() => navigate("/admin/users/list")}
                style={{ background: "none", border: "none", color: "#1e3a5f", cursor: "pointer", fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}
              >
                View all <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 10 }} />
              </button>
            </div>
            {isLoading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 40, color: "#9ca3af", fontSize: 14 }}>
                <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: 8 }} /> Loading…
              </div>
            ) : recentPlayers.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, color: "#cbd5e1" }}>
                <FontAwesomeIcon icon={faUsers} style={{ fontSize: 36, marginBottom: 10 }} />
                <p style={{ margin: 0, fontSize: 13, color: "#9ca3af" }}>No players yet</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {recentPlayers.map((p, i) => {
                  const initials = (p.name || p.full_name || "?").slice(0, 2).toUpperCase();
                  const statusColor = p.status === "A" ? "#10b981" : "#ef4444";
                  const statusLabel = p.status === "A" ? "Active" : "Inactive";
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: i < recentPlayers.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #1e3a5f, #0f172a)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 600, flexShrink: 0 }}>
                        {initials}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#1f2937", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name || p.full_name || "—"}</p>
                        <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>{p.email || "—"}</p>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: `${statusColor}18`, color: statusColor, flexShrink: 0 }}>
                        {statusLabel}
                      </span>
                      <span style={{ fontSize: 12, color: "#cbd5e1", flexShrink: 0 }}>
                        {p.created_at ? dayjs(p.created_at).format("D MMM") : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Module Overview */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e5e7eb", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <h2 style={{ margin: "0 0 18px", fontSize: 17, fontWeight: 600, color: "#1f2937" }}>Manage Modules</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {MODULE_LINKS.map((m, i) => (
                <div
                  key={i}
                  onClick={() => navigate(m.to)}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "16px 8px", borderRadius: 12, border: "1px solid #f1f5f9", cursor: "pointer", transition: "all 0.2s", background: "#fafafa", textAlign: "center" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = `${m.color}12`; e.currentTarget.style.borderColor = m.color; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#fafafa"; e.currentTarget.style.borderColor = "#f1f5f9"; e.currentTarget.style.transform = "none"; }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${m.color}18`, color: m.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>
                    <FontAwesomeIcon icon={m.icon} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#374151", lineHeight: 1.3 }}>{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default Dashboard;
