import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, notification } from "antd";
import {
  ArrowLeftOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  CopyrightOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  InfoCircleOutlined,
  MobileOutlined,
  NotificationOutlined,
  PhoneOutlined,
  PlusOutlined,
  SaveOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { addEditFooter, listFooter } from "services/footerCms.service";
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

/* ── section config ───────────────────────────────────────── */
const SECTION_KEYS = ["general", "linkColumns", "contactInfo", "socialLinks", "newsletter", "appDownload", "copyright"];

const SECTION_META = {
  general:     { number: "0", title: "General" },
  linkColumns: { number: "1", title: "Footer Link Columns" },
  contactInfo: { number: "2", title: "Contact Info" },
  socialLinks: { number: "3", title: "Social Media Links" },
  newsletter:  { number: "4", title: "Newsletter Subscription" },
  appDownload: { number: "5", title: "App Download" },
  copyright:   { number: "6", title: "Copyright Text" },
};

const SECTION_NAV_ITEMS = SECTION_KEYS.map((key) => ({
  key,
  label: `${SECTION_META[key].number}. ${SECTION_META[key].title}`,
}));

/* ── helpers ──────────────────────────────────────────────── */
const normalizeOpenSectionKey = (value = "") =>
  SECTION_KEYS.includes(value) ? value : "";

const buildSectionOpenState = ({ openKey = "" } = {}) => {
  const normalized = normalizeOpenSectionKey(openKey);
  return SECTION_KEYS.reduce((acc, key) => {
    acc[key] = normalized ? key === normalized : false;
    return acc;
  }, {});
};

const getQuickJumpCurveOffset = (index, total) => {
  if (total <= 1) return 0;
  const center = (total - 1) / 2;
  const distance = Math.abs(index - center);
  return Math.round(distance * 10);
};

/* ── SectionCard ──────────────────────────────────────────── */
const SectionCard = ({
  sectionKey, children, isOpen, onToggleOpen,
  isEditing, onEdit, onSave, onCancel, isSaving, onLockedClick,
}) => {
  const meta = SECTION_META[sectionKey];
  const isLocked = !isEditing;
  return (
    <div className="content-card" style={{ marginBottom: 24 }}>
      <div className="content-card-body">
        <div className="form-section" style={{ marginBottom: 0 }}>
          <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <button
              type="button"
              onClick={onToggleOpen}
              style={{
                border: "none", background: "transparent", padding: 0, cursor: "pointer",
                textAlign: "left", display: "flex", alignItems: "center",
                justifyContent: "space-between", gap: 12, flex: 1,
              }}
            >
              <h3 className="form-section-title" style={{ marginBottom: 0 }}>
                <span style={{ fontSize: 13, color: "#94a3b8", marginRight: 6 }}>{meta.number}.</span>
                {meta.title}
              </h3>
              <span style={{ color: "#64748b", fontSize: 14, flexShrink: 0 }}>
                {isOpen ? <UpOutlined /> : <DownOutlined />}
              </span>
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              {isEditing ? (
                <>
                  <button type="button" className="action-button secondary" onClick={onCancel} disabled={isSaving}>
                    <CloseOutlined /> Cancel
                  </button>
                  <button type="button" className="action-button primary" onClick={onSave} disabled={isSaving}>
                    <SaveOutlined /> {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              ) : (
                <button type="button" className="action-button secondary" onClick={onEdit}>
                  <EditOutlined /> Edit
                </button>
              )}
            </div>
          </div>
          {isOpen && (
            <div style={{ paddingTop: 16, position: "relative" }}>
              {children}
              {isLocked && (
                <button
                  type="button"
                  onClick={onLockedClick}
                  style={{
                    position: "absolute", inset: 0, border: "none",
                    background: "rgba(248, 250, 252, 0.28)",
                    cursor: "not-allowed", borderRadius: 12,
                  }}
                  aria-label={`${meta.title} section is read-only. Click Edit to modify.`}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════ */
export default function FooterCmsAddEditData() {
  const location = useLocation();
  const sectionRefs = useRef({});
  const state = useMemo(() => location?.state || {}, [location?.state]);
  const requestedOpenSectionKey = state?.openSectionKey || state?.sectionKey || "";

  /* ── core state ────────────────────────────────────────── */
  const [isFetching, setIsFetching] = useState(false);
  const [id, setId] = useState(state?.id ?? "");
  const [status, setStatus] = useState(state?.status ?? "A");
  const [savedStatus, setSavedStatus] = useState(state?.status ?? "A");
  const [expandedCol, setExpandedCol] = useState(0);

  const rawContent = state?.content ?? state?.result?.content ?? state;
  const initial = parseContent(rawContent);

  /* ── per-section state pairs ───────────────────────────── */
  const [linkColumns, setLinkColumns] = useState(initial.linkColumns);
  const [savedLinkColumns, setSavedLinkColumns] = useState(initial.linkColumns);

  const [contactInfo, setContactInfo] = useState(initial.contactInfo);
  const [savedContactInfo, setSavedContactInfo] = useState(initial.contactInfo);

  const [socialLinks, setSocialLinks] = useState(initial.socialLinks);
  const [savedSocialLinks, setSavedSocialLinks] = useState(initial.socialLinks);

  const [newsletter, setNewsletter] = useState(initial.newsletter);
  const [savedNewsletter, setSavedNewsletter] = useState(initial.newsletter);

  const [appDownload, setAppDownload] = useState(initial.appDownload);
  const [savedAppDownload, setSavedAppDownload] = useState(initial.appDownload);

  const [copyright, setCopyright] = useState(initial.copyright);
  const [savedCopyright, setSavedCopyright] = useState(initial.copyright);

  /* ── ui state ──────────────────────────────────────────── */
  const [activeEditSection, setActiveEditSection] = useState(() => normalizeOpenSectionKey(requestedOpenSectionKey));
  const [savingSection, setSavingSection] = useState("");
  const [openSections, setOpenSections] = useState(() => buildSectionOpenState({ openKey: requestedOpenSectionKey }));
  const [quickJumpOpen, setQuickJumpOpen] = useState(false);

  /* ── hydrate from record ───────────────────────────────── */
  const hydrateForm = (record = {}) => {
    const c = parseContent(record?.content ?? record?.result?.content ?? record);
    setLinkColumns(c.linkColumns); setSavedLinkColumns(c.linkColumns);
    setContactInfo(c.contactInfo); setSavedContactInfo(c.contactInfo);
    setSocialLinks(c.socialLinks); setSavedSocialLinks(c.socialLinks);
    setNewsletter(c.newsletter); setSavedNewsletter(c.newsletter);
    setAppDownload(c.appDownload); setSavedAppDownload(c.appDownload);
    setCopyright(c.copyright); setSavedCopyright(c.copyright);
    if (record?.id) setId(record.id);
    if (record?.result?.id) setId(record.result.id);
    if (record?.status) { setStatus(record.status); setSavedStatus(record.status); }
    if (record?.result?.status) { setStatus(record.result.status); setSavedStatus(record.result.status); }
  };

  /* ── fetch on mount ────────────────────────────────────── */
  useEffect(() => {
    document.title = `PGTI || ${id ? "Edit" : "Setup"} Footer`;
    let active = true;
    const load = async () => {
      if (state && Object.keys(state).length > 0 && state.id) hydrateForm(state);
      try {
        setIsFetching(true);
        const res = await listFooter();
        if (active && res?.status && res?.result?.id) {
          hydrateForm(res.result);
          setOpenSections(buildSectionOpenState({ openKey: requestedOpenSectionKey }));
          setActiveEditSection(normalizeOpenSectionKey(requestedOpenSectionKey));
        }
      } finally {
        if (active) setIsFetching(false);
      }
    };
    load();
    return () => { active = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedOpenSectionKey]);

  /* ── build content ─────────────────────────────────────── */
  const buildContent = () => ({ linkColumns, contactInfo, socialLinks, newsletter, appDownload, copyright });

  /* ── section interaction ───────────────────────────────── */
  const notifyReadOnly = (sectionTitle) =>
    notification.open({
      message: "Section is locked",
      description: `Click Edit in "${sectionTitle}" before making changes.`,
      placement: "topRight",
      icon: <InfoCircleOutlined style={{ color: "#1d4ed8" }} />,
      duration: 2.5,
    });

  const startEditingSection = (sectionKey) => {
    setActiveEditSection(sectionKey);
    setOpenSections((prev) => ({ ...prev, [sectionKey]: true }));
  };

  const focusSection = (sectionKey) => {
    setOpenSections(buildSectionOpenState({ openKey: sectionKey }));
    setQuickJumpOpen(false);
    setTimeout(() => {
      sectionRefs.current?.[sectionKey]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  };

  const cancelEditingSection = (sectionKey) => {
    if (sectionKey === "general") setStatus(savedStatus);
    else if (sectionKey === "linkColumns") setLinkColumns(savedLinkColumns);
    else if (sectionKey === "contactInfo") setContactInfo(savedContactInfo);
    else if (sectionKey === "socialLinks") setSocialLinks(savedSocialLinks);
    else if (sectionKey === "newsletter") setNewsletter(savedNewsletter);
    else if (sectionKey === "appDownload") setAppDownload(savedAppDownload);
    else if (sectionKey === "copyright") setCopyright(savedCopyright);
    setActiveEditSection((prev) => (prev === sectionKey ? "" : prev));
  };

  const saveSection = (sectionKey) => {
    Modal.confirm({
      title: "Save these changes?",
      icon: <ExclamationCircleOutlined style={{ color: "#1d4ed8" }} />,
      content: `Do you want to save changes for the "${SECTION_META[sectionKey]?.title}" section?`,
      okText: "Yes, Save Changes",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          setSavingSection(sectionKey);
          const res = await addEditFooter({
            ...(id && { editId: id }),
            status,
            content: JSON.stringify(buildContent()),
          });
          if (res?.status === true) {
            if (!id && res.result?.id) setId(res.result.id);
            setSavedStatus(status);
            setSavedLinkColumns(JSON.parse(JSON.stringify(linkColumns)));
            setSavedContactInfo({ ...contactInfo });
            setSavedSocialLinks({ ...socialLinks });
            setSavedNewsletter({ ...newsletter });
            setSavedAppDownload({ ...appDownload });
            setSavedCopyright(copyright);
            setActiveEditSection("");
            notification.success({
              message: "Success",
              description: "Section saved successfully.",
              placement: "topRight",
              icon: <CheckCircleOutlined style={{ color: "green" }} />,
              duration: 2,
            });
          } else {
            notification.error({
              message: "Failed to save",
              description: res?.message || "Something went wrong. Please try again.",
              placement: "topRight",
              duration: 3,
            });
          }
        } catch {
          notification.error({
            message: "Error",
            description: "An unexpected error occurred. Please try again.",
            placement: "topRight",
            duration: 3,
          });
        } finally {
          setSavingSection("");
        }
      },
    });
  };

  /* ── column helpers ────────────────────────────────────── */
  const updateCol = (ci, field, val) =>
    setLinkColumns((cols) => cols.map((c, i) => i === ci ? { ...c, [field]: val } : c));

  const moveCol = (ci, dir) => {
    setLinkColumns((cols) => {
      const next = [...cols];
      const target = ci + dir;
      if (target < 0 || target >= next.length) return cols;
      [next[ci], next[target]] = [next[target], next[ci]];
      setExpandedCol(target);
      return next;
    });
  };

  const addColumn = () => {
    setLinkColumns((cols) => [...cols, { title: "", is_visible: true, links: [emptyLink()] }]);
    setExpandedCol(linkColumns.length);
  };

  const removeColumn = (ci) => {
    setLinkColumns((cols) => {
      const next = cols.filter((_, i) => i !== ci);
      return next.length ? next : DEFAULT_COLUMNS;
    });
    setExpandedCol(0);
  };

  /* ── link helpers ──────────────────────────────────────── */
  const updateLink = (ci, li, field, val) =>
    setLinkColumns((cols) => cols.map((col, i) => {
      if (i !== ci) return col;
      return { ...col, links: col.links.map((lk, j) => j === li ? { ...lk, [field]: val } : lk) };
    }));

  const moveLink = (ci, li, dir) =>
    setLinkColumns((cols) => cols.map((col, i) => {
      if (i !== ci) return col;
      const links = [...col.links];
      const target = li + dir;
      if (target < 0 || target >= links.length) return col;
      [links[li], links[target]] = [links[target], links[li]];
      return { ...col, links };
    }));

  const addLink = (ci) =>
    setLinkColumns((cols) => cols.map((col, i) =>
      i === ci ? { ...col, links: [...col.links, emptyLink()] } : col
    ));

  const removeLink = (ci, li) =>
    setLinkColumns((cols) => cols.map((col, i) => {
      if (i !== ci) return col;
      const links = col.links.filter((_, j) => j !== li);
      return { ...col, links: links.length ? links : [emptyLink()] };
    }));

  /* ══════════════════════════════════════════════════════════ */
  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">{id ? "Edit Footer" : "Setup Footer"}</h1>
            <p className="page-subtitle">Manage link columns, contact info, social links, app download and copyright</p>
            {isFetching && <p className="page-subtitle" style={{ marginTop: 6 }}>Loading saved data...</p>}
          </div>
          <Link to="/admin/cms/footer/list">
            <button type="button" className="action-button secondary">
              <ArrowLeftOutlined /> Back to List
            </button>
          </Link>
        </div>
      </div>

      <div className="page-body">
        <div className="modern-form">

          {/* ── 0. General ─────────────────────────────────── */}
          <div ref={(node) => { sectionRefs.current.general = node; }}>
            <SectionCard
              sectionKey="general"
              isOpen={openSections.general}
              onToggleOpen={() => setOpenSections((prev) => ({ ...prev, general: !prev.general }))}
              isEditing={activeEditSection === "general"}
              onEdit={() => startEditingSection("general")}
              onSave={() => saveSection("general")}
              onCancel={() => cancelEditingSection("general")}
              isSaving={savingSection === "general"}
              onLockedClick={() => notifyReadOnly(SECTION_META.general.title)}
            >
              <fieldset disabled={activeEditSection !== "general"} style={{ border: "none", padding: 0, margin: 0 }}>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="A">Active</option>
                    <option value="I">Inactive</option>
                  </select>
                </div>
              </fieldset>
            </SectionCard>
          </div>

          {/* ── 1. Link Columns ─────────────────────────────── */}
          <div ref={(node) => { sectionRefs.current.linkColumns = node; }}>
            <SectionCard
              sectionKey="linkColumns"
              isOpen={openSections.linkColumns}
              onToggleOpen={() => setOpenSections((prev) => ({ ...prev, linkColumns: !prev.linkColumns }))}
              isEditing={activeEditSection === "linkColumns"}
              onEdit={() => startEditingSection("linkColumns")}
              onSave={() => saveSection("linkColumns")}
              onCancel={() => cancelEditingSection("linkColumns")}
              isSaving={savingSection === "linkColumns"}
              onLockedClick={() => notifyReadOnly(SECTION_META.linkColumns.title)}
            >
              <fieldset disabled={activeEditSection !== "linkColumns"} style={{ border: "none", padding: 0, margin: 0 }}>
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
                  Manage each footer column, its links, visibility and order. Use ↑↓ to reorder columns and links.
                </p>
                {linkColumns.map((col, ci) => (
                  <div key={ci} style={{ border: `2px solid ${expandedCol === ci ? "#0369a1" : "#e2e8f0"}`, borderRadius: 12, marginBottom: 12, overflow: "hidden" }}>
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
                      <button type="button" title={col.is_visible ? "Hide column" : "Show column"} onClick={e => { e.stopPropagation(); updateCol(ci, "is_visible", !col.is_visible); }} style={{ background: "none", border: "none", cursor: "pointer", color: col.is_visible ? "#16a34a" : "#94a3b8", fontSize: 16, padding: "2px 6px" }}>
                        {col.is_visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                      </button>
                      <button type="button" className="action-button secondary" style={{ fontSize: 11, padding: "2px 8px" }} onClick={e => { e.stopPropagation(); moveCol(ci, -1); }} disabled={ci === 0}>↑</button>
                      <button type="button" className="action-button secondary" style={{ fontSize: 11, padding: "2px 8px" }} onClick={e => { e.stopPropagation(); moveCol(ci, 1); }} disabled={ci === linkColumns.length - 1}>↓</button>
                      <button type="button" className="action-button danger" style={{ fontSize: 11, padding: "2px 8px" }} onClick={e => { e.stopPropagation(); removeColumn(ci); }}><DeleteOutlined /></button>
                      <span style={{ color: "#64748b", fontSize: 12 }}>{expandedCol === ci ? "▲" : "▼"}</span>
                    </div>
                    {expandedCol === ci && (
                      <div style={{ padding: 16, background: "#fff" }}>
                        <div className="form-group" style={{ marginBottom: 16 }}>
                          <label className="form-label required">Column Title</label>
                          <input className="form-input" value={col.title} onChange={e => updateCol(ci, "title", e.target.value)} placeholder="e.g. Quick Links" style={{ maxWidth: 300 }} />
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 10 }}>Links</div>
                        {col.links?.map((lk, li) => (
                          <div key={li} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, padding: "8px 10px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", opacity: lk.is_visible ? 1 : 0.55 }}>
                            <span style={{ fontSize: 11, color: "#94a3b8", minWidth: 22, textAlign: "center" }}>{li + 1}</span>
                            <input className="form-input" value={lk.label} onChange={e => updateLink(ci, li, "label", e.target.value)} placeholder="Label" style={{ flex: "0 0 160px", fontSize: 13, padding: "5px 10px" }} />
                            <input className="form-input" value={lk.url} onChange={e => updateLink(ci, li, "url", e.target.value)} placeholder="URL or /path" style={{ flex: 1, fontSize: 13, padding: "5px 10px" }} />
                            <div title={lk.is_external ? "External link (opens new tab)" : "Internal link"} onClick={() => updateLink(ci, li, "is_external", !lk.is_external)} style={{ cursor: "pointer", padding: "4px 8px", borderRadius: 6, background: lk.is_external ? "#eff6ff" : "#f1f5f9", border: "1px solid #e2e8f0", fontSize: 11, color: lk.is_external ? "#1d4ed8" : "#64748b", whiteSpace: "nowrap" }}>
                              {lk.is_external ? "🔗 Ext" : "🏠 Int"}
                            </div>
                            <button type="button" title={lk.is_visible ? "Hide link" : "Show link"} onClick={() => updateLink(ci, li, "is_visible", !lk.is_visible)} style={{ background: "none", border: "none", cursor: "pointer", color: lk.is_visible ? "#16a34a" : "#94a3b8", fontSize: 15, padding: "2px 4px" }}>
                              {lk.is_visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                            </button>
                            <button type="button" className="action-button secondary" style={{ fontSize: 10, padding: "2px 6px" }} onClick={() => moveLink(ci, li, -1)} disabled={li === 0}>↑</button>
                            <button type="button" className="action-button secondary" style={{ fontSize: 10, padding: "2px 6px" }} onClick={() => moveLink(ci, li, 1)} disabled={li === col.links.length - 1}>↓</button>
                            <button type="button" className="action-button danger" style={{ fontSize: 10, padding: "2px 6px" }} onClick={() => removeLink(ci, li)}><DeleteOutlined /></button>
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
              </fieldset>
            </SectionCard>
          </div>

          {/* ── 2. Contact Info ──────────────────────────────── */}
          <div ref={(node) => { sectionRefs.current.contactInfo = node; }}>
            <SectionCard
              sectionKey="contactInfo"
              isOpen={openSections.contactInfo}
              onToggleOpen={() => setOpenSections((prev) => ({ ...prev, contactInfo: !prev.contactInfo }))}
              isEditing={activeEditSection === "contactInfo"}
              onEdit={() => startEditingSection("contactInfo")}
              onSave={() => saveSection("contactInfo")}
              onCancel={() => cancelEditingSection("contactInfo")}
              isSaving={savingSection === "contactInfo"}
              onLockedClick={() => notifyReadOnly(SECTION_META.contactInfo.title)}
            >
              <fieldset disabled={activeEditSection !== "contactInfo"} style={{ border: "none", padding: 0, margin: 0 }}>
                <div className="row">
                  <div className="col-md-6 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input className="form-input" type="email" value={contactInfo.email} onChange={e => setContactInfo(f => ({ ...f, email: e.target.value }))} placeholder="e.g. info@pgti.com" />
                    </div>
                  </div>
                  <div className="col-md-6 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input className="form-input" value={contactInfo.phone} onChange={e => setContactInfo(f => ({ ...f, phone: e.target.value }))} placeholder="e.g. +91 28737300/28737400" />
                    </div>
                  </div>
                  <div className="col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label">Address</label>
                      <textarea className="form-input" rows={3} value={contactInfo.address} onChange={e => setContactInfo(f => ({ ...f, address: e.target.value }))} placeholder="Professional Golf Tour of India, Unit No. 303..." />
                      <CharCounter value={contactInfo.address} max={LIMITS.notes.max} />
                    </div>
                  </div>
                </div>
              </fieldset>
            </SectionCard>
          </div>

          {/* ── 3. Social Media Links ──────────────────────── */}
          <div ref={(node) => { sectionRefs.current.socialLinks = node; }}>
            <SectionCard
              sectionKey="socialLinks"
              isOpen={openSections.socialLinks}
              onToggleOpen={() => setOpenSections((prev) => ({ ...prev, socialLinks: !prev.socialLinks }))}
              isEditing={activeEditSection === "socialLinks"}
              onEdit={() => startEditingSection("socialLinks")}
              onSave={() => saveSection("socialLinks")}
              onCancel={() => cancelEditingSection("socialLinks")}
              isSaving={savingSection === "socialLinks"}
              onLockedClick={() => notifyReadOnly(SECTION_META.socialLinks.title)}
            >
              <fieldset disabled={activeEditSection !== "socialLinks"} style={{ border: "none", padding: 0, margin: 0 }}>
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
                        <input className="form-input" value={socialLinks[key]} onChange={e => setSocialLinks(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} />
                      </div>
                    </div>
                  ))}
                </div>
              </fieldset>
            </SectionCard>
          </div>

          {/* ── 4. Newsletter ────────────────────────────────── */}
          <div ref={(node) => { sectionRefs.current.newsletter = node; }}>
            <SectionCard
              sectionKey="newsletter"
              isOpen={openSections.newsletter}
              onToggleOpen={() => setOpenSections((prev) => ({ ...prev, newsletter: !prev.newsletter }))}
              isEditing={activeEditSection === "newsletter"}
              onEdit={() => startEditingSection("newsletter")}
              onSave={() => saveSection("newsletter")}
              onCancel={() => cancelEditingSection("newsletter")}
              isSaving={savingSection === "newsletter"}
              onLockedClick={() => notifyReadOnly(SECTION_META.newsletter.title)}
            >
              <fieldset disabled={activeEditSection !== "newsletter"} style={{ border: "none", padding: 0, margin: 0 }}>
                <div className="row">
                  <div className="col-md-6 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label">Input Placeholder</label>
                      <input className="form-input" value={newsletter.placeholder} onChange={e => setNewsletter(f => ({ ...f, placeholder: e.target.value }))} placeholder="e.g. Enter Email Address" />
                    </div>
                  </div>
                  <div className="col-md-6 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label">Subscribe Button Text</label>
                      <input className="form-input" value={newsletter.button_text} onChange={e => setNewsletter(f => ({ ...f, button_text: e.target.value }))} placeholder="e.g. Subscribe" />
                    </div>
                  </div>
                </div>
              </fieldset>
            </SectionCard>
          </div>

          {/* ── 5. App Download ──────────────────────────────── */}
          <div ref={(node) => { sectionRefs.current.appDownload = node; }}>
            <SectionCard
              sectionKey="appDownload"
              isOpen={openSections.appDownload}
              onToggleOpen={() => setOpenSections((prev) => ({ ...prev, appDownload: !prev.appDownload }))}
              isEditing={activeEditSection === "appDownload"}
              onEdit={() => startEditingSection("appDownload")}
              onSave={() => saveSection("appDownload")}
              onCancel={() => cancelEditingSection("appDownload")}
              isSaving={savingSection === "appDownload"}
              onLockedClick={() => notifyReadOnly(SECTION_META.appDownload.title)}
            >
              <fieldset disabled={activeEditSection !== "appDownload"} style={{ border: "none", padding: 0, margin: 0 }}>
                <div className="permission-item" style={{ cursor: "pointer", marginBottom: 16 }} onClick={() => setAppDownload(f => ({ ...f, is_visible: !f.is_visible }))}>
                  <div className="permission-checkbox">
                    <input type="checkbox" checked={!!appDownload.is_visible} readOnly />
                  </div>
                  <div className="permission-content">
                    <label className="permission-label" style={{ cursor: "pointer" }}>Show "Download Our Mobile App" section on all pages</label>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label">Google Play URL</label>
                      <input className="form-input" value={appDownload.google_play_url} onChange={e => setAppDownload(f => ({ ...f, google_play_url: e.target.value }))} placeholder="https://play.google.com/store/apps/..." />
                    </div>
                  </div>
                  <div className="col-md-6 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label">App Store URL</label>
                      <input className="form-input" value={appDownload.app_store_url} onChange={e => setAppDownload(f => ({ ...f, app_store_url: e.target.value }))} placeholder="https://apps.apple.com/..." />
                    </div>
                  </div>
                </div>
              </fieldset>
            </SectionCard>
          </div>

          {/* ── 6. Copyright ─────────────────────────────────── */}
          <div ref={(node) => { sectionRefs.current.copyright = node; }}>
            <SectionCard
              sectionKey="copyright"
              isOpen={openSections.copyright}
              onToggleOpen={() => setOpenSections((prev) => ({ ...prev, copyright: !prev.copyright }))}
              isEditing={activeEditSection === "copyright"}
              onEdit={() => startEditingSection("copyright")}
              onSave={() => saveSection("copyright")}
              onCancel={() => cancelEditingSection("copyright")}
              isSaving={savingSection === "copyright"}
              onLockedClick={() => notifyReadOnly(SECTION_META.copyright.title)}
            >
              <fieldset disabled={activeEditSection !== "copyright"} style={{ border: "none", padding: 0, margin: 0 }}>
                <div className="form-group">
                  <label className="form-label">Copyright Line</label>
                  <textarea className="form-input" rows={2} value={copyright} onChange={e => setCopyright(e.target.value)} placeholder="e.g. © 2025 Copyright All rights reserved | Professional Golf Tour of India..." />
                  <CharCounter value={copyright} max={LIMITS.notes.max} />
                </div>
              </fieldset>
            </SectionCard>
          </div>

          {/* ── bottom cancel bar ──────────────────────────── */}
          <div className="content-card">
            <div className="content-card-body">
              <div className="form-actions">
                <Link to="/admin/cms/footer/list">
                  <button type="button" className="action-button secondary">Cancel</button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Quick Jump sidebar ──────────────────────────── */}
        <div style={{ position: "fixed", right: 20, top: "50%", transform: "translateY(-50%)", zIndex: 1200, display: "flex", alignItems: "center", gap: 12 }}>
          {quickJumpOpen && (
            <div style={{
              width: 240, maxHeight: "70vh", overflowY: "auto",
              background: "#ffffff", border: "1px solid #dbe7f5",
              borderRadius: 24, boxShadow: "0 18px 44px rgba(15, 23, 42, 0.16)",
              padding: "14px 12px",
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1e3a8a", marginBottom: 10, paddingLeft: 4 }}>
                Quick Jump
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {SECTION_NAV_ITEMS.map((item, index) => {
                  const isActive = !!openSections[item.key];
                  const offset = getQuickJumpCurveOffset(index, SECTION_NAV_ITEMS.length);
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => focusSection(item.key)}
                      style={{
                        border: "1px solid #d7e3f4",
                        background: isActive ? "#e8f0ff" : "#ffffff",
                        color: isActive ? "#2563eb" : "#0f172a",
                        borderRadius: 999, padding: "12px 14px",
                        textAlign: "left", fontSize: 14,
                        fontWeight: isActive ? 700 : 600,
                        cursor: "pointer",
                        boxShadow: isActive ? "0 8px 20px rgba(37, 99, 235, 0.12)" : "none",
                        marginLeft: offset, marginRight: offset,
                        transition: "all 0.2s ease",
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => setQuickJumpOpen((prev) => !prev)}
            style={{
              width: 58, height: 58, borderRadius: "50%",
              border: "none", background: "#1e3a8a", color: "#ffffff",
              boxShadow: "0 14px 30px rgba(30, 58, 138, 0.26)",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: 22,
            }}
            aria-label="Open quick jump for Footer sections"
            title="Quick Jump"
          >
            <AppstoreOutlined />
          </button>
        </div>
      </div>
    </div>
  );
}
