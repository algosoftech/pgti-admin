import React, { useEffect, useState } from "react";
import { notification } from "antd";
import {
  ArrowLeftOutlined, CheckCircleOutlined, InfoCircleOutlined,
  SaveOutlined, PlusOutlined, DeleteOutlined, LockOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { addEditPrivacyPolicy } from "services/privacyPolicy.service";
import { CharCounter } from "components/ui/FieldHint";
import { LIMITS } from "utils/fieldValidation";
import "styles/admin-pages.css";

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ["link"],
    ["clean"],
  ],
};

const DEFAULT_SECTIONS = [
  { heading: "Introduction", content: "" },
  { heading: "How We Use Your Information", content: "" },
  { heading: "Data Storage and Security", content: "" },
  { heading: "User Rights & Choices", content: "" },
  { heading: "International Data Transfers", content: "" },
  { heading: "Changes to This Privacy Policy", content: "" },
];

const parseContent = (raw) => {
  try {
    const c = typeof raw === "string" ? JSON.parse(raw) : (raw || {});
    return {
      title: c.title || "",
      subtitle: c.subtitle || "",
      sections: Array.isArray(c.sections) && c.sections.length ? c.sections : DEFAULT_SECTIONS,
    };
  } catch {
    return { title: "", subtitle: "", sections: DEFAULT_SECTIONS };
  }
};

/* ── section card wrapper ─────────────────────────────────── */
const SectionCard = ({ number, title, icon, children }) => (
  <div className="content-card" style={{ marginBottom: 24 }}>
    <div className="content-card-body">
      <div className="form-section">
        <h3 className="form-section-title">
          {icon}&nbsp;<span style={{ fontSize: 13, color: "#94a3b8", marginRight: 6 }}>{number}.</span>{title}
        </h3>
        {children}
      </div>
    </div>
  </div>
);

export default function PrivacyPolicyAddEditData() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location?.state || {};
  const [isLoading, setIsLoading] = useState(false);
  const [id, setId] = useState(state?.id ?? "");
  const raw = state?.content ?? state?.result?.content ?? state;
  const [form, setForm] = useState(() => parseContent(raw));

  useEffect(() => { document.title = `PGTI || ${id ? "Edit" : "Setup"} Privacy Policy`; }, [id]);

  const updateSection = (idx, field, val) => {
    setForm(f => {
      const sections = f.sections.map((s, i) => i === idx ? { ...s, [field]: val } : s);
      return { ...f, sections };
    });
  };

  const addSection = () =>
    setForm(f => ({ ...f, sections: [...f.sections, { heading: "", content: "" }] }));

  const removeSection = (idx) =>
    setForm(f => ({ ...f, sections: f.sections.filter((_, i) => i !== idx).length ? f.sections.filter((_, i) => i !== idx) : [{ heading: "", content: "" }] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      notification.open({ message: "Oops!", description: "Page title is required.", placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
      return;
    }
    try {
      setIsLoading(true);
      const res = await addEditPrivacyPolicy({ ...(id && { editId: id }), status: "A", content: JSON.stringify(form) });
      if (res.status === true) {
        if (!id && res.result?.id) setId(res.result.id);
        notification.open({ message: "Success", description: "Privacy Policy saved successfully.", placement: "topRight", icon: <CheckCircleOutlined style={{ color: "green" }} />, duration: 2 });
        navigate("/admin/cms/privacy-policy/list");
      } else {
        notification.open({ message: "Oops!", description: res?.message || "Failed to save", placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
      }
    } catch {
      notification.open({ message: "Oops!", description: "An error occurred.", placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
    } finally { setIsLoading(false); }
  };

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">{id ? "Edit Privacy Policy" : "Setup Privacy Policy"}</h1>
            <p className="page-subtitle">Manage the Privacy Policy page and its sections</p>
          </div>
          <Link to="/admin/cms/privacy-policy/list">
            <button className="action-button secondary"><ArrowLeftOutlined /> Back</button>
          </Link>
        </div>
      </div>

      <div className="page-body">
        <form onSubmit={handleSubmit}>

          {/* ── Page Header ─────────────────────────────────── */}
          <SectionCard number="1" title="Page Header" icon={<LockOutlined />}>
            <div className="row">
              <div className="col-md-6 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label required">Page Title</label>
                  <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Privacy Policy" />
                </div>
              </div>
              <div className="col-md-6 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Subtitle</label>
                  <textarea className="form-input" rows={2} value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="Short description shown below the title..." />
                  <CharCounter value={form.subtitle} max={LIMITS.short_description.max} />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ── Sections ─────────────────────────────────────── */}
          <div className="content-card" style={{ marginBottom: 24 }}>
            <div className="content-card-body">
              <div className="form-section">
                <h3 className="form-section-title">
                  <LockOutlined />&nbsp;<span style={{ fontSize: 13, color: "#94a3b8", marginRight: 6 }}>2.</span>Policy Sections
                </h3>
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
                  Each section has a heading and rich-text content. The default sections match the design — you can add, remove, or reorder them.
                </p>

                {form.sections.map((section, idx) => (
                  <div key={idx} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 16, marginBottom: 16, background: "#f8fafc" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontWeight: 700, color: "#0369a1", fontSize: 14 }}>Section {idx + 1}</span>
                      <button type="button" className="action-button danger" style={{ fontSize: 11, padding: "3px 10px" }} onClick={() => removeSection(idx)}>
                        <DeleteOutlined /> Remove
                      </button>
                    </div>
                    <div className="form-group" style={{ marginBottom: 12 }}>
                      <label className="form-label required">Section Heading</label>
                      <input className="form-input" value={section.heading} onChange={e => updateSection(idx, "heading", e.target.value)} placeholder="e.g. Introduction" />
                    </div>
                    <div className="form-group">
                      <label className="form-label required">Section Content</label>
                      <ReactQuill
                        theme="snow"
                        value={section.content || ""}
                        onChange={val => updateSection(idx, "content", val)}
                        placeholder="Enter section content..."
                        style={{ backgroundColor: "white", borderRadius: 8, marginBottom: 8 }}
                        modules={QUILL_MODULES}
                      />
                      <CharCounter value={(section.content || "").replace(/<[^>]*>/g, "")} max={LIMITS.description.max} />
                    </div>
                  </div>
                ))}

                <button type="button" className="action-button secondary" onClick={addSection}>
                  <PlusOutlined /> Add Section
                </button>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="action-button secondary" onClick={() => navigate("/admin/cms/privacy-policy/list")}>Cancel</button>
            <button type="submit" className="action-button primary" disabled={isLoading}>
              {isLoading ? <><div className="loading-spinner small"></div>Saving...</> : <><SaveOutlined /> {id ? "Update Page" : "Create Page"}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
