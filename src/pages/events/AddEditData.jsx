import React, { useEffect, useState } from "react";
import { notification, Select, DatePicker } from "antd";
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import dayjs from "dayjs";

import LoadingEffect from "components/ui/Loading/LoadingEffect";
import ImageUploadField from "components/ui/ImageUploadField";
import { CharCounter, FieldHint, ImageHint } from "components/ui/FieldHint";
import { addEditEvent } from "services/events.service";
import { list as fetchArticles } from "services/articles.service";
import { IMAGE_SPECS, LIMITS, validateLength } from "utils/fieldValidation";
import "styles/admin-pages.css";

const { Option } = Select;

const EventAddEditPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location?.state;

  const [error, setError] = useState([]);
  const [ADDEDITDATA, setAddEditData] = useState(state || {});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText] = useState("Loading, please wait...");
  const [articles, setArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(false);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoadingArticles(true);
        const result = await fetchArticles({
          type: "",
          condition: { status: "A" },
          skip: 0,
          limit: 1000,
        });
        if (result.status === true && result.result) {
          setArticles(result.result);
        }
      } catch (loadError) {
        notification.open({
          message: "Oops!",
          description: "Failed to load articles. Please refresh the page.",
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
      } finally {
        setLoadingArticles(false);
      }
    };

    loadArticles();
  }, []);

  const handleChange = (e) => {
    setAddEditData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError((prev) => ({
      ...prev,
      [e.target.name]: "",
    }));
  };

  const handleArticleChange = (value) => {
    const selectedArticle = articles.find((article) => article.id === value);
    setAddEditData((prev) => ({
      ...prev,
      article_id: value,
      title: prev.title || selectedArticle?.title || "",
      image: prev.image || selectedArticle?.image || "",
    }));
    setError((prev) => ({
      ...prev,
      article_id: "",
    }));
  };

  const handleStartDateChange = (date) => {
    const formattedDate = date ? date.format("YYYY-MM-DD HH:mm:ss") : null;
    setAddEditData((prev) => ({
      ...prev,
      event_start: formattedDate,
    }));
    setError((prev) => ({
      ...prev,
      event_start: "",
    }));
  };

  const handleEndDateChange = (date) => {
    const formattedDate = date ? date.format("YYYY-MM-DD HH:mm:ss") : null;
    setAddEditData((prev) => ({
      ...prev,
      event_end: formattedDate,
    }));
    setError((prev) => ({
      ...prev,
      event_end: "",
    }));
  };

  const handleTermsConditionChange = (value) => {
    setAddEditData((prev) => ({
      ...prev,
      terms_condition: value,
    }));
    setError((prev) => ({
      ...prev,
      terms_condition: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      const formData = new FormData(e.target);

      if (!ADDEDITDATA?.article_id && !ADDEDITDATA?.title?.trim()) {
        notification.open({
          message: "Oops!",
          description: "Either select an article or enter a tournament title.",
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        return;
      }

      if (ADDEDITDATA?.title?.trim() && !validateLength(ADDEDITDATA.title, "Tournament Title", LIMITS.title)) return;

      if (!ADDEDITDATA?.image) {
        notification.open({
          message: "Oops!",
          description: "Tournament image is required.",
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        return;
      }

      if (!ADDEDITDATA?.event_start) {
        notification.open({
          message: "Oops!",
          description: "Event start date is required.",
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        return;
      }

      if (!ADDEDITDATA?.event_end) {
        notification.open({
          message: "Oops!",
          description: "Event end date is required.",
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        return;
      }

      if (dayjs(ADDEDITDATA?.event_end).isBefore(dayjs(ADDEDITDATA?.event_start))) {
        notification.open({
          message: "Oops!",
          description: "Event end date must be after start date.",
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        return;
      }

      if (!ADDEDITDATA?.terms_condition || !ADDEDITDATA?.terms_condition.trim()) {
        notification.open({
          message: "Oops!",
          description: "Terms & Conditions is required.",
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        return;
      }

      if (!validateLength(ADDEDITDATA.terms_condition, "Terms & Conditions", LIMITS.description, true)) return;

      if (formData.get("capacity") && parseInt(formData.get("capacity"), 10) <= 0) {
        notification.open({
          message: "Oops!",
          description: "Capacity must be greater than 0 when provided.",
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        return;
      }

      const payload = {
        ...(ADDEDITDATA?.id && { editId: ADDEDITDATA?.id }),
        article_id: ADDEDITDATA?.article_id,
        title: ADDEDITDATA?.title?.trim() || "",
        image: ADDEDITDATA?.image || "",
        location: ADDEDITDATA?.location?.trim() || "",
        terms_condition: ADDEDITDATA?.terms_condition || "",
        event_start: ADDEDITDATA?.event_start,
        event_end: ADDEDITDATA?.event_end,
        ...(formData.get("capacity") ? { capacity: parseInt(formData.get("capacity"), 10) } : {}),
        pro_am_details: ADDEDITDATA?.pro_am_details?.trim() || "",
        practice_round_details: ADDEDITDATA?.practice_round_details?.trim() || "",
      };

      const response = await addEditEvent(payload);
      if (response.status === true) {
        notification.open({
          message: "Success",
          description: ADDEDITDATA?.id ? "Tournament updated successfully" : "Tournament added successfully",
          placement: "topRight",
          icon: <CheckCircleOutlined style={{ color: "green" }} />,
          duration: 2,
        });
        navigate("/admin/cms/events/list");
      } else {
        notification.open({
          message: "Oops!",
          description: response?.message || "Failed to save tournament",
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
      }
    } catch (submitError) {
      notification.open({
        message: "Oops!",
        description: "An error occurred. Please try again.",
        placement: "topRight",
        icon: <InfoCircleOutlined style={{ color: "red" }} />,
        duration: 2,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = `PGTI || ${ADDEDITDATA?.id ? "Edit" : "Add"} Event`;
  }, [ADDEDITDATA?.id]);

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">{ADDEDITDATA?.id ? "Edit Tournament" : "Add New Tournament"}</h1>
            <p className="page-subtitle">
              {ADDEDITDATA?.id ? "Update tournament information" : "Create a tournament card with schedule, venue, and front filter details"}
            </p>
          </div>
          <Link to="/admin/cms/events/list">
            <button className="action-button secondary">
              <ArrowLeftOutlined />
              Back to Events / Tournaments
            </button>
          </Link>
        </div>
      </div>

      <div className="page-body">
        <div className="content-card">
          <div className="content-card-body">
            <form onSubmit={handleSubmit} className="modern-form">
              <input type="hidden" name="editId" id="editId" value={ADDEDITDATA?.id || ""} />

              <div className="form-section">
                <h3 className="form-section-title">
                  <CalendarOutlined />
                  Tournament Information
                </h3>

                <div className="row">
                  <div className="col-md-12 col-12 mb-3">
                    <div className="form-group">
                      <label htmlFor="article_id" className="form-label">
                        Related Article
                      </label>
                      <Select
                        name="article_id"
                        id="article_id"
                        placeholder="Select an article (optional)"
                        className="form-select"
                        value={ADDEDITDATA?.article_id}
                        onChange={handleArticleChange}
                        loading={loadingArticles}
                        style={{ width: "100%" }}
                        size="large"
                      >
                        {articles.map((article) => (
                          <Option key={article.id} value={article.id}>
                            {article.title}
                          </Option>
                        ))}
                      </Select>
                      {error.article_id && <div className="form-error">{error.article_id}</div>}
                      <FieldHint text="Optional. If selected, the article title and image can help prefill the tournament details." />
                    </div>
                  </div>

                  <div className="col-md-12 col-12 mb-3">
                    <div className="form-group">
                      <label htmlFor="title" className="form-label">
                        Tournament Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        id="title"
                        placeholder="Enter event / tournament title"
                        className="form-input"
                        value={ADDEDITDATA?.title || ""}
                        onChange={handleChange}
                      />
                      <CharCounter value={ADDEDITDATA?.title || ""} min={LIMITS.title.min} max={LIMITS.title.max} />
                    </div>
                  </div>

                  <div className="col-md-12 col-12 mb-3">
                    <ImageUploadField
                      label="Tournament Card Image"
                      required
                      value={ADDEDITDATA?.image || ""}
                      onChange={(url) => setAddEditData((prev) => ({ ...prev, image: url }))}
                      folder="events"
                      previewH={220}
                      spec={IMAGE_SPECS.events}
                    />
                    <ImageHint
                      recommended={IMAGE_SPECS.events.recommended}
                      maxSize={`${IMAGE_SPECS.events.maxMB}MB`}
                      note={IMAGE_SPECS.events.note}
                    />
                  </div>

                  <div className="col-md-6 col-12 mb-3">
                    <div className="form-group">
                      <label htmlFor="event_start" className="form-label required">
                        Event Start Date & Time
                      </label>
                      <DatePicker
                        showTime
                        format="YYYY-MM-DD HH:mm:ss"
                        placeholder="Select start date and time"
                        value={ADDEDITDATA?.event_start ? dayjs(ADDEDITDATA.event_start) : null}
                        onChange={handleStartDateChange}
                        style={{ width: "100%" }}
                        size="large"
                      />
                      {error.event_start && <div className="form-error">{error.event_start}</div>}
                    </div>
                  </div>

                  <div className="col-md-6 col-12 mb-3">
                    <div className="form-group">
                      <label htmlFor="event_end" className="form-label required">
                        Event End Date & Time
                      </label>
                      <DatePicker
                        showTime
                        format="YYYY-MM-DD HH:mm:ss"
                        placeholder="Select end date and time"
                        value={ADDEDITDATA?.event_end ? dayjs(ADDEDITDATA.event_end) : null}
                        onChange={handleEndDateChange}
                        style={{ width: "100%" }}
                        size="large"
                        disabledDate={(current) => {
                          if (ADDEDITDATA?.event_start) {
                            return current && current < dayjs(ADDEDITDATA.event_start).startOf("day");
                          }
                          return false;
                        }}
                      />
                      {error.event_end && <div className="form-error">{error.event_end}</div>}
                    </div>
                  </div>

                  <div className="col-md-6 col-12 mb-3">
                    <div className="form-group">
                      <label htmlFor="location" className="form-label">
                        Venue / Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        id="location"
                        placeholder="e.g. Kalhaar Blues & Greens Golf Club, Ahmedabad"
                        className="form-input"
                        value={ADDEDITDATA?.location || ""}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="col-md-6 col-12 mb-3">
                    <div className="form-group">
                      <label htmlFor="capacity" className="form-label">
                        Capacity
                      </label>
                      <input
                        type="number"
                        name="capacity"
                        id="capacity"
                        placeholder="Enter event capacity"
                        className="form-input"
                        value={ADDEDITDATA?.capacity || ""}
                        onChange={handleChange}
                        min="1"
                      />
                      {error.capacity && <div className="form-error">{error.capacity}</div>}
                      <FieldHint text="Optional. Keep this only if your tournament workflow needs a participant cap." />
                    </div>
                  </div>

                  <div className="col-md-6 col-12 mb-3">
                    <div className="form-group">
                      <label htmlFor="pro_am_details" className="form-label">
                        Pro-Am Details
                      </label>
                      <input
                        type="text"
                        name="pro_am_details"
                        id="pro_am_details"
                        placeholder="e.g. N/A or 12 Mar, 2026"
                        className="form-input"
                        value={ADDEDITDATA?.pro_am_details || ""}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="col-md-6 col-12 mb-3">
                    <div className="form-group">
                      <label htmlFor="practice_round_details" className="form-label">
                        Practice Round Details
                      </label>
                      <input
                        type="text"
                        name="practice_round_details"
                        id="practice_round_details"
                        placeholder="e.g. 24 Jan, 2024"
                        className="form-input"
                        value={ADDEDITDATA?.practice_round_details || ""}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="col-md-12 col-12 mb-3">
                    <div className="form-group">
                      <label htmlFor="terms_condition" className="form-label required">
                        Terms & Conditions
                      </label>
                      <ReactQuill
                        theme="snow"
                        value={ADDEDITDATA?.terms_condition || ""}
                        onChange={handleTermsConditionChange}
                        placeholder="Enter terms and conditions"
                        style={{
                          backgroundColor: "white",
                          borderRadius: "8px",
                          marginBottom: "8px",
                        }}
                        modules={{
                          toolbar: [
                            [{ header: [1, 2, 3, false] }],
                            ["bold", "italic", "underline", "strike"],
                            [{ list: "ordered" }, { list: "bullet" }],
                            [{ color: [] }, { background: [] }],
                            [{ align: [] }],
                            ["link"],
                            ["clean"],
                          ],
                        }}
                      />
                      <input type="hidden" name="terms_condition" value={ADDEDITDATA?.terms_condition || ""} />
                      <CharCounter
                        value={ADDEDITDATA?.terms_condition?.replace(/<[^>]*>/g, "") || ""}
                        min={LIMITS.description.min}
                        max={LIMITS.description.max}
                      />
                      <FieldHint text="Outline event rules, eligibility, cancellation policy, and any participant obligations. Rich formatting supported." />
                      {error.terms_condition && <div className="form-error">{error.terms_condition}</div>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="action-button secondary" onClick={() => navigate("/admin/cms/events/list")}>
                  Cancel
                </button>
                <button type="submit" className="action-button primary" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="loading-spinner small"></div>
                      {ADDEDITDATA?.id ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <SaveOutlined />
                      {ADDEDITDATA?.id ? "Update Tournament" : "Create Tournament"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <LoadingEffect isLoading={isLoading} text={loadingText} />
    </div>
  );
};

export default EventAddEditPage;
