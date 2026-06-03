import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, notification } from "antd";
import {
  AppstoreOutlined,
  ArrowLeftOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  DownOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  InstagramOutlined,
  RightOutlined,
  LinkOutlined,
  PictureOutlined,
  SaveOutlined,
  StarOutlined,
  TeamOutlined,
  TrophyOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { addEditHomepageSettings, listHomepageSettings } from "services/homepageSettings.service";
import { resolvePreviewMediaUrl, uploadMedia } from "services/media.service";
import ImageUploadField from "components/ui/ImageUploadField";
import CmsSetupTopActions from "components/cms/CmsSetupTopActions";
import MultiImageUploadField from "components/ui/MultiImageUploadField";
import { CharCounter, FieldHint, ImageHint } from "components/ui/FieldHint";
import { IMAGE_SPECS, LIMITS, validateLength, validateVideoFile } from "utils/fieldValidation";
import { TOUR_TYPE_OPTIONS, shouldUseExistingTourTypeRecord } from "utils/tourType";
import "styles/admin-pages.css";

const SECTION_OPEN_KEYS = [
  "hero",
  "featuredMatch",
  "pgtiRanking",
  "quickLinks",
  "latestNews",
  "league72",
  "eventsSection",
  "highlightVideos",
  "socialMedia",
  "aboutPgti",
  "partnersSections",
  "downloadApp",
];

const SECTION_NAV_ITEMS = [
  { key: "hero", number: "1", title: "Hero Banner" },
  { key: "featuredMatch", number: "2", title: "Featured Match Bar" },
  { key: "pgtiRanking", number: "3", title: "PGTI Ranking" },
  { key: "quickLinks", number: "4", title: "Quick-Link Banners" },
  { key: "latestNews", number: "5", title: "Latest News" },
  { key: "league72", number: "6", title: "72 The League Bar" },
  { key: "eventsSection", number: "7", title: "Events / Tournaments" },
  { key: "highlightVideos", number: "8", title: "Highlight Videos" },
  { key: "socialMedia", number: "9", title: "Social Media" },
  { key: "aboutPgti", number: "10", title: "About PGTI" },
  { key: "partnersSections", number: "11", title: "Partners Sections" },
  { key: "downloadApp", number: "12", title: "Download App" },
];
const EDITABLE_SECTION_KEYS = [
  "hero",
  "featuredMatch",
  "pgtiRanking",
  "quickLinks",
  "latestNews",
  "league72",
  "eventsSection",
  "highlightVideos",
  "socialMedia",
  "aboutPgti",
  "partnersSections",
];

const normalizeSectionOpenKey = (value = "") => {
  if (value === "pgtiPartners" || value === "tourPartners") return "partnersSections";
  return SECTION_OPEN_KEYS.includes(value) ? value : "";
};

const buildSectionOpenState = ({ openKey = "" } = {}) => {
  const normalizedKey = normalizeSectionOpenKey(openKey);
  return SECTION_OPEN_KEYS.reduce((acc, key) => {
    acc[key] = normalizedKey ? key === normalizedKey : false;
    return acc;
  }, {});
};

const getQuickJumpCurveOffset = (index, total) => {
  const center = (total - 1) / 2;
  if (center <= 0) return 0;
  const distance = Math.abs(index - center) / center;
  return Math.round(distance * 28);
};

const Toggle = ({ checked, onChange, label }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      flexWrap: "wrap",
      marginBottom: 16,
      padding: "10px 12px",
      borderRadius: 10,
      background: checked ? "#f0fdf4" : "#f8fafc",
      border: `1px solid ${checked ? "#86efac" : "#cbd5e1"}`,
    }}
  >
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      style={{
        border: "none",
        width: 48,
        height: 28,
        borderRadius: 999,
        background: checked ? "#16a34a" : "#cbd5e1",
        position: "relative",
        cursor: "pointer",
        transition: "background 0.2s ease",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 24 : 4,
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 4px rgba(15, 23, 42, 0.25)",
          transition: "left 0.2s ease",
        }}
      />
    </button>
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <span style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>{label}</span>
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: checked ? "#15803d" : "#b91c1c",
          background: checked ? "#dcfce7" : "#fee2e2",
          borderRadius: 999,
          padding: "2px 8px",
        }}
      >
        {checked ? "Enabled" : "Disabled"}
      </span>
    </div>
  </div>
);

const SectionCard = ({
  number,
  title,
  icon,
  children,
  isOpen,
  onToggleOpen,
  isEditing = false,
  canEdit = false,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  isLocked = canEdit && !isEditing,
  onLockedClick,
}) => (
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
            padding: 0,
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
              {icon}
              &nbsp;
              <span style={{ fontSize: 13, color: "#94a3b8", marginRight: 6 }}>{number}.</span>
              {title}
            </h3>
            <span style={{ color: "#64748b", fontSize: 14, flexShrink: 0 }}>
              {isOpen ? <DownOutlined /> : <RightOutlined />}
            </span>
          </button>
          {canEdit && (
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
          )}
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
                aria-label={`This ${title} section is read-only until you click edit`}
              />
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);

const ManagedElsewhere = ({ path, label }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 14px",
      marginBottom: 16,
      background: "#eff6ff",
      borderRadius: 8,
      border: "1px solid #bfdbfe",
      fontSize: 13,
      color: "#1e40af",
    }}
  >
    <EditOutlined style={{ flexShrink: 0 }} />
    <span>
      The actual content for this section is managed under <strong>{label}</strong>. Go to{" "}
      <Link to={path} style={{ color: "#0369a1", textDecoration: "underline" }}>
        {path}
      </Link>{" "}
      to update it. Here you only control visibility and display settings.
    </span>
  </div>
);

const NumInput = ({ label, value, onChange, min = 1, max = 12, hint }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <input
      type="number"
      className="form-input"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value))))}
      style={{ maxWidth: 100 }}
    />
    {hint && <FieldHint>{hint}</FieldHint>}
  </div>
);

const F = {
  heading: { min: 3, max: LIMITS.title.max },
  subtitle: { min: 3, max: LIMITS.short_description.max },
  desc: { min: 3, max: LIMITS.short_description.max },
};

const normalizeImageList = (value, fallback = "") => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    if (!value.trim()) return fallback ? [fallback] : [];
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      return [value].filter(Boolean);
    }
  }
  return fallback ? [fallback] : [];
};

const normalizeOrder = (value, fallback) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? Math.floor(numeric) : fallback;
};

