import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, notification } from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  DownOutlined,
  UpOutlined,
  SaveOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import { addEditAboutUs, listAboutUs } from 'services/aboutUs.service';
import ImageUploadField from 'components/ui/ImageUploadField';
import { CharCounter, ImageHint } from 'components/ui/FieldHint';
import { LIMITS, IMAGE_SPECS, stripHtml } from 'utils/fieldValidation';
import "styles/admin-pages.css";

const emptyHeroBanner = () => ({ bg_image: "", title: "", subtitle: "" });
const emptyAbout = () => ({ title: "", image: "", paragraphs: [""] });
const emptyKeyMilestones = () => ({
  heading: "",
  intro: "",
  milestones: [{ year: "", cardTitle: "", description: "" }],
});
const emptyMission = () => ({
  heading: "",
  subtitle: "",
  image: "",
  cards: [
    { text: "", accent: "secondary" },
    { text: "", accent: "secondary" },
    { text: "", accent: "secondary" },
    { text: "", accent: "secondary" },
  ],
});
const emptyVision = () => ({
  heading: "",
  subtitle: "",
  image: "",
  items: [
    { number: "01", text: "" },
    { number: "02", text: "" },
    { number: "03", text: "" },
    { number: "04", text: "" },
  ],
});
const emptyLegacy = () => ({ heading: "", description: "", image: "" });

const DEFAULT_FILTERS = ["All", "CEO", "Advisors", "Board Members", "TPC Members", "Disciplinary Committee", "Screening Committee"];
const emptyTeam = () => ({
  heading: "",
  subtitle: "",
  filters: [...DEFAULT_FILTERS],
  members: [{ name: "", role: "", title: "", bio: "", image: "", filter: "All" }],
});

function ensureArray(arr, defaultItem) {
  if (Array.isArray(arr) && arr.length > 0) return arr;
  return [defaultItem];
}

function ensureExactly4(arr, defaultItem) {
  const base = Array.isArray(arr) ? arr : [];
  const filled = [...base];
  while (filled.length < 4) filled.push({ ...defaultItem });
  return filled.slice(0, 4);
}

function parseContent(raw) {
  if (!raw) return null;
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return null; }
  }
  return raw;
}

function normalizeAboutContent(raw) {
  const parsed = parseContent(raw);
  return {
    heroBanner: parsed?.heroBanner
      ? { ...emptyHeroBanner(), ...parsed.heroBanner }
      : emptyHeroBanner(),
    about: parsed?.about
      ? { ...emptyAbout(), ...parsed.about, paragraphs: ensureArray(parsed.about.paragraphs, "") }
      : emptyAbout(),
    keyMilestones: parsed?.keyMilestones
      ? { ...emptyKeyMilestones(), ...parsed.keyMilestones, milestones: ensureArray(parsed.keyMilestones.milestones, { year: "", cardTitle: "", description: "" }) }
      : emptyKeyMilestones(),
    mission: parsed?.mission
      ? { ...emptyMission(), ...parsed.mission, cards: ensureExactly4(parsed.mission.cards, { text: "", accent: "secondary" }) }
      : emptyMission(),
    vision: parsed?.vision
      ? { ...emptyVision(), ...parsed.vision, items: ensureExactly4(parsed.vision.items, { number: "01", text: "" }) }
      : emptyVision(),
    legacy: parsed?.legacy
      ? { ...emptyLegacy(), ...parsed.legacy }
      : emptyLegacy(),
    team: parsed?.team
      ? {
          ...emptyTeam(),
          ...parsed.team,
          filters: ensureArray(parsed.team.filters, "All"),
          members: ensureArray(parsed.team.members, { name: "", role: "", title: "", bio: "", image: "", filter: "All" }),
        }
      : emptyTeam(),
  };
}

function hasSavedAboutContent(record) {
  const parsed = parseContent(record?.content ?? record?.result?.content ?? record);
  if (!parsed || typeof parsed !== "object") return false;

  return Boolean(
    parsed?.heroBanner ||
    parsed?.about ||
    parsed?.keyMilestones ||
    parsed?.mission ||
    parsed?.vision ||
    parsed?.legacy ||
    parsed?.team
  );
}

const SECTION_KEYS = ["general", "heroBanner", "about", "keyMilestones", "mission", "vision", "legacy", "team"];

const SECTION_META = {
  general: { number: "0", title: "General" },
  heroBanner: { number: "1", title: "Hero Banner" },
  about: { number: "2", title: "About PGTI" },
  keyMilestones: { number: "3", title: "Key Milestones (Journey)" },
  mission: { number: "4", title: "Our Mission" },
  vision: { number: "5", title: "Our Vision" },
  legacy: { number: "6", title: "Legacy & Impact" },
  team: { number: "7", title: "The Team Behind the Tour" },
};

const SECTION_NAV_ITEMS = SECTION_KEYS.map((key) => ({
  key,
  label: `${SECTION_META[key]?.number}. ${SECTION_META[key]?.title}`,
}));

