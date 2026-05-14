import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, notification } from "antd";
import {
  AppstoreOutlined, ArrowLeftOutlined, CheckCircleOutlined,
  CloseOutlined, DeleteOutlined, DownOutlined, EditOutlined,
  ExclamationCircleOutlined, HistoryOutlined, InfoCircleOutlined,
  PictureOutlined, PlusOutlined, ReadOutlined, SaveOutlined,
  StarOutlined, UpOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import ImageUploadField from "components/ui/ImageUploadField";
import { addEditIndianGolf, listIndianGolf } from "services/indianGolf.service";
import { CharCounter, ImageHint } from "components/ui/FieldHint";
import { LIMITS, IMAGE_SPECS } from "utils/fieldValidation";
import "styles/admin-pages.css";

const emptyItem = () => ({ year: "", title: "", description: "", image: "" });

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

const SECTION_KEYS = ["general", "heroBanner", "introSection", "greatMoments"];
const SECTION_META = {
  general:      { number: "0", title: "General" },
  heroBanner:   { number: "1", title: "Hero Banner" },
  introSection: { number: "2", title: "Introduction" },
  greatMoments: { number: "3", title: "Great Moments Timeline" },
};
const SECTION_NAV_ITEMS = SECTION_KEYS.map((key) => ({
  key,
  label: `${SECTION_META[key].number}. ${SECTION_META[key].title}`,
}));

const parseContent = (raw) => {
  try {
    const c = typeof raw === "string" ? JSON.parse(raw) : (raw || {});
    return {
      heroBanner: {
        bg_image: c.heroBanner?.bg_image || "",
        mobile_bg_image: c.heroBanner?.mobile_bg_image || "",
        title: c.heroBanner?.title || "",
        subtitle: c.heroBanner?.subtitle || "",
      },
      introSection: {
        image: c.introSection?.image || "",
        heading: c.introSection?.heading || "",
        content: c.introSection?.content || "",
      },
      greatMoments: {
        heading: c.greatMoments?.heading || "",
        description: c.greatMoments?.description || "",
        items: c.greatMoments?.items?.length ? c.greatMoments.items : [emptyItem()],
      },
    };
  } catch {
    return {
      heroBanner: { bg_image: "", mobile_bg_image: "", title: "", subtitle: "" },
      introSection: { image: "", heading: "", content: "" },
      greatMoments: { heading: "", description: "", items: [emptyItem()] },
    };
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

export default function IndianGolfAddEditData() {
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

  const [heroBanner, setHeroBanner] = useState(initial.heroBanner);
  const [savedHeroBanner, setSavedHeroBanner] = useState(initial.heroBanner);
  const [introSection, setIntroSection] = useState(initial.introSection);
  const [savedIntroSection, setSavedIntroSection] = useState(initial.introSection);
  const [greatMoments, setGreatMoments] = useState(initial.greatMoments);
  const [savedGreatMoments, setSavedGreatMoments] = useState(initial.greatMoments);

  const [activeEditSection, setActiveEditSection] = useState(() => normalizeOpenSectionKey(requestedOpenSectionKey));
  const [savingSection, setSavingSection] = useState("");
  const [openSections, setOpenSections] = useState(() => buildSectionOpenState({ openKey: requestedOpenSectionKey }));
  const [quickJumpOpen, setQuickJumpOpen] = useState(false);

  const hydrateForm = (record = {}) => {
    const c = parseContent(record?.content ?? record?.result?.content ?? record);
    setHeroBanner(c.heroBanner); setSavedHeroBanner(c.heroBanner);
    setIntroSection(c.introSection); setSavedIntroSection(c.introSection);
    setGreatMoments(c.greatMoments); setSavedGreatMoments(c.greatMoments);
    if (record?.id) setId(record.id);
    if (record?.result?.id) setId(record.result.id);
    if (record?.status) { setStatus(record.status); setSavedStatus(record.status); }
    if (record?.result?.status) { setStatus(record.result.status); setSavedStatus(record.result.status); }
  };

  useEffect(() => {
    document.title = `PGTI || ${id ? "Edit" : "Setup"} Indian Golf`;
    let active = true;
    const load = async () => {
      if (state && Object.keys(state).length > 0 && state.id) hydrateForm(state);
      try {
        setIsFetching(true);
        const res = await listIndianGolf();
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

  const buildContent = () => ({ heroBanner, introSection, greatMoments });

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
    else if (sectionKey === "heroBanner") setHeroBanner(savedHeroBanner);
    else if (sectionKey === "introSection") setIntroSection(savedIntroSection);
    else if (sectionKey === "greatMoments") setGreatMoments(savedGreatMoments);
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
          const res = await addEditIndianGolf({
            ...(id && { editId: id }),
            status,
            content: JSON.stringify(buildContent()),
          });
          if (res?.status === true) {
            if (!id && res.result?.id) setId(res.result.id);
            setSavedStatus(status);
            setSavedHeroBanner({ ...heroBanner });
            setSavedIntroSection({ ...introSection });
            setSavedGreatMoments({ ...greatMoments });
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

  const updateItem = (idx, field, val) =>
    setGreatMoments((f) => ({
      ...f,
      items: f.items.map((item, i) => (i === idx ? { ...item, [field]: val } : item)),
    }));

  const addItem = () =>
    setGreatMoments((f) => ({ ...f, items: [...f.items, emptyItem()] }));

  const removeItem = (idx) =>
    setGreatMoments((f) => {
      const items = f.items.filter((_, i) => i !== idx);
      return { ...f, items: items.length ? items : [emptyItem()] };
    });

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">{id ? "Edit Indian Golf Page" : "Setup Indian Golf Page"}</h1>
            <p className="page-subtitle">Manage all sections of the Indian Golf page</p>
            {isFetching && <p className="page-subtitle" style={{ marginTop: 6 }}>Loading saved data...</p>}
          </div>
          <Link to="/admin/cms/indian-golf/list">
            <button type="button" className="action-button secondary"><ArrowLeftOutlined /> Back to List</button>
          </Link>
        </div>
      </div>

      <div className="page-body">
        <div className="modern-form">

          {/* 0. General */}
          <div ref={(node) => { sectionRefs.current.general = node; }}>
            <SectionCard sectionKey="general" isOpen={openSections.general}
              onToggleOpen={() => setOpenSections((prev) => ({ ...prev, general: !prev.general }))}
              isEditing={activeEditSection === "general"} onEdit={() => startEditingSection("general")}
              onSave={() => saveSection("general")} onCancel={() => cancelEditingSection("general")}
              isSaving={savingSection === "general"} onLockedClick={() => notifyReadOnly(SECTION_META.general.title)}
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

          {/* 1. Hero Banner */}
          <div ref={(node) => { sectionRefs.current.heroBanner = node; }}>
            <SectionCard sectionKey="heroBanner" isOpen={openSections.heroBanner}
              onToggleOpen={() => setOpenSections((prev) => ({ ...prev, heroBanner: !prev.heroBanner }))}
              isEditing={activeEditSection === "heroBanner"} onEdit={() => startEditingSection("heroBanner")}
              onSave={() => saveSection("heroBanner")} onCancel={() => cancelEditingSection("heroBanner")}
              isSaving={savingSection === "heroBanner"} onLockedClick={() => notifyReadOnly(SECTION_META.heroBanner.title)}
            >
              <fieldset disabled={activeEditSection !== "heroBanner"} style={{ border: "none", padding: 0, margin: 0 }}>
                <ImageUploadField
                  label="Background Image"
                  value={heroBanner.bg_image}
                  onChange={(url) => setHeroBanner((prev) => ({ ...prev, bg_image: url }))}
                  folder="cms/indian-golf"
                  previewH={160}
                  spec={IMAGE_SPECS["cms/indian-golf"]}
                />
                <ImageHint recommended={IMAGE_SPECS["cms/indian-golf"]?.recommended} maxSize={`${IMAGE_SPECS["cms/indian-golf"]?.maxMB}MB`} note={IMAGE_SPECS["cms/indian-golf"]?.note} />
                <div style={{ marginTop: 16 }}>
                  <ImageUploadField
                    label="Mobile Banner Image"
                    value={heroBanner.mobile_bg_image}
                    onChange={(url) => setHeroBanner((prev) => ({ ...prev, mobile_bg_image: url }))}
                    folder="cms/indian-golf"
                    previewH={160}
                    spec={IMAGE_SPECS.hero_banner_mobile}
                  />
                  <ImageHint recommended={IMAGE_SPECS.hero_banner_mobile?.recommended} maxSize={`${IMAGE_SPECS.hero_banner_mobile?.maxMB}MB`} note={IMAGE_SPECS.hero_banner_mobile?.note} />
                </div>
                <div className="row" style={{ marginTop: 16 }}>
                  <div className="col-md-6 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label required">Page Title</label>
                      <input className="form-input" value={heroBanner.title} onChange={(e) => setHeroBanner((prev) => ({ ...prev, title: e.target.value }))} placeholder="e.g. Indian Golf" />
                    </div>
                  </div>
                  <div className="col-md-6 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label">Subtitle / Author</label>
                      <input className="form-input" value={heroBanner.subtitle} onChange={(e) => setHeroBanner((prev) => ({ ...prev, subtitle: e.target.value }))} placeholder="e.g. By V Krishnaswamy" />
                    </div>
                  </div>
                </div>
              </fieldset>
            </SectionCard>
          </div>

          {/* 2. Introduction Section */}
          <div ref={(node) => { sectionRefs.current.introSection = node; }}>
            <SectionCard sectionKey="introSection" isOpen={openSections.introSection}
              onToggleOpen={() => setOpenSections((prev) => ({ ...prev, introSection: !prev.introSection }))}
              isEditing={activeEditSection === "introSection"} onEdit={() => startEditingSection("introSection")}
              onSave={() => saveSection("introSection")} onCancel={() => cancelEditingSection("introSection")}
              isSaving={savingSection === "introSection"} onLockedClick={() => notifyReadOnly(SECTION_META.introSection.title)}
            >
              <fieldset disabled={activeEditSection !== "introSection"} style={{ border: "none", padding: 0, margin: 0 }}>
                <div className="row">
                  <div className="col-md-4 col-12 mb-3">
                    <ImageUploadField
                      label="Feature Image"
                      value={introSection.image}
                      onChange={(url) => setIntroSection((prev) => ({ ...prev, image: url }))}
                      folder="cms/indian-golf"
                      previewH={200}
                      spec={IMAGE_SPECS["cms/indian-golf"]}
                    />
                    <ImageHint recommended="800×600 px" maxSize="2MB" note="Book cover, author portrait, or section illustration." />
                  </div>
                  <div className="col-md-8 col-12 mb-3">
                    <div className="form-group" style={{ marginBottom: 16 }}>
                      <label className="form-label required">Section Heading</label>
                      <input className="form-input" value={introSection.heading} onChange={(e) => setIntroSection((prev) => ({ ...prev, heading: e.target.value }))} placeholder="e.g. PGTI History" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Content</label>
                      <ReactQuill
                        theme="snow"
                        value={introSection.content || ""}
                        onChange={(val) => setIntroSection((prev) => ({ ...prev, content: val }))}
                        placeholder="Enter the introductory content about Indian golf history..."
                        style={{ backgroundColor: "white", borderRadius: 8, marginBottom: 8 }}
                        modules={QUILL_MODULES}
                      />
                      <CharCounter value={(introSection.content || "").replace(/<[^>]*>/g, "")} min={LIMITS.description.min} max={LIMITS.description.max} />
                    </div>
                  </div>
                </div>
              </fieldset>
            </SectionCard>
          </div>

          {/* 3. Great Moments Timeline */}
          <div ref={(node) => { sectionRefs.current.greatMoments = node; }}>
            <SectionCard sectionKey="greatMoments" isOpen={openSections.greatMoments}
              onToggleOpen={() => setOpenSections((prev) => ({ ...prev, greatMoments: !prev.greatMoments }))}
              isEditing={activeEditSection === "greatMoments"} onEdit={() => startEditingSection("greatMoments")}
              onSave={() => saveSection("greatMoments")} onCancel={() => cancelEditingSection("greatMoments")}
              isSaving={savingSection === "greatMoments"} onLockedClick={() => notifyReadOnly(SECTION_META.greatMoments.title)}
            >
              <fieldset disabled={activeEditSection !== "greatMoments"} style={{ border: "none", padding: 0, margin: 0 }}>
                <div className="row" style={{ marginBottom: 20 }}>
                  <div className="col-md-6 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label required">Section Heading</label>
                      <input className="form-input" value={greatMoments.heading} onChange={(e) => setGreatMoments((f) => ({ ...f, heading: e.target.value }))} placeholder="e.g. Great Moments" />
                    </div>
                  </div>
                  <div className="col-md-6 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label">Section Description</label>
                      <textarea className="form-input" rows={2} value={greatMoments.description} onChange={(e) => setGreatMoments((f) => ({ ...f, description: e.target.value }))} placeholder="Brief intro shown above the timeline..." />
                      <CharCounter value={greatMoments.description} max={LIMITS.short_description.max} />
                    </div>
                  </div>
                </div>

                <h4 style={{ fontSize: 14, fontWeight: 600, color: "#334155", margin: "0 0 12px" }}>
                  Timeline Items
                  <span style={{ marginLeft: 8, fontWeight: 400, fontSize: 12, color: "#94a3b8" }}>
                    (each item = a year dot in the timeline + a detail section)
                  </span>
                </h4>

                {greatMoments.items.map((item, idx) => (
                  <div key={idx} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 20, marginBottom: 16, background: "#f8fafc" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <span style={{ fontWeight: 700, color: "#0369a1", fontSize: 18 }}>{item.year || `Item ${idx + 1}`}</span>
                      <button type="button" className="action-button danger" style={{ fontSize: 11, padding: "3px 10px" }} onClick={() => removeItem(idx)}>
                        <DeleteOutlined /> Remove
                      </button>
                    </div>
                    <div className="row">
                      <div className="col-md-3 col-12 mb-3">
                        <div className="form-group">
                          <label className="form-label required">Year</label>
                          <input className="form-input" value={item.year} onChange={(e) => updateItem(idx, "year", e.target.value)} placeholder="e.g. 1964" maxLength={4} />
                        </div>
                      </div>
                      <div className="col-md-9 col-12 mb-3">
                        <div className="form-group">
                          <label className="form-label required">Event Title</label>
                          <input className="form-input" value={item.title} onChange={(e) => updateItem(idx, "title", e.target.value)} placeholder="e.g. INCEPTION OF INDIAN OPEN" />
                        </div>
                      </div>
                      <div className="col-md-8 col-12 mb-3">
                        <div className="form-group">
                          <label className="form-label">Description</label>
                          <ReactQuill
                            theme="snow"
                            value={item.description || ""}
                            onChange={(val) => updateItem(idx, "description", val)}
                            placeholder="Detailed description of this milestone..."
                            style={{ backgroundColor: "white", borderRadius: 8, marginBottom: 8 }}
                            modules={QUILL_MODULES}
                          />
                          <CharCounter value={(item.description || "").replace(/<[^>]*>/g, "")} max={LIMITS.description.max} />
                        </div>
                      </div>
                      <div className="col-md-4 col-12 mb-3">
                        <ImageUploadField
                          label="Event Image"
                          value={item.image}
                          onChange={(url) => updateItem(idx, "image", url)}
                          folder="cms/indian-golf"
                          previewH={150}
                          spec={IMAGE_SPECS["cms/indian-golf"]}
                        />
                        <ImageHint recommended="800×500 px" maxSize="2MB" note="Historical photo for this milestone." />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" className="action-button secondary" onClick={addItem}>
                  <PlusOutlined /> Add Timeline Item
                </button>
              </fieldset>
            </SectionCard>
          </div>

          <div className="content-card">
            <div className="content-card-body">
              <div className="form-actions">
                <Link to="/admin/cms/indian-golf/list">
                  <button type="button" className="action-button secondary">Cancel</button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Jump */}
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
            aria-label="Open quick jump for Indian Golf sections"
            title="Quick Jump"
          >
            <AppstoreOutlined />
          </button>
        </div>
      </div>
    </div>
  );
}