const createHeroSlideId = () => `hero-slide-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeHeroVideo = (hero = {}) => {
  const base = hero?.video && typeof hero.video === "object" ? hero.video : {};
  const legacyUrl = hero?.video_url || hero?.short_video || hero?.videoUrl || "";
  return {
    url: base.url || legacyUrl || "",
    title: base.title || "",
    subtitle: base.subtitle || "",
    order: base.order || hero?.video_order || "",
  };
};

const normalizeHeroSlides = (hero = {}, { includeDrafts = false } = {}) => {
  const parsedSlides = Array.isArray(hero?.slides)
    ? hero.slides
        .map((slide) => {
          if (!slide) return null;
          const image = slide.image || slide.url || "";
          if (!image && !includeDrafts) return null;
          return {
            id: slide.id || slide.slide_id || createHeroSlideId(),
            image,
            title: slide.title || "",
            subtitle: slide.subtitle || "",
            order: slide.order || "",
            logo_image: slide.logo_image || "",
          };
        })
        .filter(Boolean)
    : [];

  if (parsedSlides.length) return parsedSlides;

  const legacyImages = normalizeImageList(hero?.slider_images, hero?.bg_image || "");
  return legacyImages.map((image, index) => ({
    id: createHeroSlideId(),
    image,
    title: index === 0 ? hero?.title || "" : "",
    subtitle: index === 0 ? hero?.subtitle || "" : "",
    order: index + 1,
    logo_image: "",
  }));
};

const normalizeHeroMedia = (hero = {}) => {
  const baseVideo = normalizeHeroVideo(hero);
  const baseSlides = normalizeHeroSlides(hero, { includeDrafts: true });
  const hasVideo = Boolean(baseVideo.url);

  const mediaItems = [];

  if (hasVideo) {
    mediaItems.push({
      type: "video",
      order: normalizeOrder(baseVideo.order, 1),
      title: baseVideo.title || "",
      subtitle: baseVideo.subtitle || "",
      url: baseVideo.url,
      fallbackIndex: 0,
    });
  }

  baseSlides.forEach((slide, index) => {
    if (!slide.image) return;
    mediaItems.push({
      type: "image",
      id: slide.id,
      order: normalizeOrder(slide.order, index + (hasVideo ? 2 : 1)),
      title: slide.title || "",
      subtitle: slide.subtitle || "",
      image: slide.image,
      logo_image: slide.logo_image || "",
      fallbackIndex: index + 1,
    });
  });

  const orderedItems = mediaItems
    .sort((left, right) => {
      if (left.order === right.order) return left.fallbackIndex - right.fallbackIndex;
      return left.order - right.order;
    })
    .map((item, index) => ({
      ...item,
      order: index + 1,
    }));

  const videoItem = orderedItems.find((item) => item.type === "video");
  const orderedImageItemsById = new Map(
    orderedItems.filter((item) => item.type === "image").map((item) => [item.id, item])
  );
  const slides = baseSlides
    .map((slide, index) => {
      const orderedItem = orderedImageItemsById.get(slide.id);
      return {
        id: slide.id || createHeroSlideId(),
        image: slide.image || "",
        title: slide.title || "",
        subtitle: slide.subtitle || "",
        order: orderedItem?.order || normalizeOrder(slide.order, index + (hasVideo ? 2 : 1)),
        logo_image: slide.logo_image || "",
      };
    })
    .sort((left, right) => {
      if (left.order === right.order) return left.id.localeCompare(right.id);
      return left.order - right.order;
    });

  return {
    video: {
      url: baseVideo.url || "",
      title: videoItem?.title || baseVideo.title || "",
      subtitle: videoItem?.subtitle || baseVideo.subtitle || "",
      order: videoItem?.order || 1,
    },
    slides,
    items: orderedItems,
  };
};

const DEFAULT = {
  hero: {
    enabled: true,
    bg_image: "",
    slider_images: [],
    slides: [],
    video: {
      url: "",
      title: "",
      subtitle: "",
    },
    title: "",
    subtitle: "",
    show_live_scores: true,
  },
  featuredMatch: {
    enabled: true,
    title: "72 The League",
    subtitle: "UP Prometheans v Rajasthan Regals - The League Final",
    link_url: "",
    logo_image: "",
    bg_image: "",
  },
  pgtiRanking: { show_section: true, heading: "PGTI Ranking", description: "Current standings of India's top professional golfers", items_to_show: 5, view_all_url: "" },
  quickLinks: {
    show_section: true,
    owgr: { title: "OWGR India Ranking", button_text: "Click for more details", link_url: "", logo_image: "" },
    pgtiRanking: { title: "PGTI Ranking", button_text: "View Full List", link_url: "" },
  },
  latestNews: { show_section: true, heading: "Latest News", subheading: "National & International", description: "Stay updated with the latest from Indian professional golf.", items_to_show: 6 },
  league72: { enabled: true, title: "72 The League", button_text: "Click for more details", link_url: "", bg_image: "" },
  eventsSection: { show_section: true, heading: "Schedule Events/Tournaments", description: "PGTI is the official sanctioning body for professional golf in India.", items_to_show: 3 },
  highlightVideos: { show_section: true, heading: "Highlight & YouTube Videos", description: "Watch the best moments from PGTI tournaments.", items_to_show: 6 },
  socialMedia: { show_section: true, heading: "The PGTI Social Media Updates", description: "Follow us for the latest updates from the tour.", instagram_url: "", facebook_url: "" },
  aboutPgti: { show_section: true, button_text: "Know More", button_url: "/about-us" },
  pgtiPartners: { show_section: true, heading: "PGTI Partners" },
  tourPartners: { show_section: true, heading: "Tour Partners" },
};

const parseContent = (raw) => {
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw || {};
    if (!parsed || Object.keys(parsed).length === 0) return DEFAULT;

    const heroMedia = normalizeHeroMedia(parsed.hero || {});
    const heroSlides = heroMedia.slides;
    const heroVideo = heroMedia.video;
    const leadHeroItem = heroMedia.items[0];

    return {
      hero: {
        ...DEFAULT.hero,
        ...parsed.hero,
        video: heroVideo,
        slides: heroSlides,
        slider_images: heroSlides.map((slide) => slide.image).filter(Boolean),
        bg_image: heroSlides[0]?.image || parsed.hero?.bg_image || "",
        title: parsed.hero?.title || leadHeroItem?.title || "",
        subtitle: parsed.hero?.subtitle || leadHeroItem?.subtitle || "",
      },
      featuredMatch: { ...DEFAULT.featuredMatch, ...parsed.featuredMatch },
      pgtiRanking: { ...DEFAULT.pgtiRanking, ...parsed.pgtiRanking },
      quickLinks: {
        ...DEFAULT.quickLinks,
        ...parsed.quickLinks,
        owgr: { ...DEFAULT.quickLinks.owgr, ...(parsed.quickLinks?.owgr || {}) },
        pgtiRanking: { ...DEFAULT.quickLinks.pgtiRanking, ...(parsed.quickLinks?.pgtiRanking || {}) },
      },
      latestNews: { ...DEFAULT.latestNews, ...parsed.latestNews },
      league72: { ...DEFAULT.league72, ...parsed.league72 },
      eventsSection: { ...DEFAULT.eventsSection, ...parsed.eventsSection },
      highlightVideos: { ...DEFAULT.highlightVideos, ...parsed.highlightVideos },
      socialMedia: { ...DEFAULT.socialMedia, ...parsed.socialMedia },
      aboutPgti: { ...DEFAULT.aboutPgti, ...parsed.aboutPgti },
      pgtiPartners: { ...DEFAULT.pgtiPartners, ...parsed.pgtiPartners },
      tourPartners: { ...DEFAULT.tourPartners, ...parsed.tourPartners },
    };
  } catch {
    return DEFAULT;
  }
};

const HERO_SPEC = IMAGE_SPECS["cms/homepage"] || { recommended: "1920x700 px", maxMB: 3, note: "Wide hero image." };
const HERO_SLIDE_LOGO_SPEC = { recommended: "220x90 px (transparent logo)", maxMB: 1, note: "Optional transparent logo shown over this hero slide." };
const HERO_VIDEO_SPEC = {
  recommended: "MP4, WebM, or MOV | 10-30 seconds recommended",
  maxMB: 15,
  formats: "MP4, WebM, MOV",
  note: "Upload the short hero video first, then add the image slides below it. Each video and image slide can have its own title and subtitle.",
};
const OWGR_SPEC = IMAGE_SPECS["cms/tour-partners"] || { recommended: "200x80 px", maxMB: 0.5, note: "Transparent PNG preferred." };
const FEATURED_MATCH_LOGO_SPEC = { recommended: "240x90 px (logo)", maxMB: 0.5, note: "Optional logo shown inside the featured match strip. Transparent PNG preferred." };

export default function HomepageSettingsAddEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const heroVideoInputRef = useRef(null);
  const sectionRefs = useRef({});
  const state = location?.state || {};
  const requestedOpenSectionKey = state?.openSectionKey || state?.sectionKey || "";
  const hasInitialStateContent = Boolean(state?.content || state?.result?.content || state?.id);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [id, setId] = useState(state?.id ?? "");
  const [tourType, setTourType] = useState(state?.tour_type ?? state?.result?.tour_type ?? "M");
  const [savedTourType, setSavedTourType] = useState(state?.tour_type ?? state?.result?.tour_type ?? "M");
  const raw = state?.content ?? state?.result?.content ?? state;
  const [form, setForm] = useState(() => parseContent(raw));
  const [savedForm, setSavedForm] = useState(() => parseContent(raw));
  const [quickJumpOpen, setQuickJumpOpen] = useState(false);
  const [activeEditSection, setActiveEditSection] = useState(() => normalizeSectionOpenKey(requestedOpenSectionKey));
  const [savingSection, setSavingSection] = useState("");
  const [openSections, setOpenSections] = useState(() =>
    buildSectionOpenState({ openKey: requestedOpenSectionKey })
  );

  const heroMedia = useMemo(() => normalizeHeroMedia(form.hero || {}), [form.hero]);
  const heroSlides = heroMedia.slides;
  const heroVideo = heroMedia.video;
  const heroMediaItems = heroMedia.items;
  const heroImages = useMemo(() => heroSlides.map((slide) => slide.image).filter(Boolean), [heroSlides]);

  useEffect(() => {
    if (!hasInitialStateContent) {
      setIsFetching(true);
      listHomepageSettings({ tour_type: tourType }).then((res) => {
        if (res?.status && res.result?.id) {
          setId(res.result.id);
          setTourType(res.result.tour_type || "M");
          setSavedTourType(res.result.tour_type || "M");
          const parsedContent = parseContent(res.result.content);
          setForm(parsedContent);
          setSavedForm(parsedContent);
          setOpenSections(buildSectionOpenState({ openKey: requestedOpenSectionKey }));
          setActiveEditSection(normalizeSectionOpenKey(requestedOpenSectionKey));
        }
        setIsFetching(false);
      });
    }
  }, [hasInitialStateContent, requestedOpenSectionKey, tourType]);

  useEffect(() => {
    document.title = `PGTI || ${id ? "Edit" : "Setup"} Homepage`;
  }, [id]);

  const setSectionField = (section, field, value) => {
    setForm((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const setNested = (section, sub, field, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [sub]: {
          ...prev[section][sub],
          [field]: value,
        },
      },
    }));
  };

  const toggleSectionCard = (sectionKey) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const focusSection = (sectionKey) => {
    setOpenSections(buildSectionOpenState({ openKey: sectionKey }));
    setQuickJumpOpen(false);

    window.setTimeout(() => {
      const node = sectionRefs.current?.[sectionKey];
      if (node?.scrollIntoView) {
        node.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 120);
  };

  const startEditingSection = (sectionKey) => {
    setActiveEditSection(sectionKey);
    setOpenSections((prev) => ({ ...prev, [sectionKey]: true }));
  };

  const cancelEditingSection = (sectionKey) => {
    setForm((prev) => {
      if (sectionKey === "partnersSections") {
        return {
          ...prev,
          pgtiPartners: savedForm.pgtiPartners,
          tourPartners: savedForm.tourPartners,
        };
      }
      return {
        ...prev,
        [sectionKey]: savedForm[sectionKey],
      };
    });
    setTourType(savedTourType);
    setActiveEditSection((prev) => (prev === sectionKey ? "" : prev));
  };

  const copyFromMainTour = async () => {
    try {
      setIsFetching(true);
      const res = await listHomepageSettings({ tour_type: "M" });
      if (!res?.status || !res?.result?.id) {
        notification.warning({
          message: "Main Tour data not found",
          description: "Please save the Main Tour Homepage first, then copy it into NextGen.",
          placement: "topRight",
          duration: 3,
        });
        return;
      }
      const parsedContent = parseContent(res.result.content);
      setForm(parsedContent);
      setSavedForm(parsedContent);
      setId("");
      setTourType("F");
      setSavedTourType("F");
      notification.success({
        message: "Copied from Main Tour",
        description: "Main Tour Homepage content is copied into this NextGen draft. Edit what you need and save to create a separate NextGen record.",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setIsFetching(false);
    }
  };

  const setHeroVideoField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        video: {
          ...normalizeHeroVideo(prev.hero),
          [field]: value,
        },
      },
    }));
  };

  const syncHeroSlides = (urls = []) => {
    setForm((prev) => {
      const nextUrls = urls.filter(Boolean);
      const existingSlides = normalizeHeroSlides(prev.hero || {}, { includeDrafts: true });
      const nextSlides = existingSlides.map((slide) => ({ ...slide }));
      const nextUrlSet = new Set(nextUrls);
      const occupiedUrls = new Set();

      nextSlides.forEach((slide) => {
        if (slide.image && !nextUrlSet.has(slide.image)) {
          slide.image = "";
        } else if (slide.image) {
          occupiedUrls.add(slide.image);
        }
      });

      nextUrls.forEach((url) => {
        if (occupiedUrls.has(url)) return;
        const draftIndex = nextSlides.findIndex((slide) => !slide.image);
        if (draftIndex >= 0) {
          nextSlides[draftIndex] = {
            ...nextSlides[draftIndex],
            image: url,
          };
        } else {
          nextSlides.push({
            id: createHeroSlideId(),
            image: url,
            title: "",
            subtitle: "",
            order: "",
            logo_image: "",
          });
        }
        occupiedUrls.add(url);
      });

      const normalizedHero = normalizeHeroMedia({
        ...prev.hero,
        slides: nextSlides,
      });

      return {
        ...prev,
        hero: {
          ...prev.hero,
          video: normalizedHero.video,
          slides: normalizedHero.slides,
          slider_images: normalizedHero.slides.map((slide) => slide.image),
          bg_image: normalizedHero.slides[0]?.image || "",
        },
      };
    });
  };

  const setHeroSlideField = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        ...(() => {
          const currentSlides = normalizeHeroSlides(prev.hero || {}, { includeDrafts: true });
          const normalizedHero = normalizeHeroMedia({
            ...prev.hero,
            slides: currentSlides.map((slide, slideIndex) =>
              slideIndex === index ? { ...slide, [field]: value } : slide
            ),
          });
          return {
            video: normalizedHero.video,
            slides: normalizedHero.slides,
            slider_images: normalizedHero.slides.map((slide) => slide.image).filter(Boolean),
            bg_image: normalizedHero.slides.find((slide) => slide.image)?.image || "",
          };
        })(),
      },
    }));
  };

  const setHeroSlideImage = (index, image) => {
    setForm((prev) => {
      const currentSlides = normalizeHeroSlides(prev.hero || {}, { includeDrafts: true });
      const normalizedHero = normalizeHeroMedia({
        ...prev.hero,
        slides: currentSlides.map((slide, slideIndex) =>
          slideIndex === index ? { ...slide, image } : slide
        ),
      });
      return {
        ...prev,
        hero: {
          ...prev.hero,
          video: normalizedHero.video,
          slides: normalizedHero.slides,
          slider_images: normalizedHero.slides.map((slide) => slide.image).filter(Boolean),
          bg_image: normalizedHero.slides.find((slide) => slide.image)?.image || "",
        },
      };
    });
  };

  const removeHeroSlideImage = (index) => {
    setHeroSlideImage(index, "");
  };

  const removeHeroSlide = (index) => {
    setForm((prev) => {
      const currentSlides = normalizeHeroSlides(prev.hero || {}, { includeDrafts: true });
      const normalizedHero = normalizeHeroMedia({
        ...prev.hero,
        slides: currentSlides.filter((_, slideIndex) => slideIndex !== index),
      });
      return {
        ...prev,
        hero: {
          ...prev.hero,
          video: normalizedHero.video,
          slides: normalizedHero.slides,
          slider_images: normalizedHero.slides.map((slide) => slide.image).filter(Boolean),
          bg_image: normalizedHero.slides.find((slide) => slide.image)?.image || "",
        },
      };
    });
  };

  const setHeroVideoOrder = (value) => {
    setForm((prev) => {
      const normalizedHero = normalizeHeroMedia({
        ...prev.hero,
        video: {
          ...normalizeHeroVideo(prev.hero),
          order: value,
        },
      });
      return {
        ...prev,
        hero: {
          ...prev.hero,
          video: normalizedHero.video,
          slides: normalizedHero.slides,
          slider_images: normalizedHero.slides.map((slide) => slide.image),
          bg_image: normalizedHero.slides[0]?.image || "",
        },
      };
    });
  };

  const setHeroSlideOrder = (index, value) => {
    setForm((prev) => {
      const currentSlides = normalizeHeroSlides(prev.hero || {}, { includeDrafts: true });
      const normalizedHero = normalizeHeroMedia({
        ...prev.hero,
        slides: currentSlides.map((slide, slideIndex) =>
          slideIndex === index ? { ...slide, order: value } : slide
        ),
      });
      return {
        ...prev,
        hero: {
          ...prev.hero,
          video: normalizedHero.video,
          slides: normalizedHero.slides,
          slider_images: normalizedHero.slides.map((slide) => slide.image).filter(Boolean),
          bg_image: normalizedHero.slides.find((slide) => slide.image)?.image || "",
        },
      };
    });
  };

  const clearHeroVideo = () => {
    setForm((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        video: {
          url: "",
          title: "",
          subtitle: "",
        },
      },
    }));
  };

  const notifyMissing = (message) => {
    notification.open({
      message: "Oops!",
      description: message,
      placement: "topRight",
      icon: <InfoCircleOutlined style={{ color: "red" }} />,
      duration: 2,
    });
  };

  const notifyReadOnly = (sectionTitle) => {
    notification.open({
      message: "Section is locked",
      description: `Click Edit in "${sectionTitle}" before changing anything here.`,
      placement: "topRight",
      icon: <InfoCircleOutlined style={{ color: "#1d4ed8" }} />,
      duration: 2.5,
    });
  };

  const handleHeroVideoUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!validateVideoFile(file, HERO_VIDEO_SPEC)) return;

    try {
      setIsLoading(true);
      const uploadResult = await uploadMedia(file, "cms/homepage");
      if (!uploadResult?.status || !uploadResult?.url) {
        notifyMissing(uploadResult?.message || "Failed to upload hero video.");
        return;
      }

      setForm((prev) => ({
        ...prev,
        hero: {
          ...prev.hero,
          ...(() => {
            const normalizedHero = normalizeHeroMedia({
              ...prev.hero,
              video: {
                ...normalizeHeroVideo(prev.hero),
                url: uploadResult.url,
              },
            });
            return {
              video: normalizedHero.video,
              slides: normalizedHero.slides,
              slider_images: normalizedHero.slides.map((slide) => slide.image),
              bg_image: normalizedHero.slides[0]?.image || "",
            };
          })(),
        },
      }));

      notification.open({
        message: "Uploaded",
        description: "Hero video uploaded successfully.",
        placement: "topRight",
        icon: <CheckCircleOutlined style={{ color: "green" }} />,
        duration: 2,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateSection = (sectionKey) => {
    if (sectionKey === "hero") {
      const heroSlidesWithImage = heroSlides.filter((slide) => slide?.image);
      const incompleteHeroSlide = heroSlides.find((slide) => !slide?.image);
      if (incompleteHeroSlide) {
        notifyMissing("One hero slide is missing its image. Upload the image again or remove that full slide before saving.");
        return false;
      }
      if (heroSlidesWithImage.length < 1) {
        notifyMissing("At least one hero slider image is required.");
        return false;
      }
      if (heroVideo.title && !validateLength(heroVideo.title, "Hero Video Title", F.heading)) return false;
      if (heroVideo.subtitle && !validateLength(heroVideo.subtitle, "Hero Video Subtitle", F.subtitle)) return false;
      for (let index = 0; index < heroSlides.length; index += 1) {
        const slide = heroSlides[index];
        if (slide?.title && !validateLength(slide.title, `Hero Slide ${index + 1} Title`, F.heading)) return false;
        if (slide?.subtitle && !validateLength(slide.subtitle, `Hero Slide ${index + 1} Subtitle`, F.subtitle)) return false;
      }
      return true;
    }
    if (sectionKey === "pgtiRanking" && form.pgtiRanking.heading && !validateLength(form.pgtiRanking.heading, "PGTI Ranking Heading", F.heading)) return false;
    if (sectionKey === "latestNews" && form.latestNews.heading && !validateLength(form.latestNews.heading, "Latest News Heading", F.heading)) return false;
    if (sectionKey === "highlightVideos" && form.highlightVideos.heading && !validateLength(form.highlightVideos.heading, "Highlight Videos Heading", F.heading)) return false;
    if (sectionKey === "socialMedia" && form.socialMedia.heading && !validateLength(form.socialMedia.heading, "Social Media Heading", F.heading)) return false;
    return true;
  };

  const buildPayloadContent = () => {
    const normalizedSlides = heroSlides
      .filter((slide) => slide?.image)
      .map((slide) => ({ ...slide }));
    const normalizedVideo = heroVideo.url ? heroVideo : { url: "", title: "", subtitle: "", order: 1 };
    const leadHeroItem = heroMediaItems[0];
    return {
      ...form,
      hero: {
        ...form.hero,
        video: normalizedVideo,
        slides: normalizedSlides,
        slider_images: normalizedSlides.map((slide) => slide.image),
        bg_image: normalizedSlides[0]?.image || "",
        title: leadHeroItem?.title || "",
        subtitle: leadHeroItem?.subtitle || "",
      },
    };
  };

  const saveSection = (sectionKey) => {
    if (!validateSection(sectionKey)) return;
    Modal.confirm({
      title: "Save these changes?",
      icon: <ExclamationCircleOutlined style={{ color: "#1d4ed8" }} />,
      content: "Do you really want to edit and save these changes for this homepage section?",
      okText: "Yes, Save Changes",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          setSavingSection(sectionKey);
          setIsLoading(true);
          const content = buildPayloadContent();
          const res = await addEditHomepageSettings({
            ...(shouldUseExistingTourTypeRecord(id, savedTourType, tourType) && { editId: id }),
            status: "A",
            tour_type: tourType,
            content: JSON.stringify(content),
          });

          if (res.status === true) {
            if (res.result?.id) setId(res.result.id);
            setSavedForm(content);
            setForm(content);
            setSavedTourType(tourType);
            setActiveEditSection("");
            notification.open({
              message: "Success",
              description: "Homepage section saved successfully.",
              placement: "topRight",
              icon: <CheckCircleOutlined style={{ color: "green" }} />,
              duration: 2,
            });
            return;
          }
          notifyMissing(res?.message || "Failed to save homepage settings.");
        } catch {
          notifyMissing("An error occurred while saving homepage settings.");
        } finally {
          setSavingSection("");
          setIsLoading(false);
        }
      },
    });
  };

  const getLockedSectionProps = (sectionKey, sectionTitle) => ({
    isLocked: activeEditSection !== sectionKey,
    onLockedClick: () => notifyReadOnly(sectionTitle),
  });

  if (isFetching) {
    return (
      <div className="admin-page-container">
        <div className="page-header">
          <h1 className="page-title">Homepage Settings</h1>
        </div>
        <div className="content-card">
          <div className="content-card-body" style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
            Loading current settings...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">{id ? "Edit Homepage Settings" : "Setup Homepage"}</h1>
            <p className="page-subtitle">Configure every section of the public-facing homepage</p>
          </div>
          <Link to="/admin/cms/homepage/list">
            <button className="action-button secondary">
              <ArrowLeftOutlined /> Back
            </button>
          </Link>
        </div>
      </div>

      <CmsSetupTopActions
        tourType={tourType}
        onCopyFromMain={copyFromMainTour}
        onSaveAll={() => saveSection(activeEditSection)}
        saveAllDisabled={!activeEditSection}
        isWorking={Boolean(isLoading || savingSection)}
      />

      <div className="page-body">
        <div>
          <div ref={(node) => { sectionRefs.current.hero = node; }}>
            <SectionCard
              number="1"
              title="Hero Banner"
              icon={<PictureOutlined />}
              isOpen={openSections.hero}
              onToggleOpen={() => toggleSectionCard("hero")}
              canEdit={EDITABLE_SECTION_KEYS.includes("hero")}
              isEditing={activeEditSection === "hero"}
              onEdit={() => startEditingSection("hero")}
              onSave={() => saveSection("hero")}
              onCancel={() => cancelEditingSection("hero")}
              isSaving={savingSection === "hero"}
              {...getLockedSectionProps("hero", "Hero Banner")}
              >
                <fieldset disabled={activeEditSection !== "hero"} style={{ border: "none", padding: 0, margin: 0 }}>
                <div className="row">
                  <div className="col-md-4 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label">Tour Type</label>
                      <select className="form-input" value={tourType} onChange={(e) => setTourType(e.target.value)}>
                        {TOUR_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <FieldHint>Select whether this homepage setup is for the main site or the PGTI NextGen site.</FieldHint>
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
                  </div>
                </div>
                <Toggle
                  checked={form.hero.enabled}
                  onChange={(value) => setSectionField("hero", "enabled", value)}
                label="Show hero banner section on homepage"
              />
            <input
              ref={heroVideoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              style={{ display: "none" }}
              onChange={handleHeroVideoUpload}
            />
            <div
              style={{
                border: "1px solid #dbeafe",
                borderRadius: 12,
                background: "#f8fbff",
                padding: 16,
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                  marginBottom: 12,
                }}
              >
                <div>
                  <label className="form-label" style={{ marginBottom: 4 }}>
                    <VideoCameraOutlined /> Short Hero Video
                  </label>
                  <FieldHint text="Optional short video for the homepage hero. Use the order field below to place it before or after the image slides." />
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="action-button secondary"
                    onClick={() => heroVideoInputRef.current?.click()}
                    disabled={isLoading}
                  >
                    <VideoCameraOutlined /> Upload Video
                  </button>
                  {heroVideo.url && (
                    <button
                      type="button"
                      className="action-button secondary"
                      onClick={clearHeroVideo}
                      disabled={isLoading}
                    >
                      Remove Video
                    </button>
                  )}
                </div>
              </div>

              <div
                style={{
                  marginBottom: 12,
                  padding: "10px 12px",
                  background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                  borderRadius: 8,
                  border: "1px solid #bae6fd",
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: "#0369a1", marginBottom: 4 }}>Video Guidelines</div>
                <ul style={{ margin: 0, padding: "0 0 0 16px", fontSize: 12, color: "#1e40af", lineHeight: 1.7 }}>
                  <li><strong>Recommended:</strong> {HERO_VIDEO_SPEC.recommended}</li>
                  <li><strong>Max file size:</strong> {HERO_VIDEO_SPEC.maxMB}MB</li>
                  <li><strong>Accepted formats:</strong> {HERO_VIDEO_SPEC.formats}</li>
                  <li>{HERO_VIDEO_SPEC.note}</li>
                </ul>
              </div>

              {heroVideo.url ? (
                <div className="row">
                  <div className="col-lg-5 col-12 mb-3">
                    <div
                      style={{
                        border: "1px solid #dbeafe",
                        borderRadius: 10,
                        background: "#0f172a",
                        overflow: "hidden",
                        minHeight: 220,
                      }}
                    >
                      <video
                        src={resolvePreviewMediaUrl(heroVideo.url)}
                        controls
                        style={{ width: "100%", height: "220px", objectFit: "contain", display: "block" }}
                      />
                    </div>
                  </div>
                  <div className="col-lg-7 col-12">
                    <div className="row">
                      <div className="col-md-3 col-12 mb-3">
                        <div className="form-group">
                          <label className="form-label">Display Order</label>
                          <input
                            type="number"
                            min={1}
                            className="form-input"
                            value={heroVideo.order}
                            onChange={(e) => setHeroVideoOrder(e.target.value)}
                            placeholder="1"
                          />
                          <FieldHint text="Lower number appears earlier in the hero slider." />
                        </div>
                      </div>
                      <div className="col-md-4 col-12 mb-3">
                        <div className="form-group">
                          <label className="form-label">Video Title</label>
                          <input
                            className="form-input"
                            value={heroVideo.title}
                            onChange={(e) => setHeroVideoField("title", e.target.value)}
                            placeholder="Optional title for the hero video"
                          />
                          <CharCounter value={heroVideo.title} min={F.heading.min} max={F.heading.max} />
                        </div>
                      </div>
                      <div className="col-md-5 col-12 mb-3">
                        <div className="form-group">
                          <label className="form-label">Video Subtitle</label>
                          <textarea
                            className="form-input"
                            rows={3}
                            value={heroVideo.subtitle}
                            onChange={(e) => setHeroVideoField("subtitle", e.target.value)}
                            placeholder="Optional subtitle shown with the hero video"
                          />
                          <CharCounter value={heroVideo.subtitle} min={F.subtitle.min} max={F.subtitle.max} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    border: "1px dashed #cbd5e1",
                    borderRadius: 10,
                    minHeight: 140,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#ffffff",
                    color: "#64748b",
                    textAlign: "center",
                    padding: 16,
                  }}
                >
                  No hero video uploaded yet.
                </div>
              )}
            </div>

            <MultiImageUploadField
              label="Hero Slider Images"
              required
              value={heroImages}
              onChange={syncHeroSlides}
              folder="cms/homepage"
              previewH={120}
              spec={HERO_SPEC}
              minRequired={1}
              helperText="Add the hero images after the video. Add Single uploads one image, while Add Multiple lets you upload the full slider in one go."
              guidelineNote="Wide homepage hero banner. Minimum 1 image required. Each slide below can have its own title and subtitle."
              showGalleryAction={false}
            />
            {heroSlides.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ marginBottom: 10 }}>
                  <label className="form-label" style={{ marginBottom: 4 }}>Image Slide Titles & Subtitles</label>
                  <FieldHint text="Each image slide can have its own optional title, subtitle, and display order. Lower order values appear earlier in the hero slider." />
                </div>
                {heroSlides.map((slide, index) => (
                  <div
                    key={slide.id || `hero-slide-${index}`}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 12,
                      padding: 14,
                      marginBottom: 12,
                      background: "#ffffff",
                    }}
                  >
                    <div className="row">
                      <div className="col-lg-4 col-md-5 col-12 mb-3">
                        <ImageUploadField
                          label="Slide Image"
                          value={slide.image}
                          onChange={(url) => setHeroSlideImage(index, url)}
                          folder="cms/homepage"
                          previewH={120}
                          spec={HERO_SPEC}
                          hint="Removing the image here keeps this slide's title, subtitle, and logo so you can replace the image later."
                        />
                      </div>
                      <div className="col-lg-8 col-md-7 col-12">
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>
                          Slide {index + 1}
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                          <button
                            type="button"
                            className="action-button secondary"
                            onClick={() => removeHeroSlideImage(index)}
                            disabled={!slide.image}
                          >
                            Remove Image
                          </button>
                          <button
                            type="button"
                            className="action-button secondary"
                            onClick={() => removeHeroSlide(index)}
                          >
                            Remove Slide
                          </button>
                        </div>
                        <div className="row">
                          <div className="col-md-2 col-12 mb-3">
                            <div className="form-group">
                              <label className="form-label">Order</label>
                              <input
                                type="number"
                                min={1}
                                className="form-input"
                                value={slide.order}
                                onChange={(e) => setHeroSlideOrder(index, e.target.value)}
                                placeholder={`${index + 1}`}
                              />
                            </div>
                          </div>
                          <div className="col-md-5 col-12 mb-3">
                            <div className="form-group">
                              <label className="form-label">Slide Title</label>
                              <input
                                className="form-input"
                                value={slide.title}
                                onChange={(e) => setHeroSlideField(index, "title", e.target.value)}
                                placeholder={`Optional title for slide ${index + 1}`}
                              />
                              <CharCounter value={slide.title} min={F.heading.min} max={F.heading.max} />
                            </div>
                          </div>
                          <div className="col-md-5 col-12 mb-3">
                            <div className="form-group">
                              <label className="form-label">Slide Subtitle</label>
                              <textarea
                                className="form-input"
                                rows={3}
                                value={slide.subtitle}
                                onChange={(e) => setHeroSlideField(index, "subtitle", e.target.value)}
                                placeholder={`Optional subtitle for slide ${index + 1}`}
                              />
                              <CharCounter value={slide.subtitle} min={F.subtitle.min} max={F.subtitle.max} />
                            </div>
                          </div>
                          <div className="col-md-12 col-12 mb-3">
                            <ImageUploadField
                              label="Transparent Slide Logo (optional)"
                              value={slide.logo_image}
                              onChange={(url) => setHeroSlideField(index, "logo_image", url)}
                              folder="cms/homepage"
                              previewH={80}
                              spec={HERO_SLIDE_LOGO_SPEC}
                              hint="Upload a transparent logo for this slide if needed."
                            />
                            <ImageHint
                              recommended={HERO_SLIDE_LOGO_SPEC.recommended}
                              maxSize={`${HERO_SLIDE_LOGO_SPEC.maxMB}MB`}
                              note={HERO_SLIDE_LOGO_SPEC.note}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Toggle
              checked={form.hero.show_live_scores}
              onChange={(value) => setSectionField("hero", "show_live_scores", value)}
              label="Show Live Scores widget on the hero section"
            />
              </fieldset>
            </SectionCard>
          </div>

          <div ref={(node) => { sectionRefs.current.featuredMatch = node; }}>
            <SectionCard
              number="2"
              title="Featured Match Bar"
              icon={<StarOutlined />}
              isOpen={openSections.featuredMatch}
              onToggleOpen={() => toggleSectionCard("featuredMatch")}
              canEdit={EDITABLE_SECTION_KEYS.includes("featuredMatch")}
              isEditing={activeEditSection === "featuredMatch"}
              onEdit={() => startEditingSection("featuredMatch")}
              onSave={() => saveSection("featuredMatch")}
              onCancel={() => cancelEditingSection("featuredMatch")}
              isSaving={savingSection === "featuredMatch"}
              {...getLockedSectionProps("featuredMatch", "Featured Match Bar")}
            >
            <fieldset disabled={activeEditSection !== "featuredMatch"} style={{ border: "none", padding: 0, margin: 0 }}>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
              The slim banner directly below the hero showing a live or featured match.
            </p>
            <Toggle
              checked={form.featuredMatch.enabled}
              onChange={(value) => setSectionField("featuredMatch", "enabled", value)}
              label="Show featured match bar below the hero"
            />
            <div className="row">
              <div className="col-md-6 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Badge / League Name</label>
                  <input
                    className="form-input"
                    value={form.featuredMatch.title}
                    onChange={(e) => setSectionField("featuredMatch", "title", e.target.value)}
                    placeholder="e.g. 72 The League"
                  />
                  <CharCounter value={form.featuredMatch.title} min={F.heading.min} max={F.heading.max} />
                </div>
              </div>
              <div className="col-md-6 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Match / Subtitle Text</label>
                  <input
                    className="form-input"
                    value={form.featuredMatch.subtitle}
                    onChange={(e) => setSectionField("featuredMatch", "subtitle", e.target.value)}
                    placeholder="e.g. UP Prometheans v Rajasthan Regals - The League Final"
                  />
                  <CharCounter value={form.featuredMatch.subtitle} min={F.subtitle.min} max={F.subtitle.max} />
                </div>
              </div>
              <div className="col-md-6 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Link URL</label>
                  <input
                    className="form-input"
                    value={form.featuredMatch.link_url}
                    onChange={(e) => setSectionField("featuredMatch", "link_url", e.target.value)}
                    placeholder="https://... or /league"
                  />
                  <FieldHint>Page the bar navigates to when clicked</FieldHint>
                </div>
              </div>
              <div className="col-md-6 col-12 mb-3">
                <ImageUploadField
                  label="Featured Match Logo (optional)"
                  value={form.featuredMatch.logo_image}
                  onChange={(url) => setSectionField("featuredMatch", "logo_image", url)}
                  folder="cms/homepage"
                  previewH={80}
                  spec={FEATURED_MATCH_LOGO_SPEC}
                />
                <ImageHint
                  recommended={FEATURED_MATCH_LOGO_SPEC.recommended}
                  maxSize={`${FEATURED_MATCH_LOGO_SPEC.maxMB}MB`}
                  note={FEATURED_MATCH_LOGO_SPEC.note}
                />
              </div>
            </div>
            </fieldset>
            </SectionCard>
          </div>

          <div ref={(node) => { sectionRefs.current.pgtiRanking = node; }}>
            <SectionCard
              number="3"
              title="PGTI Ranking Section"
              icon={<TrophyOutlined />}
              isOpen={openSections.pgtiRanking}
              onToggleOpen={() => toggleSectionCard("pgtiRanking")}
              canEdit={EDITABLE_SECTION_KEYS.includes("pgtiRanking")}
              isEditing={activeEditSection === "pgtiRanking"}
              onEdit={() => startEditingSection("pgtiRanking")}
              onSave={() => saveSection("pgtiRanking")}
              onCancel={() => cancelEditingSection("pgtiRanking")}
              isSaving={savingSection === "pgtiRanking"}
              {...getLockedSectionProps("pgtiRanking", "PGTI Ranking Section")}
            >
            <fieldset disabled={activeEditSection !== "pgtiRanking"} style={{ border: "none", padding: 0, margin: 0 }}>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
              Player ranking cards are pulled automatically from the <strong>Players / Users</strong> module ranked data. Here you control how the section is labelled and how many cards appear.
            </p>
            <Toggle checked={form.pgtiRanking.show_section} onChange={(value) => setSectionField("pgtiRanking", "show_section", value)} label="Show PGTI Ranking section on homepage" />
            <div className="row">
              <div className="col-md-5 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label required">Section Heading</label>
                  <input className="form-input" value={form.pgtiRanking.heading} onChange={(e) => setSectionField("pgtiRanking", "heading", e.target.value)} placeholder="e.g. PGTI Ranking" />
                  <CharCounter value={form.pgtiRanking.heading} min={F.heading.min} max={F.heading.max} />
                </div>
              </div>
              <div className="col-md-2 col-12 mb-3">
                <NumInput label="Players to show" value={form.pgtiRanking.items_to_show} onChange={(value) => setSectionField("pgtiRanking", "items_to_show", value)} min={1} max={10} hint="Number of ranking cards shown on homepage (max 10)" />
              </div>
              <div className="col-md-5 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">View All URL</label>
                  <input className="form-input" value={form.pgtiRanking.view_all_url} onChange={(e) => setSectionField("pgtiRanking", "view_all_url", e.target.value)} placeholder="/ranking" />
                  <FieldHint>URL of the full ranking page. Leave empty to hide the "View All" link.</FieldHint>
                </div>
              </div>
              <div className="col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Section Description</label>
                  <textarea className="form-input" rows={2} value={form.pgtiRanking.description} onChange={(e) => setSectionField("pgtiRanking", "description", e.target.value)} placeholder="Short intro shown above the ranking cards..." />
                  <CharCounter value={form.pgtiRanking.description} min={F.desc.min} max={F.desc.max} />
                </div>
              </div>
            </div>
            </fieldset>
            </SectionCard>
          </div>

          <div ref={(node) => { sectionRefs.current.quickLinks = node; }}>
            <SectionCard
              number="4"
              title="Quick-Link Banners (OWGR + PGTI)"
              icon={<LinkOutlined />}
              isOpen={openSections.quickLinks}
              onToggleOpen={() => toggleSectionCard("quickLinks")}
              canEdit={EDITABLE_SECTION_KEYS.includes("quickLinks")}
              isEditing={activeEditSection === "quickLinks"}
              onEdit={() => startEditingSection("quickLinks")}
              onSave={() => saveSection("quickLinks")}
              onCancel={() => cancelEditingSection("quickLinks")}
              isSaving={savingSection === "quickLinks"}
              {...getLockedSectionProps("quickLinks", "Quick-Link Banners")}
            >
            <fieldset disabled={activeEditSection !== "quickLinks"} style={{ border: "none", padding: 0, margin: 0 }}>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
              Two side-by-side clickable banners shown below the ranking section - one for OWGR India Ranking, one for the full PGTI Ranking list.
            </p>
            <Toggle
              checked={form.quickLinks.show_section}
              onChange={(value) => setSectionField("quickLinks", "show_section", value)}
              label="Show Quick-Link Banners section on homepage"
            />
            <div className="row">
              <div className="col-md-6 col-12 mb-3">
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 16, background: "#f8fafc" }}>
                  <div style={{ fontWeight: 700, color: "#0369a1", fontSize: 13, marginBottom: 12 }}>OWGR India Ranking Banner</div>
                  <div className="form-group" style={{ marginBottom: 10 }}>
                    <label className="form-label">Title</label>
                    <input className="form-input" value={form.quickLinks.owgr.title} onChange={(e) => setNested("quickLinks", "owgr", "title", e.target.value)} placeholder="e.g. OWGR India Ranking" />
                    <CharCounter value={form.quickLinks.owgr.title} min={F.heading.min} max={F.heading.max} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 10 }}>
                    <label className="form-label">Button Text</label>
                    <input className="form-input" value={form.quickLinks.owgr.button_text} onChange={(e) => setNested("quickLinks", "owgr", "button_text", e.target.value)} placeholder="e.g. Click for more details" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <label className="form-label">Link URL</label>
                    <input className="form-input" value={form.quickLinks.owgr.link_url} onChange={(e) => setNested("quickLinks", "owgr", "link_url", e.target.value)} placeholder="https://www.owgr.com/..." />
                  </div>
                  <ImageUploadField label="OWGR Logo / Icon" value={form.quickLinks.owgr.logo_image} onChange={(url) => setNested("quickLinks", "owgr", "logo_image", url)} folder="cms/homepage" previewH={60} spec={OWGR_SPEC} />
                  <ImageHint recommended={OWGR_SPEC.recommended} maxSize={`${OWGR_SPEC.maxMB}MB`} note="Transparent PNG preferred so it works on any background colour." />
                </div>
              </div>

              <div className="col-md-6 col-12 mb-3">
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 16, background: "#f8fafc" }}>
                  <div style={{ fontWeight: 700, color: "#0369a1", fontSize: 13, marginBottom: 12 }}>PGTI Ranking Banner</div>
                  <div className="form-group" style={{ marginBottom: 10 }}>
                    <label className="form-label">Title</label>
                    <input className="form-input" value={form.quickLinks.pgtiRanking.title} onChange={(e) => setNested("quickLinks", "pgtiRanking", "title", e.target.value)} placeholder="e.g. PGTI Ranking" />
                    <CharCounter value={form.quickLinks.pgtiRanking.title} min={F.heading.min} max={F.heading.max} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 10 }}>
                    <label className="form-label">Button Text</label>
                    <input className="form-input" value={form.quickLinks.pgtiRanking.button_text} onChange={(e) => setNested("quickLinks", "pgtiRanking", "button_text", e.target.value)} placeholder="e.g. View Full List" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Link URL</label>
                    <input className="form-input" value={form.quickLinks.pgtiRanking.link_url} onChange={(e) => setNested("quickLinks", "pgtiRanking", "link_url", e.target.value)} placeholder="/ranking/full" />
                  </div>
                </div>
              </div>
            </div>
            </fieldset>
            </SectionCard>
          </div>

          <div ref={(node) => { sectionRefs.current.latestNews = node; }}>
            <SectionCard
              number="5"
              title="Latest News Section"
              icon={<FileTextOutlined />}
              isOpen={openSections.latestNews}
              onToggleOpen={() => toggleSectionCard("latestNews")}
              canEdit={EDITABLE_SECTION_KEYS.includes("latestNews")}
              isEditing={activeEditSection === "latestNews"}
              onEdit={() => startEditingSection("latestNews")}
              onSave={() => saveSection("latestNews")}
              onCancel={() => cancelEditingSection("latestNews")}
              isSaving={savingSection === "latestNews"}
              {...getLockedSectionProps("latestNews", "Latest News Section")}
            >
            <fieldset disabled={activeEditSection !== "latestNews"} style={{ border: "none", padding: 0, margin: 0 }}>
            <ManagedElsewhere path="/admin/cms/news/list" label="CMS -> News" />
            <Toggle checked={form.latestNews.show_section} onChange={(value) => setSectionField("latestNews", "show_section", value)} label="Show Latest News section on homepage" />
            <div className="row">
              <div className="col-md-4 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label required">Section Heading</label>
                  <input className="form-input" value={form.latestNews.heading} onChange={(e) => setSectionField("latestNews", "heading", e.target.value)} placeholder="e.g. Latest News" />
                  <CharCounter value={form.latestNews.heading} min={F.heading.min} max={F.heading.max} />
                </div>
              </div>
              <div className="col-md-4 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Subheading</label>
                  <input className="form-input" value={form.latestNews.subheading} onChange={(e) => setSectionField("latestNews", "subheading", e.target.value)} placeholder="e.g. National & International" />
                  <CharCounter value={form.latestNews.subheading} min={F.heading.min} max={F.heading.max} />
                </div>
              </div>
              <div className="col-md-4 col-12 mb-3">
                <NumInput label="News cards to show" value={form.latestNews.items_to_show} onChange={(value) => setSectionField("latestNews", "items_to_show", value)} min={1} max={12} hint="Max number of news cards shown on homepage (1-12)" />
              </div>
              <div className="col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Section Description</label>
                  <textarea className="form-input" rows={2} value={form.latestNews.description} onChange={(e) => setSectionField("latestNews", "description", e.target.value)} placeholder="Short intro shown below the heading..." />
                  <CharCounter value={form.latestNews.description} min={F.desc.min} max={F.desc.max} />
                </div>
              </div>
            </div>
            </fieldset>
            </SectionCard>
          </div>

          <div ref={(node) => { sectionRefs.current.league72 = node; }}>
            <SectionCard
              number="6"
              title="72 The League Promo Bar"
              icon={<StarOutlined />}
              isOpen={openSections.league72}
              onToggleOpen={() => toggleSectionCard("league72")}
              canEdit={EDITABLE_SECTION_KEYS.includes("league72")}
              isEditing={activeEditSection === "league72"}
              onEdit={() => startEditingSection("league72")}
              onSave={() => saveSection("league72")}
              onCancel={() => cancelEditingSection("league72")}
              isSaving={savingSection === "league72"}
              {...getLockedSectionProps("league72", "72 The League Promo Bar")}
            >
            <fieldset disabled={activeEditSection !== "league72"} style={{ border: "none", padding: 0, margin: 0 }}>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
              A full-width dark banner promoting 72 The League, shown between the news and events sections.
            </p>
            <Toggle checked={form.league72.enabled} onChange={(value) => setSectionField("league72", "enabled", value)} label="Show 72 The League promotional bar on homepage" />
            <div className="row">
              <div className="col-md-4 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input className="form-input" value={form.league72.title} onChange={(e) => setSectionField("league72", "title", e.target.value)} placeholder="e.g. 72 The League" />
                  <CharCounter value={form.league72.title} min={F.heading.min} max={F.heading.max} />
                </div>
              </div>
              <div className="col-md-4 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Button Text</label>
                  <input className="form-input" value={form.league72.button_text} onChange={(e) => setSectionField("league72", "button_text", e.target.value)} placeholder="e.g. Click for more details" />
                </div>
              </div>
              <div className="col-md-4 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Link URL</label>
                  <input className="form-input" value={form.league72.link_url} onChange={(e) => setSectionField("league72", "link_url", e.target.value)} placeholder="https://... or /league" />
                </div>
              </div>
            </div>
            </fieldset>
            </SectionCard>
          </div>

          <div ref={(node) => { sectionRefs.current.eventsSection = node; }}>
            <SectionCard
              number="7"
              title="Events / Tournaments Section"
              icon={<CalendarOutlined />}
              isOpen={openSections.eventsSection}
              onToggleOpen={() => toggleSectionCard("eventsSection")}
              canEdit={EDITABLE_SECTION_KEYS.includes("eventsSection")}
              isEditing={activeEditSection === "eventsSection"}
              onEdit={() => startEditingSection("eventsSection")}
              onSave={() => saveSection("eventsSection")}
              onCancel={() => cancelEditingSection("eventsSection")}
              isSaving={savingSection === "eventsSection"}
              {...getLockedSectionProps("eventsSection", "Events / Tournaments Section")}
            >
            <fieldset disabled={activeEditSection !== "eventsSection"} style={{ border: "none", padding: 0, margin: 0 }}>
            <ManagedElsewhere path="/admin/events/list" label="Events module" />
            <Toggle checked={form.eventsSection.show_section} onChange={(value) => setSectionField("eventsSection", "show_section", value)} label="Show Events / Tournaments section on homepage" />
            <div className="row">
              <div className="col-md-5 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label required">Section Heading</label>
                  <input className="form-input" value={form.eventsSection.heading} onChange={(e) => setSectionField("eventsSection", "heading", e.target.value)} placeholder="e.g. Schedule Events/Tournaments" />
                  <CharCounter value={form.eventsSection.heading} min={F.heading.min} max={F.heading.max} />
                </div>
              </div>
              <div className="col-md-2 col-12 mb-3">
                <NumInput label="Events to show" value={form.eventsSection.items_to_show} onChange={(value) => setSectionField("eventsSection", "items_to_show", value)} min={1} max={9} hint="Number of event cards on homepage (max 9)" />
              </div>
              <div className="col-md-5 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Section Description</label>
                  <textarea className="form-input" rows={2} value={form.eventsSection.description} onChange={(e) => setSectionField("eventsSection", "description", e.target.value)} placeholder="Short intro shown below the heading..." />
                  <CharCounter value={form.eventsSection.description} min={F.desc.min} max={F.desc.max} />
                </div>
              </div>
            </div>
            </fieldset>
            </SectionCard>
          </div>

          <div ref={(node) => { sectionRefs.current.highlightVideos = node; }}>
            <SectionCard
              number="8"
              title="Highlight Videos Section"
              icon={<VideoCameraOutlined />}
              isOpen={openSections.highlightVideos}
              onToggleOpen={() => toggleSectionCard("highlightVideos")}
              canEdit={EDITABLE_SECTION_KEYS.includes("highlightVideos")}
              isEditing={activeEditSection === "highlightVideos"}
              onEdit={() => startEditingSection("highlightVideos")}
              onSave={() => saveSection("highlightVideos")}
              onCancel={() => cancelEditingSection("highlightVideos")}
              isSaving={savingSection === "highlightVideos"}
              {...getLockedSectionProps("highlightVideos", "Highlight Videos Section")}
            >
            <fieldset disabled={activeEditSection !== "highlightVideos"} style={{ border: "none", padding: 0, margin: 0 }}>
            <ManagedElsewhere path="/admin/cms/highlight-videos/list" label="CMS -> Highlights & Videos" />
            <Toggle checked={form.highlightVideos.show_section} onChange={(value) => setSectionField("highlightVideos", "show_section", value)} label="Show Highlight & YouTube Videos section on homepage" />
            <div className="row">
              <div className="col-md-5 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label required">Section Heading</label>
                  <input className="form-input" value={form.highlightVideos.heading} onChange={(e) => setSectionField("highlightVideos", "heading", e.target.value)} placeholder="e.g. Highlight & YouTube Videos" />
                  <CharCounter value={form.highlightVideos.heading} min={F.heading.min} max={F.heading.max} />
                </div>
              </div>
              <div className="col-md-2 col-12 mb-3">
                <NumInput label="Videos to show" value={form.highlightVideos.items_to_show} onChange={(value) => setSectionField("highlightVideos", "items_to_show", value)} min={1} max={12} hint="Number of video cards shown on homepage (max 12)" />
              </div>
              <div className="col-md-5 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Section Description</label>
                  <textarea className="form-input" rows={2} value={form.highlightVideos.description} onChange={(e) => setSectionField("highlightVideos", "description", e.target.value)} placeholder="Short intro shown below the heading..." />
                  <CharCounter value={form.highlightVideos.description} min={F.desc.min} max={F.desc.max} />
                </div>
              </div>
            </div>
            </fieldset>
            </SectionCard>
          </div>

          <div ref={(node) => { sectionRefs.current.socialMedia = node; }}>
            <SectionCard
              number="9"
              title="Social Media Section"
              icon={<InstagramOutlined />}
              isOpen={openSections.socialMedia}
              onToggleOpen={() => toggleSectionCard("socialMedia")}
              canEdit={EDITABLE_SECTION_KEYS.includes("socialMedia")}
              isEditing={activeEditSection === "socialMedia"}
              onEdit={() => startEditingSection("socialMedia")}
              onSave={() => saveSection("socialMedia")}
              onCancel={() => cancelEditingSection("socialMedia")}
              isSaving={savingSection === "socialMedia"}
              {...getLockedSectionProps("socialMedia", "Social Media Section")}
            >
            <fieldset disabled={activeEditSection !== "socialMedia"} style={{ border: "none", padding: 0, margin: 0 }}>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
              Shows Instagram and Facebook feed widgets on the homepage. Provide the profile/page URLs below - the website will use them to embed the feeds.
            </p>
            <Toggle checked={form.socialMedia.show_section} onChange={(value) => setSectionField("socialMedia", "show_section", value)} label="Show Social Media Updates section on homepage" />
            <div className="row">
              <div className="col-md-6 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label required">Section Heading</label>
                  <input className="form-input" value={form.socialMedia.heading} onChange={(e) => setSectionField("socialMedia", "heading", e.target.value)} placeholder="e.g. The PGTI Social Media Updates" />
                  <CharCounter value={form.socialMedia.heading} min={F.heading.min} max={F.heading.max} />
                </div>
              </div>
              <div className="col-md-6 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" rows={2} value={form.socialMedia.description} onChange={(e) => setSectionField("socialMedia", "description", e.target.value)} placeholder="e.g. Follow us for the latest updates..." />
                  <CharCounter value={form.socialMedia.description} min={F.desc.min} max={F.desc.max} />
                </div>
              </div>
              <div className="col-md-6 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Instagram Profile URL</label>
                  <input className="form-input" value={form.socialMedia.instagram_url} onChange={(e) => setSectionField("socialMedia", "instagram_url", e.target.value)} placeholder="https://www.instagram.com/pgti_official/" />
                  <FieldHint>Public Instagram profile URL. The website uses this to embed or link the feed.</FieldHint>
                </div>
              </div>
              <div className="col-md-6 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Facebook Page URL</label>
                  <input className="form-input" value={form.socialMedia.facebook_url} onChange={(e) => setSectionField("socialMedia", "facebook_url", e.target.value)} placeholder="https://www.facebook.com/pgti/" />
                  <FieldHint>Public Facebook page URL used to embed the page feed widget.</FieldHint>
                </div>
              </div>
            </div>
            </fieldset>
            </SectionCard>
          </div>

          <div ref={(node) => { sectionRefs.current.aboutPgti = node; }}>
            <SectionCard
              number="10"
              title="About PGTI Section"
              icon={<FileTextOutlined />}
              isOpen={openSections.aboutPgti}
              onToggleOpen={() => toggleSectionCard("aboutPgti")}
              canEdit={EDITABLE_SECTION_KEYS.includes("aboutPgti")}
              isEditing={activeEditSection === "aboutPgti"}
              onEdit={() => startEditingSection("aboutPgti")}
              onSave={() => saveSection("aboutPgti")}
              onCancel={() => cancelEditingSection("aboutPgti")}
              isSaving={savingSection === "aboutPgti"}
              {...getLockedSectionProps("aboutPgti", "About PGTI Section")}
            >
            <fieldset disabled={activeEditSection !== "aboutPgti"} style={{ border: "none", padding: 0, margin: 0 }}>
            <ManagedElsewhere path="/admin/cms/about-us/list" label="CMS -> About Us" />
            <Toggle checked={form.aboutPgti.show_section} onChange={(value) => setSectionField("aboutPgti", "show_section", value)} label="Show About PGTI section on homepage" />
            <div className="row">
              <div className="col-md-4 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Button Text</label>
                  <input className="form-input" value={form.aboutPgti.button_text} onChange={(e) => setSectionField("aboutPgti", "button_text", e.target.value)} placeholder="e.g. Know More" />
                  <CharCounter value={form.aboutPgti.button_text} min={F.heading.min} max={30} />
                </div>
              </div>
              <div className="col-md-4 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Button URL</label>
                  <input className="form-input" value={form.aboutPgti.button_url} onChange={(e) => setSectionField("aboutPgti", "button_url", e.target.value)} placeholder="/about-us" />
                  <FieldHint>Path the "Know More" button links to</FieldHint>
                </div>
              </div>
            </div>
            </fieldset>
            </SectionCard>
          </div>

          <div ref={(node) => { sectionRefs.current.partnersSections = node; }}>
            <SectionCard
              number="11"
              title="Partners Sections"
              icon={<TeamOutlined />}
              isOpen={openSections.partnersSections}
              onToggleOpen={() => toggleSectionCard("partnersSections")}
              canEdit={EDITABLE_SECTION_KEYS.includes("partnersSections")}
              isEditing={activeEditSection === "partnersSections"}
              onEdit={() => startEditingSection("partnersSections")}
              onSave={() => saveSection("partnersSections")}
              onCancel={() => cancelEditingSection("partnersSections")}
              isSaving={savingSection === "partnersSections"}
              {...getLockedSectionProps("partnersSections", "Partners Sections")}
            >
            <fieldset disabled={activeEditSection !== "partnersSections"} style={{ border: "none", padding: 0, margin: 0 }}>
            <ManagedElsewhere path="/admin/cms/tour-partners/list" label="CMS -> Tour Partners" />
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
              Control the heading and visibility of each partners strip. All logos and links are managed in the Tour Partners module.
            </p>
            <div className="row">
              <div className="col-md-6 col-12 mb-3">
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 16, background: "#f8fafc" }}>
                  <div style={{ fontWeight: 700, color: "#0369a1", fontSize: 13, marginBottom: 10 }}>PGTI Partners</div>
                  <Toggle checked={form.pgtiPartners.show_section} onChange={(value) => setSectionField("pgtiPartners", "show_section", value)} label="Show PGTI Partners strip" />
                  <div className="form-group">
                    <label className="form-label">Heading</label>
                    <input className="form-input" value={form.pgtiPartners.heading} onChange={(e) => setSectionField("pgtiPartners", "heading", e.target.value)} placeholder="e.g. PGTI Partners" />
                    <CharCounter value={form.pgtiPartners.heading} min={F.heading.min} max={F.heading.max} />
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-12 mb-3">
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 16, background: "#f8fafc" }}>
                  <div style={{ fontWeight: 700, color: "#0369a1", fontSize: 13, marginBottom: 10 }}>Tour Partners</div>
                  <Toggle checked={form.tourPartners.show_section} onChange={(value) => setSectionField("tourPartners", "show_section", value)} label="Show Tour Partners strip" />
                  <div className="form-group">
                    <label className="form-label">Heading</label>
                    <input className="form-input" value={form.tourPartners.heading} onChange={(e) => setSectionField("tourPartners", "heading", e.target.value)} placeholder="e.g. Tour Partners" />
                    <CharCounter value={form.tourPartners.heading} min={F.heading.min} max={F.heading.max} />
                  </div>
                </div>
              </div>
            </div>
            </fieldset>
            </SectionCard>
          </div>

          <div ref={(node) => { sectionRefs.current.downloadApp = node; }}>
            <SectionCard
              number="12"
              title="Download Our Mobile App"
              icon={<HomeOutlined />}
              isOpen={openSections.downloadApp}
              onToggleOpen={() => toggleSectionCard("downloadApp")}
            >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "16px 18px",
                background: "#f0fdf4",
                border: "1px solid #86efac",
                borderRadius: 10,
              }}
            >
              <CheckCircleOutlined style={{ color: "#16a34a", fontSize: 18, flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#15803d", marginBottom: 4 }}>Managed in Footer CMS</div>
                <div style={{ fontSize: 13, color: "#166534" }}>
                  The "Download Our Mobile App" section (Google Play URL, App Store URL and visibility toggle) is already part of the <strong>Footer</strong>. Go to{" "}
                  <Link to="/admin/cms/footer/list" style={{ color: "#15803d", textDecoration: "underline", fontWeight: 600 }}>
                    CMS -> Footer
                  </Link>{" "}
                  -> Section 5 "Download Our Mobile App" to update those settings.
                </div>
                </div>
              </div>
            </SectionCard>
          </div>

          <div className="form-actions">
            <button type="button" className="action-button secondary" onClick={() => navigate("/admin/cms/homepage/list")}>
              Cancel
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "fixed",
          right: 20,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 1050,
          display: "flex",
          alignItems: "center",
          gap: 10,
          pointerEvents: "none",
        }}
      >
        {quickJumpOpen && (
          <div
            style={{
              width: 270,
              maxHeight: "70vh",
              overflowY: "auto",
              background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
              border: "1px solid #dbeafe",
              borderRadius: 30,
              boxShadow: "0 22px 40px rgba(15, 23, 42, 0.16)",
              padding: "16px 12px 16px 16px",
              pointerEvents: "auto",
              scrollbarWidth: "thin",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 800, color: "#1e3a5f", marginBottom: 12, paddingLeft: 6 }}>
              Quick Jump
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {SECTION_NAV_ITEMS.map((item, index) => {
                const curveOffset = getQuickJumpCurveOffset(index, SECTION_NAV_ITEMS.length);
                const isActive = openSections[item.key];
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => focusSection(item.key)}
                    style={{
                      border: "1px solid #e2e8f0",
                      background: isActive
                        ? "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)"
                        : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                      color: isActive ? "#1d4ed8" : "#0f172a",
                      borderRadius: 999,
                      padding: "11px 14px",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                      marginLeft: `${curveOffset}px`,
                      width: `calc(100% - ${curveOffset}px)`,
                      boxShadow: isActive ? "0 8px 20px rgba(59, 130, 246, 0.14)" : "none",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span style={{ color: isActive ? "#60a5fa" : "#64748b", marginRight: 6 }}>{item.number}.</span>
                    {item.title}
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
            width: 54,
            height: 54,
            borderRadius: "50%",
            border: "none",
            background: "#1e3a5f",
            color: "#fff",
            boxShadow: "0 12px 24px rgba(30, 58, 95, 0.28)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "auto",
          }}
          title="Quick jump to homepage sections"
        >
          <AppstoreOutlined style={{ fontSize: 20 }} />
        </button>
      </div>
    </div>
  );
}
