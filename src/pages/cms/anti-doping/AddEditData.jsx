import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, notification } from "antd";
import {
  ArrowLeftOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  PictureOutlined,
  PlusOutlined,
  SaveOutlined,
  TeamOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import ImageUploadField from "components/ui/ImageUploadField";
import CmsSetupTopActions from "components/cms/CmsSetupTopActions";
import { addEditAntiDoping, listAntiDoping } from "services/antiDoping.service";
import { CharCounter, ImageHint } from "components/ui/FieldHint";
import { LIMITS, IMAGE_SPECS } from "utils/fieldValidation";
import { TOUR_TYPE_OPTIONS, shouldUseExistingTourTypeRecord } from "utils/tourType";
import "styles/admin-pages.css";

/* ── defaults ─────────────────────────────────────────────── */
const emptyMember = () => ({
  photo: "",
  name: "",
  designation: "",
  know_more_content: "",
  know_more_url: "",
});

const emptyResource = () => ({
  title: "",
  file_url: "",
  show_download_button: false,
  button_text: "Download PDF",
});

const DEFAULT_TABS = [
  { tab_name: "Committees", members: [emptyMember()] },
  { tab_name: "Hearing Panel", members: [emptyMember()] },
  { tab_name: "TUE Committee", members: [emptyMember()] },
];

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

/* ── section config ───────────────────────────────────────── */
const SECTION_KEYS = ["general", "heroBanner", "membersSection", "resourcesSection"];

const SECTION_META = {
  general:         { number: "0", title: "General" },
  heroBanner:      { number: "1", title: "Hero Banner" },
  membersSection:  { number: "2", title: "Anti-Doping Members" },
  resourcesSection:{ number: "3", title: "Anti-Doping Resources" },
};

const SECTION_NAV_ITEMS = SECTION_KEYS.map((key) => ({
  key,
  label: `${SECTION_META[key].number}. ${SECTION_META[key].title}`,
}));

/* ── helpers ──────────────────────────────────────────────── */
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
      membersSection: {
        heading: c.membersSection?.heading || "",
        description: c.membersSection?.description || "",
        tabs: c.membersSection?.tabs?.length ? c.membersSection.tabs : [...DEFAULT_TABS],
      },
      resourcesSection: {
        bg_image: c.resourcesSection?.bg_image || "",
        heading: c.resourcesSection?.heading || "",
        description: c.resourcesSection?.description || "",
        resources: c.resourcesSection?.resources?.length
          ? c.resourcesSection.resources
          : [emptyResource()],
      },
    };
  } catch {
    return {
      heroBanner: { bg_image: "", mobile_bg_image: "", title: "", subtitle: "" },
      membersSection: { heading: "", description: "", tabs: [...DEFAULT_TABS] },
      resourcesSection: { bg_image: "", heading: "", description: "", resources: [emptyResource()] },
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
  const distance = Math.abs(index - center);
  return Math.round(distance * 10);
};

/* ── SectionCard ──────────────────────────────────────────── */
const SectionCard = ({
  sectionKey,
  children,
  isOpen,
  onToggleOpen,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  isSaving,
  onLockedClick,
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
export default function AntiDopingAddEditData() {
  const location = useLocation();
  const sectionRefs = useRef({});
  const state = useMemo(() => location?.state || {}, [location?.state]);
  const requestedOpenSectionKey = state?.openSectionKey || state?.sectionKey || "";

  /* ── parse initial content ─────────────────────────────── */
  const raw = state?.content ?? state?.result?.content ?? state;
  const initial = parseContent(raw);

  /* ── core state ────────────────────────────────────────── */
  const [isFetching, setIsFetching] = useState(false);
  const [id, setId] = useState(state?.id ?? state?.result?.id ?? "");
  const [status, setStatus] = useState(state?.status ?? "A");
  const [savedStatus, setSavedStatus] = useState(state?.status ?? "A");
  const [tourType, setTourType] = useState(state?.tour_type ?? state?.result?.tour_type ?? "M");
  const [savedTourType, setSavedTourType] = useState(state?.tour_type ?? state?.result?.tour_type ?? "M");

  /* ── per-section state pairs ───────────────────────────── */
  const [heroBanner, setHeroBanner] = useState(initial.heroBanner);
  const [savedHeroBanner, setSavedHeroBanner] = useState(initial.heroBanner);

  const [membersSection, setMembersSection] = useState(initial.membersSection);
  const [savedMembersSection, setSavedMembersSection] = useState(initial.membersSection);

  const [resourcesSection, setResourcesSection] = useState(initial.resourcesSection);
  const [savedResourcesSection, setSavedResourcesSection] = useState(initial.resourcesSection);

  /* ── ui state ──────────────────────────────────────────── */
  const [activeEditSection, setActiveEditSection] = useState(() =>
    normalizeOpenSectionKey(requestedOpenSectionKey)
  );
  const [savingSection, setSavingSection] = useState("");
  const [openSections, setOpenSections] = useState(() =>
    buildSectionOpenState({ openKey: requestedOpenSectionKey })
  );
  const [quickJumpOpen, setQuickJumpOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  /* ── hydrate from a loaded record ─────────────────────── */
  const hydrateForm = (record = {}) => {
    const c = parseContent(record?.content ?? record?.result?.content ?? record);
    setHeroBanner(c.heroBanner);
    setSavedHeroBanner(c.heroBanner);
    setMembersSection(c.membersSection);
    setSavedMembersSection(c.membersSection);
    setResourcesSection(c.resourcesSection);
    setSavedResourcesSection(c.resourcesSection);
    if (record?.id) setId(record.id);
    if (record?.result?.id) setId(record.result.id);
    if (record?.status) { setStatus(record.status); setSavedStatus(record.status); }
    if (record?.result?.status) { setStatus(record.result.status); setSavedStatus(record.result.status); }
    if (record?.tour_type) { setTourType(record.tour_type); setSavedTourType(record.tour_type); }
    if (record?.result?.tour_type) { setTourType(record.result.tour_type); setSavedTourType(record.result.tour_type); }
  };

  /* ── fetch fresh data on mount ─────────────────────────── */
  useEffect(() => {
    document.title = `PGTI || ${id ? "Edit" : "Setup"} Anti-Doping`;
    let active = true;
    const load = async () => {
      if (state && Object.keys(state).length > 0 && state.id) hydrateForm(state);
      try {
        setIsFetching(true);
        const res = await listAntiDoping({ tour_type: tourType });
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

  /* ── build full content for save ──────────────────────── */
  const buildContent = () => ({ heroBanner, membersSection, resourcesSection });

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
    if (sectionKey === "general") { setStatus(savedStatus); setTourType(savedTourType); }
    else if (sectionKey === "heroBanner") setHeroBanner(savedHeroBanner);
    else if (sectionKey === "membersSection") setMembersSection(savedMembersSection);
    else if (sectionKey === "resourcesSection") setResourcesSection(savedResourcesSection);
    setActiveEditSection((prev) => (prev === sectionKey ? "" : prev));
  };

  const copyFromMainTour = async () => {
    try {
      setIsFetching(true);
      const res = await listAntiDoping({ tour_type: "M" });
      if (!res?.status || !res?.result?.id) {
        notification.warning({ message: "Main Tour data not found", description: "Please save the Main Tour Anti-Doping page first.", placement: "topRight", duration: 3 });
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
          const res = await addEditAntiDoping({
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
            setSavedMembersSection({ ...membersSection });
            setSavedResourcesSection({ ...resourcesSection });
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

  /* ── member tab helpers ─────────────────────────────────── */
  const updateMember = (tabIdx, memberIdx, field, val) =>
    setMembersSection((f) => ({
      ...f,
      tabs: f.tabs.map((tab, ti) =>
        ti !== tabIdx ? tab : {
          ...tab,
          members: tab.members.map((m, mi) => (mi === memberIdx ? { ...m, [field]: val } : m)),
        }
      ),
    }));

  const updateTabName = (tabIdx, value) =>
    setMembersSection((f) => ({
      ...f,
      tabs: f.tabs.map((tab, ti) => (ti === tabIdx ? { ...tab, tab_name: value } : tab)),
    }));

  const addMember = (tabIdx) =>
    setMembersSection((f) => ({
      ...f,
      tabs: f.tabs.map((tab, ti) =>
        ti === tabIdx ? { ...tab, members: [...tab.members, emptyMember()] } : tab
      ),
    }));

  const removeMember = (tabIdx, memberIdx) =>
    setMembersSection((f) => ({
      ...f,
      tabs: f.tabs.map((tab, ti) => {
        if (ti !== tabIdx) return tab;
        const members = tab.members.filter((_, mi) => mi !== memberIdx);
        return { ...tab, members: members.length ? members : [emptyMember()] };
      }),
    }));

  /* ── resource helpers ──────────────────────────────────── */
  const updateResource = (idx, field, val) =>
    setResourcesSection((f) => ({
      ...f,
      resources: f.resources.map((r, i) => (i === idx ? { ...r, [field]: val } : r)),
    }));

  const addResource = () =>
    setResourcesSection((f) => ({ ...f, resources: [...f.resources, emptyResource()] }));

  const removeResource = (idx) =>
    setResourcesSection((f) => {
      const updated = f.resources.filter((_, i) => i !== idx);
      return { ...f, resources: updated.length ? updated : [emptyResource()] };
    });

  /* ══════════════════════════════════════════════════════ */
  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">{id ? "Edit Anti-Doping Page" : "Setup Anti-Doping Page"}</h1>
            <p className="page-subtitle">Manage all sections of the Anti-Doping page</p>
            {isFetching && (
              <p className="page-subtitle" style={{ marginTop: 6 }}>Loading saved data...</p>
            )}
          </div>
          <Link to="/admin/cms/anti-doping/list">
            <button type="button" className="action-button secondary">
              <ArrowLeftOutlined /> Back to List
            </button>
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

          {/* ── 1. Hero Banner ─────────────────────────────── */}
          <div ref={(node) => { sectionRefs.current.heroBanner = node; }}>
            <SectionCard
              sectionKey="heroBanner"
              isOpen={openSections.heroBanner}
              onToggleOpen={() => setOpenSections((prev) => ({ ...prev, heroBanner: !prev.heroBanner }))}
              isEditing={activeEditSection === "heroBanner"}
              onEdit={() => startEditingSection("heroBanner")}
              onSave={() => saveSection("heroBanner")}
              onCancel={() => cancelEditingSection("heroBanner")}
              isSaving={savingSection === "heroBanner"}
              onLockedClick={() => notifyReadOnly(SECTION_META.heroBanner.title)}
            >
              <fieldset disabled={activeEditSection !== "heroBanner"} style={{ border: "none", padding: 0, margin: 0 }}>
                <ImageUploadField
                  label="Background Image"
                  value={heroBanner.bg_image}
                  onChange={(url) => setHeroBanner((prev) => ({ ...prev, bg_image: url }))}
                  folder="cms/anti-doping"
                  previewH={160}
                  spec={IMAGE_SPECS["cms/anti-doping"]}
                />
                <ImageHint
                  recommended={IMAGE_SPECS["cms/anti-doping"]?.recommended}
                  maxSize={`${IMAGE_SPECS["cms/anti-doping"]?.maxMB}MB`}
                  note={IMAGE_SPECS["cms/anti-doping"]?.note}
                />
                <div style={{ marginTop: 16 }}>
                  <ImageUploadField
                    label="Mobile Banner Image"
                    value={heroBanner.mobile_bg_image}
                    onChange={(url) => setHeroBanner((prev) => ({ ...prev, mobile_bg_image: url }))}
                    folder="cms/anti-doping"
                    previewH={160}
                    spec={IMAGE_SPECS.hero_banner_mobile}
                  />
                  <ImageHint
                    recommended={IMAGE_SPECS.hero_banner_mobile?.recommended}
                    maxSize={`${IMAGE_SPECS.hero_banner_mobile?.maxMB}MB`}
                    note={IMAGE_SPECS.hero_banner_mobile?.note}
                  />
                </div>
                <div className="form-row" style={{ marginTop: 16 }}>
                  <div className="form-group">
                    <label className="form-label required">Title</label>
                    <input
                      className="form-input"
                      value={heroBanner.title}
                      onChange={(e) => setHeroBanner((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Anti-Doping"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subtitle / Description</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      value={heroBanner.subtitle}
                      onChange={(e) => setHeroBanner((prev) => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="Brief description shown under the title..."
                    />
                    <CharCounter value={heroBanner.subtitle} max={LIMITS.short_description.max} />
                  </div>
                </div>
              </fieldset>
            </SectionCard>
          </div>

          {/* ── 2. Anti-Doping Members ──────────────────────── */}
          <div ref={(node) => { sectionRefs.current.membersSection = node; }}>
            <SectionCard
              sectionKey="membersSection"
              isOpen={openSections.membersSection}
              onToggleOpen={() => setOpenSections((prev) => ({ ...prev, membersSection: !prev.membersSection }))}
              isEditing={activeEditSection === "membersSection"}
              onEdit={() => startEditingSection("membersSection")}
              onSave={() => saveSection("membersSection")}
              onCancel={() => cancelEditingSection("membersSection")}
              isSaving={savingSection === "membersSection"}
              onLockedClick={() => notifyReadOnly(SECTION_META.membersSection.title)}
            >
              <fieldset disabled={activeEditSection !== "membersSection"} style={{ border: "none", padding: 0, margin: 0 }}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label required">Section Heading</label>
                    <input
                      className="form-input"
                      value={membersSection.heading}
                      onChange={(e) => setMembersSection((f) => ({ ...f, heading: e.target.value }))}
                      placeholder="e.g. Anti-Doping Members"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Section Description</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      value={membersSection.description}
                      onChange={(e) => setMembersSection((f) => ({ ...f, description: e.target.value }))}
                      placeholder="Short description below the heading..."
                    />
                    <CharCounter value={membersSection.description} max={LIMITS.short_description.max} />
                  </div>
                </div>

                {/* Tab selector */}
                <div style={{ display: "flex", gap: 8, marginBottom: 20, marginTop: 8, borderBottom: "2px solid #e2e8f0" }}>
                  {membersSection.tabs.map((tab, ti) => (
                    <button
                      key={ti}
                      type="button"
                      onClick={() => setActiveTab(ti)}
                      style={{
                        padding: "8px 20px", border: "none",
                        borderBottom: activeTab === ti ? "3px solid #0369a1" : "3px solid transparent",
                        background: "none", fontWeight: activeTab === ti ? 700 : 400,
                        color: activeTab === ti ? "#0369a1" : "#64748b",
                        cursor: "pointer", fontSize: 14, transition: "all 0.2s",
                      }}
                    >
                      {tab.tab_name}
                      <span style={{ marginLeft: 6, background: "#e2e8f0", borderRadius: 10, padding: "1px 7px", fontSize: 11 }}>
                        {tab.members.length}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="form-group" style={{ maxWidth: 420, marginBottom: 18 }}>
                  <label className="form-label required">Active Tab Label</label>
                  <input
                    className="form-input"
                    value={membersSection.tabs[activeTab]?.tab_name || ""}
                    onChange={(e) => updateTabName(activeTab, e.target.value)}
                    placeholder="e.g. Committees, Team, Hearing Panel"
                  />
                  <small style={{ color: "#64748b", display: "block", marginTop: 6 }}>
                    The frontend response also exposes this tab as a matching key, for example Team becomes team[].
                  </small>
                </div>

                {/* Members for active tab */}
                {membersSection.tabs[activeTab]?.members.map((member, mi) => (
                  <div key={mi} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 16, marginBottom: 16, background: "#f8fafc" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontWeight: 600, color: "#334155", fontSize: 13 }}>Member {mi + 1}</span>
                      <button type="button" className="action-button danger" style={{ fontSize: 11, padding: "3px 10px" }} onClick={() => removeMember(activeTab, mi)}>
                        <DeleteOutlined /> Remove
                      </button>
                    </div>
                    <div className="row">
                      <div className="col-md-3 col-12 mb-3">
                        <ImageUploadField
                          label="Photo"
                          value={member.photo}
                          onChange={(url) => updateMember(activeTab, mi, "photo", url)}
                          folder="cms/anti-doping"
                          previewH={120}
                          spec={IMAGE_SPECS.users}
                        />
                        <ImageHint
                          recommended={IMAGE_SPECS.users?.recommended}
                          maxSize={`${IMAGE_SPECS.users?.maxMB}MB`}
                          note="Square crop preferred. Professional headshot."
                        />
                      </div>
                      <div className="col-md-9 col-12 mb-3">
                        <div className="row">
                          <div className="col-md-6 col-12 mb-3">
                            <div className="form-group">
                              <label className="form-label required">Name</label>
                              <input className="form-input" value={member.name} onChange={(e) => updateMember(activeTab, mi, "name", e.target.value)} placeholder="Full name" />
                            </div>
                          </div>
                          <div className="col-md-6 col-12 mb-3">
                            <div className="form-group">
                              <label className="form-label">Designation / Role</label>
                              <input className="form-input" value={member.designation} onChange={(e) => updateMember(activeTab, mi, "designation", e.target.value)} placeholder="e.g. Chairman, Member" />
                            </div>
                          </div>
                          <div className="col-12 mb-3">
                            <div className="form-group">
                              <label className="form-label">
                                Know More — External URL
                                <span style={{ color: "#94a3b8", fontWeight: 400, fontSize: 12 }}> (optional — overrides content below if filled)</span>
                              </label>
                              <input
                                className="form-input"
                                value={member.know_more_url}
                                onChange={(e) => updateMember(activeTab, mi, "know_more_url", e.target.value)}
                                placeholder="Leave blank to use rich-text content below"
                              />
                            </div>
                          </div>
                          <div className="col-12 mb-3">
                            <div className="form-group">
                              <label className="form-label">
                                Know More — Content
                                <span style={{ color: "#94a3b8", fontWeight: 400, fontSize: 12 }}> (shown in a popup / detail page)</span>
                              </label>
                              <ReactQuill
                                theme="snow"
                                value={member.know_more_content || ""}
                                onChange={(val) => updateMember(activeTab, mi, "know_more_content", val)}
                                placeholder="Enter bio, achievements, or any content shown when user clicks 'Know More'..."
                                style={{ backgroundColor: "white", borderRadius: 8, marginBottom: 8 }}
                                modules={QUILL_MODULES}
                              />
                              <CharCounter value={(member.know_more_content || "").replace(/<[^>]*>/g, "")} max={LIMITS.description.max} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" className="action-button secondary" onClick={() => addMember(activeTab)}>
                  <PlusOutlined /> Add Member to {membersSection.tabs[activeTab]?.tab_name}
                </button>
              </fieldset>
            </SectionCard>
          </div>

          {/* ── 3. Anti-Doping Resources ────────────────────── */}
          <div ref={(node) => { sectionRefs.current.resourcesSection = node; }}>
            <SectionCard
              sectionKey="resourcesSection"
              isOpen={openSections.resourcesSection}
              onToggleOpen={() => setOpenSections((prev) => ({ ...prev, resourcesSection: !prev.resourcesSection }))}
              isEditing={activeEditSection === "resourcesSection"}
              onEdit={() => startEditingSection("resourcesSection")}
              onSave={() => saveSection("resourcesSection")}
              onCancel={() => cancelEditingSection("resourcesSection")}
              isSaving={savingSection === "resourcesSection"}
              onLockedClick={() => notifyReadOnly(SECTION_META.resourcesSection.title)}
            >
              <fieldset disabled={activeEditSection !== "resourcesSection"} style={{ border: "none", padding: 0, margin: 0 }}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label required">Section Heading</label>
                    <input
                      className="form-input"
                      value={resourcesSection.heading}
                      onChange={(e) => setResourcesSection((f) => ({ ...f, heading: e.target.value }))}
                      placeholder="e.g. Anti-Doping Resources"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Section Description</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      value={resourcesSection.description}
                      onChange={(e) => setResourcesSection((f) => ({ ...f, description: e.target.value }))}
                      placeholder="Description shown on the left panel..."
                    />
                    <CharCounter value={resourcesSection.description} max={LIMITS.short_description.max} />
                  </div>
                </div>

                <div style={{ marginTop: 8, marginBottom: 20 }}>
                  <ImageUploadField
                    label="Left Background Image"
                    value={resourcesSection.bg_image}
                    onChange={(url) => setResourcesSection((f) => ({ ...f, bg_image: url }))}
                    folder="cms/anti-doping"
                    previewH={140}
                    spec={IMAGE_SPECS["cms/anti-doping"]}
                  />
                  <ImageHint
                    recommended="800×600 px"
                    maxSize="2MB"
                    note="Background image for the resources panel. Dark or neutral tones work best."
                  />
                </div>

                <h4 style={{ fontSize: 14, fontWeight: 600, color: "#334155", margin: "0 0 12px" }}>Resource Items</h4>
                {resourcesSection.resources.map((res, idx) => (
                  <div key={idx} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 16, marginBottom: 12, background: "#f8fafc" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ fontWeight: 600, color: "#0369a1", fontSize: 13 }}>
                        {String(idx + 1).padStart(2, "0")}. Resource
                      </span>
                      <button type="button" className="action-button danger" style={{ fontSize: 11, padding: "3px 10px" }} onClick={() => removeResource(idx)}>
                        <DeleteOutlined /> Remove
                      </button>
                    </div>
                    <div className="row">
                      <div className="col-md-5 col-12 mb-3">
                        <div className="form-group">
                          <label className="form-label required">Resource Title</label>
                          <input className="form-input" value={res.title} onChange={(e) => updateResource(idx, "title", e.target.value)} placeholder="e.g. PGTI Anti-Doping Policy" />
                        </div>
                      </div>
                      <div className="col-md-5 col-12 mb-3">
                        <div className="form-group">
                          <label className="form-label">File / PDF URL</label>
                          <input className="form-input" value={res.file_url} onChange={(e) => updateResource(idx, "file_url", e.target.value)} placeholder="https://cdn.example.com/document.pdf" />
                        </div>
                      </div>
                      <div className="col-md-2 col-12 mb-3">
                        <div className="form-group">
                          <label className="form-label">Download Button</label>
                          <div className="permission-item" style={{ marginTop: 4 }} onClick={() => updateResource(idx, "show_download_button", !res.show_download_button)}>
                            <div className="permission-checkbox">
                              <input type="checkbox" checked={!!res.show_download_button} readOnly />
                            </div>
                            <div className="permission-content">
                              <label className="permission-label">Show</label>
                            </div>
                          </div>
                        </div>
                      </div>
                      {res.show_download_button && (
                        <div className="col-md-4 col-12 mb-3">
                          <div className="form-group">
                            <label className="form-label">Button Label</label>
                            <input className="form-input" value={res.button_text} onChange={(e) => updateResource(idx, "button_text", e.target.value)} placeholder="e.g. Download PDF" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <button type="button" className="action-button secondary" onClick={addResource}>
                  <PlusOutlined /> Add Resource
                </button>
              </fieldset>
            </SectionCard>
          </div>

          {/* ── bottom cancel bar ──────────────────────────── */}
          <div className="content-card">
            <div className="content-card-body">
              <div className="form-actions">
                <Link to="/admin/cms/anti-doping/list">
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
            aria-label="Open quick jump for Anti-Doping sections"
            title="Quick Jump"
          >
            <AppstoreOutlined />
          </button>
        </div>
      </div>
    </div>
  );
}
