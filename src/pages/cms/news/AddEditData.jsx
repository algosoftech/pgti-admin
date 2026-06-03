import React, { useEffect, useMemo, useState } from "react";
import { notification, Select } from "antd";
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  FileTextOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import LoadingEffect from "components/ui/Loading/LoadingEffect";
import { addEditNews, list as listNews } from "services/news.service";
import { list as listEvents } from "services/events.service";
import ImageUploadField from "components/ui/ImageUploadField";
import MultiImageUploadField from "components/ui/MultiImageUploadField";
import { CharCounter, FieldHint, ImageHint } from "components/ui/FieldHint";
import { LIMITS, IMAGE_SPECS, stripHtml, validateLength } from "utils/fieldValidation";
import { TOUR_TYPE_OPTIONS } from "utils/tourType";
import "styles/admin-pages.css";

const { Option } = Select;

const MONTH_OPTIONS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const currentYear = new Date().getFullYear();
const SEASON_OPTIONS = Array.from({ length: 8 }, (_, index) => currentYear + 2 - index);

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ["link", "image"],
    ["clean"],
  ],
};

const parseHeroBannerImages = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
};

const buildInitialState = (state = {}) => ({
  id: state?.id || "",
  title: state?.title || "",
  short_description: state?.short_description || "",
  description: state?.description || "",
  image: state?.image || "",
  hero_banner_images: parseHeroBannerImages(state?.hero_banner_images),
  location: state?.location || "",
  news_date: state?.news_date || "",
  is_international: state?.is_international === 1 || state?.is_international === true || state?.is_international === "1",
  event_id: state?.event_id || undefined,
  season: state?.season || currentYear,
  news_month: state?.news_month || undefined,
  sort_order: state?.sort_order ?? 0,
  about_pgti_content: state?.about_pgti_content || "",
  tour_type: state?.tour_type || "M",
  status: state?.status || "A",
});

