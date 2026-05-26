import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircleOutlined,
  CloudUploadOutlined,
  EyeOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Button, Modal, Select, notification } from "antd";
import Top_navbar from "components/layout/TopNavbar";
import LoadingEffect from "components/ui/Loading/LoadingEffect";
import { FILE_SPECS, validateAceWebFile } from "utils/fieldValidation";
import { getAceImportDetail, listAceImports, uploadAceImport } from "services/events.service";
import "styles/admin-pages.css";

const { Option } = Select;
const aceFileSpec = FILE_SPECS.ace_import_web;

const toast = (message, description, success = false) =>
  notification.open({
    message,
    description,
    placement: "topRight",
    duration: success ? 2.5 : 4,
    icon: success ? (
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

const summaryCards = [
  {
    title: "Player Master Sync",
    value: "Member records are saved in compatibility tables and synced into current players wherever the data is usable.",
  },
  {
    title: "Tournament Package",
    value: "pg_acetour / pg_course / pg_entry",
  },
  {
    title: "Tournament Operations Data",
    value: "pg_draw / pg_putts / pg_prize / pg_tourrec / pg_oom",
  },
];

export default function AceImport() {
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState(null);
  const [filters, setFilters] = useState({ import_types: [], status_options: [] });

  const loadHistory = async (nextPage = page, nextLimit = limit) => {
    setLoading(true);
    const response = await listAceImports({
      skip: (nextPage - 1) * nextLimit,
      limit: nextLimit,
      detected_type: typeFilter || undefined,
      status: statusFilter || undefined,
    });

    if (response?.status) {
      setRows(response.result || []);
      setCount(response.count || 0);
      setFilters(response.filters || { import_types: [], status_options: [] });
    } else {
      toast("Oops!", response?.message || "Failed to load import history.");
    }
    setLoading(false);
  };

  useEffect(() => {
    document.title = "PGTI || Tournament Data Import";
  }, []);

  useEffect(() => {
    loadHistory(1, limit);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, statusFilter]);

  useEffect(() => {
    loadHistory(page, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = useMemo(() => Math.max(Math.ceil(count / limit), 1), [count, limit]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateAceWebFile(file, aceFileSpec)) {
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    toast("File Ready", `${file.name} selected. Click "Run Import" to process it.`, true);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast("Oops!", "Please choose a generated .web file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setUploading(true);
    const response = await uploadAceImport(formData);
    if (response?.status) {
      toast("Success", "Tournament data imported successfully.", true);
      setSelectedFile(null);
      loadHistory(1, limit);
      setPage(1);
    } else {
      toast("Oops!", response?.message || "Tournament data import failed.");
    }
    setUploading(false);
  };

  const openDetail = async (id) => {
    setDetailOpen(true);
    setDetail(null);
    setDetailLoading(true);
    const response = await getAceImportDetail(id);
    if (response?.status) {
      setDetail(response.result || null);
    } else {
      toast("Oops!", response?.message || "Failed to load import detail.");
    }
    setDetailLoading(false);
  };

  return (
    <div className="admin-page-container">
      <Top_navbar title="Tournament Data Import" />

      <div className="content-card" style={{ marginBottom: 20 }}>
        <div className="content-card-body">
          <div style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: 20 }}>
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
                }}
              >
                <FileTextOutlined />
                Data Import
              </div>

              <h2 style={{ margin: "14px 0 10px", color: "#102a43", fontSize: 30, fontWeight: 800 }}>
                Upload generated `.web` tournament data files
              </h2>
              <p style={{ margin: 0, color: "#486581", fontSize: 15, lineHeight: 1.7 }}>
                This importer accepts the generated `.web` files as-is, processes the payload safely, and stores it
                in the current PGTI schema together with linked compatibility tables for complete traceability.
              </p>

              <div
                style={{
                  marginTop: 18,
                  padding: 16,
                  borderRadius: 18,
                  background: "#f8fafc",
                  border: "1px solid #dbe7f3",
                }}
              >
                <div style={{ fontWeight: 700, color: "#1e3a5f", marginBottom: 8 }}>Upload file</div>
                <div style={{ color: "#64748b", fontSize: 13, marginBottom: 12 }}>
                  Accepted: {aceFileSpec.accepted} | Max size: {aceFileSpec.maxMB} MB
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  <input type="file" accept={aceFileSpec.accepted} onChange={handleFileChange} />
                  <Button type="primary" icon={<CloudUploadOutlined />} loading={uploading} onClick={handleUpload}>
                    Run Import
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={() => loadHistory(page, limit)}>
                    Refresh History
                  </Button>
                </div>
                {selectedFile && (
                  <div style={{ marginTop: 12, color: "#1d4ed8", fontWeight: 600 }}>
                    Ready: {selectedFile.name}
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                background: "linear-gradient(135deg, #102a43 0%, #1f4b82 100%)",
                borderRadius: 20,
                padding: 20,
                color: "#fff",
                boxShadow: "0 18px 42px rgba(15, 23, 42, 0.16)",
              }}
            >
              <div style={{ fontSize: 12, textTransform: "uppercase", opacity: 0.8, letterSpacing: 0.7, fontWeight: 700 }}>
                Supported flows
              </div>
              <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
                {summaryCards.map((card) => (
                  <div
                    key={card.title}
                    style={{
                      borderRadius: 16,
                      padding: 14,
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.14)",
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>{card.title}</div>
                    <div style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.6 }}>{card.value}</div>
                  </div>
                ))}
              </div>
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
              <h3 style={{ margin: 0, color: "#102a43", fontSize: 22, fontWeight: 800 }}>Import history</h3>
              <p style={{ margin: "6px 0 0", color: "#64748b" }}>
                Review each batch, inspect warnings, and confirm that related tournament or player data landed correctly.
              </p>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Select
                allowClear
                placeholder="Filter by import type"
                value={typeFilter || undefined}
                style={{ minWidth: 220 }}
                onChange={(value) => setTypeFilter(value || "")}
              >
                {(filters.import_types || []).map((item) => (
                  <Option key={item} value={item}>
                    {item}
                  </Option>
                ))}
              </Select>
              <Select
                allowClear
                placeholder="Filter by status"
                value={statusFilter || undefined}
                style={{ minWidth: 180 }}
                onChange={(value) => setStatusFilter(value || "")}
              >
                {(filters.status_options || []).map((item) => (
                  <Option key={item} value={item}>
                    {item}
                  </Option>
                ))}
              </Select>
            </div>
          </div>

          {loading ? (
            <LoadingEffect />
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table className="table table-hover" style={{ marginBottom: 0 }}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>File</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Statements</th>
                      <th>Imported On</th>
                      <th style={{ width: 160 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", color: "#64748b", padding: 36 }}>
                          No imports found yet.
                        </td>
                      </tr>
                    ) : (
                      rows.map((item, index) => {
                        const style = statusStyle[item.status] || statusStyle.PROCESSING;
                        return (
                          <tr key={item.id}>
                            <td>{(page - 1) * limit + index + 1}</td>
                            <td>
                              <div style={{ fontWeight: 700, color: "#102a43" }}>{item.file_name}</div>
                              <div style={{ color: "#64748b", fontSize: 12 }}>Batch #{item.id}</div>
                            </td>
                            <td>{item.detected_type}</td>
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
                            <td>{item.statement_count || 0}</td>
                            <td>{prettyDate(item.created_at)}</td>
                            <td>
                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <Button size="small" icon={<EyeOutlined />} onClick={() => openDetail(item.id)}>
                                  View
                                </Button>
                                {item.file_url && (
                                  <Button size="small" href={item.file_url} target="_blank" rel="noreferrer">
                                    File
                                  </Button>
                                )}
                              </div>
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
                <div style={{ color: "#64748b" }}>Showing {rows.length} of {count} import batches</div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <Select
                    value={limit}
                    style={{ width: 110 }}
                    onChange={(value) => {
                      setLimit(value);
                      setPage(1);
                      loadHistory(1, value);
                    }}
                  >
                    {[10, 20, 50].map((value) => (
                      <Option key={value} value={value}>
                        {value} / page
                      </Option>
                    ))}
                  </Select>
                  <Button
                    disabled={page <= 1}
                    onClick={() => {
                      const next = page - 1;
                      setPage(next);
                      loadHistory(next, limit);
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
                      loadHistory(next, limit);
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

      <Modal open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={960} title="Tournament Data Import Detail">
        {detailLoading ? (
          <LoadingEffect />
        ) : !detail ? (
          <div style={{ color: "#64748b" }}>No detail available.</div>
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
                { label: "File", value: detail.file_name },
                { label: "Type", value: detail.detected_type },
                { label: "Status", value: detail.status },
                { label: "Statements", value: detail.statement_count || 0 },
              ].map((item) => (
                <div key={item.label} style={{ padding: 14, borderRadius: 14, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>
                    {item.label}
                  </div>
                  <div style={{ fontWeight: 700, color: "#102a43" }}>{item.value || "--"}</div>
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
                  maxHeight: 420,
                  overflow: "auto",
                }}
              >
                {JSON.stringify(detail.summary || {}, null, 2)}
              </pre>
            </div>

            {!!detail.errors?.length && (
              <div>
                <div style={{ fontWeight: 700, color: "#b91c1c", marginBottom: 8 }}>Errors</div>
                <pre
                  style={{
                    margin: 0,
                    padding: 16,
                    borderRadius: 16,
                    background: "#fef2f2",
                    color: "#7f1d1d",
                    fontSize: 12,
                    lineHeight: 1.6,
                    maxHeight: 260,
                    overflow: "auto",
                  }}
                >
                  {JSON.stringify(detail.errors || [], null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
