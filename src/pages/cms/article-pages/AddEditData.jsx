import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, notification } from "antd";
import {
  AlignLeftOutlined,
  AppstoreOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  OrderedListOutlined,
  PictureOutlined,
  PlusOutlined,
  SaveOutlined,
  SearchOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import LoadingEffect from "components/ui/Loading/LoadingEffect";
import ImageUploadField from "components/ui/ImageUploadField";
import { CharCounter, FieldHint, ImageHint } from "components/ui/FieldHint";
import { addEditArticlePage, listArticlePages } from "services/articlePages.service";
import { IMAGE_SPECS, LIMITS, stripHtml, validateLength } from "utils/fieldValidation";
import { TOUR_TYPE_OPTIONS } from "utils/tourType";
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

/* ── helpers ──────────────────────────────────────────────── */
const slugify = (value = "") =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/--+/g, "-");

const emptySection = (index = 0) => ({
  id: `section-${Date.now()}-${index}`,
  topic_title: "",
  heading: "",
  body: "",
  sort_order: index + 1,
});

/* ── section config ───────────────────────────────────────── */
const SECTION_KEYS = ["articleBasics", "heroBanner", "introContent", "topicSections", "seo"];

const SECTION_META = {
  articleBasics: { number: "1", title: "Article Basics",   icon: <FileTextOutlined /> },
  heroBanner:    { number: "2", title: "Hero Banner",       icon: <PictureOutlined /> },
  introContent:  { number: "3", title: "Intro Content",     icon: <AlignLeftOutlined /> },
  topicSections: { number: "4", title: "Topic Sections",    icon: <OrderedListOutlined /> },
  seo:           { number: "5", title: "SEO",               icon: <SearchOutlined /> },
};

const SECTION_NAV_ITEMS = SECTION_KEYS.map((key) => ({
  key,
  label: `${SECTION_META[key].number}. ${SECTION_META[key].title}`,
}));

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