export default function NewsAddEditData() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = useMemo(() => location?.state || {}, [location?.state]);

  const [ADDEDITDATA, setAddEditData] = useState(buildInitialState(state));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({});
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    document.title = `PGTI || ${ADDEDITDATA?.id ? "Edit" : "Add"} News`;
  }, [ADDEDITDATA?.id]);

  useEffect(() => {
    setAddEditData(buildInitialState(state));
  }, [state]);

  useEffect(() => {
    const loadEvents = async () => {
      setLoadingEvents(true);
      const res = await listEvents({ skip: 0, limit: 1000, condition: { status: "A", tour_type: ADDEDITDATA.tour_type || "M" } });
      if (res?.status) {
        setEvents(res.result || []);
      } else {
        notification.open({
          message: "Oops!",
          description: res?.message || "Failed to load event / tournament options.",
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 3,
        });
      }
      setLoadingEvents(false);
    };

    loadEvents();
  }, [ADDEDITDATA.tour_type]);

  useEffect(() => {
    const hydrateEditData = async () => {
      if (!state?.id) return;

      setIsLoading(true);
      const res = await listNews({ skip: 0, limit: 1, condition: { id: state.id } });

      if (res?.status && res?.result?.length) {
        setAddEditData(buildInitialState(res.result[0]));
      } else {
        notification.open({
          message: "Oops!",
          description: res?.message || "Failed to load the saved news details.",
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 3,
        });
      }

      setIsLoading(false);
    };

    hydrateEditData();
  }, [state?.id]);

  const eventOptions = useMemo(
    () =>
      (events || []).map((item) => ({
        value: item.id,
        label: item.title || item.article_title || `Event ${item.id}`,
      })),
    [events]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddEditData((prev) => ({ ...prev, [name]: value }));
    setError((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      if (!ADDEDITDATA?.title?.trim()) {
        notification.open({ message: "Oops!", description: "Title is required.", placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
        setIsLoading(false); return;
      }
      if (!validateLength(ADDEDITDATA.title, 'Title', LIMITS.title)) { setIsLoading(false); return; }
      if (!ADDEDITDATA?.short_description?.trim()) {
        notification.open({ message: "Oops!", description: "Short description is required.", placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
        setIsLoading(false); return;
      }
      if (!validateLength(ADDEDITDATA.short_description, 'Short Description', LIMITS.short_description)) { setIsLoading(false); return; }
      if (!stripHtml(ADDEDITDATA?.description || "")) {
        notification.open({ message: "Oops!", description: "Description is required.", placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
        setIsLoading(false); return;
      }
      if (!validateLength(ADDEDITDATA.description, 'Description', LIMITS.description, true)) { setIsLoading(false); return; }
      if (!ADDEDITDATA?.id && !ADDEDITDATA?.image) {
        notification.open({ message: "Oops!", description: "News image is required.", placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
        setIsLoading(false); return;
      }
      if (parseHeroBannerImages(ADDEDITDATA?.hero_banner_images).length < 1) {
        notification.open({ message: "Oops!", description: "At least one hero banner image is required.", placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
        setIsLoading(false); return;
      }

      const param = {
        ...(ADDEDITDATA?.id && { editId: ADDEDITDATA.id }),
        title: ADDEDITDATA.title.trim(),
        short_description: ADDEDITDATA.short_description.trim(),
        description: ADDEDITDATA.description || "",
        location: ADDEDITDATA.location?.trim() || "",
        news_date: ADDEDITDATA.news_date || "",
        is_international: ADDEDITDATA.is_international ? 1 : 0,
        hero_banner_images: parseHeroBannerImages(ADDEDITDATA.hero_banner_images),
        event_id: ADDEDITDATA.event_id ? Number(ADDEDITDATA.event_id) : null,
        season: ADDEDITDATA.season ? Number(ADDEDITDATA.season) : null,
        news_month: ADDEDITDATA.news_month ? Number(ADDEDITDATA.news_month) : null,
        sort_order: Number(ADDEDITDATA.sort_order || 0),
        about_pgti_content: ADDEDITDATA.about_pgti_content || "",
        tour_type: ADDEDITDATA.tour_type || "M",
        status: ADDEDITDATA.status || "A",
        ...(ADDEDITDATA?.image && { image: ADDEDITDATA.image }),
      };

      const res = await addEditNews(param);
      if (res.status === true) {
        notification.open({ message: "Success", description: ADDEDITDATA?.id ? "News updated successfully" : "News added successfully", placement: "topRight", icon: <CheckCircleOutlined style={{ color: "green" }} />, duration: 2 });
        navigate("/admin/cms/news/list");
      } else {
        notification.open({ message: "Oops!", description: res?.message || "Failed to save news", placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
      }
    } catch {
      notification.open({ message: "Oops!", description: "An error occurred. Please try again.", placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">{ADDEDITDATA?.id ? "Edit News" : "Add News"}</h1>
            <p className="page-subtitle">
              {ADDEDITDATA?.id ? "Update news information" : "Create a new national or international news item"}
            </p>
          </div>
          <Link to="/admin/cms/news/list">
            <button className="action-button secondary"><ArrowLeftOutlined /> Back to News</button>
          </Link>
        </div>
      </div>

      <div className="page-body">
        <div className="content-card">
          <div className="content-card-body">
            <form onSubmit={handleSubmit} className="modern-form">

              {/* ── News Information ─────────────────────────────── */}
              <div className="form-section">
                <h3 className="form-section-title">
                  <FileTextOutlined /> News Information
                </h3>

                <div className="row">
                  <div className="col-md-12 col-12 mb-4">
                    <div className="form-group">
                      <MultiImageUploadField
                        label="Hero Banner Carousel Images"
                        required
                        value={parseHeroBannerImages(ADDEDITDATA?.hero_banner_images)}
                        onChange={(urls) => setAddEditData((prev) => ({ ...prev, hero_banner_images: urls }))}
                        folder="cms/news"
                        previewH={90}
                        spec={IMAGE_SPECS.news}
                        minRequired={1}
                        helperText="These images appear in the right-side carousel on the news detail page."
                        guidelineNote="Landscape ratio preferred. Minimum 1 image required. No maximum limit."
                      />
                    </div>
                  </div>

                  <div className="col-md-12 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label required">Title</label>
                      <input
                        type="text"
                        name="title"
                        className="form-input"
                        placeholder="Enter news title"
                        value={ADDEDITDATA?.title || ""}
                        onChange={handleChange}
                      />
                      <CharCounter value={ADDEDITDATA?.title} min={LIMITS.title.min} max={LIMITS.title.max} />
                      {error.title && <div className="form-error">{error.title}</div>}
                    </div>
                  </div>

                  <div className="col-md-6 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label">Location</label>
                      <input
                        type="text"
                        name="location"
                        className="form-input"
                        placeholder="e.g. Phillaur, Punjab"
                        value={ADDEDITDATA?.location || ""}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="col-md-6 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label">News Date</label>
                      <input
                        type="date"
                        name="news_date"
                        className="form-input"
                        value={ADDEDITDATA?.news_date ? ADDEDITDATA.news_date.substring(0, 10) : ""}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="col-md-6 col-12 mb-3">
                    <label className="form-label">Event / Tournament</label>
                    <Select
                      value={ADDEDITDATA.event_id}
                      onChange={(value) => setAddEditData((prev) => ({ ...prev, event_id: value }))}
                      placeholder="Select event / tournament"
                      className="form-select"
                      style={{ width: "100%" }}
                      loading={loadingEvents}
                      size="large"
                      showSearch
                      optionFilterProp="children"
                      allowClear
                    >
                      {eventOptions.map((item) => (
                        <Option key={item.value} value={item.value}>
                          {item.label}
                        </Option>
                      ))}
                    </Select>
                    <FieldHint text="These options come from the Events / Tournaments admin module." />
                  </div>

                  <div className="col-md-3 col-12 mb-3">
                    <label className="form-label">Season</label>
                    <Select
                      value={ADDEDITDATA.season}
                      onChange={(value) => setAddEditData((prev) => ({ ...prev, season: value }))}
                      placeholder="Select season"
                      className="form-select"
                      style={{ width: "100%" }}
                      size="large"
                      allowClear
                    >
                      {SEASON_OPTIONS.map((item) => (
                        <Option key={item} value={item}>
                          {item}
                        </Option>
                      ))}
                    </Select>
                  </div>

                  <div className="col-md-3 col-12 mb-3">
                    <label className="form-label">Month</label>
                    <Select
                      value={ADDEDITDATA.news_month}
                      onChange={(value) => setAddEditData((prev) => ({ ...prev, news_month: value }))}
                      placeholder="Select month"
                      className="form-select"
                      style={{ width: "100%" }}
                      size="large"
                      allowClear
                    >
                      {MONTH_OPTIONS.map((item) => (
                        <Option key={item.value} value={item.value}>
                          {item.label}
                        </Option>
                      ))}
                    </Select>
                  </div>

                  <div className="col-md-3 col-12 mb-3">
                    <label className="form-label">Sort Order</label>
                    <input
                      type="number"
                      name="sort_order"
                      className="form-input"
                      min="0"
                      placeholder="0"
                      value={ADDEDITDATA?.sort_order ?? 0}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-3 col-12 mb-3">
                    <label className="form-label">Tour Type</label>
                    <Select
                      value={ADDEDITDATA.tour_type || "M"}
                      onChange={(value) => setAddEditData((prev) => ({ ...prev, tour_type: value, event_id: undefined }))}
                      className="form-select"
                      style={{ width: "100%" }}
                      size="large"
                    >
                      {TOUR_TYPE_OPTIONS.map((item) => (
                        <Option key={item.value} value={item.value}>
                          {item.label}
                        </Option>
                      ))}
                    </Select>
                    <FieldHint text="Choose whether this news item belongs to PGTI Main Tour or PGTI NextGen." />
                  </div>

                  <div className="col-md-3 col-12 mb-3">
                    <label className="form-label">Status</label>
                    <Select
                      value={ADDEDITDATA.status}
                      onChange={(value) => setAddEditData((prev) => ({ ...prev, status: value }))}
                      className="form-select"
                      style={{ width: "100%" }}
                      size="large"
                    >
                      <Option value="A">Active</Option>
                      <Option value="I">Inactive</Option>
                    </Select>
                  </div>

                  <div className="col-md-12 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label required">Short Description</label>
                      <textarea
                        name="short_description"
                        className="form-input"
                        rows={3}
                        placeholder="Brief summary shown on listing cards"
                        value={ADDEDITDATA?.short_description || ""}
                        onChange={handleChange}
                      />
                      <CharCounter value={ADDEDITDATA?.short_description} min={LIMITS.short_description.min} max={LIMITS.short_description.max} />
                      <FieldHint text="A short teaser shown on news listing cards and search results. Keep it factual and engaging." />
                      {error.short_description && <div className="form-error">{error.short_description}</div>}
                    </div>
                  </div>

                  <div className="col-md-12 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label required">Full Description</label>
                      <ReactQuill
                        theme="snow"
                        value={ADDEDITDATA?.description || ""}
                        onChange={(val) => {
                          setAddEditData((p) => ({ ...p, description: val }));
                          setError((p) => ({ ...p, description: "" }));
                        }}
                        placeholder="Enter full news article content..."
                        style={{ backgroundColor: "white", borderRadius: 8, marginBottom: 8 }}
                        modules={QUILL_MODULES}
                      />
                      <CharCounter value={ADDEDITDATA?.description?.replace(/<[^>]*>/g, '') || ""} min={LIMITS.description.min} max={LIMITS.description.max} />
                      <FieldHint text="Full article content. Include quotes, event details, and context. Rich text formatting is supported." />
                      {error.description && <div className="form-error">{error.description}</div>}
                    </div>
                  </div>

                  <div className="col-md-12 col-12 mb-3">
                    <ImageUploadField
                      label="News Image"
                      required={!ADDEDITDATA?.id}
                      value={ADDEDITDATA?.image || ""}
                      onChange={(url) => {
                        setAddEditData((p) => ({ ...p, image: url }));
                        setError((p) => ({ ...p, image: "" }));
                      }}
                      folder="cms/news"
                      previewH={200}
                      error={error.image}
                      spec={IMAGE_SPECS.news}
                    />
                    <ImageHint
                      recommended={IMAGE_SPECS.news.recommended}
                      maxSize={`${IMAGE_SPECS.news.maxMB}MB`}
                      note={IMAGE_SPECS.news.note}
                    />
                  </div>

                </div>
              </div>

              {/* ── International News Flag ──────────────────────── */}
              <div className="form-section">
                <h3 className="form-section-title">
                  <GlobalOutlined /> News Classification
                </h3>
                <div
                  className="permission-item"
                  style={{ cursor: "pointer", maxWidth: 400 }}
                  onClick={() => setAddEditData((p) => ({ ...p, is_international: !p.is_international }))}
                >
                  <div className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={!!ADDEDITDATA?.is_international}
                      readOnly
                    />
                  </div>
                  <div className="permission-content">
                    <label className="permission-label" style={{ cursor: "pointer", fontWeight: 600 }}>
                      International News
                    </label>
                    <p className="permission-description" style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
                      Check this to mark the news as international. It will appear in the International News section on the front-end.
                    </p>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">
                  <FileTextOutlined /> About PGTI Section
                </h3>
                <div className="col-md-12 col-12 mb-3 p-0">
                  <div className="form-group">
                    <label className="form-label">About PGTI Content</label>
                    <ReactQuill
                      theme="snow"
                      value={ADDEDITDATA?.about_pgti_content || ""}
                      onChange={(val) => {
                        setAddEditData((p) => ({ ...p, about_pgti_content: val }));
                      }}
                      placeholder="Add the About PGTI text shown at the end of the news detail page..."
                      style={{ backgroundColor: "white", borderRadius: 8, marginBottom: 8 }}
                      modules={QUILL_MODULES}
                    />
                    <FieldHint text="This rich text block is appended near the end of the news detail view." />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">
                  <InfoCircleOutlined /> Contact Information Source
                </h3>
                <div
                  style={{
                    border: "1px solid #dbeafe",
                    background: "#eff6ff",
                    borderRadius: 12,
                    padding: "16px 18px",
                    color: "#1e3a8a",
                    fontSize: 14,
                    lineHeight: 1.6,
                  }}
                >
                  Contact information for the end-of-page contact block comes from <strong>CMS / Contact Us</strong>.
                  Update that module to change the contact content shown with news pages.
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="action-button secondary" onClick={() => navigate("/admin/cms/news/list")}>
                  Cancel
                </button>
                <button type="submit" className="action-button primary" disabled={isLoading}>
                  {isLoading ? (
                    <><div className="loading-spinner small"></div>{ADDEDITDATA?.id ? "Updating..." : "Creating..."}</>
                  ) : (
                    <><SaveOutlined /> {ADDEDITDATA?.id ? "Update News" : "Create News"}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <LoadingEffect isLoading={isLoading} text="Saving..." />
    </div>
  );
}
