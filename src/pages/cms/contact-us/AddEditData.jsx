import React, { useEffect, useState } from "react";
import { notification } from "antd";
import {
  ArrowLeftOutlined, CheckCircleOutlined, InfoCircleOutlined,
  SaveOutlined, PictureOutlined, PhoneOutlined, EnvironmentOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ImageUploadField from "components/ui/ImageUploadField";
import { addEditContactUs } from "services/contactUs.service";
import { CharCounter, ImageHint } from "components/ui/FieldHint";
import { LIMITS, IMAGE_SPECS } from "utils/fieldValidation";
import "styles/admin-pages.css";

const DEFAULT_TABS = [
  { tab_name: "Admin Inquiries", email: "", phone: "", address: "" },
  { tab_name: "Tour Entry Inquiries", email: "", phone: "", address: "" },
  { tab_name: "Marketing Inquiries", email: "", phone: "", address: "" },
  { tab_name: "Media Inquiries", email: "", phone: "", address: "" },
];

const parseContent = (raw) => {
  try {
    const c = typeof raw === "string" ? JSON.parse(raw) : (raw || {});
    return {
      heroBanner: { bg_image: c.heroBanner?.bg_image || "", title: c.heroBanner?.title || "CONTACT US" },
      inquiryTabs: Array.isArray(c.inquiryTabs) && c.inquiryTabs.length ? c.inquiryTabs : DEFAULT_TABS,
      map_embed_url: c.map_embed_url || "",
    };
  } catch {
    return { heroBanner: { bg_image: "", title: "CONTACT US" }, inquiryTabs: DEFAULT_TABS, map_embed_url: "" };
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

export default function ContactUsAddEditData() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location?.state || {};
  const [isLoading, setIsLoading] = useState(false);
  const [id, setId] = useState(state?.id ?? "");
  const [activeTab, setActiveTab] = useState(0);
  const raw = state?.content ?? state?.result?.content ?? state;
  const [form, setForm] = useState(() => parseContent(raw));

  useEffect(() => { document.title = `PGTI || ${id ? "Edit" : "Setup"} Contact Us`; }, [id]);

  const setHero = (field, val) => setForm(f => ({ ...f, heroBanner: { ...f.heroBanner, [field]: val } }));

  const updateTab = (idx, field, val) => {
    setForm(f => {
      const inquiryTabs = f.inquiryTabs.map((t, i) => i === idx ? { ...t, [field]: val } : t);
      return { ...f, inquiryTabs };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.heroBanner.title.trim()) {
      notification.open({ message: "Oops!", description: "Hero title is required.", placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
      return;
    }
    try {
      setIsLoading(true);
      const res = await addEditContactUs({ ...(id && { editId: id }), status: "A", content: JSON.stringify(form) });
      if (res.status === true) {
        if (!id && res.result?.id) setId(res.result.id);
        notification.open({ message: "Success", description: "Contact Us page saved successfully.", placement: "topRight", icon: <CheckCircleOutlined style={{ color: "green" }} />, duration: 2 });
        navigate("/admin/cms/contact-us/list");
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
            <h1 className="page-title">{id ? "Edit Contact Us" : "Setup Contact Us"}</h1>
            <p className="page-subtitle">Manage the Contact Us page content and inquiry tabs</p>
          </div>
          <Link to="/admin/cms/contact-us/list">
            <button className="action-button secondary"><ArrowLeftOutlined /> Back</button>
          </Link>
        </div>
      </div>

      <div className="page-body">
        <form onSubmit={handleSubmit}>

          {/* ── 1. Hero Banner ──────────────────────────────── */}
          <SectionCard number="1" title="Hero Banner" icon={<PictureOutlined />}>
            <ImageUploadField
              label="Background Image"
              required
              value={form.heroBanner.bg_image}
              onChange={(url) => setHero("bg_image", url)}
              folder="cms/contact-us"
              previewH={160}
              spec={IMAGE_SPECS['cms/contact-us']}
            />
            <ImageHint
              recommended={IMAGE_SPECS['cms/contact-us'].recommended}
              maxSize={`${IMAGE_SPECS['cms/contact-us'].maxMB}MB`}
              note={IMAGE_SPECS['cms/contact-us'].note}
            />
            <div className="form-group" style={{ marginTop: 16 }}>
              <label className="form-label required">Hero Title</label>
              <input className="form-input" value={form.heroBanner.title} onChange={e => setHero("title", e.target.value)} placeholder="e.g. CONTACT US" />
            </div>
          </SectionCard>

          {/* ── 2. Inquiry Tabs ──────────────────────────────── */}
          <SectionCard number="2" title="Inquiry Tabs" icon={<PhoneOutlined />}>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
              Each tab shows on the Contact Us page with its own email, phone, and address. Tab names are fixed to match the design.
            </p>

            {/* Tab selector */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, borderBottom: "2px solid #e2e8f0" }}>
              {form.inquiryTabs.map((tab, ti) => (
                <button key={ti} type="button" onClick={() => setActiveTab(ti)} style={{ padding: "8px 20px", border: "none", borderBottom: activeTab === ti ? "3px solid #0369a1" : "3px solid transparent", background: "none", fontWeight: activeTab === ti ? 700 : 400, color: activeTab === ti ? "#0369a1" : "#64748b", cursor: "pointer", fontSize: 13, transition: "all 0.2s" }}>
                  {tab.tab_name}
                </button>
              ))}
            </div>

            {/* Active tab fields */}
            {form.inquiryTabs[activeTab] && (
              <div className="row">
                <div className="col-md-4 col-12 mb-3">
                  <div className="form-group">
                    <label className="form-label">Tab Name</label>
                    <input className="form-input" value={form.inquiryTabs[activeTab].tab_name} onChange={e => updateTab(activeTab, "tab_name", e.target.value)} placeholder="e.g. Admin Inquiries" />
                  </div>
                </div>
                <div className="col-md-4 col-12 mb-3">
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-input" value={form.inquiryTabs[activeTab].email} onChange={e => updateTab(activeTab, "email", e.target.value)} placeholder="e.g. admin@pgpgti.com" />
                  </div>
                </div>
                <div className="col-md-4 col-12 mb-3">
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input className="form-input" value={form.inquiryTabs[activeTab].phone} onChange={e => updateTab(activeTab, "phone", e.target.value)} placeholder="e.g. +91-9910714848" />
                  </div>
                </div>
                <div className="col-12 mb-3">
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <textarea className="form-input" rows={3} value={form.inquiryTabs[activeTab].address} onChange={e => updateTab(activeTab, "address", e.target.value)} placeholder="e.g. Professional Golf Tour of India, Unit No. 303, ABW Tower, Rectangle One, Saket - 110017 INDIA" />
                    <CharCounter value={form.inquiryTabs[activeTab].address} max={LIMITS.notes.max} />
                  </div>
                </div>
              </div>
            )}
          </SectionCard>

          {/* ── 3. Google Maps ───────────────────────────────── */}
          <SectionCard number="3" title="Google Maps" icon={<EnvironmentOutlined />}>
            <div className="form-group">
              <label className="form-label">Google Maps Embed URL</label>
              <input
                className="form-input"
                value={form.map_embed_url}
                onChange={e => setForm(f => ({ ...f, map_embed_url: e.target.value }))}
                placeholder="https://www.google.com/maps/embed?pb=..."
              />
              <p className="form-hint">Go to Google Maps → Share → Embed a map → Copy the src URL from the iframe code</p>
            </div>
            {form.map_embed_url && (
              <div style={{ marginTop: 12, borderRadius: 10, overflow: "hidden", border: "1px solid #e2e8f0" }}>
                <iframe title="Map Preview" src={form.map_embed_url} width="100%" height="280" style={{ border: 0, display: "block" }} allowFullScreen loading="lazy" />
              </div>
            )}
          </SectionCard>

          <div className="form-actions">
            <button type="button" className="action-button secondary" onClick={() => navigate("/admin/cms/contact-us/list")}>Cancel</button>
            <button type="submit" className="action-button primary" disabled={isLoading}>
              {isLoading ? <><div className="loading-spinner small"></div>Saving...</> : <><SaveOutlined /> {id ? "Update Page" : "Create Page"}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