const getQuickJumpCurveOffset = (index, total) => {
  if (total <= 1) return 0;
  const center = (total - 1) / 2;
  const distance = Math.abs(index - center);
  return Math.round(distance * 10);
};

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

const normalizeOpenSectionKey = (value = "") => (SECTION_KEYS.includes(value) ? value : "");

const buildSectionOpenState = ({ openKey = "" } = {}) => {
  const normalized = normalizeOpenSectionKey(openKey);
  return SECTION_KEYS.reduce((acc, key) => {
    acc[key] = normalized ? key === normalized : false;
    return acc;
  }, {});
};

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
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              textAlign: "left",
            }}
          >
            <button
              type="button"
              onClick={onToggleOpen}
              style={{
                border: "none",
                background: "transparent",
                padding: 0,
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flex: 1,
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
                    position: "absolute",
                    inset: 0,
                    border: "none",
                    background: "rgba(248, 250, 252, 0.28)",
                    cursor: "not-allowed",
                    borderRadius: 12,
                  }}
                  aria-label={`This ${meta.title} section is read-only until you click edit`}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function AboutUsAddEditData() {
  const location = useLocation();
  const sectionRefs = useRef({});
  const state = useMemo(() => location?.state || {}, [location?.state]);
  const requestedOpenSectionKey = state?.openSectionKey || state?.sectionKey || "";
  const raw = state?.content ?? state?.result?.content ?? state;
  const initialContent = normalizeAboutContent(raw);

  const [isFetching, setIsFetching] = useState(false);
  const [id, setId] = useState(state?.id ?? state?.result?.id ?? "");
  const [status, setStatus] = useState(state?.status ?? "A");
  const [savedStatus, setSavedStatus] = useState(state?.status ?? "A");
  const [activeEditSection, setActiveEditSection] = useState(() => normalizeOpenSectionKey(requestedOpenSectionKey));
  const [savingSection, setSavingSection] = useState("");
  const [openSections, setOpenSections] = useState(() =>
    buildSectionOpenState({ openKey: requestedOpenSectionKey })
  );
  const [quickJumpOpen, setQuickJumpOpen] = useState(false);

  const [heroBanner, setHeroBanner] = useState(initialContent.heroBanner);
  const [savedHeroBanner, setSavedHeroBanner] = useState(initialContent.heroBanner);
  const [about, setAbout] = useState(initialContent.about);
  const [savedAbout, setSavedAbout] = useState(initialContent.about);
  const [keyMilestones, setKeyMilestones] = useState(initialContent.keyMilestones);
  const [savedKeyMilestones, setSavedKeyMilestones] = useState(initialContent.keyMilestones);
  const [mission, setMission] = useState(initialContent.mission);
  const [savedMission, setSavedMission] = useState(initialContent.mission);
  const [vision, setVision] = useState(initialContent.vision);
  const [savedVision, setSavedVision] = useState(initialContent.vision);
  const [legacy, setLegacy] = useState(initialContent.legacy);
  const [savedLegacy, setSavedLegacy] = useState(initialContent.legacy);
  const [team, setTeam] = useState(initialContent.team);
  const [savedTeam, setSavedTeam] = useState(initialContent.team);
  const [newFilter, setNewFilter] = useState("");
  const [openMembers, setOpenMembers] = useState(initialContent.team.members.map(() => true));

  const hydrateForm = (record = {}) => {
    const next = normalizeAboutContent(record?.content ?? record?.result?.content ?? record);
    setHeroBanner(next.heroBanner);
    setSavedHeroBanner(next.heroBanner);
    setAbout(next.about);
    setSavedAbout(next.about);
    setKeyMilestones(next.keyMilestones);
    setSavedKeyMilestones(next.keyMilestones);
    setMission(next.mission);
    setSavedMission(next.mission);
    setVision(next.vision);
    setSavedVision(next.vision);
    setLegacy(next.legacy);
    setSavedLegacy(next.legacy);
    setTeam(next.team);
    setSavedTeam(next.team);
    setOpenMembers(next.team.members.map(() => true));

    if (record?.id) setId(record.id);
    if (record?.result?.id) setId(record.result.id);
    if (record?.status) setStatus(record.status);
    if (record?.result?.status) setStatus(record.result.status);
    if (record?.status) setSavedStatus(record.status);
    if (record?.result?.status) setSavedStatus(record.result.status);
  };

  useEffect(() => {
    let active = true;

    const loadRecord = async () => {
      if (state && Object.keys(state).length > 0 && hasSavedAboutContent(state)) {
        hydrateForm(state);
      }

      try {
        setIsFetching(true);
        const res = await listAboutUs({ id: state?.id || state?.result?.id, limit: 1 });
        if (active && res?.status && res?.result && hasSavedAboutContent(res.result)) {
          hydrateForm(res.result);
          setOpenSections(buildSectionOpenState({ openKey: requestedOpenSectionKey }));
          setActiveEditSection(normalizeOpenSectionKey(requestedOpenSectionKey));
        } else if (active && state && Object.keys(state).length > 0) {
          hydrateForm(state);
        }
      } finally {
        if (active) setIsFetching(false);
      }
    };

    loadRecord();
    return () => { active = false; };
  }, [requestedOpenSectionKey, state]);

  useEffect(() => {
    setOpenMembers((prev) => {
      if (team.members.length === 0) return [];
      if (prev.length === team.members.length) return prev;
      if (prev.length === 0) return team.members.map((_, index) => index === 0);
      return team.members.map((_, index) => prev[index] ?? false);
    });
  }, [team.members]);

  const buildContent = () => ({
    heroBanner: {
      bg_image: heroBanner.bg_image,
      title: heroBanner.title,
      subtitle: heroBanner.subtitle,
    },
    about: { title: about.title, image: about.image, paragraphs: about.paragraphs.filter((p) => String(p).trim()) },
    keyMilestones: {
      heading: keyMilestones.heading,
      intro: keyMilestones.intro,
      milestones: keyMilestones.milestones.filter((m) => m.year || m.cardTitle || m.description),
    },
    mission: {
      heading: mission.heading,
      subtitle: mission.subtitle,
      image: mission.image,
      cards: mission.cards, // always exactly 4
    },
    vision: {
      heading: vision.heading,
      subtitle: vision.subtitle,
      image: vision.image,
      items: vision.items, // always exactly 4
    },
    legacy: { heading: legacy.heading, description: legacy.description, image: legacy.image },
    team: {
      heading: team.heading,
      subtitle: team.subtitle,
      filters: team.filters.filter(Boolean),
      members: team.members.filter((m) => m.name || m.role),
    },
  });

  const notifyReadOnly = (sectionTitle) => {
    notification.open({
      message: "Section is locked",
      description: `Click Edit in "${sectionTitle}" before changing anything here.`,
      placement: "topRight",
      icon: <InfoCircleOutlined style={{ color: "#1d4ed8" }} />,
      duration: 2.5,
    });
  };

  const startEditingSection = (sectionKey) => {
    setActiveEditSection(sectionKey);
    setOpenSections((prev) => ({ ...prev, [sectionKey]: true }));
  };

  const focusSection = (sectionKey) => {
    setOpenSections(buildSectionOpenState({ openKey: sectionKey }));
    setQuickJumpOpen(false);
    setTimeout(() => {
      sectionRefs.current?.[sectionKey]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 120);
  };

  const cancelEditingSection = (sectionKey) => {
    if (sectionKey === "general") {
      setStatus(savedStatus);
    } else if (sectionKey === "heroBanner") {
      setHeroBanner(savedHeroBanner);
    } else if (sectionKey === "about") {
      setAbout(savedAbout);
    } else if (sectionKey === "keyMilestones") {
      setKeyMilestones(savedKeyMilestones);
    } else if (sectionKey === "mission") {
      setMission(savedMission);
    } else if (sectionKey === "vision") {
      setVision(savedVision);
    } else if (sectionKey === "legacy") {
      setLegacy(savedLegacy);
    } else if (sectionKey === "team") {
      setTeam(savedTeam);
      setOpenMembers(savedTeam.members.map(() => true));
    }
    setActiveEditSection((prev) => (prev === sectionKey ? "" : prev));
  };

  const saveSection = (sectionKey) => {
    Modal.confirm({
      title: "Save these changes?",
      icon: <ExclamationCircleOutlined style={{ color: "#1d4ed8" }} />,
      content: "Do you really want to edit and save these changes for this About Us section?",
      okText: "Yes, Save Changes",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          setSavingSection(sectionKey);
          const content = buildContent();
          const res = await addEditAboutUs({
            ...(id && { editId: id }),
            status,
            content: JSON.stringify(content),
          });
          if (res?.status === true) {
            if (!id && res.result?.id) setId(res.result.id);
            setSavedStatus(status);
            setSavedHeroBanner(heroBanner);
            setSavedAbout(about);
            setSavedKeyMilestones(keyMilestones);
            setSavedMission(mission);
            setSavedVision(vision);
            setSavedLegacy(legacy);
            setSavedTeam(team);
            setActiveEditSection("");
            notification.success({
              message: "Success",
              description: "About Us section saved successfully.",
              placement: "topRight",
              icon: <CheckCircleOutlined style={{ color: "green" }} />,
              duration: 2,
            });
          } else {
            notification.error({
              message: "Failed to save",
              description: res?.message || "Failed to save About Us",
              placement: "topRight",
              icon: <InfoCircleOutlined style={{ color: "red" }} />,
              duration: 2,
            });
          }
        } catch (err) {
          notification.error({
            message: "Error",
            description: "An error occurred. Please try again.",
            placement: "topRight",
            icon: <InfoCircleOutlined style={{ color: "red" }} />,
            duration: 2,
          });
        } finally {
          setSavingSection("");
        }
      },
    });
  };

  /* ── Filter chip helpers ── */
  const addFilter = () => {
    const trimmed = newFilter.trim();
    if (!trimmed || team.filters.includes(trimmed)) { setNewFilter(""); return; }
    setTeam((p) => ({ ...p, filters: [...p.filters, trimmed] }));
    setNewFilter("");
  };
  const removeFilter = (label) => {
    if (label === "All") return; // "All" is permanent
    setTeam((p) => ({
      ...p,
      filters: p.filters.filter((f) => f !== label),
      members: p.members.map((m) => m.filter === label ? { ...m, filter: "All" } : m),
    }));
  };

  const toggleMember = (index) => {
    setOpenMembers((prev) => prev.map((isOpen, i) => (i === index ? !isOpen : isOpen)));
  };

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">{id ? "Edit About Us" : "Add About Us"}</h1>
            <p className="page-subtitle">Edit all sections of the About Us page.</p>
            {isFetching && (
              <p className="page-subtitle" style={{ marginTop: 6 }}>Loading saved About Us data...</p>
            )}
          </div>
          <Link to="/admin/cms/about-us/list">
            <button type="button" className="action-button secondary">
              <ArrowLeftOutlined /> Back to List
            </button>
          </Link>
        </div>
      </div>

      <div className="page-body">
      <div className="modern-form">
        <input type="hidden" name="editId" value={id} />

        {/* General */}
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

        {/* 1. Hero Banner */}
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
              folder="cms/about-us"
              previewH={160}
              spec={IMAGE_SPECS['cms/about-us']}
            />
            <ImageHint
              recommended={IMAGE_SPECS['cms/about-us'].recommended}
              maxSize={`${IMAGE_SPECS['cms/about-us'].maxMB}MB`}
              note="Hero background image for the About Us page banner."
            />
            <div className="form-row" style={{ marginTop: 16 }}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={heroBanner.title}
                  onChange={(e) => setHeroBanner((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. About Us"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Subtitle / Description</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={heroBanner.subtitle}
                  onChange={(e) => setHeroBanner((prev) => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Brief hero description shown under the title..."
                />
                <CharCounter value={heroBanner.subtitle} max={LIMITS.short_description.max} />
              </div>
            </div>
          </fieldset>
        </SectionCard>
        </div>

        {/* 2. About PGTI */}
        <div ref={(node) => { sectionRefs.current.about = node; }}>
        <SectionCard
          sectionKey="about"
          isOpen={openSections.about}
          onToggleOpen={() => setOpenSections((prev) => ({ ...prev, about: !prev.about }))}
          isEditing={activeEditSection === "about"}
          onEdit={() => startEditingSection("about")}
          onSave={() => saveSection("about")}
          onCancel={() => cancelEditingSection("about")}
          isSaving={savingSection === "about"}
          onLockedClick={() => notifyReadOnly(SECTION_META.about.title)}
        >
          <fieldset disabled={activeEditSection !== "about"} style={{ border: "none", padding: 0, margin: 0 }}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input type="text" className="form-input" value={about.title}
                  onChange={(e) => setAbout((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. About PGTI" />
              </div>
              <ImageUploadField label="Section Image" value={about.image}
                onChange={(url) => setAbout((p) => ({ ...p, image: url }))}
                folder="cms/about-us" previewH={120} spec={IMAGE_SPECS['cms/about-us']} />
              <ImageHint recommended={IMAGE_SPECS['cms/about-us'].recommended}
                maxSize={`${IMAGE_SPECS['cms/about-us'].maxMB}MB`}
                note={IMAGE_SPECS['cms/about-us'].note} />
              <div className="form-group">
                <label className="form-label">Paragraphs</label>
                {about.paragraphs.map((p, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <ReactQuill
                          theme="snow"
                          value={p}
                          onChange={(value) =>
                            setAbout((prev) => ({
                              ...prev,
                              paragraphs: prev.paragraphs.map((x, j) => (j === i ? value : x)),
                            }))
                          }
                          modules={QUILL_MODULES}
                          placeholder={`Paragraph ${i + 1}`}
                        />
                      </div>
                      <button type="button" className="action-button secondary" style={{ alignSelf: "flex-start" }}
                        onClick={() => setAbout((prev) => ({ ...prev, paragraphs: prev.paragraphs.filter((_, j) => j !== i) }))}>
                        <MinusCircleOutlined />
                      </button>
                    </div>
                    <CharCounter value={stripHtml(p)} max={LIMITS.description.max} />
                  </div>
                ))}
                <button type="button" className="action-button secondary"
                  onClick={() => setAbout((p) => ({ ...p, paragraphs: [...p.paragraphs, "<p><br></p>"] }))}>
                  <PlusOutlined /> Add paragraph
                </button>
              </div>
          </fieldset>
        </SectionCard>
        </div>

        {/* 2. Key Milestones */}
        <div ref={(node) => { sectionRefs.current.keyMilestones = node; }}>
        <SectionCard
          sectionKey="keyMilestones"
          isOpen={openSections.keyMilestones}
          onToggleOpen={() => setOpenSections((prev) => ({ ...prev, keyMilestones: !prev.keyMilestones }))}
          isEditing={activeEditSection === "keyMilestones"}
          onEdit={() => startEditingSection("keyMilestones")}
          onSave={() => saveSection("keyMilestones")}
          onCancel={() => cancelEditingSection("keyMilestones")}
          isSaving={savingSection === "keyMilestones"}
          onLockedClick={() => notifyReadOnly(SECTION_META.keyMilestones.title)}
        >
          <fieldset disabled={activeEditSection !== "keyMilestones"} style={{ border: "none", padding: 0, margin: 0 }}>
              <div className="form-group">
                <label className="form-label">Section heading</label>
                <input type="text" className="form-input" value={keyMilestones.heading}
                  onChange={(e) => setKeyMilestones((p) => ({ ...p, heading: e.target.value }))}
                  placeholder="e.g. Our Journey Through the Years" />
              </div>
              <div className="form-group">
                <label className="form-label">Intro text</label>
                <textarea className="form-input" rows={2} value={keyMilestones.intro}
                  onChange={(e) => setKeyMilestones((p) => ({ ...p, intro: e.target.value }))}
                  placeholder="Brief intro for the timeline" />
                <CharCounter value={keyMilestones.intro} max={LIMITS.short_description.max} />
              </div>
              <label className="form-label">Milestones</label>
              {keyMilestones.milestones.map((m, i) => (
                <div key={i} className="form-group" style={{ border: "1px solid #e2e8f0", padding: 12, borderRadius: 8, marginBottom: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <input type="text" className="form-input" placeholder="Year (e.g. 2006)" value={m.year}
                      onChange={(e) => setKeyMilestones((prev) => ({ ...prev, milestones: prev.milestones.map((x, j) => j === i ? { ...x, year: e.target.value } : x) }))} />
                    <input type="text" className="form-input" placeholder="Card title" value={m.cardTitle}
                      onChange={(e) => setKeyMilestones((prev) => ({ ...prev, milestones: prev.milestones.map((x, j) => j === i ? { ...x, cardTitle: e.target.value } : x) }))} />
                  </div>
                  <textarea className="form-input" rows={2} placeholder="Description" value={m.description}
                    onChange={(e) => setKeyMilestones((prev) => ({ ...prev, milestones: prev.milestones.map((x, j) => j === i ? { ...x, description: e.target.value } : x) }))}
                    style={{ marginTop: 8 }} />
                  <CharCounter value={m.description} max={LIMITS.short_description.max} />
                  <button type="button" className="action-button secondary" style={{ marginTop: 8 }}
                    onClick={() => setKeyMilestones((prev) => ({ ...prev, milestones: prev.milestones.filter((_, j) => j !== i) }))}>
                    <MinusCircleOutlined /> Remove
                  </button>
                </div>
              ))}
              <button type="button" className="action-button secondary"
                onClick={() => setKeyMilestones((p) => ({ ...p, milestones: [...p.milestones, { year: "", cardTitle: "", description: "" }] }))}>
                <PlusOutlined /> Add milestone
              </button>
          </fieldset>
        </SectionCard>
        </div>

        {/* 3. Our Mission */}
        <div ref={(node) => { sectionRefs.current.mission = node; }}>
        <SectionCard
          sectionKey="mission"
          isOpen={openSections.mission}
          onToggleOpen={() => setOpenSections((prev) => ({ ...prev, mission: !prev.mission }))}
          isEditing={activeEditSection === "mission"}
          onEdit={() => startEditingSection("mission")}
          onSave={() => saveSection("mission")}
          onCancel={() => cancelEditingSection("mission")}
          isSaving={savingSection === "mission"}
          onLockedClick={() => notifyReadOnly(SECTION_META.mission.title)}
        >
          <fieldset disabled={activeEditSection !== "mission"} style={{ border: "none", padding: 0, margin: 0 }}>
              <div className="form-group">
                <label className="form-label">Heading</label>
                <input type="text" className="form-input" value={mission.heading}
                  onChange={(e) => setMission((p) => ({ ...p, heading: e.target.value }))}
                  placeholder="e.g. Our Mission" />
              </div>
              <div className="form-group">
                <label className="form-label">Subtitle / intro</label>
                <textarea className="form-input" rows={2} value={mission.subtitle}
                  onChange={(e) => setMission((p) => ({ ...p, subtitle: e.target.value }))}
                  placeholder="To promote and develop professional golf in India..." />
                <CharCounter value={mission.subtitle} max={LIMITS.short_description.max} />
              </div>
              <ImageUploadField label="Mission Image (displayed on the left side)"
                value={mission.image}
                onChange={(url) => setMission((p) => ({ ...p, image: url }))}
                folder="cms/about-us" previewH={120} spec={IMAGE_SPECS['cms/about-us']} />
              <ImageHint recommended={IMAGE_SPECS['cms/about-us'].recommended}
                maxSize={`${IMAGE_SPECS['cms/about-us'].maxMB}MB`}
                note="Wide landscape image shown on the left of the mission section." />
              <label className="form-label" style={{ marginTop: 16, display: 'block' }}>
                Mission Cards <span style={{ fontSize: 12, color: '#64748b', fontWeight: 400 }}>(exactly 4 cards — shown in 2×2 grid)</span>
              </label>
              {mission.cards.map((c, i) => (
                <div key={i} className="form-group" style={{ border: "1px solid #e2e8f0", padding: 12, borderRadius: 8, marginBottom: 12 }}>
                  <label className="form-label" style={{ fontSize: 12, color: '#64748b' }}>Card {i + 1}</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <textarea className="form-input" rows={2} value={c.text}
                      onChange={(e) => setMission((prev) => ({ ...prev, cards: prev.cards.map((x, j) => j === i ? { ...x, text: e.target.value } : x) }))}
                      placeholder={`Mission card ${i + 1} text`} style={{ flex: 1 }} />
                    <select value={c.accent || "secondary"}
                      onChange={(e) => setMission((prev) => ({ ...prev, cards: prev.cards.map((x, j) => j === i ? { ...x, accent: e.target.value } : x) }))}
                      className="form-input" style={{ width: 130 }}>
                      <option value="primary">Primary (blue)</option>
                      <option value="secondary">Secondary</option>
                    </select>
                  </div>
                  <CharCounter value={c.text} max={LIMITS.short_description.max} />
                </div>
              ))}
          </fieldset>
        </SectionCard>
        </div>

        {/* 4. Our Vision */}
        <div ref={(node) => { sectionRefs.current.vision = node; }}>
        <SectionCard
          sectionKey="vision"
          isOpen={openSections.vision}
          onToggleOpen={() => setOpenSections((prev) => ({ ...prev, vision: !prev.vision }))}
          isEditing={activeEditSection === "vision"}
          onEdit={() => startEditingSection("vision")}
          onSave={() => saveSection("vision")}
          onCancel={() => cancelEditingSection("vision")}
          isSaving={savingSection === "vision"}
          onLockedClick={() => notifyReadOnly(SECTION_META.vision.title)}
        >
          <fieldset disabled={activeEditSection !== "vision"} style={{ border: "none", padding: 0, margin: 0 }}>
              <div className="form-group">
                <label className="form-label">Heading</label>
                <input type="text" className="form-input" value={vision.heading}
                  onChange={(e) => setVision((p) => ({ ...p, heading: e.target.value }))}
                  placeholder="e.g. Our Vision" />
              </div>
              <div className="form-group">
                <label className="form-label">Subtitle</label>
                <textarea className="form-input" rows={2} value={vision.subtitle}
                  onChange={(e) => setVision((p) => ({ ...p, subtitle: e.target.value }))}
                  placeholder="To establish India as a globally respected force in professional golf. PGTI envisions:" />
                <CharCounter value={vision.subtitle} max={LIMITS.short_description.max} />
              </div>
              <ImageUploadField label="Vision Image (displayed in the center)"
                value={vision.image}
                onChange={(url) => setVision((p) => ({ ...p, image: url }))}
                folder="cms/about-us" previewH={120} spec={IMAGE_SPECS['cms/about-us']} />
              <ImageHint recommended={IMAGE_SPECS['cms/about-us'].recommended}
                maxSize={`${IMAGE_SPECS['cms/about-us'].maxMB}MB`}
                note="Square or portrait image shown in the center of the vision grid." />
              <label className="form-label" style={{ marginTop: 16, display: 'block' }}>
                Vision Items <span style={{ fontSize: 12, color: '#64748b', fontWeight: 400 }}>(exactly 4 items — items 01 & 03 on left, 02 & 04 on right)</span>
              </label>
              {vision.items.map((item, i) => (
                <div key={i} className="form-group" style={{ border: "1px solid #e2e8f0", padding: 12, borderRadius: 8, marginBottom: 12 }}>
                  <label className="form-label" style={{ fontSize: 12, color: '#64748b' }}>Item {item.number}</label>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <input type="text" className="form-input" placeholder="Number" value={item.number}
                      onChange={(e) => setVision((prev) => ({ ...prev, items: prev.items.map((x, j) => j === i ? { ...x, number: e.target.value } : x) }))}
                      style={{ width: 70 }} />
                    <textarea className="form-input" rows={2} placeholder="Vision item text" value={item.text}
                      onChange={(e) => setVision((prev) => ({ ...prev, items: prev.items.map((x, j) => j === i ? { ...x, text: e.target.value } : x) }))}
                      style={{ flex: 1 }} />
                  </div>
                  <CharCounter value={item.text} max={LIMITS.short_description.max} />
                </div>
              ))}
          </fieldset>
        </SectionCard>
        </div>

        {/* 5. Legacy & Impact — BEFORE Team */}
        <div ref={(node) => { sectionRefs.current.legacy = node; }}>
        <SectionCard
          sectionKey="legacy"
          isOpen={openSections.legacy}
          onToggleOpen={() => setOpenSections((prev) => ({ ...prev, legacy: !prev.legacy }))}
          isEditing={activeEditSection === "legacy"}
          onEdit={() => startEditingSection("legacy")}
          onSave={() => saveSection("legacy")}
          onCancel={() => cancelEditingSection("legacy")}
          isSaving={savingSection === "legacy"}
          onLockedClick={() => notifyReadOnly(SECTION_META.legacy.title)}
        >
          <fieldset disabled={activeEditSection !== "legacy"} style={{ border: "none", padding: 0, margin: 0 }}>
              <div className="form-group">
                <label className="form-label">Heading</label>
                <input type="text" className="form-input" value={legacy.heading}
                  onChange={(e) => setLegacy((p) => ({ ...p, heading: e.target.value }))}
                  placeholder="e.g. Legacy & Impact" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={4} value={legacy.description}
                  onChange={(e) => setLegacy((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Paragraph(s) for legacy section" />
                <CharCounter value={legacy.description} max={LIMITS.description.max} />
              </div>
              <ImageUploadField label="Legacy Image" value={legacy.image}
                onChange={(url) => setLegacy((p) => ({ ...p, image: url }))}
                folder="cms/about-us" previewH={120} spec={IMAGE_SPECS['cms/about-us']} />
              <ImageHint recommended={IMAGE_SPECS['cms/about-us'].recommended}
                maxSize={`${IMAGE_SPECS['cms/about-us'].maxMB}MB`}
                note="Wide legacy/heritage image displayed in the final section of the page." />
          </fieldset>
        </SectionCard>
        </div>

        {/* 6. The Team Behind the Tour */}
        <div ref={(node) => { sectionRefs.current.team = node; }}>
        <SectionCard
          sectionKey="team"
          isOpen={openSections.team}
          onToggleOpen={() => setOpenSections((prev) => ({ ...prev, team: !prev.team }))}
          isEditing={activeEditSection === "team"}
          onEdit={() => startEditingSection("team")}
          onSave={() => saveSection("team")}
          onCancel={() => cancelEditingSection("team")}
          isSaving={savingSection === "team"}
          onLockedClick={() => notifyReadOnly(SECTION_META.team.title)}
        >
          <fieldset disabled={activeEditSection !== "team"} style={{ border: "none", padding: 0, margin: 0 }}>
              <div className="form-group">
                <label className="form-label">Heading</label>
                <input type="text" className="form-input" value={team.heading}
                  onChange={(e) => setTeam((p) => ({ ...p, heading: e.target.value }))}
                  placeholder="e.g. The Team Behind the Tour" />
              </div>
              <div className="form-group">
                <label className="form-label">Subtitle</label>
                <textarea className="form-input" rows={2} value={team.subtitle}
                  onChange={(e) => setTeam((p) => ({ ...p, subtitle: e.target.value }))}
                  placeholder="A dynamic team of board members..." />
                <CharCounter value={team.subtitle} max={LIMITS.short_description.max} />
              </div>

              {/* Filter chips */}
              <div className="form-group">
                <label className="form-label">
                  Filter Labels <span style={{ fontSize: 12, color: '#64748b', fontWeight: 400 }}>("All" is always present and used in frontend to show all members)</span>
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                  {team.filters.map((f) => (
                    <span key={f} style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      background: f === "All" ? "#0ea5e9" : "#e2e8f0",
                      color: f === "All" ? "#fff" : "#334155",
                      borderRadius: 20, padding: "4px 12px", fontSize: 13,
                    }}>
                      {f}
                      {f !== "All" && (
                        <button type="button" onClick={() => removeFilter(f)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, lineHeight: 1, fontSize: 14 }}>
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="text" className="form-input" value={newFilter}
                    onChange={(e) => setNewFilter(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFilter())}
                    placeholder="Add new filter label (e.g. Board Members)"
                    style={{ flex: 1 }} />
                  <button type="button" className="action-button secondary" onClick={addFilter} disabled={!newFilter.trim()}>
                    <PlusOutlined /> Add
                  </button>
                </div>
              </div>

              {/* Team members */}
              <label className="form-label">Team Members</label>
              {team.members.map((m, i) => (
                <div key={i} className="form-group" style={{ border: "1px solid #e2e8f0", padding: 12, borderRadius: 8, marginBottom: 12 }}>
                  <button
                    type="button"
                    onClick={() => toggleMember(i)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      background: "transparent",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b" }}>
                        {m.name?.trim() || `Member ${i + 1}`}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                        {m.role?.trim() || "Click to expand and edit details"}
                      </div>
                    </div>
                    <span style={{ color: "#475569", flexShrink: 0 }}>
                      {openMembers[i] ? <UpOutlined /> : <DownOutlined />}
                    </span>
                  </button>

                  {openMembers[i] && (
                  <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
                    <div>
                      <label className="form-label" style={{ fontSize: 12 }}>Name</label>
                      <input type="text" className="form-input" placeholder="e.g. Mr. Amandeep Johl" value={m.name}
                        onChange={(e) => setTeam((prev) => ({ ...prev, members: prev.members.map((x, j) => j === i ? { ...x, name: e.target.value } : x) }))} />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: 12 }}>Role / designation</label>
                      <input type="text" className="form-input" placeholder="e.g. CEO, PGTI" value={m.role}
                        onChange={(e) => setTeam((prev) => ({ ...prev, members: prev.members.map((x, j) => j === i ? { ...x, role: e.target.value } : x) }))} />
                    </div>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <label className="form-label" style={{ fontSize: 12 }}>Full Title</label>
                    <input type="text" className="form-input" placeholder="e.g. Chief Executive Officer – PGTI" value={m.title || ""}
                      onChange={(e) => setTeam((prev) => ({ ...prev, members: prev.members.map((x, j) => j === i ? { ...x, title: e.target.value } : x) }))} />
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <label className="form-label" style={{ fontSize: 12 }}>Bio</label>
                    <textarea className="form-input" rows={3} placeholder="Member biography..." value={m.bio || ""}
                      onChange={(e) => setTeam((prev) => ({ ...prev, members: prev.members.map((x, j) => j === i ? { ...x, bio: e.target.value } : x) }))} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: 12, marginTop: 8, alignItems: "end" }}>
                    <div>
                      <ImageUploadField
                        label="Member Photo"
                        value={m.image}
                        onChange={(url) => setTeam((prev) => ({
                          ...prev,
                          members: prev.members.map((x, j) => j === i ? { ...x, image: url } : x),
                        }))}
                        folder="cms/about-us"
                        previewH={140}
                        spec={IMAGE_SPECS['cms/about-us']}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: 12 }}>Filter Category</label>
                      <select className="form-input" value={m.filter || "All"}
                        onChange={(e) => setTeam((prev) => ({ ...prev, members: prev.members.map((x, j) => j === i ? { ...x, filter: e.target.value } : x) }))}>
                        {team.filters.map((f) => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                  </div>
                  <button type="button" className="action-button secondary" style={{ marginTop: 8 }}
                    onClick={() => {
                      setTeam((prev) => ({ ...prev, members: prev.members.filter((_, j) => j !== i) }));
                      setOpenMembers((prev) => prev.filter((_, j) => j !== i));
                    }}>
                    <MinusCircleOutlined /> Remove Member
                  </button>
                  </>
                  )}
                </div>
              ))}
              <button type="button" className="action-button secondary"
                onClick={() => {
                  setTeam((p) => ({ ...p, members: [...p.members, { name: "", role: "", title: "", bio: "", image: "", filter: p.filters[0] || "All" }] }));
                  setOpenMembers((prev) => [...prev, true]);
                }}>
                <PlusOutlined /> Add Member
              </button>
          </fieldset>
        </SectionCard>
        </div>

        <div className="content-card">
          <div className="content-card-body">
            <div className="form-actions">
              <Link to="/admin/cms/about-us/list" style={{ marginLeft: 12 }}>
                <button type="button" className="action-button secondary">Cancel</button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "fixed",
          right: 20,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 1200,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        {quickJumpOpen && (
          <div
            style={{
              width: 240,
              maxHeight: "70vh",
              overflowY: "auto",
              background: "#ffffff",
              border: "1px solid #dbe7f5",
              borderRadius: 24,
              boxShadow: "0 18px 44px rgba(15, 23, 42, 0.16)",
              padding: "14px 12px",
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#1e3a8a",
                marginBottom: 10,
                paddingLeft: 4,
              }}
            >
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
                      borderRadius: 999,
                      padding: "12px 14px",
                      textAlign: "left",
                      fontSize: 14,
                      fontWeight: isActive ? 700 : 600,
                      cursor: "pointer",
                      boxShadow: isActive ? "0 8px 20px rgba(37, 99, 235, 0.12)" : "none",
                      marginLeft: offset,
                      marginRight: offset,
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
            width: 58,
            height: 58,
            borderRadius: "50%",
            border: "none",
            background: "#1e3a8a",
            color: "#ffffff",
            boxShadow: "0 14px 30px rgba(30, 58, 138, 0.26)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: 22,
          }}
          aria-label="Open quick jump for About Us sections"
          title="Quick Jump"
        >
          <AppstoreOutlined />
        </button>
      </div>
    </div>
    </div>
  );
}
