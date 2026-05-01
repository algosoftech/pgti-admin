import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeftOutlined, EditOutlined, UserOutlined,
  PhoneOutlined, MailOutlined, EnvironmentOutlined,
  TrophyOutlined, CalendarOutlined, IdcardOutlined,
  TeamOutlined, StarOutlined,
} from "@ant-design/icons";
import moment from "moment";
import "styles/admin-pages.css";

const IMAGE_BASE = (() => {
  const b = process.env.REACT_APP_IMAGE_BASE_URL || '';
  return b.endsWith('/') ? b.slice(0, -1) : b;
})();

const resolveImg = (v) => {
  if (!v) return '';
  if (/^https?:\/\//i.test(v)) return v;
  return `${IMAGE_BASE}/${v.replace(/^\//, '')}`;
};

const InfoRow = ({ icon, label, value }) => (
  <div style={{
    display: "flex", alignItems: "flex-start", gap: 12,
    padding: "11px 0", borderBottom: "1px solid #f1f5f9",
  }}>
    <div style={{ width: 32, display: "flex", justifyContent: "center", paddingTop: 2, color: "#94a3b8", flexShrink: 0 }}>
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, color: "#1e3a5f", fontWeight: 500 }}>{value || <span style={{ color: "#cbd5e1" }}>Not provided</span>}</div>
    </div>
  </div>
);

const SectionCard = ({ title, icon, children }) => (
  <div className="content-card" style={{ marginBottom: 20 }}>
    <div className="content-card-body">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#1d4ed8" }}>{icon}</div>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#1e3a5f" }}>{title}</span>
      </div>
      {children}
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    A: { label: "Active",              bg: "#f0fdf4", color: "#16a34a", border: "#86efac" },
    I: { label: "Inactive",            bg: "#fef2f2", color: "#dc2626", border: "#fca5a5" },
    P: { label: "Pending Verification", bg: "#fffbeb", color: "#d97706", border: "#fcd34d" },
  };
  const s = map[status] || map.I;
  return (
    <span style={{ fontSize: 13, fontWeight: 600, background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: "4px 14px", borderRadius: 20 }}>
      {s.label}
    </span>
  );
};

