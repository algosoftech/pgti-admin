import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { notification, Select } from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  FilePdfOutlined,
  InfoCircleOutlined,
  SaveOutlined,
  SwapOutlined,
} from "@ant-design/icons";

import Top_navbar from "components/layout/TopNavbar";
import LoadingEffect from "components/ui/Loading/LoadingEffect";
import { FILE_SPECS, validatePdfFile } from "utils/fieldValidation";
import { getPgtiCareerEarning, savePgtiCareerEarning } from "services/pgtiCareerEarning.service";
import { TOUR_TYPE_OPTIONS } from "utils/tourType";
import "styles/admin-pages.css";

const { Option } = Select;
const pdfSpec = FILE_SPECS.career_earning_pdf;

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

export default function PgtiCareerEarning() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [record, setRecord] = useState(null);
  const [title, setTitle] = useState("PGTI Earnings");
  const [status, setStatus] = useState("A");
  const [tourType, setTourType] = useState("M");
  const [selectedFile, setSelectedFile] = useState(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState("");

  const currentFileUrl = record?.file_url || "";
  const currentFileName = record?.file_name || "";
  const fileLabel = selectedFile?.name || currentFileName || "";
  const isExisting = Boolean(record?.id);
  const previewUrl = localPreviewUrl || currentFileUrl || "";
  const previewSrc = previewUrl ? `${previewUrl}${previewUrl.includes("#") ? "" : "#toolbar=1&navpanes=0&view=FitH"}` : "";

  const shellStyle = useMemo(
    () => ({
      width: "100%",
      margin: 0,
    }),
    []
  );

  const cardGridStyle = useMemo(
    () => ({
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: 20,
      padding: 24,
    }),
    []
  );

  const formGridStyle = useMemo(
    () => ({
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
      gap: 18,
      alignItems: "start",
    }),
    []
  );

  const hydrate = useCallback((data, nextTourType = "M") => {
    setRecord(data || null);
    setTitle(data?.title || "PGTI Earnings");
    setStatus(data?.status || "A");
    setTourType(data?.tour_type || nextTourType || "M");
    setSelectedFile(null);
  }, []);

  const loadDetail = useCallback(async () => {
    setIsLoading(true);
    const res = await getPgtiCareerEarning(tourType);
    if (res?.status) {
      hydrate(res.result || null, tourType);
    } else {
      notify("Oops!", res?.message || "Failed to load PGTI career earning PDF details.");
    }
    setIsLoading(false);
  }, [hydrate, tourType]);

  useEffect(() => {
    document.title = "PGTI || PGTI Career Earning";
    loadDetail();
  }, [loadDetail]);

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
    if (!validatePdfFile(file, pdfSpec)) {
      event.target.value = "";
      return;
    }
    setSelectedFile(file);
    notify("PDF Ready", 'PDF selected successfully. Click "Save Document" to publish the update.', true);
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      notify("Oops!", "Document title is required.");
      return;
    }

    if (!isExisting && !selectedFile) {
      notify("Oops!", "Please upload the career earning PDF before saving.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("status", status || "A");
    formData.append("tour_type", tourType || "M");
    if (record?.file_name) formData.append("file_name", record.file_name);
    if (record?.file_path) formData.append("existing_file_path", record.file_path);
    if (selectedFile) formData.append("file", selectedFile);

    setIsSaving(true);
    const res = await savePgtiCareerEarning(formData);
    if (res?.status) {
      notify(
        "Success",
        isExisting ? "PGTI career earning PDF updated successfully." : "PGTI career earning PDF created successfully.",
        true
      );
      hydrate(res.result || null);
    } else {
      notify("Oops!", res?.message || "Failed to save PGTI career earning PDF.");
    }
    setIsSaving(false);
  };

  const statusMeta = useMemo(
    () =>
      status === "A"
        ? { label: "Active", bg: "#ecfdf3", color: "#15803d", border: "#bbf7d0" }
        : { label: "Inactive", bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
    [status]
  );

  return (
    <div className="admin-page-container">
      <Top_navbar title="PGTI Career Earning" />

      <div className="page-body modern-form" style={shellStyle}>
        <div
          className="content-card"
          style={{
            overflow: "hidden",
            background:
              "linear-gradient(135deg, rgba(30,58,95,0.05) 0%, rgba(14,116,144,0.08) 45%, rgba(255,255,255,1) 100%)",
            border: "1px solid #dbe7f3",
          }}
        >
          <div className="content-card-body" style={{ padding: 0 }}>
            <div style={cardGridStyle}>
              <div style={{ minWidth: 0 }}>
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
                  Stats Tab Document
                </div>

                <h2 style={{ margin: 0, color: "#102a43", fontSize: 30, fontWeight: 800, lineHeight: 1.2 }}>
                  Manage the PGTI Career Earning PDF
                </h2>
                <p style={{ margin: "12px 0 0", color: "#486581", fontSize: 15, lineHeight: 1.75, maxWidth: 760 }}>
                  Upload the PDF used for the front stats page &quot;PGTI Career Earning&quot; tab. The stats API
                  returns this file in the `document` block so the frontend can render the embedded PDF view directly.
                </p>
                <div style={{ marginTop: 18, maxWidth: 260 }}>
                  <label className="form-label">Tour Type</label>
                  <Select value={tourType} onChange={setTourType} size="large" style={{ width: "100%" }}>
                    {TOUR_TYPE_OPTIONS.map((option) => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.92)",
                  border: "1px solid #dbe7f3",
                  borderRadius: 18,
                  padding: 18,
                  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: "#64748b",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                  }}
                >
                  Current document state
                </div>
                <div
                  style={{
                    marginTop: 12,
                    color: "#0f172a",
                    fontSize: 18,
                    fontWeight: 700,
                    lineHeight: 1.35,
                    wordBreak: "break-word",
                  }}
                >
                  {title || "No PDF published yet"}
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
                  <span style={{ color: "#64748b", fontSize: 12, alignSelf: "center", lineHeight: 1.5 }}>
                    Updated: {prettyDate(record?.updated_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="content-card">
            <div className="content-card-body">
              <div
                className="d-flex justify-content-between align-items-center flex-wrap gap-3"
                style={{ marginBottom: 22 }}
              >
                <div>
                  <h3 className="form-section-title" style={{ marginBottom: 8 }}>
                    <FilePdfOutlined />
                    &nbsp;Career Earning Document
                  </h3>
                  <p className="page-subtitle" style={{ marginBottom: 0, lineHeight: 1.55 }}>
                    Upload one PDF and keep it aligned with the front stats tab.
                  </p>
                </div>
                <Link to="/admin/dashboard">
                  <button type="button" className="action-button secondary">
                    <ArrowLeftOutlined />
                    Back
                  </button>
                </Link>
              </div>

              <div style={formGridStyle}>
                <div>
                  <label className="form-label required">Document Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Enter PDF title"
                  />
                </div>

                <div>
                  <label className="form-label">Status</label>
                  <Select value={status} onChange={setStatus} size="large" style={{ width: "100%" }}>
                    <Option value="A">Active</Option>
                    <Option value="I">Inactive</Option>
                  </Select>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <div
                    style={{
                      border: "1px dashed #cbd5e1",
                      borderRadius: 16,
                      padding: 20,
                      background: "#f8fafc",
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
                          PDF Upload
                        </div>
                        <div
                          style={{
                            color: "#64748b",
                            fontSize: 13,
                            lineHeight: 1.6,
                            wordBreak: "break-word",
                          }}
                        >
                          {fileLabel || "No PDF selected yet."}
                        </div>
                        <div style={{ marginTop: 10, color: "#64748b", fontSize: 12 }}>
                          Accepted: {pdfSpec.accepted} | Max size: {pdfSpec.maxMB}MB
                        </div>
                      </div>

                      <label
                        className="action-button secondary"
                        style={{ cursor: "pointer", marginBottom: 0, flexShrink: 0 }}
                      >
                        <SwapOutlined />
                        {selectedFile || currentFileUrl ? "Replace PDF" : "Upload PDF"}
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={handleFileChange}
                          style={{ display: "none" }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <div
                    style={{
                      background: "#f8fbff",
                      border: "1px solid #dbeafe",
                      color: "#1e3a5f",
                      borderRadius: 14,
                      padding: "14px 16px",
                      fontSize: 13,
                      lineHeight: 1.7,
                    }}
                  >
                    {pdfSpec.note}
                  </div>
                </div>
              </div>

              <div className="form-actions" style={{ marginTop: 24 }}>
                <button type="submit" className="action-button primary" disabled={isSaving}>
                  <SaveOutlined />
                  Save Document
                </button>
              </div>
            </div>
          </div>

          <div className="content-card">
            <div className="content-card-body">
              <div
                className="d-flex justify-content-between align-items-center flex-wrap gap-3"
                style={{ marginBottom: 18 }}
              >
                <div>
                  <h3 className="form-section-title" style={{ marginBottom: 8 }}>
                    <FilePdfOutlined />
                    &nbsp;Document Preview
                  </h3>
                  <p className="page-subtitle" style={{ marginBottom: 0, lineHeight: 1.55 }}>
                    Review the currently published PDF directly from admin.
                  </p>
                </div>
                {previewUrl && (
                  <a href={previewUrl} target="_blank" rel="noreferrer" className="action-button secondary">
                    <FilePdfOutlined />
                    Open in New Tab
                  </a>
                )}
              </div>

              {previewUrl ? (
                <div
                  style={{
                    border: "1px solid #dbe7f3",
                    borderRadius: 18,
                    overflow: "hidden",
                    background: "#fff",
                  }}
                >
                  <iframe
                    title="PGTI Career Earning PDF Preview"
                    src={previewSrc}
                    style={{ width: "100%", height: "900px", border: "none", display: "block" }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    border: "1px dashed #cbd5e1",
                    borderRadius: 18,
                    padding: "60px 24px",
                    textAlign: "center",
                    color: "#64748b",
                    background: "#f8fafc",
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 700 }}>No PDF preview available yet</div>
                  <div style={{ marginTop: 8, lineHeight: 1.65 }}>
                    Upload and save a PDF to make the career earning document available.
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>

      <LoadingEffect
        isLoading={isLoading || isSaving}
        text={isLoading ? "Loading career earning PDF..." : "Saving career earning PDF..."}
      />
    </div>
  );
}
