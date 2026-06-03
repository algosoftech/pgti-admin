import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Modal, notification } from "antd";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  AppstoreOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  SaveOutlined,
  UpOutlined,
} from "@ant-design/icons";

import ImageUploadField from "components/ui/ImageUploadField";
import CmsSetupTopActions from "components/cms/CmsSetupTopActions";
import { CharCounter, FieldHint, ImageHint } from "components/ui/FieldHint";
import { addEditGrowthOfGolf, listGrowthOfGolf } from "services/growthOfGolf.service";
import { uploadMedia } from "services/media.service";
import {
  FILE_SPECS,
  IMAGE_SPECS,
  LIMITS,
  stripHtml,
  validatePdfFile,
} from "utils/fieldValidation";
import { TOUR_TYPE_OPTIONS, shouldUseExistingTourTypeRecord } from "utils/tourType";
import "styles/admin-pages.css";

const pdfSpec = FILE_SPECS.handbook_pdf;

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

const emptyHeroBanner = () => ({
  bg_image: "",
  mobile_bg_image: "",
  title: "",
  subtitle: "",
});

const emptyFormationSection = () => ({
  heading: "",
  subtitle: "",
  content: "",
  side_image: "",
  side_image_title: "",
  side_image_subtitle: "",
});

const emptyFounderClub = (number = 1) => ({
  number: String(number).padStart(2, "0"),
  title: "",
  description: "",
  pdf_url: "",
  image: "",
});

const emptyFounderClubsSection = () => ({
  heading: "",
  subtitle: "",
  side_panel_title: "",
  side_panel_subtitle: "",
  side_panel_image: "",
  side_panel_button_label: "Download PDF",
  items: [
    emptyFounderClub(1),
    emptyFounderClub(2),
    emptyFounderClub(3),
    emptyFounderClub(4),
  ],
});

const emptyFirstPresidentSection = () => ({
  section_heading: "",
  name: "",
  subtitle: "",
  content: "",
  image: "",
});

const emptyMilestoneItem = (year = "") => ({
  year,
  title: "",
  description: "",
});

const emptyMilestonesSection = () => ({
  heading: "",
  subtitle: "",
  side_card_title: "",
  side_card_subtitle: "",
  side_card_image: "",
  items: [
    emptyMilestoneItem("1955"),
    emptyMilestoneItem("1957"),
    emptyMilestoneItem("1958"),
  ],
});

const emptyChampionsSection = () => ({
  heading: "",
  subtitle: "",
  items: [""],
});

const ensureArray = (value, fallbackFactory) => {
  if (Array.isArray(value) && value.length > 0) return value;
  return [fallbackFactory()];
};

const parseContent = (raw) => {
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw || {};
  } catch {
    return {};
  }
};

const normalizeContent = (raw) => {
  const parsed = parseContent(raw);

  return {
    heroBanner: parsed.heroBanner
      ? { ...emptyHeroBanner(), ...parsed.heroBanner }
      : emptyHeroBanner(),
    formationSection: parsed.formationSection
      ? { ...emptyFormationSection(), ...parsed.formationSection }
      : emptyFormationSection(),
    founderClubsSection: parsed.founderClubsSection
      ? {
          ...emptyFounderClubsSection(),
          ...parsed.founderClubsSection,
          items: ensureArray(parsed.founderClubsSection.items, emptyFounderClub).map((item, index) => ({
            ...emptyFounderClub(index + 1),
            ...item,
            number: String(item?.number || index + 1).padStart(2, "0"),
          })),
        }
      : emptyFounderClubsSection(),
    firstPresidentSection: parsed.firstPresidentSection
      ? { ...emptyFirstPresidentSection(), ...parsed.firstPresidentSection }
      : emptyFirstPresidentSection(),
    milestonesSection: parsed.milestonesSection
      ? {
          ...emptyMilestonesSection(),
          ...parsed.milestonesSection,
          items: ensureArray(parsed.milestonesSection.items, emptyMilestoneItem).map((item) => ({
            ...emptyMilestoneItem(item?.year || ""),
            ...item,
          })),
        }
      : emptyMilestonesSection(),
    championsSection: parsed.championsSection
      ? {
          ...emptyChampionsSection(),
          ...parsed.championsSection,
          items: ensureArray(parsed.championsSection.items, () => "").map((item) => String(item || "")),
        }
      : emptyChampionsSection(),
  };
};

const SECTION_KEYS = [
  "general",
  "heroBanner",
  "formationSection",
  "founderClubsSection",
  "firstPresidentSection",
  "milestonesSection",
  "championsSection",
];

const SECTION_META = {
  general: { number: "0", title: "General" },
  heroBanner: { number: "1", title: "Hero Banner" },
  formationSection: { number: "2", title: "Formation of Indian Golf Union" },
  founderClubsSection: { number: "3", title: "Founder Clubs & Documents" },
  firstPresidentSection: { number: "4", title: "First President" },
  milestonesSection: { number: "5", title: "Milestones in Indian Golf" },
  championsSection: { number: "6", title: "Legendary Amateur Champions" },
};

const SECTION_NAV_ITEMS = SECTION_KEYS.map((key) => ({
  key,
  label: `${SECTION_META[key].number}. ${SECTION_META[key].title}`,
}));

