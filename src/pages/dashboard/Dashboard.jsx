import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBell,
  faBolt,
  faBookOpen,
  faCalendarDays,
  faCircleCheck,
  faClock,
  faEnvelope,
  faFileAlt,
  faFlagCheckered,
  faGolfBallTee,
  faImages,
  faMedal,
  faMessage,
  faNewspaper,
  faPenToSquare,
  faRotateRight,
  faSignal,
  faSpinner,
  faTrophy,
  faUpload,
  faUserPlus,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import dayjs from "dayjs";
import Top_navbar from "components/layout/TopNavbar";
import { fetchDashboardStats } from "store/slices/dashboard.slice";
import "components/layout/dashboard.css";

const STATUS_COLORS = {
  WIN: "#1fb56f",
  RU: "#2678c7",
  T3: "#8167d8",
  T5: "#e6a01a",
  T10: "#f1722a",
  CUT: "#d94841",
  MC: "#d94841",
  WD: "#e6a01a",
  DQ: "#c02828",
  DNP: "#8fa0af",
};

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const FALLBACK_MONTHLY = MONTHS_SHORT.map((month) => ({ month, players: 0 }));

const QUICK_ACTIONS = [
  { label: "Add Player",       desc: "Create a golfer profile",      icon: faUserPlus,    to: "/admin/users/addeditdata" },
  { label: "Add Tournament",   desc: "Create or edit event details",  icon: faTrophy,      to: "/admin/events/addeditdata" },
  { label: "Write News",       desc: "Publish latest tour updates",   icon: faPenToSquare, to: "/admin/cms/news/addeditdata" },
  { label: "Import .web Data", desc: "Upload official ACE files",     icon: faUpload,      to: "/admin/events/ace-import" },
  { label: "Live Sync",        desc: "Monitor Redis live data",       icon: faSignal,      to: "/admin/live-sync" },
  { label: "Push Notification",desc: "Send web or app alerts",        icon: faBell,        to: "/admin/push-notifications/list" },
];

const MODULE_LINKS = [
  { label: "Players",     icon: faUsers,       to: "/admin/users/list" },
  { label: "Tournaments", icon: faCalendarDays,to: "/admin/events/list" },
  { label: "News",        icon: faNewspaper,   to: "/admin/cms/news/list" },
  { label: "Gallery",     icon: faImages,      to: "/admin/cms/gallery/list" },
  { label: "TV Timings",  icon: faClock,       to: "/admin/cms/tv-timings/list" },
  { label: "Imports",     icon: faUpload,      to: "/admin/events/ace-import" },
  { label: "Bookings",    icon: faGolfBallTee, to: "/admin/tee-time-booking/windows" },
  { label: "Inquiries",   icon: faMessage,     to: "/admin/inquiries/contact-us/list" },
];

const formatNumber = (value) => {
  if (value === undefined || value === null || value === "") return "0";
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return n.toLocaleString("en-IN");
};

const formatDate = (value, fallback = "Not scheduled") => {
  if (!value) return fallback;
  const p = dayjs(value);
  return p.isValid() ? p.format("D MMM YYYY") : fallback;
};

const formatDateTime = (value, fallback = "Not yet") => {
  if (!value) return fallback;
  const p = dayjs(value);
  return p.isValid() ? p.format("D MMM, h:mm A") : fallback;
};

