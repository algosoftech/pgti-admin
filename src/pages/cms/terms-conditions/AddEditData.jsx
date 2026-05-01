import React, { useEffect, useState } from "react";
import { notification } from "antd";
import { ArrowLeftOutlined, CheckCircleOutlined, InfoCircleOutlined, SaveOutlined, FileTextOutlined } from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { addEditTermsConditions } from "services/termsConditions.service";
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

const parseContent = (raw) => {
  try {
    const c = typeof raw === "string" ? JSON.parse(raw) : (raw || {});
    return { title: c.title || "", subtitle: c.subtitle || "", content: c.content || "" };
  } catch {
    return { title: "", subtitle: "", content: "" };
  }
};

export default function TermsConditionsAddEditData() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location?.state || {};
  const [isLoading, setIsLoading] = useState(false);
  const [id, setId] = useState(state?.id ?? "");
  const raw = state?.content ?? state?.result?.content ?? state;
  const [form, setForm] = useState(() => parseContent(raw));

  useEffect(() => { document.title = `PGTI || ${id ? "Edit" : "Setup"} Terms & Conditions`; }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      notification.open({ message: "Oops!", description: "Page title is required.", placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
      return;
    }
    try {
      setIsLoading(true);
      const res = await addEditTermsConditions({ ...(id && { editId: id }), status: "A", content: JSON.stringify(form) });
      if (res.status === true) {
        if (!id && res.result?.id) setId(res.result.id);
        notification.open({ message: "Success", description: "Terms & Conditions saved successfully.", placement: "topRight", icon: <CheckCircleOutlined style={{ color: "green" }} />, duration: 2 });
        navigate("/admin/cms/terms-conditions/list");
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
            <h1 className="page-title">{id ? "Edit Terms & Conditions" : "Setup Terms & Conditions"}</h1>
            <p className="page-subtitle">Manage the Terms & Conditions page content</p>
          </div>
          <Link to="/admin/cms/terms-conditions/list">
            <button className="action-button secondary"><ArrowLeftOutlined /> Back</button>
          </Link>
        </div>
      </div>

      <div className="page-body">
        <div className="content-card">
          <div className="content-card-body">
            <form onSubmit={handleSubmit} className="modern-form">
              <div className="form-section">
                <h3 className="form-section-title"><FileTextOutlined /> Page Content</h3>

                <div className="row">
                  <div className="col-md-6 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label required">Page Title</label>
                      <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Terms & Conditions" />
                    </div>
                  </div>
                  <div className="col-md-6 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label">Subtitle</label>
                      <textarea className="form-input" rows={2} value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="Short description shown below the title..." />
                      <CharCounter value={form.subtitle} max={LIMITS.short_description.max} />
                    </div>
                  </div>
                  <div className="col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label required">Page Content</label>
                      <ReactQuill
                        theme="snow"
                        value={form.content || ""}
                        onChange={val => setForm(f => ({ ...f, content: val }))}
                        placeholder="Enter the full Terms & Conditions content here..."
                        style={{ backgroundColor: "white", borderRadius: 8, marginBottom: 8, minHeight: 400 }}
                        modules={QUILL_MODULES}
                      />
                      <CharCounter value={(form.content || "").replace(/<[^>]*>/g, "")} min={LIMITS.description.min} max={LIMITS.description.max} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="action-button secondary" onClick={() => navigate("/admin/cms/terms-conditions/list")}>Cancel</button>
                <button type="submit" className="action-button primary" disabled={isLoading}>
                  {isLoading ? <><div className="loading-spinner small"></div>Saving...</> : <><SaveOutlined /> {id ? "Update Page" : "Create Page"}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
