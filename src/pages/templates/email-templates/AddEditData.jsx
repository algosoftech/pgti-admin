import React, { useEffect, useState } from "react";
import { notification } from "antd";
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  EyeOutlined,
  CodeOutlined,
  EditOutlined,
  PlusOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import LoadingEffect from "components/ui/Loading/LoadingEffect";
import { list as listEmailTemplates } from "services/emailTemplates.service";
import { addEditEmailTemplate } from "services/emailTemplates.service";
import { CharCounter, FieldHint } from "components/ui/FieldHint";
import { LIMITS, validateLength } from "utils/fieldValidation";
import "styles/admin-pages.css";

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ["link", "image"],
    ["clean"],
  ],
};

const CATEGORIES = [
  { value: "welcome",      label: "Welcome" },
  { value: "password",     label: "Password Reset" },
  { value: "order",        label: "Order" },
  { value: "event",        label: "Event" },
  { value: "newsletter",   label: "Newsletter" },
  { value: "promotional",  label: "Promotional" },
  { value: "notification", label: "Notification" },
  { value: "general",      label: "General" },
];

const COMMON_VARIABLES = [
  "user_name", "user_email", "user_phone",
  "site_name", "site_url", "support_email",
  "order_id", "order_date", "order_total",
  "event_name", "event_date", "event_venue",
  "reset_link", "activation_link",
  "year",
];

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");
}