export default function ViewData() {
  const location = useLocation();
  const navigate = useNavigate();
  const player = location?.state || {};

  const img = resolveImg(player.profile_image || player.image);
  const name = player.full_name || player.name || "Unknown Player";
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  useEffect(() => {
    document.title = `PGTI || Player — ${name}`;
  }, [name]);

  if (!player?.id) {
    return (
      <div className="admin-page-container">
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
          <UserOutlined style={{ fontSize: 48, marginBottom: 16, display: "block" }} />
          <div style={{ fontSize: 16, fontWeight: 600, color: "#64748b", marginBottom: 8 }}>No player selected</div>
          <button className="action-button secondary" onClick={() => navigate("/admin/users/list")}>
            <ArrowLeftOutlined /> Back to Players
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">Player Profile</h1>
            <p className="page-subtitle">View complete player information</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="action-button secondary" onClick={() => navigate("/admin/users/list")}>
              <ArrowLeftOutlined /> Back
            </button>
            <button className="action-button primary" onClick={() => navigate("/admin/users/addeditdata", { state: player })}>
              <EditOutlined /> Edit Player
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Left — Profile card */}
        <div className="col-md-4 col-12">
          <div className="content-card" style={{ marginBottom: 20 }}>
            <div className="content-card-body" style={{ textAlign: "center", padding: "32px 24px" }}>
              {/* Avatar */}
              {img ? (
                <img src={img} alt={name}
                  style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", border: "3px solid #e2e8f0", marginBottom: 16 }}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              ) : (
                <div style={{
                  width: 100, height: 100, borderRadius: "50%",
                  background: "linear-gradient(135deg,#1e3a5f,#0369a1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px", fontSize: 32, fontWeight: 700, color: "white",
                }}>
                  {initials}
                </div>
              )}

              <div style={{ fontWeight: 700, fontSize: 18, color: "#1e3a5f", marginBottom: 4 }}>{name}</div>

              {player.pgti_membership_id && (
                <div style={{ fontSize: 12, fontFamily: "monospace", color: "#0369a1", background: "#eff6ff", padding: "3px 12px", borderRadius: 20, border: "1px solid #bfdbfe", display: "inline-block", marginBottom: 12 }}>
                  {player.pgti_membership_id}
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <StatusBadge status={player.status} />
              </div>

              {player.player_type && (
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
                  <TrophyOutlined style={{ marginRight: 6, color: player.player_type === "Professional" ? "#1d4ed8" : "#16a34a" }} />
                  {player.player_type}
                </div>
              )}

              {player.experience_years && (
                <div style={{ fontSize: 13, color: "#64748b" }}>
                  <StarOutlined style={{ marginRight: 6, color: "#d97706" }} />
                  {player.experience_years} years experience
                </div>
              )}

              {/* Quick stats row */}
              <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "center" }}>
                {[
                  { label: "Ranking",     value: player.pgti_ranking || "—" },
                  { label: "Tournaments", value: player.tournaments_played || "—" },
                  { label: "Wins",        value: player.wins || "—" },
                ].map(s => (
                  <div key={s.label} style={{ flex: 1, background: "#f8fafc", borderRadius: 10, padding: "10px 6px", border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#1e3a5f" }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #e2e8f0", fontSize: 12, color: "#94a3b8" }}>
                Joined {player.created_at ? moment(player.created_at).format("DD MMM YYYY") : "—"}
              </div>
            </div>
          </div>
        </div>

        {/* Right — Details */}
        <div className="col-md-8 col-12">

          {/* Personal Info */}
          <SectionCard title="Personal Information" icon={<UserOutlined />}>
            <InfoRow icon={<CalendarOutlined />} label="Date of Birth"
              value={player.dob ? moment(player.dob).format("DD MMMM YYYY") : null} />
            <InfoRow icon={<UserOutlined />}     label="Gender"       value={player.gender} />
            <InfoRow icon={<EnvironmentOutlined />} label="Nationality" value={player.nationality} />
            <InfoRow icon={<EnvironmentOutlined />} label="Address"    value={player.address} />
          </SectionCard>

          {/* Contact */}
          <SectionCard title="Contact Information" icon={<PhoneOutlined />}>
            <InfoRow icon={<PhoneOutlined />} label="Mobile Number" value={player.mobile} />
            <InfoRow icon={<MailOutlined />}  label="Email Address" value={player.email} />
          </SectionCard>

          {/* Professional */}
          <SectionCard title="Professional Details" icon={<TrophyOutlined />}>
            <InfoRow icon={<IdcardOutlined />}  label="PGTI Membership ID" value={player.pgti_membership_id} />
            <InfoRow icon={<TrophyOutlined />}  label="Player Type"        value={player.player_type} />
            <InfoRow icon={<StarOutlined />}    label="Experience"         value={player.experience_years ? `${player.experience_years} years` : null} />
            <InfoRow icon={<TeamOutlined />}    label="Home Club"          value={player.home_club} />
          </SectionCard>

          {/* Account */}
          <SectionCard title="Account Information" icon={<IdcardOutlined />}>
            <InfoRow icon={<IdcardOutlined />}    label="Account Status"  value={<StatusBadge status={player.status} />} />
            <InfoRow icon={<CalendarOutlined />}  label="Registration Date" value={player.created_at ? moment(player.created_at).format("DD MMM YYYY, hh:mm A") : null} />
            <InfoRow icon={<CalendarOutlined />}  label="Last Updated"   value={player.updated_at ? moment(player.updated_at).format("DD MMM YYYY, hh:mm A") : null} />
          </SectionCard>

          {/* About Info */}
          {(player.about_info || player.bio || player.biography) && (
            <SectionCard title="About / Career Highlights" icon={<StarOutlined />}>
              <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                {player.about_info || player.bio || player.biography}
              </div>
            </SectionCard>
          )}

        </div>
      </div>
    </div>
  );
}
