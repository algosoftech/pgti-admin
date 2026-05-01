import React, { useEffect, useState } from "react";
import { notification } from "antd";
import {
  InfoCircleOutlined, CheckCircleOutlined, ArrowLeftOutlined, SaveOutlined,
  TrophyOutlined, CalendarOutlined, UserOutlined, DollarOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LoadingEffect from "components/ui/Loading/LoadingEffect";
import { addEditTournamentResult } from "services/tournamentResults.service";
import { CharCounter, FieldHint } from "components/ui/FieldHint";
import { LIMITS } from "utils/fieldValidation";
import "styles/admin-pages.css";

const RESULT_STATUSES = [
  { value: "WIN",  label: "Win" },
  { value: "RU",   label: "Runner-up" },
  { value: "T3",   label: "Top-3" },
  { value: "T5",   label: "Top-5" },
  { value: "T10",  label: "Top-10" },
  { value: "CUT",  label: "Cut" },
  { value: "MC",   label: "Missed Cut" },
  { value: "WD",   label: "Withdrew" },
  { value: "DQ",   label: "Disqualified" },
  { value: "DNP",  label: "Did Not Play" },
];

const currentYear = new Date().getFullYear();
const SEASONS = Array.from({ length: 10 }, (_, i) => currentYear - i);

const SectionCard = ({ icon, title, children }) => (
  <div className="content-card" style={{ marginBottom: 20 }}>
    <div className="content-card-body">
      <div className="form-section">
        <h3 className="form-section-title">{icon}&nbsp;{title}</h3>
        {children}
      </div>
    </div>
  </div>
);

export default function AddEditTournamentResult() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const state     = location?.state || {};
  const isEdit    = !!state?.id;

  const [ADDEDITDATA, setAddEditData] = useState({
    player_id:       "",
    player_name:     "",
    tournament_name: "",
    season:          String(currentYear),
    start_date:      "",
    end_date:        "",
    position:        "",
    status:          "CUT",
    prize_money:     "",
    notes:           "",
    ...state,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = `PGTI || ${isEdit ? "Edit" : "Add"} Tournament Result`;
  }, [isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddEditData((prev) => ({ ...prev, [name]: value }));
  };

  const notify = (type, desc) => notification.open({
    message: type === "error" ? "Oops!" : "Success",
    description: desc,
    placement: "topRight",
    icon: type === "error"
      ? <InfoCircleOutlined style={{ color: "red" }} />
      : <CheckCircleOutlined style={{ color: "green" }} />,
    duration: 2,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ADDEDITDATA.tournament_name?.trim()) return notify("error", "Tournament name is required.");
    if (!ADDEDITDATA.start_date)              return notify("error", "Start date is required.");
    if (!ADDEDITDATA.status)                  return notify("error", "Result status is required.");

    try {
      setIsLoading(true);
      const param = {
        ...(isEdit && { editId: state.id }),
        player_id:       ADDEDITDATA.player_id       || "",
        player_name:     ADDEDITDATA.player_name?.trim() || "",
        tournament_name: ADDEDITDATA.tournament_name.trim(),
        season:          ADDEDITDATA.season           || String(currentYear),
        start_date:      ADDEDITDATA.start_date       || "",
        end_date:        ADDEDITDATA.end_date         || "",
        position:        ADDEDITDATA.position ? Number(ADDEDITDATA.position) : null,
        status:          ADDEDITDATA.status           || "CUT",
        prize_money:     ADDEDITDATA.prize_money ? Number(ADDEDITDATA.prize_money) : null,
        notes:           ADDEDITDATA.notes?.trim()    || "",
      };

      const res = await addEditTournamentResult(param);
      if (res.status === true) {
        notify("success", isEdit ? "Result updated successfully." : "Result added successfully.");
        navigate("/admin/tournament-results/list");
      } else {
        notify("error", res?.message || "Failed to save result.");
      }
    } catch {
      notify("error", "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">{isEdit ? "Edit Result" : "Add Tournament Result"}</h1>
            <p className="page-subtitle">{isEdit ? "Update player tournament result" : "Record a player's tournament participation and result"}</p>
          </div>
          <Link to="/admin/tournament-results/list">
            <button className="action-button secondary"><ArrowLeftOutlined /> Back to Results</button>
          </Link>
        </div>
      </div>

      <div className="page-body">
        <form onSubmit={handleSubmit} className="modern-form">

          {/* ── Player Info ─────────────────────── */}
          <SectionCard icon={<UserOutlined />} title="Player Information">
            <div className="row">
              <div className="col-md-6 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Player Name</label>
                  <input
                    type="text" name="player_name" className="form-input"
                    placeholder="e.g. Honey Baisoya"
                    value={ADDEDITDATA.player_name} onChange={handleChange}
                  />
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                    Enter the player's name. Player ID linking can be done via dropdown once player list API is available.
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Player ID <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span></label>
                  <input
                    type="text" name="player_id" className="form-input"
                    placeholder="Player system ID"
                    value={ADDEDITDATA.player_id} onChange={handleChange}
                    style={{ fontFamily: "monospace" }}
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ── Tournament Details ───────────────── */}
          <SectionCard icon={<TrophyOutlined />} title="Tournament Details">
            <div className="row">
              <div className="col-md-8 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label required">Tournament Name</label>
                  <input
                    type="text" name="tournament_name" className="form-input"
                    placeholder="e.g. Tata Steel PGTI Players Championship 2025"
                    value={ADDEDITDATA.tournament_name} onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-4 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Season</label>
                  <select name="season" className="form-input" value={ADDEDITDATA.season} onChange={handleChange}>
                    {SEASONS.map(y => <option key={y} value={String(y)}>{y}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ── Date & Scheduling ────────────────── */}
          <SectionCard icon={<CalendarOutlined />} title="Date &amp; Scheduling">
            <div className="row">
              <div className="col-md-4 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label required">Start Date</label>
                  <input type="date" name="start_date" className="form-input" value={ADDEDITDATA.start_date ? ADDEDITDATA.start_date.substring(0, 10) : ""} onChange={handleChange} />
                </div>
              </div>
              <div className="col-md-4 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input type="date" name="end_date" className="form-input" value={ADDEDITDATA.end_date ? ADDEDITDATA.end_date.substring(0, 10) : ""} onChange={handleChange} />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ── Result ──────────────────────────── */}
          <SectionCard icon={<TrophyOutlined />} title="Result Details">
            <div className="row">
              <div className="col-md-3 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label required">Result Status</label>
                  <select name="status" className="form-input" value={ADDEDITDATA.status} onChange={handleChange}>
                    {RESULT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="col-md-3 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Position / Score</label>
                  <input
                    type="text" name="position" className="form-input"
                    placeholder="e.g. 7 or 07:40"
                    value={ADDEDITDATA.position} onChange={handleChange}
                  />
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>Finishing position or score (e.g. 16 or T5)</div>
                </div>
              </div>
              <div className="col-md-3 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Prize Money (₹)</label>
                  <input
                    type="number" name="prize_money" className="form-input"
                    placeholder="e.g. 145950" min="0"
                    value={ADDEDITDATA.prize_money} onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Notes <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span></label>
                  <textarea
                    name="notes" className="form-input" rows={3}
                    placeholder="Any additional notes about this result…"
                    value={ADDEDITDATA.notes} onChange={handleChange}
                  />
                  <CharCounter value={ADDEDITDATA.notes} max={LIMITS.notes.max} />
                  <FieldHint text="Optional. Add context such as weather conditions, course difficulty, or any notable events during the round." />
                </div>
              </div>
            </div>
          </SectionCard>

          <div className="form-actions">
            <button type="button" className="action-button secondary" onClick={() => navigate("/admin/tournament-results/list")}>Cancel</button>
            <button type="submit" className="action-button primary" disabled={isLoading}>
              {isLoading
                ? <><div className="loading-spinner small"></div>{isEdit ? "Updating…" : "Saving…"}</>
                : <><SaveOutlined /> {isEdit ? "Update Result" : "Save Result"}</>}
            </button>
          </div>

        </form>
      </div>

      <LoadingEffect isLoading={isLoading} text="Saving result…" />
    </div>
  );
}