const Dashboard = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { stats, isLoading } = useSelector((s) => s.dashboard);

  useEffect(() => { dispatch(fetchDashboardStats()); }, [dispatch]);

  /* ── Torch / spotlight effect ── */
  const torchRef = useRef(null);

  const handleHeroMouseMove = useCallback((e) => {
    if (!torchRef.current) return;
    const { left, top } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    torchRef.current.style.backgroundImage =
      `radial-gradient(circle 130px at ${x}px ${y}px,` +
      `rgba(255,255,220,0.55) 0%,` +
      `rgba(255,230,120,0.28) 45%,` +
      `rgba(255,200,80,0.08) 70%,` +
      `transparent 100%)`;
    torchRef.current.style.opacity = "1";
  }, []);

  const handleHeroMouseLeave = useCallback(() => {
    if (torchRef.current) torchRef.current.style.opacity = "0";
  }, []);

  const adminInfo  = JSON.parse(sessionStorage.getItem("ADMIN-INFO") || "{}");
  const adminName  = adminInfo?.name || "Admin";

  const monthlyPlayers        = stats?.monthlyPlayers?.length ? stats.monthlyPlayers : FALLBACK_MONTHLY;
  const resultsByStatus       = stats?.resultsByStatus || [];
  const recentPlayers         = stats?.recentPlayers?.slice(0, 5) || [];
  const recentImportBatches   = stats?.recentImportBatches?.slice(0, 5) || [];
  const upcomingEvents        = stats?.upcomingEvents?.slice(0, 5) || [];
  const currentEvents         = stats?.currentEvents?.slice(0, 3) || [];
  const recentCampaigns       = stats?.recentCampaigns?.slice(0, 5) || [];
  const playerPrizeSyncStatus = stats?.playerPrizeSyncStatus || {};
  const tournamentLiveSyncStatus = stats?.tournamentLiveSyncStatus || {};

  const statCards = [
    { label: "Total Players",    value: stats?.totalPlayers,             meta: "Profiles in system",             icon: faUsers,       tone: "navy",   to: "/admin/users/list" },
    { label: "Active Players",   value: stats?.activePlayers,            meta: "Ready for listings",             icon: faGolfBallTee, tone: "green",  to: "/admin/users/list" },
    { label: "Tournaments",      value: stats?.activeEvents,             meta: `${formatNumber(stats?.upcomingEventsCount)} upcoming`, icon: faCalendarDays, tone: "blue", to: "/admin/events/list" },
    { label: "Results",          value: stats?.totalTournamentResults,   meta: "Tournament finishes",            icon: faMedal,       tone: "gold",   to: "/admin/tournament-results/list" },
    { label: "Gallery",          value: stats?.totalGalleryItems,        meta: "Published images",               icon: faImages,      tone: "teal",   to: "/admin/cms/gallery/list" },
    { label: "Press Releases",   value: stats?.totalPressReleases,       meta: "Live content",                   icon: faNewspaper,   tone: "orange", to: "/admin/cms/press-release/list" },
    { label: "TV Timings",       value: stats?.totalTvTimings,           meta: "Broadcast rows",                 icon: faClock,       tone: "purple", to: "/admin/cms/tv-timings/list" },
    { label: "Unread Alerts",    value: stats?.unreadAdminNotifications,  meta: "Needs attention",               icon: faBell,        tone: "red",    to: "/admin/push-notifications/list" },
  ];

  const bookingSummary = [
    { label: "Tee Windows",     value: stats?.totalTeeTimeWindows,      sub: `${formatNumber(stats?.totalTeeTimeSlots)} slots built` },
    { label: "Qualifier Open",  value: stats?.totalQualifierEnabled,    sub: `${formatNumber(stats?.totalQualifierApplications)} applications` },
    { label: "Qualifier Paid",  value: stats?.totalQualifierPaid,       sub: "Payment slips approved" },
    { label: "Physio Booked",   value: stats?.totalPhysioBookings,      sub: `${formatNumber(stats?.totalPhysioSlots)} slots available` },
  ];

  const syncSummary = [
    {
      title:   "Player Prize Sync",
      enabled: playerPrizeSyncStatus?.enabled,
      interval: playerPrizeSyncStatus?.interval_minutes ? `${playerPrizeSyncStatus.interval_minutes} min` : "—",
      detail:  `${formatNumber(playerPrizeSyncStatus?.matched_player_count)} mapped players`,
      lastRun: playerPrizeSyncStatus?.last_run_at,
    },
    {
      title:   "Live Tournament Sync",
      enabled: tournamentLiveSyncStatus?.enabled,
      interval: tournamentLiveSyncStatus?.interval_minutes ? `${tournamentLiveSyncStatus.interval_minutes} min` : "—",
      detail:  `${formatNumber(stats?.successfulLiveTournamentBatches)} successful runs`,
      lastRun: tournamentLiveSyncStatus?.last_run_at,
    },
  ];

  return (
    <>
      <Top_navbar title="Dashboard" />

      <main className="dashboard-container pgti-command-center">

        {/* ── Hero ──────────────────────────────────────────── */}
        <section
          className="pgti-dashboard-hero pgti-entry"
          style={{ "--delay": "0s" }}
          onMouseMove={handleHeroMouseMove}
          onMouseLeave={handleHeroMouseLeave}
        >
          {/* Torch / spotlight layer — follows cursor */}
          <div ref={torchRef} className="pgti-hero-torch" aria-hidden="true" />

          <div className="pgti-hero-copy">
            <span className="pgti-hero-kicker">
              <FontAwesomeIcon icon={faFlagCheckered} /> PGTI Command Center
            </span>
            <h1>Welcome back, {adminName}</h1>
            <p>Live operational view of players, tournaments, content, bookings, imports and notifications.</p>
            <div className="pgti-hero-actions">
              <button className="pgti-primary-action" onClick={() => navigate("/admin/events/list")}>
                Manage Tournaments <FontAwesomeIcon icon={faArrowRight} />
              </button>
              <button className="pgti-ghost-action" onClick={() => dispatch(fetchDashboardStats())}>
                <FontAwesomeIcon icon={isLoading ? faSpinner : faRotateRight} spin={isLoading} />
                Refresh Data
              </button>
            </div>
          </div>

          {/* Scoreboard */}
          <div className="pgti-hero-scoreboard">
            <div>
              <span>Today</span>
              <strong>{dayjs().format("D MMM YYYY")}</strong>
            </div>
            <div>
              <span>Live Events</span>
              <strong>{formatNumber(currentEvents.length)}</strong>
            </div>
            <div>
              <span>Live Sync</span>
              <strong className={tournamentLiveSyncStatus?.enabled ? "is-good" : "is-muted"}>
                {tournamentLiveSyncStatus?.enabled ? "● Online" : "○ Off"}
              </strong>
            </div>
          </div>
        </section>

        {/* ── Stat Cards ────────────────────────────────────── */}
        <section className="pgti-stat-grid">
          {statCards.map((card) => (
            <button
              key={card.label}
              type="button"
              className={`pgti-stat-card ${card.tone}`}
              onClick={() => navigate(card.to)}
            >
              {/* Watermark background icon */}
              <span className="pgti-stat-bg-icon" aria-hidden="true">
                <FontAwesomeIcon icon={card.icon} />
              </span>
              <span className="pgti-stat-icon">
                <FontAwesomeIcon icon={card.icon} />
              </span>
              <span className="pgti-stat-body">
                <strong>{isLoading ? "—" : formatNumber(card.value)}</strong>
                <span>{card.label}</span>
                <small>{card.meta}</small>
              </span>
              <span className="pgti-stat-arrow" aria-hidden="true">
                <FontAwesomeIcon icon={faArrowRight} />
              </span>
            </button>
          ))}
        </section>

        {/* ── Bento Grid ────────────────────────────────────── */}
        <section className="pgti-bento">

          {/* Col 1, Row 1 – Player Registrations Chart */}
          <div className="pgti-panel pgti-chart-panel pgti-entry" style={{ "--delay": "0.08s" }}>
            <div className="pgti-panel-head">
              <div>
                <span className="pgti-panel-eyebrow">Season Growth</span>
                <h2>Player Registrations</h2>
              </div>
              <button type="button" onClick={() => navigate("/admin/users/list")}>
                All players <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthlyPlayers} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="fairwayGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2f8f65" stopOpacity={0.36} />
                    <stop offset="95%" stopColor="#2f8f65" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#edf3f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#8fa0af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#8fa0af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  formatter={(v) => [v, "New players"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #d0e6d8", fontSize: 13, boxShadow: "0 8px 24px rgba(18,51,35,.14)" }}
                />
                <Area
                  type="monotone" dataKey="players"
                  stroke="#2f8f65" strokeWidth={2.5}
                  fill="url(#fairwayGradient)"
                  dot={{ r: 3, fill: "#2f8f65", strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Col 2, Row 1 – Upcoming Tournaments */}
          <div className="pgti-panel pgti-events-panel pgti-entry" style={{ "--delay": "0.13s" }}>
            <div className="pgti-panel-head">
              <div>
                <span className="pgti-panel-eyebrow">Schedule</span>
                <h2>Upcoming Tournaments</h2>
              </div>
              <button type="button" onClick={() => navigate("/admin/events/list")}>
                Calendar <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
            <div className="pgti-event-list">
              {upcomingEvents.length ? upcomingEvents.map((ev) => (
                <button key={ev.id} type="button" className="pgti-event-row" onClick={() => navigate("/admin/events/list")}>
                  <span className="pgti-event-date">{formatDate(ev.event_start || ev.created_at)}</span>
                  <span className="pgti-event-main">
                    <strong>{ev.title || `Tournament ${ev.id}`}</strong>
                    <small>{ev.location || "Venue TBD"} · {ev.tour_type === "F" ? "NextGen" : "Main Tour"}</small>
                  </span>
                </button>
              )) : (
                <div className="pgti-empty-state">No upcoming tournaments.</div>
              )}
            </div>
          </div>

          {/* Col 3, Row 1 – Booking Summary */}
          <div className="pgti-panel pgti-booking-panel pgti-entry" style={{ "--delay": "0.18s" }}>
            <div className="pgti-panel-head compact">
              <div>
                <span className="pgti-panel-eyebrow">Bookings</span>
                <h2>Player Services</h2>
              </div>
            </div>
            <div className="pgti-booking-grid">
              {bookingSummary.map((item) => (
                <div key={item.label} className="pgti-booking-card">
                  <strong>{formatNumber(item.value)}</strong>
                  <span>{item.label}</span>
                  <small>{item.sub}</small>
                </div>
              ))}
            </div>
          </div>

          {/* Col 1, Row 2 – Quick Actions */}
          <div className="pgti-panel pgti-actions-panel pgti-entry" style={{ "--delay": "0.22s" }}>
            <div className="pgti-panel-head compact">
              <div>
                <span className="pgti-panel-eyebrow">Shortcuts</span>
                <h2>Quick Actions</h2>
              </div>
            </div>
            <div className="pgti-action-grid">
              {QUICK_ACTIONS.map((action) => (
                <button key={action.label} type="button" onClick={() => navigate(action.to)}>
                  <span><FontAwesomeIcon icon={action.icon} /></span>
                  <strong>{action.label}</strong>
                  <small>{action.desc}</small>
                </button>
              ))}
            </div>
          </div>

          {/* Col 2, Row 2 – Results Pie */}
          <div className="pgti-panel pgti-results-panel pgti-entry" style={{ "--delay": "0.27s" }}>
            <div className="pgti-panel-head">
              <div>
                <span className="pgti-panel-eyebrow">Performance</span>
                <h2>Results by Status</h2>
              </div>
              <button type="button" onClick={() => navigate("/admin/tournament-results/list")}>
                Results <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
            {resultsByStatus.length ? (
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie
                    data={resultsByStatus} dataKey="count" nameKey="status"
                    cx="50%" cy="50%" outerRadius={78} innerRadius={40} paddingAngle={4}
                  >
                    {resultsByStatus.map((entry, i) => (
                      <Cell key={`${entry.status}-${i}`} fill={STATUS_COLORS[entry.status] || "#9ca3af"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 13 }} />
                  <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="pgti-chart-legend">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="pgti-empty-state tall">No result data yet.</div>
            )}
          </div>

          {/* Col 3, Row 2 – Sync Health */}
          <div className="pgti-panel pgti-sync-panel pgti-entry" style={{ "--delay": "0.32s" }}>
            <div className="pgti-panel-head">
              <div>
                <span className="pgti-panel-eyebrow">Automation</span>
                <h2>Sync Health</h2>
              </div>
              <button type="button" onClick={() => navigate("/admin/live-sync")}>
                Monitor <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
            <div className="pgti-sync-list">
              {syncSummary.map((item) => (
                <div key={item.title} className="pgti-sync-card">
                  <div className="pgti-sync-card-header">
                    <div>
                      <strong>{item.title}</strong>
                      <small>{item.detail}</small>
                    </div>
                    <span className={`pgti-status-pill ${item.enabled ? "success" : "muted"}`}>
                      {item.enabled
                        ? <><span className="pgti-live-dot" />Enabled</>
                        : "Disabled"
                      }
                    </span>
                  </div>
                  <dl>
                    <div><dt>Interval</dt><dd>{item.interval}</dd></div>
                    <div><dt>Last run</dt><dd>{formatDateTime(item.lastRun)}</dd></div>
                  </dl>
                </div>
              ))}
            </div>
          </div>

          {/* Col 1, Row 3 – Recent Players */}
          <div className="pgti-panel pgti-recent-panel pgti-entry" style={{ "--delay": "0.36s" }}>
            <div className="pgti-panel-head">
              <div>
                <span className="pgti-panel-eyebrow">Roster</span>
                <h2>Recent Players</h2>
              </div>
              <button type="button" onClick={() => navigate("/admin/users/list")}>
                All players <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
            <div className="pgti-player-list">
              {recentPlayers.length ? recentPlayers.map((player) => (
                <div key={player.id} className="pgti-player-row">
                  <span>{(player.name || player.full_name || "?").slice(0, 2).toUpperCase()}</span>
                  <div>
                    <strong>{player.name || player.full_name || "—"}</strong>
                    <small>{player.email || "No email"}</small>
                  </div>
                  <em className={player.status === "A" ? "active" : "inactive"}>
                    {player.status === "A" ? "Active" : "Inactive"}
                  </em>
                </div>
              )) : (
                <div className="pgti-empty-state">No recent player records.</div>
              )}
            </div>
          </div>

          {/* Col 2, Row 3 – Recent Imports */}
          <div className="pgti-panel pgti-import-panel pgti-entry" style={{ "--delay": "0.40s" }}>
            <div className="pgti-panel-head">
              <div>
                <span className="pgti-panel-eyebrow">Imports</span>
                <h2>Recent .web Batches</h2>
              </div>
              <button type="button" onClick={() => navigate("/admin/events/ace-import")}>
                Import center <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
            <div className="pgti-import-list">
              {recentImportBatches.length ? recentImportBatches.map((batch) => (
                <div key={batch.id} className="pgti-import-row">
                  <FontAwesomeIcon icon={batch.status === "SUCCESS" ? faCircleCheck : faBolt} />
                  <div>
                    <strong>{batch.file_name || `Batch ${batch.id}`}</strong>
                    <small>{batch.detected_type || "Unknown"} · {formatDateTime(batch.created_at)}</small>
                  </div>
                  <span className={`pgti-status-pill ${batch.status === "SUCCESS" ? "success" : "warning"}`}>
                    {batch.status}
                  </span>
                </div>
              )) : (
                <div className="pgti-empty-state">No import batches yet.</div>
              )}
            </div>
          </div>

          {/* Col 3, Row 3 – Recent Campaigns */}
          <div className="pgti-panel pgti-notification-panel pgti-entry" style={{ "--delay": "0.44s" }}>
            <div className="pgti-panel-head">
              <div>
                <span className="pgti-panel-eyebrow">Notifications</span>
                <h2>Recent Campaigns</h2>
              </div>
              <button type="button" onClick={() => navigate("/admin/push-notifications/list")}>
                Open <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
            <div className="pgti-campaign-list">
              {recentCampaigns.length ? recentCampaigns.map((c) => (
                <div key={c.id} className="pgti-campaign-row">
                  <span><FontAwesomeIcon icon={faBell} /></span>
                  <div>
                    <strong>{c.title}</strong>
                    <small>{c.platform_scope || "all"} · {formatNumber(c.success_count)}/{formatNumber(c.target_count)} sent</small>
                  </div>
                  <em>{c.status}</em>
                </div>
              )) : (
                <div className="pgti-empty-state">No campaigns yet.</div>
              )}
            </div>
          </div>

          {/* Full width – Module Map */}
          <div className="pgti-panel pgti-module-panel pgti-entry" style={{ "--delay": "0.48s" }}>
            <div className="pgti-panel-head compact">
              <div>
                <span className="pgti-panel-eyebrow">Navigation</span>
                <h2>Module Map</h2>
              </div>
            </div>
            <div className="pgti-module-grid">
              {MODULE_LINKS.map((mod) => (
                <button key={mod.label} type="button" onClick={() => navigate(mod.to)}>
                  <FontAwesomeIcon icon={mod.icon} />
                  <span>{mod.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Full width – CMS Summary */}
          <div className="pgti-panel pgti-content-panel pgti-entry" style={{ "--delay": "0.52s" }}>
            <div className="pgti-panel-head compact">
              <div>
                <span className="pgti-panel-eyebrow">Content Library</span>
                <h2>CMS Summary</h2>
              </div>
            </div>
            <div className="pgti-content-strip">
              <div>
                <FontAwesomeIcon icon={faFileAlt} />
                <strong>{formatNumber(stats?.totalArticles)}</strong>
                <span>Articles</span>
              </div>
              <div>
                <FontAwesomeIcon icon={faImages} />
                <strong>{formatNumber(stats?.totalListingBanners)}</strong>
                <span>Banners</span>
              </div>
              <div>
                <FontAwesomeIcon icon={faBookOpen} />
                <strong>{formatNumber(stats?.totalHandbooks)}</strong>
                <span>Handbooks</span>
              </div>
              <div>
                <FontAwesomeIcon icon={faEnvelope} />
                <strong>{formatNumber(stats?.totalInquiries)}</strong>
                <span>Inquiries</span>
              </div>
            </div>
          </div>

        </section>
      </main>
    </>
  );
};

export default Dashboard;