export default function EmailTemplateAddEditData() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location?.state || {};

  const [ADDEDITDATA, setAddEditData] = useState({
    name: "",
    slug: "",
    subject: "",
    category: "general",
    body: "",
    variables: [],
    status: "A",
    ...state,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("visual"); // visual | html | preview
  const [newVariable, setNewVariable] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!state?.id);

  useEffect(() => {
    document.title = `PGTI || ${state?.id ? "Edit" : "Add"} Email Template`;
  }, [state?.id]);

  useEffect(() => {
    const normalizeTemplateState = (template = {}) => {
      let variables = template?.variables;
      if (typeof variables === "string") {
        try {
          variables = JSON.parse(variables);
        } catch {
          variables = [];
        }
      }

      setAddEditData((prev) => ({
        ...prev,
        ...template,
        variables: Array.isArray(variables) ? variables : [],
      }));
    };

    if (state?.id) {
      listEmailTemplates({ skip: 0, limit: 1, condition: { id: state.id } }).then((res) => {
        if (res?.status && res?.result?.length) {
          normalizeTemplateState(res.result[0]);
        }
      });
      return;
    }

    normalizeTemplateState(state);
  }, [state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddEditData((prev) => {
      const next = { ...prev, [name]: value };
      // Auto-generate slug from name unless manually edited
      if (name === "name" && !slugManuallyEdited) {
        next.slug = slugify(value);
      }
      return next;
    });
  };

  const handleSlugChange = (e) => {
    setSlugManuallyEdited(true);
    setAddEditData((prev) => ({ ...prev, slug: slugify(e.target.value) }));
  };

  const handleBodyChange = (val) => {
    setAddEditData((prev) => ({ ...prev, body: val }));
  };

  const handleHtmlChange = (e) => {
    setAddEditData((prev) => ({ ...prev, body: e.target.value }));
  };

  const addVariable = (v) => {
    const trimmed = v.trim().replace(/[^a-z0-9_]/gi, "");
    if (!trimmed) return;
    setAddEditData((prev) => {
      if (prev.variables.includes(trimmed)) return prev;
      return { ...prev, variables: [...prev.variables, trimmed] };
    });
    setNewVariable("");
  };

  const removeVariable = (v) => {
    setAddEditData((prev) => ({ ...prev, variables: prev.variables.filter((x) => x !== v) }));
  };

  const insertVariable = (v) => {
    const tag = `{{${v}}}`;
    if (activeTab === "html") {
      setAddEditData((prev) => ({ ...prev, body: (prev.body || "") + tag }));
    } else {
      // Insert into quill body (append at end as fallback)
      setAddEditData((prev) => ({ ...prev, body: (prev.body || "") + `<span>${tag}</span>` }));
    }
    // Also ensure variable is tracked
    addVariable(v);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ADDEDITDATA?.name?.trim()) {
      notification.open({ message: "Oops!", description: "Template name is required.", placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
      return;
    }
    if (!ADDEDITDATA?.slug?.trim()) {
      notification.open({ message: "Oops!", description: "Slug is required.", placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
      return;
    }
    if (!ADDEDITDATA?.subject?.trim()) {
      notification.open({ message: "Oops!", description: "Subject line is required.", placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
      return;
    }
    if (!validateLength(ADDEDITDATA.subject, 'Subject Line', LIMITS.subject)) return;
    if (!ADDEDITDATA?.body?.trim() || ADDEDITDATA.body === "<p><br></p>") {
      notification.open({ message: "Oops!", description: "Email body is required.", placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
      return;
    }

    try {
      setIsLoading(true);
      const param = {
        ...(ADDEDITDATA?.id && { editId: ADDEDITDATA.id }),
        name: ADDEDITDATA.name.trim(),
        slug: ADDEDITDATA.slug.trim(),
        subject: ADDEDITDATA.subject.trim(),
        category: ADDEDITDATA.category || "general",
        body: ADDEDITDATA.body || "",
        variables: JSON.stringify(ADDEDITDATA.variables || []),
        status: ADDEDITDATA.status || "A",
      };

      const res = await addEditEmailTemplate(param);
      if (res.status === true) {
        notification.open({
          message: "Success",
          description: ADDEDITDATA?.id ? "Template updated successfully." : "Template created successfully.",
          placement: "topRight",
          icon: <CheckCircleOutlined style={{ color: "green" }} />,
          duration: 2,
        });
        navigate("/admin/templates/email-templates/list");
      } else {
        notification.open({ message: "Oops!", description: res?.message || "Failed to save template.", placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
      }
    } catch {
      notification.open({ message: "Oops!", description: "An error occurred. Please try again.", placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">{ADDEDITDATA?.id ? "Edit Email Template" : "New Email Template"}</h1>
            <p className="page-subtitle">
              {ADDEDITDATA?.id ? "Update template content and settings" : "Create a reusable email template"}
            </p>
          </div>
          <Link to="/admin/templates/email-templates/list">
            <button className="action-button secondary"><ArrowLeftOutlined /> Back to Templates</button>
          </Link>
        </div>
      </div>

      <div className="page-body">
        <form onSubmit={handleSubmit} className="modern-form">

          {/* ── Template Details ──────────────────────────────── */}
          <div className="content-card" style={{ marginBottom: 24 }}>
            <div className="content-card-body">
              <div className="form-section">
                <h3 className="form-section-title"><EditOutlined /> Template Details</h3>
                <div className="row">
                  <div className="col-md-6 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label required">Template Name</label>
                      <input
                        type="text"
                        name="name"
                        className="form-input"
                        placeholder="e.g. Welcome Email"
                        value={ADDEDITDATA.name}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-6 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label required">Slug</label>
                      <input
                        type="text"
                        name="slug"
                        className="form-input"
                        placeholder="e.g. welcome_email"
                        value={ADDEDITDATA.slug}
                        onChange={handleSlugChange}
                        style={{ fontFamily: "monospace" }}
                      />
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                        Auto-generated from name. Used by the backend to identify this template.
                      </div>
                    </div>
                  </div>
                  <div className="col-md-8 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label required">Subject Line</label>
                      <input
                        type="text"
                        name="subject"
                        className="form-input"
                        placeholder="e.g. Welcome to PGTI, {{user_name}}!"
                        value={ADDEDITDATA.subject}
                        onChange={handleChange}
                      />
                      <CharCounter value={ADDEDITDATA.subject} min={LIMITS.subject.min} max={LIMITS.subject.max} />
                      <FieldHint text={`Keep the subject concise and descriptive. You can include variables like {{user_name}} directly in the subject line.`} />
                    </div>
                  </div>
                  <div className="col-md-4 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select
                        name="category"
                        className="form-input"
                        value={ADDEDITDATA.category}
                        onChange={handleChange}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-4 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select
                        name="status"
                        className="form-input"
                        value={ADDEDITDATA.status}
                        onChange={handleChange}
                      >
                        <option value="A">Active</option>
                        <option value="I">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Variables ──────────────────────────────────────── */}
          <div className="content-card" style={{ marginBottom: 24 }}>
            <div className="content-card-body">
              <div className="form-section">
                <h3 className="form-section-title"><CodeOutlined /> Template Variables</h3>
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
                  Add the variables this template uses. Click any chip below to insert it into the email body.
                </p>

                {/* Common variable suggestions */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 8 }}>Common Variables (click to add &amp; insert)</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {COMMON_VARIABLES.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => insertVariable(v)}
                        style={{
                          fontSize: 11,
                          fontFamily: "monospace",
                          background: ADDEDITDATA.variables.includes(v) ? "#dbeafe" : "#f1f5f9",
                          color: ADDEDITDATA.variables.includes(v) ? "#1d4ed8" : "#475569",
                          border: ADDEDITDATA.variables.includes(v) ? "1px solid #93c5fd" : "1px solid #e2e8f0",
                          padding: "3px 10px",
                          borderRadius: 5,
                          cursor: "pointer",
                        }}
                      >
                        {`{{${v}}}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom variable input */}
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Add custom variable (e.g. player_rank)"
                    value={newVariable}
                    onChange={(e) => setNewVariable(e.target.value.replace(/[^a-z0-9_]/gi, ""))}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addVariable(newVariable); } }}
                    style={{ maxWidth: 300, fontFamily: "monospace" }}
                  />
                  <button type="button" className="action-button primary" style={{ padding: "6px 14px" }} onClick={() => addVariable(newVariable)}>
                    <PlusOutlined /> Add
                  </button>
                </div>

                {/* Active variables for this template */}
                {ADDEDITDATA.variables.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 8 }}>This template uses:</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {ADDEDITDATA.variables.map((v) => (
                        <span
                          key={v}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 11,
                            fontFamily: "monospace",
                            background: "#eff6ff",
                            color: "#1d4ed8",
                            border: "1px solid #93c5fd",
                            padding: "3px 8px",
                            borderRadius: 5,
                          }}
                        >
                          {`{{${v}}}`}
                          <CloseOutlined
                            style={{ fontSize: 9, cursor: "pointer", color: "#94a3b8" }}
                            onClick={() => removeVariable(v)}
                          />
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Email Body Editor ──────────────────────────────── */}
          <div className="content-card" style={{ marginBottom: 24 }}>
            <div className="content-card-body">
              <div className="form-section">
                <h3 className="form-section-title"><EditOutlined /> Email Body</h3>

                {/* Tab switcher */}
                <div style={{ display: "flex", gap: 4, marginBottom: 16, borderBottom: "1px solid #e2e8f0", paddingBottom: 0 }}>
                  {[
                    { key: "visual", label: "Visual Editor", icon: <EditOutlined /> },
                    { key: "html",   label: "HTML Source",   icon: <CodeOutlined /> },
                    { key: "preview", label: "Preview",      icon: <EyeOutlined /> },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      style={{
                        padding: "8px 18px",
                        fontSize: 13,
                        fontWeight: activeTab === tab.key ? 600 : 400,
                        color: activeTab === tab.key ? "#1d4ed8" : "#64748b",
                        background: "none",
                        border: "none",
                        borderBottom: activeTab === tab.key ? "2px solid #1d4ed8" : "2px solid transparent",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: -1,
                      }}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>

                {/* Visual Editor */}
                {activeTab === "visual" && (
                  <ReactQuill
                    theme="snow"
                    value={ADDEDITDATA.body || ""}
                    onChange={handleBodyChange}
                    placeholder="Compose your email template here. Use the Variables section above to insert placeholders..."
                    style={{ backgroundColor: "white", borderRadius: 8 }}
                    modules={QUILL_MODULES}
                  />
                )}

                {/* HTML Source */}
                {activeTab === "html" && (
                  <textarea
                    value={ADDEDITDATA.body || ""}
                    onChange={handleHtmlChange}
                    placeholder="<p>Hello {{user_name}},</p><p>Welcome to PGTI!</p>"
                    rows={20}
                    style={{
                      width: "100%",
                      fontFamily: "monospace",
                      fontSize: 13,
                      padding: 16,
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      background: "#0f172a",
                      color: "#e2e8f0",
                      resize: "vertical",
                      lineHeight: 1.6,
                    }}
                  />
                )}

                {/* Preview */}
                {activeTab === "preview" && (
                  <div
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      overflow: "hidden",
                    }}
                  >
                    {/* Email header mock */}
                    <div style={{ background: "#f8fafc", padding: "12px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        <strong>Subject:</strong> {ADDEDITDATA.subject || <em style={{ color: "#94a3b8" }}>No subject</em>}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        <strong>Category:</strong> {CATEGORIES.find(c => c.value === ADDEDITDATA.category)?.label || "General"}
                      </div>
                    </div>
                    {/* Body preview */}
                    <div
                      style={{ padding: 24, minHeight: 300, background: "white" }}
                      dangerouslySetInnerHTML={{ __html: ADDEDITDATA.body || "<p style='color:#94a3b8;font-style:italic'>No content yet.</p>" }}
                    />
                    {/* Variable warning */}
                    {ADDEDITDATA.variables.length > 0 && (
                      <div style={{ background: "#fffbeb", borderTop: "1px solid #fef08a", padding: "8px 20px", fontSize: 11, color: "#854d0e" }}>
                        Note: Variables like {ADDEDITDATA.variables.slice(0, 3).map(v => `{{${v}}}`).join(", ")} will be replaced with real values when sent.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="action-button secondary" onClick={() => navigate("/admin/templates/email-templates/list")}>
              Cancel
            </button>
            <button type="submit" className="action-button primary" disabled={isLoading}>
              {isLoading ? (
                <><div className="loading-spinner small"></div>{ADDEDITDATA?.id ? "Updating..." : "Creating..."}</>
              ) : (
                <><SaveOutlined /> {ADDEDITDATA?.id ? "Update Template" : "Create Template"}</>
              )}
            </button>
          </div>

        </form>
      </div>

      <LoadingEffect isLoading={isLoading} text="Saving template..." />
    </div>
  );
}
