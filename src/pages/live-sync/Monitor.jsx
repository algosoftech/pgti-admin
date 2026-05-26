import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircleOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  LinkOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { Button, Modal, notification, Select } from "antd";

import Top_navbar from "components/layout/TopNavbar";
import LoadingEffect from "components/ui/Loading/LoadingEffect";
import {
  getTournamentLiveSyncBatchDetail,
  getTournamentLiveSyncStatus,
  listTournamentLiveSyncBatches,
  runTournamentLiveSync,
} from "services/events.service";
import { getPlayerPrizeSyncStatus, runPlayerPrizeSync } from "services/users.service";
import "styles/admin-pages.css";

const { Option } = Select;

const notify = (message, description, isSuccess = false) =>
  notification.open({
    message,
    description,
    placement: "topRight",
    duration: isSuccess ? 2.5 : 4,
    icon: isSuccess ? (
      <CheckCircleOutlined style={{ color: "#15803d" }} />
    ) : (
      <InfoCircleOutlined style={{ color: "#dc2626" }} />
    ),
  });

const prettyDate = (value) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusStyle = {
  SUCCESS: { background: "#ecfdf3", color: "#15803d", border: "#bbf7d0" },
  FAILED: { background: "#fef2f2", color: "#b91c1c", border: "#fecaca" },
  PROCESSING: { background: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
};

const buildTournamentEndpoints = (baseUrl, supportedDays = []) => {
  const safeBase = baseUrl || "https://pgtofindia.net/data/index.php";
  const endpoints = [
    `${safeBase}?export=tour`,
    `${safeBase}?export=course`,
    `${safeBase}?export=entry`,
    `${safeBase}?export=prize`,
  ];

  supportedDays.forEach((day) => {
    endpoints.push(`${safeBase}?export=draw&tour_day=${day}`);
    endpoints.push(`${safeBase}?export=score&tour_day=${day}`);
  });

  return endpoints;
};

const MetricCard = ({ label, value, hint }) => (
  <div
    style={{
      padding: 16,
      borderRadius: 16,
      background: "#fff",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
    }}
  >
    <div style={{ color: "#64748b", fontSize: 12, textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.4 }}>
      {label}
    </div>
    <div style={{ marginTop: 8, color: "#102a43", fontSize: 22, fontWeight: 800 }}>
      {value ?? "--"}
    </div>
    {hint ? <div style={{ marginTop: 6, color: "#64748b", fontSize: 13 }}>{hint}</div> : null}
  </div>
);

const EndpointList = ({ items = [] }) => (
  <div
    style={{
      display: "grid",
      gap: 10,
      marginTop: 14,
    }}
  >
    {items.map((item) => (
      <div
        key={item}
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          padding: 12,
          borderRadius: 12,
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
        }}
      >
        <LinkOutlined style={{ color: "#2563eb", marginTop: 2 }} />
        <div style={{ color: "#1e3a5f", fontSize: 13, lineHeight: 1.6, wordBreak: "break-all" }}>{item}</div>
      </div>
    ))}
  </div>
);