const normalizeOpenSectionKey = (value = "") => (SECTION_KEYS.includes(value) ? value : "");

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
                gap: 12,
                flex: 1,
              }}
            >
              <h3 className="form-section-title" style={{ marginBottom: 0 }}>
                <span style={{ fontSize: 13, color: "#94a3b8", marginRight: 6 }}>
                  {meta.number}.
                </span>
                {meta.title}
              </h3>
              <span style={{ color: "#64748b", fontSize: 14, flexShrink: 0 }}>
                {isOpen ? <UpOutlined /> : <DownOutlined />}
              </span>
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              {isEditing ? (
                <>
                  <button
                    type="button"
                    className="action-button secondary"
                    onClick={onCancel}
                    disabled={isSaving}
                  >
                    <CloseOutlined /> Cancel
                  </button>
                  <button
                    type="button"
                    className="action-button primary"
                    onClick={onSave}
                    disabled={isSaving}
                  >
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
              {!isEditing && (
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

export default function GrowthOfGolfAddEditData() {
  const location = useLocation();
  const sectionRefs = useRef({});
  const requestedOpenSectionKey =
    location?.state?.openSectionKey || location?.state?.sectionKey || "";

  const initialContent = useMemo(
    () => normalizeContent(location?.state?.content ?? location?.state?.result?.content ?? location?.state),
    [location?.state]
  );

  const [isFetching, setIsFetching] = useState(false);
  const [isUploadingPdfKey, setIsUploadingPdfKey] = useState("");
  const [id, setId] = useState(location?.state?.id ?? location?.state?.result?.id ?? "");
  const [status, setStatus] = useState(location?.state?.status ?? "A");
  const [savedStatus, setSavedStatus] = useState(location?.state?.status ?? "A");
  const [tourType, setTourType] = useState(location?.state?.tour_type ?? location?.state?.result?.tour_type ?? "M");
  const [savedTourType, setSavedTourType] = useState(location?.state?.tour_type ?? location?.state?.result?.tour_type ?? "M");

  const [heroBanner, setHeroBanner] = useState(initialContent.heroBanner);
  const [savedHeroBanner, setSavedHeroBanner] = useState(initialContent.heroBanner);
  const [formationSection, setFormationSection] = useState(initialContent.formationSection);
  const [savedFormationSection, setSavedFormationSection] = useState(initialContent.formationSection);
  const [founderClubsSection, setFounderClubsSection] = useState(initialContent.founderClubsSection);
  const [savedFounderClubsSection, setSavedFounderClubsSection] = useState(initialContent.founderClubsSection);
  const [firstPresidentSection, setFirstPresidentSection] = useState(initialContent.firstPresidentSection);
  const [savedFirstPresidentSection, setSavedFirstPresidentSection] = useState(initialContent.firstPresidentSection);
  const [milestonesSection, setMilestonesSection] = useState(initialContent.milestonesSection);
  const [savedMilestonesSection, setSavedMilestonesSection] = useState(initialContent.milestonesSection);
  const [championsSection, setChampionsSection] = useState(initialContent.championsSection);
  const [savedChampionsSection, setSavedChampionsSection] = useState(initialContent.championsSection);

  const [activeEditSection, setActiveEditSection] = useState(() =>
    normalizeOpenSectionKey(requestedOpenSectionKey)
  );
  const [savingSection, setSavingSection] = useState("");
  const [openSections, setOpenSections] = useState(() =>
    buildSectionOpenState({ openKey: requestedOpenSectionKey })
  );
  const [quickJumpOpen, setQuickJumpOpen] = useState(false);

  const hydrateForm = (record = {}) => {
    const normalized = normalizeContent(record?.content ?? record?.result?.content ?? record);
    setHeroBanner(normalized.heroBanner);
    setSavedHeroBanner(normalized.heroBanner);
    setFormationSection(normalized.formationSection);
    setSavedFormationSection(normalized.formationSection);
    setFounderClubsSection(normalized.founderClubsSection);
    setSavedFounderClubsSection(normalized.founderClubsSection);
    setFirstPresidentSection(normalized.firstPresidentSection);
    setSavedFirstPresidentSection(normalized.firstPresidentSection);
    setMilestonesSection(normalized.milestonesSection);
    setSavedMilestonesSection(normalized.milestonesSection);
    setChampionsSection(normalized.championsSection);
    setSavedChampionsSection(normalized.championsSection);

    const nextId = record?.id ?? record?.result?.id;
    if (nextId) setId(nextId);

    const nextStatus = record?.status ?? record?.result?.status;
    if (nextStatus) {
      setStatus(nextStatus);
      setSavedStatus(nextStatus);
    }
    const nextTourType = record?.tour_type ?? record?.result?.tour_type;
    if (nextTourType) {
      setTourType(nextTourType);
      setSavedTourType(nextTourType);
    }
  };

  useEffect(() => {
    document.title = `PGTI || ${id ? "Edit" : "Setup"} Growth of Golf`;
  }, [id]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        if (location?.state && Object.keys(location.state).length > 0) {
          hydrateForm(location.state);
        }

        setIsFetching(true);
        const res = await listGrowthOfGolf({ tour_type: tourType });
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
    return () => {
      active = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedOpenSectionKey, tourType]);

  const buildContent = () => ({
    heroBanner,
    formationSection,
    founderClubsSection,
    firstPresidentSection,
    milestonesSection,
    championsSection,
  });

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
    if (sectionKey === "general") {
      setStatus(savedStatus);
      setTourType(savedTourType);
    } else if (sectionKey === "heroBanner") {
      setHeroBanner(savedHeroBanner);
    } else if (sectionKey === "formationSection") {
      setFormationSection(savedFormationSection);
    } else if (sectionKey === "founderClubsSection") {
      setFounderClubsSection(savedFounderClubsSection);
    } else if (sectionKey === "firstPresidentSection") {
      setFirstPresidentSection(savedFirstPresidentSection);
    } else if (sectionKey === "milestonesSection") {
      setMilestonesSection(savedMilestonesSection);
    } else if (sectionKey === "championsSection") {
      setChampionsSection(savedChampionsSection);
    }

    setActiveEditSection((prev) => (prev === sectionKey ? "" : prev));
  };

  const persistCurrentStateAsSaved = () => {
    setSavedStatus(status);
    setSavedTourType(tourType);
    setSavedHeroBanner({ ...heroBanner });
    setSavedFormationSection({ ...formationSection });
    setSavedFounderClubsSection({
      ...founderClubsSection,
      items: founderClubsSection.items.map((item) => ({ ...item })),
    });
    setSavedFirstPresidentSection({ ...firstPresidentSection });
    setSavedMilestonesSection({
      ...milestonesSection,
      items: milestonesSection.items.map((item) => ({ ...item })),
    });
    setSavedChampionsSection({
      ...championsSection,
      items: [...championsSection.items],
    });
  };

  const copyFromMainTour = async () => {
    try {
      setIsFetching(true);
      const res = await listGrowthOfGolf({ tour_type: "M" });
      if (!res?.status || !res?.result?.id) {
        notification.warning({
          message: "Main Tour data not found",
          description: "Please save the Main Tour Growth of Golf page first.",
          placement: "topRight",
          duration: 3,
        });
        return;
      }
      hydrateForm(res.result);
      setId("");
      setTourType("F");
      setSavedTourType("F");
      notification.success({
        message: "Copied from Main Tour",
        description: "Edit the copied NextGen draft and save to create a separate record.",
        placement: "topRight",
        duration: 3,
      });
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
          const res = await addEditGrowthOfGolf({
            ...(shouldUseExistingTourTypeRecord(id, savedTourType, tourType) && { editId: id }),
            status,
            tour_type: tourType,
            content: JSON.stringify(buildContent()),
          });

          if (res?.status === true) {
            if (res?.result?.id) setId(res.result.id);
            persistCurrentStateAsSaved();
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
              description: res?.message || "Something went wrong.",
              placement: "topRight",
              duration: 3,
            });
          }
        } catch {
          notification.error({
            message: "Error",
            description: "An unexpected error occurred.",
            placement: "topRight",
            duration: 3,
          });
        } finally {
          setSavingSection("");
        }
      },
    });
  };

  const updateFounderClub = (index, field, value) =>
    setFounderClubsSection((prev) => ({
      ...prev,
      items: prev.items.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item
      ),
    }));

  const addFounderClub = () =>
    setFounderClubsSection((prev) => ({
      ...prev,
      items: [...prev.items, emptyFounderClub(prev.items.length + 1)],
    }));

  const removeFounderClub = (index) =>
    setFounderClubsSection((prev) => {
      const nextItems = prev.items.filter((_, idx) => idx !== index);
      return {
        ...prev,
        items: (nextItems.length ? nextItems : [emptyFounderClub(1)]).map((item, idx) => ({
          ...item,
          number: String(item.number || idx + 1).padStart(2, "0"),
        })),
      };
    });

  const updateMilestone = (index, field, value) =>
    setMilestonesSection((prev) => ({
      ...prev,
      items: prev.items.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item
      ),
    }));

  const addMilestone = () =>
    setMilestonesSection((prev) => ({
      ...prev,
      items: [...prev.items, emptyMilestoneItem("")],
    }));

  const removeMilestone = (index) =>
    setMilestonesSection((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index).length
        ? prev.items.filter((_, idx) => idx !== index)
        : [emptyMilestoneItem("")],
    }));

  const updateChampion = (index, value) =>
    setChampionsSection((prev) => ({
      ...prev,
      items: prev.items.map((item, idx) => (idx === index ? value : item)),
    }));

  const addChampion = () =>
    setChampionsSection((prev) => ({
      ...prev,
      items: [...prev.items, ""],
    }));

  const removeChampion = (index) =>
    setChampionsSection((prev) => {
      const nextItems = prev.items.filter((_, idx) => idx !== index);
      return {
        ...prev,
        items: nextItems.length ? nextItems : [""],
      };
    });

  const handlePdfUpload = async (file, clubIndex) => {
    if (!file) return;
    if (!validatePdfFile(file, pdfSpec)) return;

    const uploadKey = `club-${clubIndex}`;
    setIsUploadingPdfKey(uploadKey);

    try {
      const result = await uploadMedia(file, "cms/growth-of-golf");
      if (result?.status && result?.url) {
        updateFounderClub(clubIndex, "pdf_url", result.url);
        notification.success({
          message: "PDF uploaded",
          description: "The founder club document is ready to be linked on the frontend.",
          placement: "topRight",
          duration: 2,
        });
      } else {
        notification.error({
          message: "Upload failed",
          description: result?.message || "Could not upload the PDF attachment.",
          placement: "topRight",
          duration: 3,
        });
      }
    } finally {
      setIsUploadingPdfKey("");
    }
  };

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">{id ? "Edit Growth of Golf Page" : "Setup Growth of Golf Page"}</h1>
            <p className="page-subtitle">Manage the section-wise content that powers the standalone Growth of Golf frontend page.</p>
            {isFetching && (
              <p className="page-subtitle" style={{ marginTop: 6 }}>
                Loading saved data...
              </p>
            )}
          </div>
          <Link to="/admin/cms/growth-of-golf/list">
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
          <div className="content-card" style={{ marginBottom: 24 }}>
            <div className="content-card-body">
              <div className="form-section" style={{ marginBottom: 0 }}>
                <h3 className="form-section-title">Frontend Mapping Guide</h3>
                <div className="row">
                  <div className="col-lg-6 col-12 mb-3">
                    <div className="content-card" style={{ background: "#f8fbff", border: "1px solid #dbeafe", marginBottom: 0 }}>
                      <div className="content-card-body">
                        <div style={{ fontWeight: 700, color: "#1d4ed8", marginBottom: 8 }}>Where each section appears</div>
                        <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.75 }}>
                          <div><strong>Hero Banner</strong>: top banner image, title, and subtitle.</div>
                          <div><strong>Formation of Indian Golf Union</strong>: main introduction block and side image block.</div>
                          <div><strong>Founder Clubs & Documents</strong>: founder club cards, descriptions, optional image, and downloadable PDF.</div>
                          <div><strong>First President</strong>: profile block with image and biography copy.</div>
                          <div><strong>Milestones in Indian Golf</strong>: highlight card and year-wise milestone cards.</div>
                          <div><strong>Legendary Amateur Champions</strong>: stacked champion highlight rows.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6 col-12 mb-3">
                    <div className="content-card" style={{ background: "#fffdf6", border: "1px solid #fde68a", marginBottom: 0 }}>
                      <div className="content-card-body">
                        <div style={{ fontWeight: 700, color: "#92400e", marginBottom: 8 }}>Content entry notes</div>
                        <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.75 }}>
                          <div>Use the founder club PDF field when the frontend needs a direct club document download button.</div>
                          <div>Side image title and subtitle fields are available where the frontend needs an image-side text block.</div>
                          <div>Each section is edited and saved independently, similar to Homepage Settings and About Us.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                    <button
                      type="button"
                      className="action-button secondary"
                      onClick={copyFromMainTour}
                      disabled={isFetching}
                      style={{ marginTop: 12 }}
                    >
                      Copy from Main Tour
                    </button>
                  )}
                </div>
              </fieldset>
            </SectionCard>
          </div>

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
                  folder="cms/growth-of-golf"
                  previewH={160}
                  spec={IMAGE_SPECS["cms/growth-of-golf"] || IMAGE_SPECS["cms/indian-golf"]}
                />
                <ImageHint
                  recommended={(IMAGE_SPECS["cms/growth-of-golf"] || IMAGE_SPECS["cms/indian-golf"])?.recommended}
                  maxSize={`${(IMAGE_SPECS["cms/growth-of-golf"] || IMAGE_SPECS["cms/indian-golf"])?.maxMB}MB`}
                  note={(IMAGE_SPECS["cms/growth-of-golf"] || IMAGE_SPECS["cms/indian-golf"])?.note}
                />

                <div style={{ marginTop: 16 }}>
                  <ImageUploadField
                    label="Mobile Banner Image"
                    value={heroBanner.mobile_bg_image}
                    onChange={(url) => setHeroBanner((prev) => ({ ...prev, mobile_bg_image: url }))}
                    folder="cms/growth-of-golf"
                    previewH={160}
                    spec={IMAGE_SPECS.hero_banner_mobile}
                  />
                  <ImageHint
                    recommended={IMAGE_SPECS.hero_banner_mobile?.recommended}
                    maxSize={`${IMAGE_SPECS.hero_banner_mobile?.maxMB}MB`}
                    note={IMAGE_SPECS.hero_banner_mobile?.note}
                  />
                </div>

                <div className="row" style={{ marginTop: 16 }}>
                  <div className="col-md-6 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label required">Page Title</label>
                      <input
                        className="form-input"
                        value={heroBanner.title}
                        onChange={(e) => setHeroBanner((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g. Growth of golf"
                      />
                    </div>
                  </div>
                  <div className="col-md-6 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label">Subtitle / Author</label>
                      <input
                        className="form-input"
                        value={heroBanner.subtitle}
                        onChange={(e) => setHeroBanner((prev) => ({ ...prev, subtitle: e.target.value }))}
                        placeholder="e.g. By V Krishnaswamy"
                      />
                    </div>
                  </div>
                </div>
              </fieldset>
            </SectionCard>
          </div>

          <div ref={(node) => { sectionRefs.current.formationSection = node; }}>
            <SectionCard
              sectionKey="formationSection"
              isOpen={openSections.formationSection}
              onToggleOpen={() => setOpenSections((prev) => ({ ...prev, formationSection: !prev.formationSection }))}
              isEditing={activeEditSection === "formationSection"}
              onEdit={() => startEditingSection("formationSection")}
              onSave={() => saveSection("formationSection")}
              onCancel={() => cancelEditingSection("formationSection")}
              isSaving={savingSection === "formationSection"}
              onLockedClick={() => notifyReadOnly(SECTION_META.formationSection.title)}
            >
              <fieldset disabled={activeEditSection !== "formationSection"} style={{ border: "none", padding: 0, margin: 0 }}>
                <div className="row">
                  <div className="col-lg-8 col-12 mb-3">
                    <div className="form-group" style={{ marginBottom: 16 }}>
                      <label className="form-label required">Section Heading</label>
                      <input
                        className="form-input"
                        value={formationSection.heading}
                        onChange={(e) => setFormationSection((prev) => ({ ...prev, heading: e.target.value }))}
                        placeholder="e.g. The Formation of Indian Golf Union"
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                      <label className="form-label">Section Subtitle</label>
                      <textarea
                        className="form-input"
                        rows={2}
                        value={formationSection.subtitle}
                        onChange={(e) => setFormationSection((prev) => ({ ...prev, subtitle: e.target.value }))}
                        placeholder="Short support line shown just below the heading..."
                      />
                      <CharCounter value={formationSection.subtitle} max={LIMITS.short_description.max} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Main Content</label>
                      <ReactQuill
                        theme="snow"
                        value={formationSection.content || ""}
                        onChange={(value) => setFormationSection((prev) => ({ ...prev, content: value }))}
                        placeholder="Write the full formation history content here..."
                        style={{ backgroundColor: "white", borderRadius: 8, marginBottom: 8 }}
                        modules={QUILL_MODULES}
                      />
                      <CharCounter value={stripHtml(formationSection.content || "")} max={LIMITS.description.max} />
                    </div>
                  </div>

                  <div className="col-lg-4 col-12 mb-3">
                    <ImageUploadField
                      label="Side Image"
                      value={formationSection.side_image}
                      onChange={(url) => setFormationSection((prev) => ({ ...prev, side_image: url }))}
                      folder="cms/growth-of-golf"
                      previewH={220}
                      spec={IMAGE_SPECS["cms/growth-of-golf"] || IMAGE_SPECS["cms/indian-golf"]}
                    />
                    <ImageHint recommended="800×900 px" maxSize="2MB" note="Shown as the side-support visual in the formation block." />

                    <div className="form-group" style={{ marginTop: 16 }}>
                      <label className="form-label">Side Image Title</label>
                      <input
                        className="form-input"
                        value={formationSection.side_image_title}
                        onChange={(e) => setFormationSection((prev) => ({ ...prev, side_image_title: e.target.value }))}
                        placeholder="e.g. Founder Clubs of IGU"
                      />
                      <FieldHint text="Use this when the frontend shows a text badge or card title beside the side image." />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Side Image Subtitle</label>
                      <textarea
                        className="form-input"
                        rows={3}
                        value={formationSection.side_image_subtitle}
                        onChange={(e) => setFormationSection((prev) => ({ ...prev, side_image_subtitle: e.target.value }))}
                        placeholder="Short subtitle for the side-image block..."
                      />
                    </div>
                  </div>
                </div>
              </fieldset>
            </SectionCard>
          </div>

          <div ref={(node) => { sectionRefs.current.founderClubsSection = node; }}>
            <SectionCard
              sectionKey="founderClubsSection"
              isOpen={openSections.founderClubsSection}
              onToggleOpen={() => setOpenSections((prev) => ({ ...prev, founderClubsSection: !prev.founderClubsSection }))}
              isEditing={activeEditSection === "founderClubsSection"}
              onEdit={() => startEditingSection("founderClubsSection")}
              onSave={() => saveSection("founderClubsSection")}
              onCancel={() => cancelEditingSection("founderClubsSection")}
              isSaving={savingSection === "founderClubsSection"}
              onLockedClick={() => notifyReadOnly(SECTION_META.founderClubsSection.title)}
            >
              <fieldset disabled={activeEditSection !== "founderClubsSection"} style={{ border: "none", padding: 0, margin: 0 }}>
                <div className="row" style={{ marginBottom: 18 }}>
                  <div className="col-lg-7 col-12 mb-3">
                    <div className="form-group" style={{ marginBottom: 16 }}>
                      <label className="form-label required">Section Heading</label>
                      <input
                        className="form-input"
                        value={founderClubsSection.heading}
                        onChange={(e) => setFounderClubsSection((prev) => ({ ...prev, heading: e.target.value }))}
                        placeholder="e.g. Founder Clubs of IGU"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Section Subtitle</label>
                      <textarea
                        className="form-input"
                        rows={3}
                        value={founderClubsSection.subtitle}
                        onChange={(e) => setFounderClubsSection((prev) => ({ ...prev, subtitle: e.target.value }))}
                        placeholder="Introductory text shown above the club cards..."
                      />
                      <CharCounter value={founderClubsSection.subtitle} max={LIMITS.short_description.max} />
                    </div>
                  </div>
                  <div className="col-lg-5 col-12 mb-3">
                    <ImageUploadField
                      label="Side Panel Image"
                      value={founderClubsSection.side_panel_image}
                      onChange={(url) => setFounderClubsSection((prev) => ({ ...prev, side_panel_image: url }))}
                      folder="cms/growth-of-golf"
                      previewH={180}
                      spec={IMAGE_SPECS["cms/growth-of-golf"] || IMAGE_SPECS["cms/indian-golf"]}
                    />
                    <div className="form-group" style={{ marginTop: 16 }}>
                      <label className="form-label">Side Panel Title</label>
                      <input
                        className="form-input"
                        value={founderClubsSection.side_panel_title}
                        onChange={(e) => setFounderClubsSection((prev) => ({ ...prev, side_panel_title: e.target.value }))}
                        placeholder="e.g. Founder Clubs of IGU"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Side Panel Subtitle</label>
                      <textarea
                        className="form-input"
                        rows={2}
                        value={founderClubsSection.side_panel_subtitle}
                        onChange={(e) => setFounderClubsSection((prev) => ({ ...prev, side_panel_subtitle: e.target.value }))}
                        placeholder="Short support copy for the side panel..."
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Download Button Label</label>
                      <input
                        className="form-input"
                        value={founderClubsSection.side_panel_button_label}
                        onChange={(e) => setFounderClubsSection((prev) => ({ ...prev, side_panel_button_label: e.target.value }))}
                        placeholder="e.g. Download PDF"
                      />
                    </div>
                  </div>
                </div>

                <h4 style={{ fontSize: 14, fontWeight: 700, color: "#334155", marginBottom: 12 }}>
                  Founder Club Cards
                </h4>
                <FieldHint text="Each row becomes one founder club card on the frontend. Add a PDF attachment if the club needs a downloadable document button." />

                {founderClubsSection.items.map((item, index) => {
                  const uploadKey = `club-${index}`;
                  return (
                    <div
                      key={`club-${index}`}
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        padding: 20,
                        marginBottom: 16,
                        background: "#f8fafc",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                        <span style={{ fontWeight: 700, color: "#0369a1", fontSize: 18 }}>
                          Club {item.number || String(index + 1).padStart(2, "0")}
                        </span>
                        <button
                          type="button"
                          className="action-button danger"
                          style={{ fontSize: 11, padding: "3px 10px" }}
                          onClick={() => removeFounderClub(index)}
                        >
                          <DeleteOutlined /> Remove
                        </button>
                      </div>

                      <div className="row">
                        <div className="col-md-2 col-12 mb-3">
                          <div className="form-group">
                            <label className="form-label">Card Number</label>
                            <input
                              className="form-input"
                              value={item.number}
                              onChange={(e) => updateFounderClub(index, "number", e.target.value)}
                              placeholder="01"
                            />
                          </div>
                        </div>
                        <div className="col-md-10 col-12 mb-3">
                          <div className="form-group">
                            <label className="form-label required">Club Title</label>
                            <input
                              className="form-input"
                              value={item.title}
                              onChange={(e) => updateFounderClub(index, "title", e.target.value)}
                              placeholder="e.g. Royal Calcutta Golf Club"
                            />
                          </div>
                        </div>

                        <div className="col-lg-7 col-12 mb-3">
                          <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                              className="form-input"
                              rows={4}
                              value={item.description}
                              onChange={(e) => updateFounderClub(index, "description", e.target.value)}
                              placeholder="Short founder club description shown in the card or detail popup..."
                            />
                            <CharCounter value={item.description} max={LIMITS.short_description.max} />
                          </div>
                        </div>

                        <div className="col-lg-5 col-12 mb-3">
                          <ImageUploadField
                            label="Optional Club Image"
                            value={item.image}
                            onChange={(url) => updateFounderClub(index, "image", url)}
                            folder="cms/growth-of-golf"
                            previewH={150}
                            spec={IMAGE_SPECS["cms/growth-of-golf"] || IMAGE_SPECS["cms/indian-golf"]}
                          />
                          <ImageHint recommended="800×600 px" maxSize="2MB" note="Optional. Use when the frontend card needs a club-specific visual." />
                        </div>

                        <div className="col-12">
                          <div className="form-group">
                            <label className="form-label">PDF Attachment</label>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                              <label className="action-button secondary" style={{ marginBottom: 0, cursor: "pointer" }}>
                                {isUploadingPdfKey === uploadKey ? "Uploading PDF..." : "Upload PDF"}
                                <input
                                  type="file"
                                  accept=".pdf,application/pdf"
                                  style={{ display: "none" }}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handlePdfUpload(file, index);
                                    e.target.value = "";
                                  }}
                                  disabled={isUploadingPdfKey === uploadKey}
                                />
                              </label>
                              {item.pdf_url && (
                                <a
                                  href={item.pdf_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="action-button secondary"
                                  style={{ textDecoration: "none" }}
                                >
                                  Open Current PDF
                                </a>
                              )}
                            </div>
                            <div style={{ marginTop: 10 }}>
                              <input
                                className="form-input"
                                value={item.pdf_url}
                                onChange={(e) => updateFounderClub(index, "pdf_url", e.target.value)}
                                placeholder="Uploaded PDF URL will appear here"
                              />
                            </div>
                            <FieldHint text="This file becomes the frontend downloadable document for this founder club card." />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <button type="button" className="action-button secondary" onClick={addFounderClub}>
                  <PlusOutlined /> Add Founder Club
                </button>
              </fieldset>
            </SectionCard>
          </div>

          <div ref={(node) => { sectionRefs.current.firstPresidentSection = node; }}>
            <SectionCard
              sectionKey="firstPresidentSection"
              isOpen={openSections.firstPresidentSection}
              onToggleOpen={() => setOpenSections((prev) => ({ ...prev, firstPresidentSection: !prev.firstPresidentSection }))}
              isEditing={activeEditSection === "firstPresidentSection"}
              onEdit={() => startEditingSection("firstPresidentSection")}
              onSave={() => saveSection("firstPresidentSection")}
              onCancel={() => cancelEditingSection("firstPresidentSection")}
              isSaving={savingSection === "firstPresidentSection"}
              onLockedClick={() => notifyReadOnly(SECTION_META.firstPresidentSection.title)}
            >
              <fieldset disabled={activeEditSection !== "firstPresidentSection"} style={{ border: "none", padding: 0, margin: 0 }}>
                <div className="row">
                  <div className="col-lg-8 col-12 mb-3">
                    <div className="form-group" style={{ marginBottom: 16 }}>
                      <label className="form-label">Section Heading</label>
                      <input
                        className="form-input"
                        value={firstPresidentSection.section_heading}
                        onChange={(e) => setFirstPresidentSection((prev) => ({ ...prev, section_heading: e.target.value }))}
                        placeholder="e.g. First President"
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                      <label className="form-label required">Name</label>
                      <input
                        className="form-input"
                        value={firstPresidentSection.name}
                        onChange={(e) => setFirstPresidentSection((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. A. D. Vickers"
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                      <label className="form-label">Subtitle</label>
                      <input
                        className="form-input"
                        value={firstPresidentSection.subtitle}
                        onChange={(e) => setFirstPresidentSection((prev) => ({ ...prev, subtitle: e.target.value }))}
                        placeholder="e.g. A. D. Vickers served as the first President..."
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Biography Content</label>
                      <ReactQuill
                        theme="snow"
                        value={firstPresidentSection.content || ""}
                        onChange={(value) => setFirstPresidentSection((prev) => ({ ...prev, content: value }))}
                        placeholder="Full profile content for the first president section..."
                        style={{ backgroundColor: "white", borderRadius: 8, marginBottom: 8 }}
                        modules={QUILL_MODULES}
                      />
                      <CharCounter value={stripHtml(firstPresidentSection.content || "")} max={LIMITS.description.max} />
                    </div>
                  </div>

                  <div className="col-lg-4 col-12 mb-3">
                    <ImageUploadField
                      label="President Image"
                      value={firstPresidentSection.image}
                      onChange={(url) => setFirstPresidentSection((prev) => ({ ...prev, image: url }))}
                      folder="cms/growth-of-golf"
                      previewH={240}
                      spec={IMAGE_SPECS["cms/growth-of-golf"] || IMAGE_SPECS["cms/indian-golf"]}
                    />
                    <ImageHint recommended="800×900 px" maxSize="2MB" note="Portrait image used on the right side of the First President section." />
                  </div>
                </div>
              </fieldset>
            </SectionCard>
          </div>

          <div ref={(node) => { sectionRefs.current.milestonesSection = node; }}>
            <SectionCard
              sectionKey="milestonesSection"
              isOpen={openSections.milestonesSection}
              onToggleOpen={() => setOpenSections((prev) => ({ ...prev, milestonesSection: !prev.milestonesSection }))}
              isEditing={activeEditSection === "milestonesSection"}
              onEdit={() => startEditingSection("milestonesSection")}
              onSave={() => saveSection("milestonesSection")}
              onCancel={() => cancelEditingSection("milestonesSection")}
              isSaving={savingSection === "milestonesSection"}
              onLockedClick={() => notifyReadOnly(SECTION_META.milestonesSection.title)}
            >
              <fieldset disabled={activeEditSection !== "milestonesSection"} style={{ border: "none", padding: 0, margin: 0 }}>
                <div className="row" style={{ marginBottom: 18 }}>
                  <div className="col-lg-7 col-12 mb-3">
                    <div className="form-group" style={{ marginBottom: 16 }}>
                      <label className="form-label required">Section Heading</label>
                      <input
                        className="form-input"
                        value={milestonesSection.heading}
                        onChange={(e) => setMilestonesSection((prev) => ({ ...prev, heading: e.target.value }))}
                        placeholder="e.g. Milestones in Indian Golf"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Section Subtitle</label>
                      <textarea
                        className="form-input"
                        rows={3}
                        value={milestonesSection.subtitle}
                        onChange={(e) => setMilestonesSection((prev) => ({ ...prev, subtitle: e.target.value }))}
                        placeholder="Short support copy above the milestone cards..."
                      />
                      <CharCounter value={milestonesSection.subtitle} max={LIMITS.short_description.max} />
                    </div>
                  </div>

                  <div className="col-lg-5 col-12 mb-3">
                    <div className="form-group" style={{ marginBottom: 16 }}>
                      <label className="form-label">Side Card Title</label>
                      <input
                        className="form-input"
                        value={milestonesSection.side_card_title}
                        onChange={(e) => setMilestonesSection((prev) => ({ ...prev, side_card_title: e.target.value }))}
                        placeholder="e.g. Milestones in Indian Golf"
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                      <label className="form-label">Side Card Subtitle</label>
                      <textarea
                        className="form-input"
                        rows={2}
                        value={milestonesSection.side_card_subtitle}
                        onChange={(e) => setMilestonesSection((prev) => ({ ...prev, side_card_subtitle: e.target.value }))}
                        placeholder="Short copy inside the blue milestone card..."
                      />
                    </div>
                    <ImageUploadField
                      label="Side Card Image"
                      value={milestonesSection.side_card_image}
                      onChange={(url) => setMilestonesSection((prev) => ({ ...prev, side_card_image: url }))}
                      folder="cms/growth-of-golf"
                      previewH={180}
                      spec={IMAGE_SPECS["cms/growth-of-golf"] || IMAGE_SPECS["cms/indian-golf"]}
                    />
                  </div>
                </div>

                {milestonesSection.items.map((item, index) => (
                  <div
                    key={`milestone-${index}`}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 12,
                      padding: 20,
                      marginBottom: 16,
                      background: "#f8fafc",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <span style={{ fontWeight: 700, color: "#0369a1", fontSize: 18 }}>
                        {item.year || `Milestone ${index + 1}`}
                      </span>
                      <button
                        type="button"
                        className="action-button danger"
                        style={{ fontSize: 11, padding: "3px 10px" }}
                        onClick={() => removeMilestone(index)}
                      >
                        <DeleteOutlined /> Remove
                      </button>
                    </div>
                    <div className="row">
                      <div className="col-md-3 col-12 mb-3">
                        <div className="form-group">
                          <label className="form-label required">Year</label>
                          <input
                            className="form-input"
                            value={item.year}
                            onChange={(e) => updateMilestone(index, "year", e.target.value)}
                            placeholder="1955"
                          />
                        </div>
                      </div>
                      <div className="col-md-9 col-12 mb-3">
                        <div className="form-group">
                          <label className="form-label required">Card Title</label>
                          <input
                            className="form-input"
                            value={item.title}
                            onChange={(e) => updateMilestone(index, "title", e.target.value)}
                            placeholder="Short milestone title"
                          />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="form-group">
                          <label className="form-label">Description</label>
                          <textarea
                            className="form-input"
                            rows={4}
                            value={item.description}
                            onChange={(e) => updateMilestone(index, "description", e.target.value)}
                            placeholder="Milestone description..."
                          />
                          <CharCounter value={item.description} max={LIMITS.short_description.max} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button type="button" className="action-button secondary" onClick={addMilestone}>
                  <PlusOutlined /> Add Milestone Card
                </button>
              </fieldset>
            </SectionCard>
          </div>

          <div ref={(node) => { sectionRefs.current.championsSection = node; }}>
            <SectionCard
              sectionKey="championsSection"
              isOpen={openSections.championsSection}
              onToggleOpen={() => setOpenSections((prev) => ({ ...prev, championsSection: !prev.championsSection }))}
              isEditing={activeEditSection === "championsSection"}
              onEdit={() => startEditingSection("championsSection")}
              onSave={() => saveSection("championsSection")}
              onCancel={() => cancelEditingSection("championsSection")}
              isSaving={savingSection === "championsSection"}
              onLockedClick={() => notifyReadOnly(SECTION_META.championsSection.title)}
            >
              <fieldset disabled={activeEditSection !== "championsSection"} style={{ border: "none", padding: 0, margin: 0 }}>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label required">Section Heading</label>
                  <input
                    className="form-input"
                    value={championsSection.heading}
                    onChange={(e) => setChampionsSection((prev) => ({ ...prev, heading: e.target.value }))}
                    placeholder="e.g. Legendary Amateur Champions"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 18 }}>
                  <label className="form-label">Section Subtitle</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    value={championsSection.subtitle}
                    onChange={(e) => setChampionsSection((prev) => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="Optional short line above the champion list..."
                  />
                  <CharCounter value={championsSection.subtitle} max={LIMITS.short_description.max} />
                </div>

                {championsSection.items.map((item, index) => (
                  <div
                    key={`champion-${index}`}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      marginBottom: 14,
                      border: "1px solid #e2e8f0",
                      borderRadius: 12,
                      padding: 14,
                      background: "#f8fafc",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <label className="form-label">Champion Line {index + 1}</label>
                      <textarea
                        className="form-input"
                        rows={2}
                        value={item}
                        onChange={(e) => updateChampion(index, e.target.value)}
                        placeholder="Write one champion highlight row exactly as it should appear on the frontend..."
                      />
                    </div>
                    <button
                      type="button"
                      className="action-button danger"
                      style={{ marginTop: 28 }}
                      onClick={() => removeChampion(index)}
                    >
                      <DeleteOutlined />
                    </button>
                  </div>
                ))}

                <button type="button" className="action-button secondary" onClick={addChampion}>
                  <PlusOutlined /> Add Champion Row
                </button>
              </fieldset>
            </SectionCard>
          </div>

          <div className="content-card">
            <div className="content-card-body">
              <div className="form-actions">
                <Link to="/admin/cms/growth-of-golf/list">
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
                width: 260,
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
            aria-label="Open quick jump for Growth of Golf sections"
            title="Quick Jump"
          >
            <AppstoreOutlined />
          </button>
        </div>
      </div>
    </div>
  );
}
