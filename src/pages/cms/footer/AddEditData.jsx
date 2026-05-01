import React, { useEffect, useState } from "react";
import { notification } from "antd";
import {
  ArrowLeftOutlined, CheckCircleOutlined, InfoCircleOutlined, SaveOutlined,
  PlusOutlined, DeleteOutlined, LinkOutlined, PhoneOutlined,
  GlobalOutlined, AppstoreOutlined, CopyrightOutlined, EyeOutlined, EyeInvisibleOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { addEditFooter } from "services/footerCms.service";
import { CharCounter } from "components/ui/FieldHint";
import { LIMITS } from "utils/fieldValidation";
import "styles/admin-pages.css";

/* ── defaults ─────────────────────────────────────────────── */
const emptyLink = () => ({ label: "", url: "", is_external: false, is_visible: true });

const DEFAULT_COLUMNS = [
  {
    title: "Links", is_visible: true,
    links: [
      { label: "Home", url: "/", is_external: false, is_visible: true },
      { label: "About us", url: "/about-us", is_external: false, is_visible: true },
      { label: "Contact Us", url: "/contact-us", is_external: false, is_visible: true },
      { label: "Anti Doping", url: "/anti-doping", is_external: false, is_visible: true },
    ],
  },
  {
    title: "Quick Links", is_visible: true,
    links: [
      { label: "Tour Partners", url: "/tour-partners", is_external: false, is_visible: true },
      { label: "Players", url: "/players", is_external: false, is_visible: true },
      { label: "Tournaments", url: "/tournaments", is_external: false, is_visible: true },
      { label: "Media", url: "/media", is_external: false, is_visible: true },
      { label: "Stats", url: "/stats", is_external: false, is_visible: true },
      { label: "Indian Golf", url: "/indian-golf", is_external: false, is_visible: true },
    ],
  },
  {
    title: "Network Partners", is_visible: true,
    links: [
      { label: "DP World Tour", url: "https://www.dpworldtour.com", is_external: true, is_visible: true },
      { label: "Japan Golf Tour", url: "https://www.jgto.org", is_external: true, is_visible: true },
      { label: "PGA Tour", url: "https://www.pgatour.com", is_external: true, is_visible: true },
      { label: "R&A", url: "https://www.randa.org", is_external: true, is_visible: true },
      { label: "IJCSA", url: "#", is_external: true, is_visible: true },
      { label: "Official World Golf Ranking", url: "https://www.owgr.com", is_external: true, is_visible: true },
    ],
  },
  {
    title: "Other", is_visible: true,
    links: [
      { label: "Terms & Conditions", url: "/terms-conditions", is_external: false, is_visible: true },
      { label: "Disclaimer", url: "/disclaimer", is_external: false, is_visible: true },
      { label: "Privacy Policy", url: "/privacy-policy", is_external: false, is_visible: true },
    ],
  },
];

const parseContent = (raw) => {
  try {
    const c = typeof raw === "string" ? JSON.parse(raw) : (raw || {});
    return {
      linkColumns: Array.isArray(c.linkColumns) && c.linkColumns.length ? c.linkColumns : DEFAULT_COLUMNS,
      contactInfo: {
        address: c.contactInfo?.address || "Professional Golf Tour of India, Unit No. 303, ABW Tower, Rectangle One, Saket - 110017 INDIA",
        email: c.contactInfo?.email || "",
        phone: c.contactInfo?.phone || "",
      },
      socialLinks: {
        facebook: c.socialLinks?.facebook || "",
        twitter: c.socialLinks?.twitter || "",
        linkedin: c.socialLinks?.linkedin || "",
        instagram: c.socialLinks?.instagram || "",
        youtube: c.socialLinks?.youtube || "",
        google_plus: c.socialLinks?.google_plus || "",
      },
      newsletter: {
        placeholder: c.newsletter?.placeholder || "Enter Email Address",
        button_text: c.newsletter?.button_text || "Subscribe",
      },
      appDownload: {
        is_visible: c.appDownload?.is_visible !== false,
        google_play_url: c.appDownload?.google_play_url || "",
        app_store_url: c.appDownload?.app_store_url || "",
      },
      copyright: c.copyright || "© 2025 Copyright All rights reserved | Professional Golf Tour of India",
    };
  } catch {
    return {
      linkColumns: DEFAULT_COLUMNS,
      contactInfo: { address: "", email: "", phone: "" },
      socialLinks: { facebook: "", twitter: "", linkedin: "", instagram: "", youtube: "", google_plus: "" },
      newsletter: { placeholder: "Enter Email Address", button_text: "Subscribe" },
      appDownload: { is_visible: true, google_play_url: "", app_store_url: "" },
      copyright: "© 2025 Copyright All rights reserved",
    };
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

/* ══════════════════════════════════════════════════════════ */
export default function FooterCmsAddEditData() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location?.state || {};
  const [isLoading, setIsLoading] = useState(false);
  const [id, setId] = useState(state?.id ?? "");
  const [expandedCol, setExpandedCol] = useState(0);
  const raw = state?.content ?? state?.result?.content ?? state;
  const [form, setForm] = useState(() => parseContent(raw));

  useEffect(() => { document.title = `PGTI || ${id ? "Edit" : "Setup"} Footer`; }, [id]);

  /* ── column helpers ─────────────────────────────────────── */
  const updateCol = (ci, field, val) => {
    setForm(f => {
      const linkColumns = f.linkColumns.map((c, i) => i === ci ? { ...c, [field]: val } : c);
      return { ...f, linkColumns };
    });
  };

  const moveCol = (ci, dir) => {
    setForm(f => {
      const cols = [...f.linkColumns];
      const target = ci + dir;
      if (target < 0 || target >= cols.length) return f;
      [cols[ci], cols[target]] = [cols[target], cols[ci]];
      setExpandedCol(target);
      return { ...f, linkColumns: cols };
    });
  };

  const addColumn = () => {
    setForm(f => ({ ...f, linkColumns: [...f.linkColumns, { title: "", is_visible: true, links: [emptyLink()] }] }));
    setExpandedCol(form.linkColumns.length);
  };

  const removeColumn = (ci) => {
    setForm(f => {
      const linkColumns = f.linkColumns.filter((_, i) => i !== ci);
      return { ...f, linkColumns: linkColumns.length ? linkColumns : DEFAULT_COLUMNS };
    });
    setExpandedCol(0);
  };

  /* ── link helpers ───────────────────────────────────────── */
  const updateLink = (ci, li, field, val) => {
    setForm(f => {
      const linkColumns = f.linkColumns.map((col, i) => {
        if (i !== ci) return col;
        const links = col.links.map((lk, j) => j === li ? { ...lk, [field]: val } : lk);
        return { ...col, links };
      });
      return { ...f, linkColumns };
    });
  };

  const moveLink = (ci, li, dir) => {
    setForm(f => {
      const linkColumns = f.linkColumns.map((col, i) => {
        if (i !== ci) return col;
        const links = [...col.links];
        const target = li + dir;
        if (target < 0 || target >= links.length) return col;
        [links[li], links[target]] = [links[target], links[li]];
        return { ...col, links };
      });
      return { ...f, linkColumns };
    });
  };

  const addLink = (ci) => {
    setForm(f => {
      const linkColumns = f.linkColumns.map((col, i) =>
        i === ci ? { ...col, links: [...col.links, emptyLink()] } : col
      );
      return { ...f, linkColumns };
    });
  };

  const removeLink = (ci, li) => {
    setForm(f => {
      const linkColumns = f.linkColumns.map((col, i) => {
        if (i !== ci) return col;
        const links = col.links.filter((_, j) => j !== li);
        return { ...col, links: links.length ? links : [emptyLink()] };
      });
      return { ...f, linkColumns };
    });
  };

  /* ── generic setters ────────────────────────────────────── */
  const setContact = (field, val) => setForm(f => ({ ...f, contactInfo: { ...f.contactInfo, [field]: val } }));
  const setSocial = (field, val) => setForm(f => ({ ...f, socialLinks: { ...f.socialLinks, [field]: val } }));
  const setNewsletter = (field, val) => setForm(f => ({ ...f, newsletter: { ...f.newsletter, [field]: val } }));
  const setApp = (field, val) => setForm(f => ({ ...f, appDownload: { ...f.appDownload, [field]: val } }));

  /* ── submit ────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const res = await addEditFooter({ ...(id && { editId: id }), status: "A", content: JSON.stringify(form) });
      if (res.status === true) {
        if (!id && res.result?.id) setId(res.result.id);
        notification.open({ message: "Success", description: "Footer saved successfully.", placement: "topRight", icon: <CheckCircleOutlined style={{ color: "green" }} />, duration: 2 });
        navigate("/admin/cms/footer/list");
      } else {
        notification.open({ message: "Oops!", description: res?.message || "Failed to save", placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
      }
    } catch {
      notification.open({ message: "Oops!", description: "An error occurred.", placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
    } finally { setIsLoading(false); }
  };

  /* ══════════════════════════════════════════════════════════ */
  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">{id ? "Edit Footer" : "Setup Footer"}</h1>
            <p className="page-subtitle">Manage link columns, contact info, social links, app download and copyright</p>
          </div>
          <Link to="/admin/cms/footer/list">
            <button className="action-button secondary"><ArrowLeftOutlined /> Back</button>
          </Link>
        </div>
      </div>

      <div className="page-body">
        <form onSubmit={handleSubmit}>

          {/* ── 1. Link Columns ─────────────────────────────── */}
          <SectionCard number="1" title="Footer Link Columns" icon={<LinkOutlined />}>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
              Manage each footer column, its links, visibility and order. Use ↑↓ to reorder columns and links.
            </p>

            {form.linkColumns.map((col, ci) => (
              <div key={ci} style={{ border: `2px solid ${expandedCol === ci ? "#0369a1" : "#e2e8f0"}`, borderRadius: 12, marginBottom: 12, overflow: "hidden" }}>

                {/* Column header row */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: expandedCol === ci ? "#eff6ff" : "#f8fafc", cursor: "pointer" }}
                  onClick={() => setExpandedCol(expandedCol === ci ? -1 : ci)}
                >
                  <span style={{ fontWeight: 700, color: "#1e3a5f", flex: 1, fontSize: 14 }}>
                    {col.title || `Column ${ci + 1}`}
                    <span style={{ marginLeft: 8, fontWeight: 400, fontSize: 12, color: "#64748b" }}>
                      ({col.links?.filter(l => l.is_visible).length || 0} visible / {col.links?.length || 0} total)
                    </span>
                  </span>

                  {/* Visibility toggle */}
                  <button
                    type="button"
                    title={col.is_visible ? "Hide column" : "Show column"}
                    onClick={e => { e.stopPropagation(); updateCol(ci, "is_visible", !col.is_visible); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: col.is_visible ? "#16a34a" : "#94a3b8", fontSize: 16, padding: "2px 6px" }}
                  >
                    {col.is_visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                  </button>

                  {/* Reorder */}
                  <button type="button" className="action-button secondary" style={{ fontSize: 11, padding: "2px 8px" }} onClick={e => { e.stopPropagation(); moveCol(ci, -1); }} disabled={ci === 0}>↑</button>
                  <button type="button" className="action-button secondary" style={{ fontSize: 11, padding: "2px 8px" }} onClick={e => { e.stopPropagation(); moveCol(ci, 1); }} disabled={ci === form.linkColumns.length - 1}>↓</button>
                  <button type="button" className="action-button danger" style={{ fontSize: 11, padding: "2px 8px" }} onClick={e => { e.stopPropagation(); removeColumn(ci); }}>
                    <DeleteOutlined />
                  </button>
                  <span style={{ color: "#64748b", fontSize: 12 }}>{expandedCol === ci ? "▲" : "▼"}</span>
                </div>

                {/* Column body — expanded */}
                {expandedCol === ci && (
                  <div style={{ padding: 16, background: "#fff" }}>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                      <label className="form-label required">Column Title</label>
                      <input className="form-input" value={col.title} onChange={e => updateCol(ci, "title", e.target.value)} placeholder="e.g. Quick Links" style={{ maxWidth: 300 }} />
                    </div>

                    {/* Links list */}
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 10 }}>Links</div>
                    {col.links?.map((lk, li) => (
                      <div key={li} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, padding: "8px 10px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", opacity: lk.is_visible ? 1 : 0.55 }}>
                        {/* Order */}
                        <span style={{ fontSize: 11, color: "#94a3b8", minWidth: 22, textAlign: "center" }}>{li + 1}</span>

                        {/* Label */}
                        <input
                          className="form-input"
                          value={lk.label}
                          onChange={e => updateLink(ci, li, "label", e.target.value)}
                          placeholder="Label"
                          style={{ flex: "0 0 160px", fontSize: 13, padding: "5px 10px" }}
                        />

                        {/* URL */}
                        <input
                          className="form-input"
                          value={lk.url}
                          onChange={e => updateLink(ci, li, "url", e.target.value)}
                          placeholder="URL or /path"
                          style={{ flex: 1, fontSize: 13, padding: "5px 10px" }}
                        />

                        {/* External toggle */}
                        <div
                          title={lk.is_external ? "External link (opens new tab)" : "Internal link"}
                          onClick={() => updateLink(ci, li, "is_external", !lk.is_external)}
                          style={{ cursor: "pointer", padding: "4px 8px", borderRadius: 6, background: lk.is_external ? "#eff6ff" : "#f1f5f9", border: "1px solid #e2e8f0", fontSize: 11, color: lk.is_external ? "#1d4ed8" : "#64748b", whiteSpace: "nowrap" }}
                        >
                          {lk.is_external ? "🔗 Ext" : "🏠 Int"}
                        </div>

                        {/* Visibility */}
                        <button type="button" title={lk.is_visible ? "Hide link" : "Show link"} onClick={() => updateLink(ci, li, "is_visible", !lk.is_visible)} style={{ background: "none", border: "none", cursor: "pointer", color: lk.is_visible ? "#16a34a" : "#94a3b8", fontSize: 15, padding: "2px 4px" }}>
                          {lk.is_visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                        </button>

                        {/* Reorder */}
                        <button type="button" className="action-button secondary" style={{ fontSize: 10, padding: "2px 6px" }} onClick={() => moveLink(ci, li, -1)} disabled={li === 0}>↑</button>
                        <button type="button" className="action-button secondary" style={{ fontSize: 10, padding: "2px 6px" }} onClick={() => moveLink(ci, li, 1)} disabled={li === col.links.length - 1}>↓</button>

                        {/* Remove */}
                        <button type="button" className="action-button danger" style={{ fontSize: 10, padding: "2px 6px" }} onClick={() => removeLink(ci, li)}>
                          <DeleteOutlined />
                        </button>
                      </div>
                    ))}

                    <button type="button" className="action-button secondary" style={{ marginTop: 8, fontSize: 12 }} onClick={() => addLink(ci)}>
                      <PlusOutlined /> Add Link
                    </button>
                  </div>
                )}
              </div>
            ))}

            <button type="button" className="action-button secondary" onClick={addColumn} style={{ marginTop: 4 }}>
              <PlusOutlined /> Add Column
            </button>
          </SectionCard>

          {/* ── 2. Contact Info ──────────────────────────────── */}
          <SectionCard number="2" title="Connect Us (Contact Info)" icon={<PhoneOutlined />}>
            <div className="row">
              <div className="col-md-6 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-input" type="email" value={form.contactInfo.email} onChange={e => setContact("email", e.target.value)} placeholder="e.g. info@pgti.com" />
                </div>
              </div>
              <div className="col-md-6 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" value={form.contactInfo.phone} onChange={e => setContact("phone", e.target.value)} placeholder="e.g. +91 28737300/28737400" />
                </div>
              </div>
              <div className="col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <textarea className="form-input" rows={3} value={form.contactInfo.address} onChange={e => setContact("address", e.target.value)} placeholder="Professional Golf Tour of India, Unit No. 303..." />
                  <CharCounter value={form.contactInfo.address} max={LIMITS.notes.max} />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ── 3. Social Links ──────────────────────────────── */}
          <SectionCard number="3" title="Social Media Links" icon={<GlobalOutlined />}>
            <div className="row">
              {[
                { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/pgti" },
                { key: "twitter", label: "Twitter / X", placeholder: "https://twitter.com/pgti" },
                { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/company/pgti" },
                { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/pgti" },
                { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@pgti" },
                { key: "google_plus", label: "Google+", placeholder: "https://plus.google.com/pgti" },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="col-md-6 col-12 mb-3">
                  <div className="form-group">
                    <label className="form-label">{label}</label>
                    <input className="form-input" value={form.socialLinks[key]} onChange={e => setSocial(key, e.target.value)} placeholder={placeholder} />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* ── 4. Newsletter ────────────────────────────────── */}
          <SectionCard number="4" title="Newsletter Subscription" icon={<AppstoreOutlined />}>
            <div className="row">
              <div className="col-md-6 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Input Placeholder</label>
                  <input className="form-input" value={form.newsletter.placeholder} onChange={e => setNewsletter("placeholder", e.target.value)} placeholder="e.g. Enter Email Address" />
                </div>
              </div>
              <div className="col-md-6 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Subscribe Button Text</label>
                  <input className="form-input" value={form.newsletter.button_text} onChange={e => setNewsletter("button_text", e.target.value)} placeholder="e.g. Subscribe" />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ── 5. App Download ──────────────────────────────── */}
          <SectionCard number="5" title="Download Our Mobile App" icon={<AppstoreOutlined />}>
            {/* Visibility toggle */}
            <div
              className="permission-item"
              style={{ cursor: "pointer", marginBottom: 16 }}
              onClick={() => setApp("is_visible", !form.appDownload.is_visible)}
            >
              <div className="permission-checkbox">
                <input type="checkbox" checked={!!form.appDownload.is_visible} readOnly />
              </div>
              <div className="permission-content">
                <label className="permission-label" style={{ cursor: "pointer" }}>Show "Download Our Mobile App" section on all pages</label>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Google Play URL</label>
                  <input className="form-input" value={form.appDownload.google_play_url} onChange={e => setApp("google_play_url", e.target.value)} placeholder="https://play.google.com/store/apps/..." />
                </div>
              </div>
              <div className="col-md-6 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">App Store URL</label>
                  <input className="form-input" value={form.appDownload.app_store_url} onChange={e => setApp("app_store_url", e.target.value)} placeholder="https://apps.apple.com/..." />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ── 6. Copyright ─────────────────────────────────── */}
          <SectionCard number="6" title="Copyright Text" icon={<CopyrightOutlined />}>
            <div className="form-group">
              <label className="form-label">Copyright Line</label>
              <textarea className="form-input" rows={2} value={form.copyright} onChange={e => setForm(f => ({ ...f, copyright: e.target.value }))} placeholder="e.g. © 2025 Copyright All rights reserved | Professional Golf Tour of India..." />
              <CharCounter value={form.copyright} max={LIMITS.notes.max} />
            </div>
          </SectionCard>

          <div className="form-actions">
            <button type="button" className="action-button secondary" onClick={() => navigate("/admin/cms/footer/list")}>Cancel</button>
            <button type="submit" className="action-button primary" disabled={isLoading}>
              {isLoading ? <><div className="loading-spinner small"></div>Saving...</> : <><SaveOutlined /> {id ? "Update Footer" : "Create Footer"}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
