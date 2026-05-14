import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, notification } from "antd";
import {
  AppstoreOutlined, ArrowLeftOutlined,
  CheckCircleOutlined, CloseOutlined, DeleteOutlined, DownOutlined,
  EditOutlined, ExclamationCircleOutlined,
  InfoCircleOutlined, PlusOutlined, SaveOutlined, UpOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { addEditCookiePolicy, listCookiePolicy } from "services/cookiePolicy.service";
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
  { heading: "What Are Cookies?", content: "" },
  { heading: "How We Use Cookies", content: "" },
  { heading: "Types of Cookies We Use", content: "" },
  { heading: "Managing Cookie Preferences", content: "" },
  { heading: "Third-Party Cookies", content: "" },
  { heading: "Changes to This Cookie Policy", content: "" },
];

const SECTION_KEYS = ["header", "contentSections"];
const SECTION_META = {
  header: { number: "1", title: "Page Header" },
  contentSections: { number: "2", title: "Policy Content Sections" },
};
const SECTION_NAV_ITEMS = SECTION_KEYS.map((key) => ({
  key,
  label: `${SECTION_META[key].number}. ${SECTION_META[key].title}`,
}));

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
  return Math.round(Math.abs(index - center) * 10);
};

const SectionCard = ({
  sectionKey, children, isOpen, onToggleOpen,
  isEditing, onEdit, onSave, onCancel, isSaving, onLockedClick,
}) => {
  const meta = SECTION_META[sectionKey];
  return (
    <div className="content-card" style={{ marginBottom: 24 }}>
      <div className="content-card-body">
        <div className="form-section" style={{ marginBottom: 0 }}>
          <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <button
              type="button"
              onClick={onToggleOpen}
              style={{ border: "none", background: "transparent", padding: 0, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12, flex: 1 }}
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
                  <button type="button" className="action-button secondary" onClick={onCancel} disabled={isSaving}><CloseOutlined /> Cancel</button>
                  <button type="button" className="action-button primary" onClick={onSave} disabled={isSaving}><SaveOutlined /> {isSaving ? "Saving..." : "Save Changes"}</button>
                </>
              ) : (
                <button type="button" className="action-button secondary" onClick={onEdit}><EditOutlined /> Edit</button>
              )}
            </div>
          </div>
          {isOpen && (
            <div style={{ paddingTop: 16, position: "relative" }}>
              {children}
              {!isEditing && (
                <button
                  type="button"
                  onClick={onLockedClick}
                  style={{ position: "absolute", inset: 0, border: "none", background: "rgba(248, 250, 252, 0.28)", cursor: "not-allowed", borderRadius: 12 }}
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

export default function CookiePolicyAddEditData() {
  const location = useLocation();
  const sectionRefs = useRef({});
  const state = useMemo(() => location?.state || {}, [location?.state]);
  const requestedOpenSectionKey = state?.openSectionKey || state?.sectionKey || "";

  const raw = state?.content ?? state?.result?.content ?? state;
  const initial = parseContent(raw);

  const [isFetching, setIsFetching] = useState(false);
  const [id, setId] = useState(state?.id ?? state?.result?.id ?? "");
  const [status, setStatus] = useState(state?.status ?? "A");
  const [savedStatus, setSavedStatus] = useState(state?.status ?? "A");

  const [header, setHeader] = useState({ title: initial.title, subtitle: initial.subtitle });
  const [savedHeader, setSavedHeader] = useState({ title: initial.title, subtitle: initial.subtitle });
  const [sections, setSections] = useState(initial.sections);
  const [savedSections, setSavedSections] = useState(initial.sections);

  const [activeEditSection, setActiveEditSection] = useState(() => normalizeOpenSectionKey(requestedOpenSectionKey));
  const [savingSection, setSavingSection] = useState("");
  const [openSections, setOpenSections] = useState(() => buildSectionOpenState({ openKey: requestedOpenSectionKey }));
  const [quickJumpOpen, setQuickJumpOpen] = useState(false);

  const hydrateForm = (record = {}) => {
    const c = parseContent(record?.content ?? record?.result?.content ?? record);
    setHeader({ title: c.title, subtitle: c.subtitle });
    setSavedHeader({ title: c.title, subtitle: c.subtitle });
    setSections(c.sections);
    setSavedSections(c.sections);
    if (record?.id) setId(record.id);
    if (record?.result?.id) setId(record.result.id);
    if (record?.status) { setStatus(record.status); setSavedStatus(record.status); }
    if (record?.result?.status) { setStatus(record.result.status); setSavedStatus(record.result.status); }
  };

  useEffect(() => {
    document.title = `PGTI || ${id ? "Edit" : "Setup"} Cookie Policy`;
    let active = true;
    const load = async () => {
      if (state && Object.keys(state).length > 0 && state.id) hydrateForm(state);
      try {
        setIsFetching(true);
        const res = await listCookiePolicy();
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

  const buildContent = () => ({ title: header.title, subtitle: header.subtitle, sections });

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
    if (sectionKey === "header") { setHeader(savedHeader); setStatus(savedStatus); }
    else if (sectionKey === "contentSections") setSections(savedSections);
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
        if (!header.title.trim()) {
          notification.open({ message: "Oops!", description: "Page title is required.", placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
          return;
        }
        try {
          setSavingSection(sectionKey);
          const res = await addEditCookiePolicy({
            ...(id && { editId: id }),
            status,
            content: JSON.stringify(buildContent()),
          });
          if (res?.status === true) {
            if (!id && res.result?.id) setId(res.result.id);
            setSavedStatus(status);
            setSavedHeader({ ...header });
            setSavedSections([...sections]);
            setActiveEditSection("");
            notification.success({
              message: "Success",
              description: "Section saved successfully.",
              placement: "topRight",
              icon: <CheckCircleOutlined style={{ color: "green" }} />,
              duration: 2,
            });
          } else {
            notification.error({ message: "Failed to save", description: res?.message || "Something went wrong.", placement: "topRight", duration: 3 });
          }
        } catch {
          notification.error({ message: "Error", description: "An unexpected error occurred.", placement: "topRight", duration: 3 });
        } finally {
          setSavingSection("");
        }
      },
    });
  };

  const updateSection = (idx, field, val) =>
    setSections((f) => f.map((s, i) => (i === idx ? { ...s, [field]: val } : s)));

  const addSection = () =>
    setSections((f) => [...f, { heading: "", content: "" }]);

  const removeSection = (idx) =>
    setSections((f) => {
      const next = f.filter((_, i) => i !== idx);
      return next.length ? next : [{ heading: "", content: "" }];
    });

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">{id ? "Edit Cookie Policy" : "Setup Cookie Policy"}</h1>
            <p className="page-subtitle">Manage the Cookie Policy page content section by section.</p>
            {isFetching && <p className="page-subtitle" style={{ marginTop: 6 }}>Loading saved data...</p>}
          </div>
          <Link to="/admin/cms/cookie-policy/list">
            <button type="button" className="action-button secondary"><ArrowLeftOutlined /> Back to List</button>
          </Link>
        </div>
      </div>

      <div className="page-body">
        <div className="modern-form">
          <div ref={(node) => { sectionRefs.current.header = node; }}>
            <SectionCard sectionKey="header" isOpen={openSections.header}
              onToggleOpen={() => setOpenSections((prev) => ({ ...prev, header: !prev.header }))}
              isEditing={activeEditSection === "header"} onEdit={() => startEditingSection("header")}
              onSave={() => saveSection("header")} onCancel={() => cancelEditingSection("header")}
              isSaving={savingSection === "header"} onLockedClick={() => notifyReadOnly(SECTION_META.header.title)}
            >
              <fieldset disabled={activeEditSection !== "header"} style={{ border: "none", padding: 0, margin: 0 }}>
                <div className="row">
                  <div className="col-md-6 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label required">Page Title</label>
                      <input className="form-input" value={header.title} onChange={(e) => setHeader((prev) => ({ ...prev, title: e.target.value }))} placeholder="e.g. Cookie Policy" />
                    </div>
                  </div>
                  <div className="col-md-6 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label">Subtitle</label>
                      <textarea className="form-input" rows={2} value={header.subtitle} onChange={(e) => setHeader((prev) => ({ ...prev, subtitle: e.target.value }))} placeholder="Short description shown below the title..." />
                      <CharCounter value={header.subtitle} max={LIMITS.short_description.max} />
                    </div>
                  </div>
                  <div className="col-md-6 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="A">Active</option>
                        <option value="I">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
              </fieldset>
            </SectionCard>
          </div>

          <div ref={(node) => { sectionRefs.current.contentSections = node; }}>
            <SectionCard sectionKey="contentSections" isOpen={openSections.contentSections}
              onToggleOpen={() => setOpenSections((prev) => ({ ...prev, contentSections: !prev.contentSections }))}
              isEditing={activeEditSection === "contentSections"} onEdit={() => startEditingSection("contentSections")}
              onSave={() => saveSection("contentSections")} onCancel={() => cancelEditingSection("contentSections")}
              isSaving={savingSection === "contentSections"} onLockedClick={() => notifyReadOnly(SECTION_META.contentSections.title)}
            >
              <fieldset disabled={activeEditSection !== "contentSections"} style={{ border: "none", padding: 0, margin: 0 }}>
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
                  Each section has a heading and rich-text content. You can add, remove, or reorder them as needed.
                </p>
                {sections.map((section, idx) => (
                  <div key={idx} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 16, marginBottom: 16, background: "#f8fafc" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontWeight: 700, color: "#0369a1", fontSize: 14 }}>Section {idx + 1}</span>
                      <button type="button" className="action-button danger" style={{ fontSize: 11, padding: "3px 10px" }} onClick={() => removeSection(idx)}>
                        <DeleteOutlined /> Remove
                      </button>
                    </div>
                    <div className="form-group" style={{ marginBottom: 12 }}>
                      <label className="form-label required">Section Heading</label>
                      <input className="form-input" value={section.heading} onChange={(e) => updateSection(idx, "heading", e.target.value)} placeholder="e.g. What Are Cookies?" />
                    </div>
                    <div className="form-group">
                      <label className="form-label required">Section Content</label>
                      <ReactQuill
                        theme="snow"
                        value={section.content || ""}
                        onChange={(val) => updateSection(idx, "content", val)}
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
              </fieldset>
            </SectionCard>
          </div>

          <div className="content-card">
            <div className="content-card-body">
              <div className="form-actions">
                <Link to="/admin/cms/cookie-policy/list">
                  <button type="button" className="action-button secondary">Cancel</button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div style={{ position: "fixed", right: 20, top: "50%", transform: "translateY(-50%)", zIndex: 1200, display: "flex", alignItems: "center", gap: 12 }}>
          {quickJumpOpen && (
            <div style={{ width: 240, maxHeight: "70vh", overflowY: "auto", background: "#ffffff", border: "1px solid #dbe7f5", borderRadius: 24, boxShadow: "0 18px 44px rgba(15, 23, 42, 0.16)", padding: "14px 12px" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1e3a8a", marginBottom: 10, paddingLeft: 4 }}>Quick Jump</div>
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
            style={{ width: 58, height: 58, borderRadius: "50%", border: "none", background: "#1e3a8a", color: "#ffffff", boxShadow: "0 14px 30px rgba(30, 58, 138, 0.26)", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 22 }}
            aria-label="Open quick jump for Cookie Policy sections"
            title="Quick Jump"
          >
            <AppstoreOutlined />
          </button>
        </div>
      </div>
    </div>
  );
}
