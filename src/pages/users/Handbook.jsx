import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { notification, Select } from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloudUploadOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  InfoCircleOutlined,
  SaveOutlined,
  SwapOutlined,
} from "@ant-design/icons";

import Top_navbar from "components/layout/TopNavbar";
import LoadingEffect from "components/ui/Loading/LoadingEffect";
import { FILE_SPECS, validatePdfFile } from "utils/fieldValidation";
import { getPlayersHandbook, savePlayersHandbook } from "services/users.service";
import "styles/admin-pages.css";

const { Option } = Select;

const handbookSpec = FILE_SPECS.handbook_pdf;

const notify = (message, description, isSuccess = false) => {
  notification.open({
    message,
    description,
    placement: "topRight",
    icon: isSuccess ? (
      <CheckCircleOutlined style={{ color: "green" }} />
    ) : (
      <InfoCircleOutlined style={{ color: "red" }} />
    ),
    duration: isSuccess ? 2 : 3,
  });
};

const prettyDate = (value) => {
  if (!value) return "Not published yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently updated";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function Handbook() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [record, setRecord] = useState(null);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("A");
  const [selectedFile, setSelectedFile] = useState(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState("");

  const currentFileUrl = record?.file_url || "";
  const currentFileName = record?.file_name || "";
  const fileLabel = selectedFile?.name || currentFileName || "";
  const isExisting = Boolean(record?.id);
  const previewUrl = localPreviewUrl || currentFileUrl || "";
  const previewSrc = previewUrl ? `${previewUrl}${previewUrl.includes("#") ? "" : "#toolbar=1&navpanes=0&view=FitH"}` : "";

  const hydrate = useCallback((data) => {
    setRecord(data || null);
    setTitle(data?.title || "");
    setStatus(data?.status || "A");
    setSelectedFile(null);
  }, []);

  const loadHandbook = useCallback(async () => {
    setIsLoading(true);
    const res = await getPlayersHandbook();
    if (res?.status) {
      hydrate(res.result || null);
    } else {
      notify("Oops!", res?.message || "Failed to load handbook details.");
    }
    setIsLoading(false);
  }, [hydrate]);

  useEffect(() => {
    document.title = "PGTI || Players Handbook";
    loadHandbook();
  }, [loadHandbook]);

  useEffect(() => {
    if (!selectedFile) {
      setLocalPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setLocalPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validatePdfFile(file, handbookSpec)) {
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    notify("PDF Ready", 'PDF selected successfully. Click "Save Handbook" to publish the update.', true);
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      notify("Oops!", "Handbook title is required.");
      return;
    }

    if (!isExisting && !selectedFile) {
      notify("Oops!", "Please upload the handbook PDF before saving.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("status", status || "A");

    if (record?.file_name) formData.append("file_name", record.file_name);
    if (record?.file_path) formData.append("existing_file_path", record.file_path);
    if (selectedFile) formData.append("file", selectedFile);

    setIsSaving(true);
    const res = await savePlayersHandbook(formData);
    if (res?.status) {
      notify(
        "Success",
        isExisting ? "Players handbook updated successfully." : "Players handbook created successfully.",
        true
      );
      hydrate(res.result || null);
    } else {
      notify("Oops!", res?.message || "Failed to save handbook.");
    }
    setIsSaving(false);
  };

  const statusMeta = useMemo(
    () =>
      status === "A"
        ? {
            label: "Active",
            bg: "#ecfdf3",
            color: "#15803d",
            border: "#bbf7d0",
          }
        : {
            label: "Inactive",
            bg: "#fff7ed",
            color: "#c2410c",
            border: "#fed7aa",
          },
    [status]
  );

  return (
    <div className="admin-page-container">
      <Top_navbar title="Players Handbook" />

      <div
        className="content-card"
        style={{
          overflow: "hidden",
          background:
            "linear-gradient(135deg, rgba(30,58,95,0.05) 0%, rgba(14,116,144,0.08) 45%, rgba(255,255,255,1) 100%)",
          border: "1px solid #dbe7f3",
          marginBottom: 20,
        }}
      >
        <div className="content-card-body" style={{ padding: 0 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.7fr) minmax(280px, 0.9fr)",
              gap: 20,
              padding: 24,
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  border: "1px solid #bfdbfe",
                  borderRadius: 999,
                  padding: "6px 12px",
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                  marginBottom: 14,
                }}
              >
                <FilePdfOutlined />
                Player Dashboard Document
              </div>

              <h2 style={{ margin: 0, color: "#102a43", fontSize: 30, fontWeight: 800 }}>
                Single source for the player handbook
              </h2>
              <p style={{ margin: "12px 0 0", color: "#486581", fontSize: 15, lineHeight: 1.7, maxWidth: 760 }}>
                Upload the latest PDF shown in the player dashboard handbook tab. The current file stays
                available until you replace it, so admins can safely refresh title, status, or the document itself
                without touching any front-end integration.
              </p>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.88)",
                border: "1px solid #dbe7f3",
                borderRadius: 18,
                padding: 18,
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
              }}
            >
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6 }}>
                Current handbook state
              </div>
              <div style={{ marginTop: 12, color: "#0f172a", fontSize: 18, fontWeight: 700 }}>
                {title || "No handbook published yet"}
              </div>
              <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 10 }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "5px 12px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                    background: statusMeta.bg,
                    color: statusMeta.color,
                    border: `1px solid ${statusMeta.border}`,
                  }}
                >
                  {statusMeta.label}
                </span>
                <span style={{ color: "#64748b", fontSize: 12, alignSelf: "center" }}>
                  Updated: {prettyDate(record?.updated_at)}
                </span>
              </div>

              <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
                <Link to="/admin/users/list" style={{ textDecoration: "none" }}>
                  <button className="action-button secondary" style={{ width: "100%", justifyContent: "center" }}>
                    <ArrowLeftOutlined />
                    Back to Players
                  </button>
                </Link>
                <button
                  type="button"
                  className="action-button primary"
                  onClick={handleSave}
                  disabled={isLoading || isSaving}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  <SaveOutlined />
                  {isSaving ? "Saving..." : "Save Handbook"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="content-card-body">
          <form onSubmit={handleSave} className="modern-form">
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: 16,
                borderRadius: 16,
                background: "#f8fbff",
                border: "1px solid #dbeafe",
                marginBottom: 22,
              }}
            >
              <InfoCircleOutlined style={{ color: "#2563eb", fontSize: 18, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 700, color: "#1e3a5f", marginBottom: 4 }}>Publishing note</div>
                <div style={{ color: "#52606d", lineHeight: 1.65 }}>
                  Only PDF files are accepted. If you upload a new file, it replaces the current player handbook
                  document for both the admin preview and the authenticated player API.
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-8 col-12 mb-3">
                <label className="form-label required">Handbook Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Enter handbook title"
                  maxLength={180}
                />
              </div>

              <div className="col-md-4 col-12 mb-3">
                <label className="form-label">Status</label>
                <Select
                  value={status}
                  onChange={setStatus}
                  size="large"
                  style={{ width: "100%" }}
                >
                  <Option value="A">Active</Option>
                  <Option value="I">Inactive</Option>
                </Select>
              </div>

              <div className="col-md-12 col-12 mb-4">
                <label className="form-label required">Handbook PDF</label>
                <div
                  style={{
                    border: "1px dashed #93c5fd",
                    borderRadius: 18,
                    background: "#f8fbff",
                    padding: 22,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 16,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div
                        style={{
                          width: 54,
                          height: 54,
                          borderRadius: 16,
                          background: "#eff6ff",
                          color: "#1d4ed8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 24,
                        }}
                      >
                        <FilePdfOutlined />
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                          {fileLabel || "No PDF selected yet"}
                        </div>
                        <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
                          Accepted: {handbookSpec.accepted} · Max size: {handbookSpec.maxMB}MB
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                      <label className="action-button secondary" style={{ marginBottom: 0, cursor: "pointer" }}>
                        <CloudUploadOutlined />
                        {selectedFile || currentFileUrl ? "Replace PDF" : "Upload PDF"}
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={handleFileChange}
                          style={{ display: "none" }}
                        />
                      </label>
              {currentFileUrl ? (
                        <a
                          href={currentFileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="action-button secondary"
                          style={{ textDecoration: "none" }}
                        >
                          <DownloadOutlined />
                          Download Current
                        </a>
                      ) : null}
                    </div>
                  </div>

                  <div style={{ marginTop: 12, color: "#52606d", fontSize: 13 }}>
                    {handbookSpec.note}
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                borderTop: "1px solid #e2e8f0",
                paddingTop: 22,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  marginBottom: 16,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h3 style={{ margin: 0, color: "#0f172a", fontSize: 20, fontWeight: 700 }}>Preview</h3>
                  <p style={{ margin: "4px 0 0", color: "#64748b" }}>
                    Review the currently published handbook directly from admin.
                  </p>
                </div>
                <button
                  type="button"
                  className="action-button secondary"
                  onClick={loadHandbook}
                  disabled={isLoading || isSaving}
                >
                  <SwapOutlined />
                  Refresh Data
                </button>
              </div>

              {previewSrc ? (
                <div
                  style={{
                    border: "1px solid #dbe7f3",
                    borderRadius: 18,
                    overflow: "hidden",
                    background: "#fff",
                    minHeight: 720,
                  }}
                >
                  <object
                    data={previewSrc}
                    type="application/pdf"
                    style={{ width: "100%", height: 720, border: 0, display: "block" }}
                  >
                    <embed
                      src={previewSrc}
                      type="application/pdf"
                      style={{ width: "100%", height: 720, border: 0, display: "block" }}
                    />
                    <div
                      style={{
                        minHeight: 220,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        color: "#52606d",
                        padding: 24,
                      }}
                    >
                      <FilePdfOutlined style={{ fontSize: 42, color: "#94a3b8" }} />
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#102a43" }}>
                        Inline PDF preview is not available in this browser.
                      </div>
                      <div style={{ fontSize: 13 }}>
                        Open the PDF in a separate tab to review the handbook.
                      </div>
                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="action-button primary"
                        style={{ textDecoration: "none" }}
                      >
                        <DownloadOutlined />
                        Open PDF
                      </a>
                    </div>
                  </object>
                </div>
              ) : (
                <div
                  style={{
                    minHeight: 280,
                    borderRadius: 18,
                    border: "1px dashed #cbd5e1",
                    background: "#f8fafc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: 10,
                    color: "#64748b",
                  }}
                >
                  <FilePdfOutlined style={{ fontSize: 42, color: "#94a3b8" }} />
                  <div style={{ fontSize: 16, fontWeight: 700 }}>No handbook preview available yet</div>
                  <div style={{ fontSize: 13 }}>
                    Upload and save a PDF to make the player handbook available.
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>

      <LoadingEffect isLoading={isLoading || isSaving} text={isLoading ? "Loading handbook..." : "Saving handbook..."} />
    </div>
  );
}