export default function LiveSyncMonitor() {
  const [isLoading, setIsLoading] = useState(false);
  const [runningPrize, setRunningPrize] = useState(false);
  const [runningTournament, setRunningTournament] = useState(false);
  const [prizeStatus, setPrizeStatus] = useState(null);
  const [tournamentStatus, setTournamentStatus] = useState(null);
  const [batches, setBatches] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState(null);

  const loadData = useCallback(async (nextPage = page, nextLimit = limit) => {
    setIsLoading(true);
    const [prizeRes, tournamentRes, batchRes] = await Promise.all([
      getPlayerPrizeSyncStatus(),
      getTournamentLiveSyncStatus(),
      listTournamentLiveSyncBatches({ skip: (nextPage - 1) * nextLimit, limit: nextLimit }),
    ]);

    if (prizeRes?.status) {
      setPrizeStatus(prizeRes.result || null);
    } else {
      notify("Oops!", prizeRes?.message || "Failed to fetch player prize sync status.");
    }

    if (tournamentRes?.status) {
      setTournamentStatus(tournamentRes.result || null);
    } else {
      notify("Oops!", tournamentRes?.message || "Failed to fetch tournament live sync status.");
    }

    if (batchRes?.status) {
      setBatches(batchRes.result || []);
      setCount(batchRes.count || 0);
    } else {
      notify("Oops!", batchRes?.message || "Failed to fetch tournament live sync history.");
    }

    setIsLoading(false);
  }, [limit, page]);

  useEffect(() => {
    document.title = "PGTI || Live Sync";
    loadData(1, limit);
  }, [loadData, limit]);

  const openBatchDetail = async (id) => {
    setDetailOpen(true);
    setDetail(null);
    setDetailLoading(true);
    const response = await getTournamentLiveSyncBatchDetail(id);
    if (response?.status) {
      setDetail(response.result || null);
    } else {
      notify("Oops!", response?.message || "Failed to load batch detail.");
    }
    setDetailLoading(false);
  };

  const handleRunPrize = async () => {
    setRunningPrize(true);
    const response = await runPlayerPrizeSync();
    if (response?.status) {
      notify("Success", "Player prize sync completed successfully.", true);
      await loadData(page, limit);
    } else {
      notify("Oops!", response?.message || "Failed to run player prize sync.");
    }
    setRunningPrize(false);
  };

  const handleRunTournament = async () => {
    setRunningTournament(true);
    const response = await runTournamentLiveSync();
    if (response?.status) {
      notify("Success", "Tournament live sync completed successfully.", true);
      await loadData(page, limit);
    } else {
      notify("Oops!", response?.message || "Failed to run tournament live sync.");
    }
    setRunningTournament(false);
  };

  const tournamentEndpoints = useMemo(
    () => buildTournamentEndpoints(tournamentStatus?.source_url, tournamentStatus?.supported_days || []),
    [tournamentStatus]
  );

  const prizeEndpoints = useMemo(
    () => [prizeStatus?.source_url || "https://pgtofindia.net/data/index.php?export=prize"],
    [prizeStatus]
  );

  const totalPages = useMemo(() => Math.max(Math.ceil(count / limit), 1), [count, limit]);

  return (
    <div className="admin-page-container">
      <Top_navbar title="Live Sync" />

      <div className="content-card" style={{ marginBottom: 20 }}>
        <div className="content-card-body">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 18,
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  color: "#1d4ed8",
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                  marginBottom: 12,
                }}
              >
                <SyncOutlined />
                Monitoring & Control
              </div>
              <h2 style={{ margin: 0, color: "#102a43", fontSize: 28, fontWeight: 800 }}>Watch live feeds and trigger syncs</h2>
              <p style={{ margin: "10px 0 0", color: "#486581", fontSize: 15, lineHeight: 1.7, maxWidth: 900 }}>
                This console shows the currently watched live endpoints, the health of both automatic sync systems,
                the latest run metadata, and recent tournament sync batches. Manual runs are available here whenever
                the team needs an immediate refresh.
              </p>
            </div>

            <Button icon={<ReloadOutlined />} onClick={() => loadData(page, limit)} disabled={isLoading || runningPrize || runningTournament}>
              Refresh All
            </Button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
            <div
              style={{
                borderRadius: 20,
                padding: 20,
                background: "linear-gradient(135deg, #102a43 0%, #1f4b82 100%)",
                color: "#fff",
                boxShadow: "0 18px 42px rgba(15, 23, 42, 0.16)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.82, textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 700 }}>
                    Player prize sync
                  </div>
                  <div style={{ marginTop: 6, fontSize: 24, fontWeight: 800 }}>Prize feed monitor</div>
                </div>
                <Button type="primary" icon={<PlayCircleOutlined />} loading={runningPrize} onClick={handleRunPrize}>
                  Run Now
                </Button>
              </div>

              <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
                <MetricCard label="Enabled" value={prizeStatus?.enabled ? "Yes" : "No"} hint="Automatic scheduler state" />
                <MetricCard label="Interval" value={prizeStatus?.interval_minutes ? `${prizeStatus.interval_minutes} min` : "--"} hint="Polling frequency" />
                <MetricCard label="Last Run" value={prettyDate(prizeStatus?.last_run_at)} hint="Latest successful trigger" />
                <MetricCard label="Mapped Players" value={prizeStatus?.matched_player_count ?? 0} hint="Players linked with prize data" />
              </div>

              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.92 }}>Watched endpoint</div>
                <EndpointList items={prizeEndpoints} />
              </div>

              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.92, marginBottom: 10 }}>Latest mapped rows</div>
                <div style={{ display: "grid", gap: 10 }}>
                  {(prizeStatus?.latest_rows || []).length ? (
                    (prizeStatus.latest_rows || []).map((row, index) => (
                      <div
                        key={`${row.mem_code || "row"}-${index}`}
                        style={{
                          padding: 12,
                          borderRadius: 12,
                          background: "rgba(255,255,255,0.08)",
                          border: "1px solid rgba(255,255,255,0.14)",
                        }}
                      >
                        <div style={{ fontWeight: 700 }}>{row.mem_name || row.mem_code || "--"}</div>
                        <div style={{ marginTop: 4, fontSize: 13, opacity: 0.9 }}>
                          Code: {row.mem_code || "--"} | Rank: {row.computed_rank || "--"} | Net Pay: {row.net_pay || "--"}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: 13, opacity: 0.88 }}>No mapped prize rows available yet.</div>
                  )}
                </div>
              </div>

              {prizeStatus?.last_error ? (
                <div
                  style={{
                    marginTop: 18,
                    padding: 12,
                    borderRadius: 12,
                    background: "rgba(127,29,29,0.28)",
                    border: "1px solid rgba(254,202,202,0.25)",
                    color: "#fee2e2",
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  Last error: {prizeStatus.last_error}
                </div>
              ) : null}
            </div>

            <div
              style={{
                borderRadius: 20,
                padding: 20,
                background: "#fff",
                border: "1px solid #dbe7f3",
                boxShadow: "0 12px 32px rgba(15, 23, 42, 0.08)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 700 }}>
                    Tournament live sync
                  </div>
                  <div style={{ marginTop: 6, fontSize: 24, fontWeight: 800, color: "#102a43" }}>Tournament feed monitor</div>
                </div>
                <Button type="primary" icon={<PlayCircleOutlined />} loading={runningTournament} onClick={handleRunTournament}>
                  Run Now
                </Button>
              </div>

              <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
                <MetricCard label="Enabled" value={tournamentStatus?.enabled ? "Yes" : "No"} hint="Automatic scheduler state" />
                <MetricCard label="Interval" value={tournamentStatus?.interval_minutes ? `${tournamentStatus.interval_minutes} min` : "--"} hint="Polling frequency" />
                <MetricCard label="Last Run" value={prettyDate(tournamentStatus?.last_run_at)} hint="Latest successful trigger" />
                <MetricCard
                  label="Supported Days"
                  value={Array.isArray(tournamentStatus?.supported_days) ? tournamentStatus.supported_days.join(", ") : "--"}
                  hint="Configured draw/score round fetches"
                />
              </div>

              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 13, color: "#1e3a5f", fontWeight: 700 }}>Watched endpoints</div>
                <EndpointList items={tournamentEndpoints} />
              </div>

              {tournamentStatus?.latest_batch ? (
                <div
                  style={{
                    marginTop: 18,
                    padding: 16,
                    borderRadius: 16,
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ fontWeight: 700, color: "#102a43" }}>Latest tournament sync batch</div>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "4px 10px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700,
                        background: (statusStyle[tournamentStatus.latest_batch.status] || statusStyle.PROCESSING).background,
                        color: (statusStyle[tournamentStatus.latest_batch.status] || statusStyle.PROCESSING).color,
                        border: `1px solid ${(statusStyle[tournamentStatus.latest_batch.status] || statusStyle.PROCESSING).border}`,
                      }}
                    >
                      {tournamentStatus.latest_batch.status}
                    </span>
                  </div>
                  <div style={{ marginTop: 10, color: "#486581", fontSize: 13, lineHeight: 1.7 }}>
                    Batch #{tournamentStatus.latest_batch.id} | Started: {prettyDate(tournamentStatus.latest_batch.started_at)} | Completed:{" "}
                    {prettyDate(tournamentStatus.latest_batch.completed_at)}
                  </div>
                </div>
              ) : null}

              {tournamentStatus?.last_error ? (
                <div
                  style={{
                    marginTop: 18,
                    padding: 12,
                    borderRadius: 12,
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#7f1d1d",
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  Last error: {tournamentStatus.last_error}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="content-card-body">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h3 style={{ margin: 0, color: "#102a43", fontSize: 22, fontWeight: 800 }}>Recent tournament sync batches</h3>
              <p style={{ margin: "6px 0 0", color: "#64748b" }}>
                Watch raw sync history, inspect summary payloads, and open any batch to see the captured feed snapshots.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <Select
                value={limit}
                style={{ width: 120 }}
                onChange={(value) => {
                  setLimit(value);
                  setPage(1);
                  loadData(1, value);
                }}
              >
                {[10, 20, 50].map((value) => (
                  <Option key={value} value={value}>
                    {value} / page
                  </Option>
                ))}
              </Select>
              <Button icon={<ReloadOutlined />} onClick={() => loadData(page, limit)}>
                Refresh Batches
              </Button>
            </div>
          </div>

          {isLoading ? (
            <LoadingEffect />
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table className="table table-hover" style={{ marginBottom: 0 }}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Status</th>
                      <th>Context</th>
                      <th>Source URL</th>
                      <th>Started</th>
                      <th>Completed</th>
                      <th style={{ width: 160 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", color: "#64748b", padding: 36 }}>
                          No tournament live sync batches found yet.
                        </td>
                      </tr>
                    ) : (
                      batches.map((item, index) => {
                        const style = statusStyle[item.status] || statusStyle.PROCESSING;
                        return (
                          <tr key={item.id}>
                            <td>{(page - 1) * limit + index + 1}</td>
                            <td>
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 6,
                                  padding: "4px 10px",
                                  borderRadius: 999,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  background: style.background,
                                  color: style.color,
                                  border: `1px solid ${style.border}`,
                                }}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td>
                              <div style={{ fontWeight: 700, color: "#102a43" }}>{item.context_key || "--"}</div>
                              <div style={{ color: "#64748b", fontSize: 12 }}>Batch #{item.id}</div>
                            </td>
                            <td style={{ maxWidth: 280, wordBreak: "break-all" }}>{item.source_url || "--"}</td>
                            <td>{prettyDate(item.started_at)}</td>
                            <td>{prettyDate(item.completed_at)}</td>
                            <td>
                              <Button size="small" icon={<EyeOutlined />} onClick={() => openBatchDetail(item.id)}>
                                View
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  marginTop: 18,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ color: "#64748b" }}>Showing {batches.length} of {count} tournament sync batches</div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <Button
                    disabled={page <= 1}
                    onClick={() => {
                      const next = page - 1;
                      setPage(next);
                      loadData(next, limit);
                    }}
                  >
                    Previous
                  </Button>
                  <div style={{ minWidth: 84, textAlign: "center", fontWeight: 700 }}>
                    {page} / {totalPages}
                  </div>
                  <Button
                    disabled={page >= totalPages}
                    onClick={() => {
                      const next = page + 1;
                      setPage(next);
                      loadData(next, limit);
                    }}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Modal open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={1040} title="Tournament Live Sync Batch Detail">
        {detailLoading ? (
          <LoadingEffect />
        ) : !detail ? (
          <div style={{ color: "#64748b" }}>No batch detail available.</div>
        ) : (
          <div style={{ display: "grid", gap: 18 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
              }}
            >
              {[
                { label: "Batch", value: detail.id },
                { label: "Status", value: detail.status },
                { label: "Context", value: detail.context_key || "--" },
                { label: "Snapshots", value: detail.snapshots?.length || 0 },
              ].map((item) => (
                <div key={item.label} style={{ padding: 14, borderRadius: 14, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>
                    {item.label}
                  </div>
                  <div style={{ fontWeight: 700, color: "#102a43", wordBreak: "break-word" }}>{item.value || "--"}</div>
                </div>
              ))}
            </div>

            <div>
              <div style={{ fontWeight: 700, color: "#102a43", marginBottom: 8 }}>Summary</div>
              <pre
                style={{
                  margin: 0,
                  padding: 16,
                  borderRadius: 16,
                  background: "#0f172a",
                  color: "#e2e8f0",
                  fontSize: 12,
                  lineHeight: 1.6,
                  maxHeight: 280,
                  overflow: "auto",
                }}
              >
                {typeof detail.summary === "string" ? detail.summary : JSON.stringify(detail.summary || {}, null, 2)}
              </pre>
            </div>

            <div>
              <div style={{ fontWeight: 700, color: "#102a43", marginBottom: 8 }}>Snapshots</div>
              <div style={{ overflowX: "auto" }}>
                <table className="table table-hover" style={{ marginBottom: 0 }}>
                  <thead>
                    <tr>
                      <th>Feed</th>
                      <th>Day</th>
                      <th>Rows</th>
                      <th>Fetched</th>
                      <th>Request URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detail.snapshots || []).map((snapshot) => (
                      <tr key={snapshot.id}>
                        <td>{snapshot.feed_type}</td>
                        <td>{snapshot.tour_day || "--"}</td>
                        <td>{snapshot.row_count || 0}</td>
                        <td>{prettyDate(snapshot.fetched_at)}</td>
                        <td style={{ maxWidth: 420, wordBreak: "break-all" }}>{snapshot.request_url}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
