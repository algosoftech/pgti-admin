import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, notification } from "antd";
import {
  AppstoreOutlined, ArrowLeftOutlined, BulbOutlined, CheckCircleOutlined,
  CloseOutlined, DeleteOutlined, DownOutlined, EditOutlined,
  ExclamationCircleOutlined, InfoCircleOutlined, OrderedListOutlined,
  PictureOutlined, PlusOutlined, SaveOutlined, UpOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import ImageUploadField from "components/ui/ImageUploadField";
import CmsSetupTopActions from "components/cms/CmsSetupTopActions";
import { addEditGolfFacts, listGolfFacts } from "services/golfFacts.service";
import { CharCounter, FieldHint, ImageHint } from "components/ui/FieldHint";
import { LIMITS, IMAGE_SPECS } from "utils/fieldValidation";
import { TOUR_TYPE_OPTIONS, shouldUseExistingTourTypeRecord } from "utils/tourType";
import "styles/admin-pages.css";

const emptyFact = () => ({ title: "", description: "" });

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

const SECTION_KEYS = ["general", "heroBanner", "introSection", "facts"];
const SECTION_META = {
  general:     { number: "0", title: "General" },
  heroBanner:  { number: "1", title: "Hero Banner" },
  introSection:{ number: "2", title: "Introduction" },
  facts:       { number: "3", title: "Golf Facts List" },
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
        heading: c.introSection?.heading || "",
        description: c.introSection?.description || "",
      },
      facts: Array.isArray(c.facts) && c.facts.length ? c.facts : [emptyFact()],
    };
  } catch {
    return {
      heroBanner: { bg_image: "", mobile_bg_image: "", title: "", subtitle: "" },
      introSection: { heading: "", description: "" },
      facts: [emptyFact()],
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

export default function GolfFactsAddEditData() {
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
  const [tourType, setTourType] = useState(state?.tour_type ?? state?.result?.tour_type ?? "M");
  const [savedTourType, setSavedTourType] = useState(state?.tour_type ?? state?.result?.tour_type ?? "M");

  const [heroBanner, setHeroBanner] = useState(initial.heroBanner);
  const [savedHeroBanner, setSavedHeroBanner] = useState(initial.heroBanner);
  const [introSection, setIntroSection] = useState(initial.introSection);
  const [savedIntroSection, setSavedIntroSection] = useState(initial.introSection);
  const [facts, setFacts] = useState(initial.facts);
  const [savedFacts, setSavedFacts] = useState(initial.facts);

  const [activeEditSection, setActiveEditSection] = useState(() => normalizeOpenSectionKey(requestedOpenSectionKey));
  const [savingSection, setSavingSection] = useState("");
  const [openSections, setOpenSections] = useState(() => buildSectionOpenState({ openKey: requestedOpenSectionKey }));
  const [quickJumpOpen, setQuickJumpOpen] = useState(false);

  const hydrateForm = (record = {}) => {
    const c = parseContent(record?.content ?? record?.result?.content ?? record);
    setHeroBanner(c.heroBanner); setSavedHeroBanner(c.heroBanner);
    setIntroSection(c.introSection); setSavedIntroSection(c.introSection);
    setFacts(c.facts); setSavedFacts(c.facts);
    if (record?.id) setId(record.id);
    if (record?.result?.id) setId(record.result.id);
    if (record?.status) { setStatus(record.status); setSavedStatus(record.status); }
    if (record?.result?.status) { setStatus(record.result.status); setSavedStatus(record.result.status); }
    if (record?.tour_type) { setTourType(record.tour_type); setSavedTourType(record.tour_type); }
    if (record?.result?.tour_type) { setTourType(record.result.tour_type); setSavedTourType(record.result.tour_type); }
  };

  useEffect(() => {
    document.title = `PGTI || ${id ? "Edit" : "Setup"} Golf Facts`;
    let active = true;
    const load = async () => {
      if (state && Object.keys(state).length > 0 && state.id) hydrateForm(state);
      try {
        setIsFetching(true);
        const res = await listGolfFacts({ tour_type: tourType });
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
  }, [requestedOpenSectionKey, tourType]);

  const buildContent = () => ({ heroBanner, introSection, facts });

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
    if (sectionKey === "general") { setStatus(savedStatus); setTourType(savedTourType); }
    else if (sectionKey === "heroBanner") setHeroBanner(savedHeroBanner);
    else if (sectionKey === "introSection") setIntroSection(savedIntroSection);
    else if (sectionKey === "facts") setFacts(savedFacts);
    setActiveEditSection((prev) => (prev === sectionKey ? "" : prev));
  };

  const copyFromMainTour = async () => {
    try {
      setIsFetching(true);
      const res = await listGolfFacts({ tour_type: "M" });
      if (!res?.status || !res?.result?.id) {
        notification.warning({ message: "Main Tour data not found", description: "Please save the Main Tour Golf Facts page first.", placement: "topRight", duration: 3 });
        return;
      }
      hydrateForm(res.result);
      setId("");
      setTourType("F");
      setSavedTourType("F");
      notification.success({ message: "Copied from Main Tour", description: "Edit the copied NextGen draft and save to create a separate record.", placement: "topRight", duration: 3 });
    } finally {
      setIsFetching(false);
    }
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
          const res = await addEditGolfFacts({
            ...(shouldUseExistingTourTypeRecord(id, savedTourType, tourType) && { editId: id }),
            status,
            tour_type: tourType,
            content: JSON.stringify(buildContent()),
          });
          if (res?.status === true) {
            if (res.result?.id) setId(res.result.id);
            setSavedStatus(status);
            setSavedTourType(tourType);
            setSavedHeroBanner({ ...heroBanner });
            setSavedIntroSection({ ...introSection });
            setSavedFacts([...facts]);
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

  const updateFact = (idx, field, val) =>
    setFacts((f) => f.map((fact, i) => (i === idx ? { ...fact, [field]: val } : fact)));

  const addFact = () => setFacts((f) => [...f, emptyFact()]);

  const removeFact = (idx) =>
    setFacts((f) => {
      const next = f.filter((_, i) => i !== idx);
      return next.length ? next : [emptyFact()];
    });

  const moveFact = (idx, direction) => {
    setFacts((f) => {
      const next = [...f];
      const target = idx + direction;
      if (target < 0 || target >= next.length) return f;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">{id ? "Edit Golf Facts Page" : "Setup Golf Facts Page"}</h1>
            <p className="page-subtitle">Manage all sections of the Golf Facts page</p>
            {isFetching && <p className="page-subtitle" style={{ marginTop: 6 }}>Loading saved data...</p>}
          </div>
          <Link to="/admin/cms/golf-facts/list">
            <button type="button" className="action-button secondary"><ArrowLeftOutlined /> Back to List</button>
          </Link>
        </div>
      </div>

      <CmsSetupTopActions
        tourType={tourType}
        onCopyFromMain={copyFromMainTour}
        onSaveAll={() => saveSection(activeEditSection)}
        saveAllDisabled={!activeEditSection}
        isWorking={Boolean(isFetching || savingSection)}
      />

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
                <div className="form-group">
                  <label className="form-label">Tour Type</label>
                  <select className="form-input" value={tourType} onChange={(e) => setTourType(e.target.value)}>
                    {TOUR_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  {tourType === "F" && (
                    <button type="button" className="action-button secondary" onClick={copyFromMainTour} disabled={isFetching} style={{ marginTop: 12 }}>
                      Copy from Main Tour
                    </button>
                  )}
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
                  folder="cms/golf-facts"
                  previewH={160}
                  spec={IMAGE_SPECS["cms/golf-facts"]}
                />
                <ImageHint recommended={IMAGE_SPECS["cms/golf-facts"]?.recommended} maxSize={`${IMAGE_SPECS["cms/golf-facts"]?.maxMB}MB`} note={IMAGE_SPECS["cms/golf-facts"]?.note} />
                <div style={{ marginTop: 16 }}>
                  <ImageUploadField
                    label="Mobile Banner Image"
                    value={heroBanner.mobile_bg_image}
                    onChange={(url) => setHeroBanner((prev) => ({ ...prev, mobile_bg_image: url }))}
                    folder="cms/golf-facts"
                    previewH={160}
                    spec={IMAGE_SPECS.hero_banner_mobile}
                  />
                  <ImageHint recommended={IMAGE_SPECS.hero_banner_mobile?.recommended} maxSize={`${IMAGE_SPECS.hero_banner_mobile?.maxMB}MB`} note={IMAGE_SPECS.hero_banner_mobile?.note} />
                </div>
                <div className="row" style={{ marginTop: 16 }}>
                  <div className="col-md-6 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label required">Page Title</label>
                      <input className="form-input" value={heroBanner.title} onChange={(e) => setHeroBanner((prev) => ({ ...prev, title: e.target.value }))} placeholder="e.g. Little Golf Facts" />
                    </div>
                  </div>
                  <div className="col-md-6 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label">Subtitle</label>
                      <textarea className="form-input" rows={2} value={heroBanner.subtitle} onChange={(e) => setHeroBanner((prev) => ({ ...prev, subtitle: e.target.value }))} placeholder="Short description shown below the title..." />
                      <CharCounter value={heroBanner.subtitle} max={LIMITS.short_description.max} />
                    </div>
                  </div>
                </div>
              </fieldset>
            </SectionCard>
          </div>

          {/* 2. Introduction */}
          <div ref={(node) => { sectionRefs.current.introSection = node; }}>
            <SectionCard sectionKey="introSection" isOpen={openSections.introSection}
              onToggleOpen={() => setOpenSections((prev) => ({ ...prev, introSection: !prev.introSection }))}
              isEditing={activeEditSection === "introSection"} onEdit={() => startEditingSection("introSection")}
              onSave={() => saveSection("introSection")} onCancel={() => cancelEditingSection("introSection")}
              isSaving={savingSection === "introSection"} onLockedClick={() => notifyReadOnly(SECTION_META.introSection.title)}
            >
              <fieldset disabled={activeEditSection !== "introSection"} style={{ border: "none", padding: 0, margin: 0 }}>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label required">Section Heading</label>
                  <input className="form-input" value={introSection.heading} onChange={(e) => setIntroSection((prev) => ({ ...prev, heading: e.target.value }))} placeholder="e.g. India's Most Fascinating Golf Facts" />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <ReactQuill
                    theme="snow"
                    value={introSection.description || ""}
                    onChange={(val) => setIntroSection((prev) => ({ ...prev, description: val }))}
                    placeholder="Introductory paragraph shown below the heading..."
                    style={{ backgroundColor: "white", borderRadius: 8, marginBottom: 8 }}
                    modules={QUILL_MODULES}
                  />
                  <CharCounter value={(introSection.description || "").replace(/<[^>]*>/g, "")} max={LIMITS.description.max} />
                </div>
              </fieldset>
            </SectionCard>
          </div>

          {/* 3. Golf Facts List */}
          <div ref={(node) => { sectionRefs.current.facts = node; }}>
            <SectionCard sectionKey="facts" isOpen={openSections.facts}
              onToggleOpen={() => setOpenSections((prev) => ({ ...prev, facts: !prev.facts }))}
              isEditing={activeEditSection === "facts"} onEdit={() => startEditingSection("facts")}
              onSave={() => saveSection("facts")} onCancel={() => cancelEditingSection("facts")}
              isSaving={savingSection === "facts"} onLockedClick={() => notifyReadOnly(SECTION_META.facts.title)}
            >
              <fieldset disabled={activeEditSection !== "facts"} style={{ border: "none", padding: 0, margin: 0 }}>
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
                  Add each golf fact below. Use ↑ ↓ arrows to reorder.
                </p>
                {facts.map((fact, idx) => (
                  <div key={idx} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 16, marginBottom: 16, background: "#f8fafc" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                      <span style={{ fontWeight: 700, color: "#0369a1", fontSize: 16 }}>{String(idx + 1).padStart(2, "0")}.</span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button type="button" className="action-button secondary" style={{ fontSize: 11, padding: "3px 8px" }} onClick={() => moveFact(idx, -1)} disabled={idx === 0} title="Move up">↑</button>
                        <button type="button" className="action-button secondary" style={{ fontSize: 11, padding: "3px 8px" }} onClick={() => moveFact(idx, 1)} disabled={idx === facts.length - 1} title="Move down">↓</button>
                        <button type="button" className="action-button danger" style={{ fontSize: 11, padding: "3px 10px" }} onClick={() => removeFact(idx)}>
                          <DeleteOutlined /> Remove
                        </button>
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 12 }}>
                      <label className="form-label required">Fact Title</label>
                      <input className="form-input" value={fact.title} onChange={(e) => updateFact(idx, "title", e.target.value)} placeholder="e.g. Royal Calcutta Golf Club in Kolkata" />
                    </div>
                    <div className="form-group">
                      <label className="form-label required">Fact Description</label>
                      <ReactQuill
                        theme="snow"
                        value={fact.description || ""}
                        onChange={(val) => updateFact(idx, "description", val)}
                        placeholder="Enter the detailed description for this fact..."
                        style={{ backgroundColor: "white", borderRadius: 8, marginBottom: 8 }}
                        modules={QUILL_MODULES}
                      />
                      <CharCounter value={(fact.description || "").replace(/<[^>]*>/g, "")} max={LIMITS.description.max} />
                      <FieldHint text="Describe the golf fact in detail. Include historical context, significance, and interesting details." />
                    </div>
                  </div>
                ))}
                <button type="button" className="action-button secondary" onClick={addFact}>
                  <PlusOutlined /> Add Golf Fact
                </button>
              </fieldset>
            </SectionCard>
          </div>

          <div className="content-card">
            <div className="content-card-body">
              <div className="form-actions">
                <Link to="/admin/cms/golf-facts/list">
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
            aria-label="Open quick jump for Golf Facts sections"
            title="Quick Jump"
          >
            <AppstoreOutlined />
          </button>
        </div>
      </div>
    </div>
  );
}