/* ── SectionCard ──────────────────────────────────────────── */
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
              {!isEditing && (
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
export default function ArticlePagesAddEditData() {
  const navigate = useNavigate();
  const location = useLocation();
  const sectionRefs = useRef({});
  const state = useMemo(() => location?.state || {}, [location?.state]);
  const queryId = useMemo(() => new URLSearchParams(location.search).get("id"), [location.search]);
  const requestedOpenSectionKey = state?.openSectionKey || state?.sectionKey || "";
  const articleImageSpec = IMAGE_SPECS["cms/article-pages"] || IMAGE_SPECS["cms/homepage"];

  /* ── core state ────────────────────────────────────────── */
  const [isFetching, setIsFetching] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading article page...");
  const [id, setId] = useState(state?.id ?? queryId ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(state?.slug));

  /* ── per-section state pairs ───────────────────────────── */
  const initBasics = {
    title: state?.title || "",
    slug: state?.slug || "",
    author_name: state?.author_name || "",
    sort_order: Number.isFinite(Number(state?.sort_order)) ? Number(state.sort_order) : 0,
    status: state?.status || "A",
    tour_type: state?.tour_type || "M",
  };
  const initBanner = { hero_image: state?.hero_image || "", mobile_hero_image: state?.mobile_hero_image || "", hero_title: state?.hero_title || "" };
  const initIntro  = {
    intro_heading: state?.intro_heading || "",
    intro_body: state?.intro_body || "",
    highlight_text: state?.highlight_text || "",
    content_heading: state?.content_heading || "",
  };
  const initSections = Array.isArray(state?.sections) && state.sections.length
    ? state.sections : [emptySection(0)];
  const initSeo = { meta_title: state?.meta_title || "", meta_description: state?.meta_description || "" };

  const [articleBasics, setArticleBasics]     = useState(initBasics);
  const [savedArticleBasics, setSavedArticleBasics] = useState(initBasics);

  const [heroBanner, setHeroBanner]           = useState(initBanner);
  const [savedHeroBanner, setSavedHeroBanner] = useState(initBanner);

  const [introContent, setIntroContent]       = useState(initIntro);
  const [savedIntroContent, setSavedIntroContent] = useState(initIntro);

  const [topicSections, setTopicSections]     = useState(initSections);
  const [savedTopicSections, setSavedTopicSections] = useState(initSections);

  const [seo, setSeo]                         = useState(initSeo);
  const [savedSeo, setSavedSeo]               = useState(initSeo);

  /* ── ui state ──────────────────────────────────────────── */
  const [activeEditSection, setActiveEditSection] = useState(() => normalizeOpenSectionKey(requestedOpenSectionKey));
  const [savingSection, setSavingSection]     = useState("");
  const [openSections, setOpenSections]       = useState(() => buildSectionOpenState({ openKey: requestedOpenSectionKey }));
  const [quickJumpOpen, setQuickJumpOpen]     = useState(false);

  /* ── hydrate all state pairs from a loaded record ──────── */
  const hydrateForm = (record = {}) => {
    const basics = {
      title: record.title || "",
      slug: record.slug || "",
      author_name: record.author_name || "",
      sort_order: Number.isFinite(Number(record.sort_order)) ? Number(record.sort_order) : 0,
      status: record.status || "A",
      tour_type: record.tour_type || "M",
    };
    setArticleBasics(basics); setSavedArticleBasics(basics);
    setSlugTouched(Boolean(record.slug));

    const banner = { hero_image: record.hero_image || "", mobile_hero_image: record.mobile_hero_image || "", hero_title: record.hero_title || "" };
    setHeroBanner(banner); setSavedHeroBanner(banner);

    const intro = {
      intro_heading: record.intro_heading || "",
      intro_body: record.intro_body || "",
      highlight_text: record.highlight_text || "",
      content_heading: record.content_heading || "",
    };
    setIntroContent(intro); setSavedIntroContent(intro);

    const sects = Array.isArray(record.sections) && record.sections.length
      ? record.sections : [emptySection(0)];
    setTopicSections(sects); setSavedTopicSections(JSON.parse(JSON.stringify(sects)));

    const s = { meta_title: record.meta_title || "", meta_description: record.meta_description || "" };
    setSeo(s); setSavedSeo(s);

    if (record.id) setId(record.id);
  };

  /* ── fetch fresh data on mount ─────────────────────────── */
  useEffect(() => {
    document.title = `PGTI || ${id ? "Edit" : "Add"} Article Page`;
    const targetId = queryId || state?.id;
    if (!targetId) return;

    let active = true;
    const load = async () => {
      if (state?.id) hydrateForm(state);
      try {
        setIsFetching(true);
        const res = await listArticlePages({ id: targetId, skip: 0, limit: 1 });
        if (active && res?.status && res.result?.length) {
          hydrateForm(res.result[0]);
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
  }, [queryId, requestedOpenSectionKey]);

  /* ── build full article payload ────────────────────────── */
  const buildPayload = () => ({
    ...(id && { editId: id }),
    ...articleBasics,
    slug: slugify(articleBasics.slug || articleBasics.title),
    ...heroBanner,
    ...introContent,
    ...seo,
    sections: topicSections.map((s, i) => ({ ...s, sort_order: i + 1 })),
  });

  /* ── section interaction ───────────────────────────────── */
  const notifyReadOnly = (title) =>
    notification.open({
      message: "Section is locked",
      description: `Click Edit in "${title}" before making changes.`,
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
    if (sectionKey === "articleBasics")  setArticleBasics({ ...savedArticleBasics });
    else if (sectionKey === "heroBanner")   setHeroBanner({ ...savedHeroBanner });
    else if (sectionKey === "introContent") setIntroContent({ ...savedIntroContent });
    else if (sectionKey === "topicSections") setTopicSections(JSON.parse(JSON.stringify(savedTopicSections)));
    else if (sectionKey === "seo")          setSeo({ ...savedSeo });
    setActiveEditSection((prev) => (prev === sectionKey ? "" : prev));
  };

  /* ── per-section validation ────────────────────────────── */
  const notifyError = (description) =>
    notification.open({
      message: "Oops!", description, placement: "topRight",
      icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 3,
    });

  const validateForSave = (sectionKey) => {
    if (sectionKey === "articleBasics") {
      if (!articleBasics.title?.trim()) { notifyError("Article title is required."); return false; }
      if (!validateLength(articleBasics.title, "Article Title", LIMITS.title)) return false;
      if (!articleBasics.author_name?.trim()) { notifyError("Author name is required."); return false; }
      if (!validateLength(articleBasics.author_name, "Author Name", LIMITS.title)) return false;
    }
    if (sectionKey === "heroBanner") {
      if (!heroBanner.hero_image) { notifyError("Hero banner image is required."); return false; }
      if (!heroBanner.hero_title?.trim()) { notifyError("Hero banner title is required."); return false; }
      if (!validateLength(heroBanner.hero_title, "Hero Banner Title", LIMITS.title)) return false;
    }
    if (sectionKey === "introContent") {
      if (!introContent.intro_heading?.trim()) { notifyError("Intro heading is required."); return false; }
      if (!validateLength(introContent.intro_heading, "Intro Heading", LIMITS.title)) return false;
      if (!introContent.intro_body?.trim() || !stripHtml(introContent.intro_body)) { notifyError("Intro body is required."); return false; }
      if (!validateLength(introContent.intro_body, "Intro Body", LIMITS.description, true)) return false;
    }
    if (sectionKey === "topicSections") {
      if (!topicSections.length) { notifyError("Add at least one topic section."); return false; }
      for (let i = 0; i < topicSections.length; i++) {
        const s = topicSections[i];
        if (!s.topic_title?.trim()) { notifyError(`Topic title is required for section ${i + 1}.`); return false; }
        if (!s.body?.trim() || !stripHtml(s.body).trim()) { notifyError(`Topic content is required for section ${i + 1}.`); return false; }
      }
    }
    return true;
  };

  const saveSection = (sectionKey) => {
    if (!validateForSave(sectionKey)) return;
    Modal.confirm({
      title: "Save these changes?",
      icon: <ExclamationCircleOutlined style={{ color: "#1d4ed8" }} />,
      content: `Do you want to save changes for the "${SECTION_META[sectionKey]?.title}" section?`,
      okText: "Yes, Save Changes",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          setSavingSection(sectionKey);
          setLoadingText("Saving...");
          const res = await addEditArticlePage(buildPayload());
          if (res?.status) {
            if (!id && res.result?.id) setId(res.result.id);
            setSavedArticleBasics({ ...articleBasics });
            setSavedHeroBanner({ ...heroBanner });
            setSavedIntroContent({ ...introContent });
            setSavedTopicSections(JSON.parse(JSON.stringify(topicSections)));
            setSavedSeo({ ...seo });
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

  /* ── topic section helpers ─────────────────────────────── */
  const updateSection = (index, field, value) =>
    setTopicSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );

  const addSection = () =>
    setTopicSections((prev) => [...prev, emptySection(prev.length)]);

  const removeSection = (index) =>
    setTopicSections((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length ? next.map((s, i) => ({ ...s, sort_order: i + 1 })) : [emptySection(0)];
    });

  /* ── slug helpers ──────────────────────────────────────── */
  const handleBasicsChange = (e) => {
    const { name, value } = e.target;
    setArticleBasics((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "title" && !slugTouched) next.slug = slugify(value);
      return next;
    });
  };

  const handleSlugChange = (e) => {
    setSlugTouched(true);
    setArticleBasics((prev) => ({ ...prev, slug: slugify(e.target.value) }));
  };

  /* ══════════════════════════════════════════════════════════ */
  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">{id ? "Edit Article Page" : "Add Article Page"}</h1>
            <p className="page-subtitle">Build a structured long-form article with hero banner, intro, and multiple topic blocks.</p>
            {isFetching && <p className="page-subtitle" style={{ marginTop: 6 }}>Loading saved data...</p>}
          </div>
          <Link to="/admin/cms/article-pages/list">
            <button type="button" className="action-button secondary">
              <ArrowLeftOutlined /> Back to Article Pages
            </button>
          </Link>
        </div>
      </div>

      <div className="page-body">
        <div className="modern-form">

          {/* ── 1. Article Basics ──────────────────────────── */}
          <div ref={(node) => { sectionRefs.current.articleBasics = node; }}>
            <SectionCard
              sectionKey="articleBasics"
              isOpen={openSections.articleBasics}
              onToggleOpen={() => setOpenSections((prev) => ({ ...prev, articleBasics: !prev.articleBasics }))}
              isEditing={activeEditSection === "articleBasics"}
              onEdit={() => startEditingSection("articleBasics")}
              onSave={() => saveSection("articleBasics")}
              onCancel={() => cancelEditingSection("articleBasics")}
              isSaving={savingSection === "articleBasics"}
              onLockedClick={() => notifyReadOnly(SECTION_META.articleBasics.title)}
            >
              <fieldset disabled={activeEditSection !== "articleBasics"} style={{ border: "none", padding: 0, margin: 0 }}>
                <div className="row">
                  <div className="col-md-8 col-12 mb-3">
                    <label className="form-label required">Article Title</label>
                    <input
                      type="text" className="form-input" name="title"
                      value={articleBasics.title} onChange={handleBasicsChange}
                      placeholder="Indian Open - Down the Years"
                    />
                    <CharCounter value={articleBasics.title} min={LIMITS.title.min} max={LIMITS.title.max} />
                  </div>
                  <div className="col-md-4 col-12 mb-3">
                    <label className="form-label required">Slug</label>
                    <input
                      type="text" className="form-input" name="slug"
                      value={articleBasics.slug} onChange={handleSlugChange}
                      placeholder="indian-open-down-the-years"
                    />
                    <FieldHint text="Used for the front-end URL. Auto-fills from the title until you edit it manually." />
                  </div>
                  <div className="col-md-6 col-12 mb-3">
                    <label className="form-label required">Author Name</label>
                    <input
                      type="text" className="form-input" name="author_name"
                      value={articleBasics.author_name} onChange={handleBasicsChange}
                      placeholder="V Krishnaswamy"
                    />
                    <CharCounter value={articleBasics.author_name} min={LIMITS.title.min} max={LIMITS.title.max} />
                  </div>
                  <div className="col-md-3 col-12 mb-3">
                    <label className="form-label">Sort Order</label>
                    <input
                      type="number" className="form-input" name="sort_order"
                      value={articleBasics.sort_order} onChange={handleBasicsChange} min="0"
                    />
                  </div>
                  <div className="col-md-3 col-12 mb-3">
                    <label className="form-label">Tour Type</label>
                    <select
                      className="form-input" name="tour_type"
                      value={articleBasics.tour_type || "M"} onChange={handleBasicsChange}
                    >
                      {TOUR_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3 col-12 mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-input" name="status"
                      value={articleBasics.status} onChange={handleBasicsChange}
                    >
                      <option value="A">Active</option>
                      <option value="I">Inactive</option>
                    </select>
                  </div>
                </div>
              </fieldset>
            </SectionCard>
          </div>

          {/* ── 2. Hero Banner ─────────────────────────────── */}
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
                <div className="row">
                  <div className="col-12 mb-3">
                    <ImageUploadField
                      label="Hero Banner Image"
                      required
                      value={heroBanner.hero_image}
                      onChange={(url) => setHeroBanner((prev) => ({ ...prev, hero_image: url }))}
                      folder="cms/article-pages"
                      previewH={220}
                      spec={articleImageSpec}
                    />
                    <ImageHint recommended={articleImageSpec.recommended} maxSize={`${articleImageSpec.maxMB}MB`} note={articleImageSpec.note} />
                  </div>
                  <div className="col-12 mb-3">
                    <ImageUploadField
                      label="Mobile Hero Banner Image"
                      value={heroBanner.mobile_hero_image}
                      onChange={(url) => setHeroBanner((prev) => ({ ...prev, mobile_hero_image: url }))}
                      folder="cms/article-pages"
                      previewH={180}
                      spec={IMAGE_SPECS.hero_banner_mobile}
                    />
                    <ImageHint recommended={IMAGE_SPECS.hero_banner_mobile.recommended} maxSize={`${IMAGE_SPECS.hero_banner_mobile.maxMB}MB`} note={IMAGE_SPECS.hero_banner_mobile.note} />
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label required">Hero Banner Title</label>
                    <input
                      type="text" className="form-input"
                      value={heroBanner.hero_title}
                      onChange={(e) => setHeroBanner((prev) => ({ ...prev, hero_title: e.target.value }))}
                      placeholder="Indian open - Down the Years"
                    />
                    <CharCounter value={heroBanner.hero_title} min={LIMITS.title.min} max={LIMITS.title.max} />
                  </div>
                </div>
              </fieldset>
            </SectionCard>
          </div>

          {/* ── 3. Intro Content ───────────────────────────── */}
          <div ref={(node) => { sectionRefs.current.introContent = node; }}>
            <SectionCard
              sectionKey="introContent"
              isOpen={openSections.introContent}
              onToggleOpen={() => setOpenSections((prev) => ({ ...prev, introContent: !prev.introContent }))}
              isEditing={activeEditSection === "introContent"}
              onEdit={() => startEditingSection("introContent")}
              onSave={() => saveSection("introContent")}
              onCancel={() => cancelEditingSection("introContent")}
              isSaving={savingSection === "introContent"}
              onLockedClick={() => notifyReadOnly(SECTION_META.introContent.title)}
            >
              <fieldset disabled={activeEditSection !== "introContent"} style={{ border: "none", padding: 0, margin: 0 }}>
                <div className="row">
                  <div className="col-12 mb-3">
                    <label className="form-label required">Intro Heading</label>
                    <input
                      type="text" className="form-input"
                      value={introContent.intro_heading}
                      onChange={(e) => setIntroContent((prev) => ({ ...prev, intro_heading: e.target.value }))}
                      placeholder="Indian Open: A Historic Journey"
                    />
                    <CharCounter value={introContent.intro_heading} min={LIMITS.title.min} max={LIMITS.title.max} />
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label required">Intro Body</label>
                    <ReactQuill
                      theme="snow"
                      value={introContent.intro_body}
                      onChange={(value) => setIntroContent((prev) => ({ ...prev, intro_body: value }))}
                      modules={QUILL_MODULES}
                      placeholder="Add the opening story, context, and key background paragraphs."
                    />
                    <CharCounter value={stripHtml(introContent.intro_body)} min={LIMITS.description.min} max={LIMITS.description.max} />
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label">Highlight / Pull Quote</label>
                    <textarea
                      className="form-input" rows={3}
                      value={introContent.highlight_text}
                      onChange={(e) => setIntroContent((prev) => ({ ...prev, highlight_text: e.target.value }))}
                      placeholder="Optional highlighted statement shown between the intro and topic sections."
                    />
                    <CharCounter value={introContent.highlight_text} min={LIMITS.short_description.min} max={LIMITS.short_description.max} />
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label">Main Content Heading</label>
                    <input
                      type="text" className="form-input"
                      value={introContent.content_heading}
                      onChange={(e) => setIntroContent((prev) => ({ ...prev, content_heading: e.target.value }))}
                      placeholder="The Legacy of the Indian Open Golf"
                    />
                    <FieldHint text="Large heading shown above the topic content stack." />
                  </div>
                </div>
              </fieldset>
            </SectionCard>
          </div>

          {/* ── 4. Topic Sections ──────────────────────────── */}
          <div ref={(node) => { sectionRefs.current.topicSections = node; }}>
            <SectionCard
              sectionKey="topicSections"
              isOpen={openSections.topicSections}
              onToggleOpen={() => setOpenSections((prev) => ({ ...prev, topicSections: !prev.topicSections }))}
              isEditing={activeEditSection === "topicSections"}
              onEdit={() => startEditingSection("topicSections")}
              onSave={() => saveSection("topicSections")}
              onCancel={() => cancelEditingSection("topicSections")}
              isSaving={savingSection === "topicSections"}
              onLockedClick={() => notifyReadOnly(SECTION_META.topicSections.title)}
            >
              <fieldset disabled={activeEditSection !== "topicSections"} style={{ border: "none", padding: 0, margin: 0 }}>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                  <button type="button" className="action-button secondary" onClick={addSection}>
                    <PlusOutlined /> Add Topic
                  </button>
                </div>
                {topicSections.map((section, index) => (
                  <div key={section.id || `section-${index}`} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 16, marginBottom: 16, background: "#f8fafc" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <span style={{ fontWeight: 600, color: "#0f172a", fontSize: 14 }}>Topic {index + 1}</span>
                      <button
                        type="button" className="action-button secondary"
                        style={{ fontSize: 11, padding: "3px 10px" }}
                        onClick={() => removeSection(index)}
                        disabled={topicSections.length === 1}
                      >
                        <DeleteOutlined /> Remove
                      </button>
                    </div>
                    <div className="row">
                      <div className="col-md-4 col-12 mb-3">
                        <label className="form-label required">Topic Label</label>
                        <input
                          type="text" className="form-input"
                          value={section.topic_title}
                          onChange={(e) => updateSection(index, "topic_title", e.target.value)}
                          placeholder="Early Beginnings (1964–1970)"
                        />
                      </div>
                      <div className="col-md-8 col-12 mb-3">
                        <label className="form-label">Section Heading</label>
                        <input
                          type="text" className="form-input"
                          value={section.heading}
                          onChange={(e) => updateSection(index, "heading", e.target.value)}
                          placeholder="Early Beginnings (1964–1970)"
                        />
                      </div>
                      <div className="col-12 mb-3">
                        <label className="form-label required">Section Content</label>
                        <ReactQuill
                          theme="snow"
                          value={section.body}
                          onChange={(value) => updateSection(index, "body", value)}
                          modules={QUILL_MODULES}
                          placeholder="Add the detailed content for this topic."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </fieldset>
            </SectionCard>
          </div>

          {/* ── 5. SEO ─────────────────────────────────────── */}
          <div ref={(node) => { sectionRefs.current.seo = node; }}>
            <SectionCard
              sectionKey="seo"
              isOpen={openSections.seo}
              onToggleOpen={() => setOpenSections((prev) => ({ ...prev, seo: !prev.seo }))}
              isEditing={activeEditSection === "seo"}
              onEdit={() => startEditingSection("seo")}
              onSave={() => saveSection("seo")}
              onCancel={() => cancelEditingSection("seo")}
              isSaving={savingSection === "seo"}
              onLockedClick={() => notifyReadOnly(SECTION_META.seo.title)}
            >
              <fieldset disabled={activeEditSection !== "seo"} style={{ border: "none", padding: 0, margin: 0 }}>
                <div className="row">
                  <div className="col-12 mb-3">
                    <label className="form-label">Meta Title</label>
                    <input
                      type="text" className="form-input"
                      value={seo.meta_title}
                      onChange={(e) => setSeo((prev) => ({ ...prev, meta_title: e.target.value }))}
                      placeholder="Optional SEO title"
                    />
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label">Meta Description</label>
                    <textarea
                      className="form-input" rows={3}
                      value={seo.meta_description}
                      onChange={(e) => setSeo((prev) => ({ ...prev, meta_description: e.target.value }))}
                      placeholder="Optional SEO description"
                    />
                  </div>
                </div>
              </fieldset>
            </SectionCard>
          </div>

          {/* ── bottom bar ─────────────────────────────────── */}
          <div className="content-card">
            <div className="content-card-body">
              <div className="form-actions">
                <Link to="/admin/cms/article-pages/list">
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
              width: 220, maxHeight: "70vh", overflowY: "auto",
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
            aria-label="Open quick jump for Article Page sections"
            title="Quick Jump"
          >
            <AppstoreOutlined />
          </button>
        </div>
      </div>

      <LoadingEffect isLoading={savingSection !== ""} text={loadingText} />
    </div>
  );
}
