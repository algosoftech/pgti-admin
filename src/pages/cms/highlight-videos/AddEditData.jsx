import React, { useState, useEffect } from "react";
import { notification } from "antd";
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LoadingEffect from 'components/ui/Loading/LoadingEffect';
import { addEditHighlightVideo } from 'services/highlightVideo.service';
import { CharCounter, FieldHint } from 'components/ui/FieldHint';
import { LIMITS } from 'utils/fieldValidation';
import "styles/admin-pages.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVideo } from "@fortawesome/free-solid-svg-icons";

export default function HighlightVideoAddEditPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location?.state;
  const [error, setError] = useState({});
  const [formData, setFormData] = useState({
    title: state?.title || "",
    link: state?.link || "",
    ...state,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Saving...");

  useEffect(() => {
    document.title = `PGTI || Admin || ${formData?.id ? "Edit" : "Add"} Highlight & Video`;
  }, [formData?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const title = (e.target.title && e.target.title.value) || formData.title || "";
    const link = (e.target.link && e.target.link.value) || formData.link || "";

    if (!title.trim()) {
      notification.warning({
        message: "Title required",
        description: "Please enter a title.",
        placement: "topRight",
        icon: <InfoCircleOutlined style={{ color: "orange" }} />,
      });
      setError((prev) => ({ ...prev, title: "Title is required" }));
      return;
    }
    if (!link.trim()) {
      notification.warning({
        message: "Link required",
        description: "Please enter a YouTube video link.",
        placement: "topRight",
        icon: <InfoCircleOutlined style={{ color: "orange" }} />,
      });
      setError((prev) => ({ ...prev, link: "Link is required" }));
      return;
    }

    setIsLoading(true);
    try {
      const param = {
        title: title.trim(),
        link: link.trim(),
      };
      if (formData?.id) param.editId = formData.id;

      const res = await addEditHighlightVideo(param);
      if (res && res.status === true) {
        notification.success({
          message: "Success",
          description: formData?.id ? "Video updated successfully." : "Video added successfully.",
          placement: "topRight",
          icon: <CheckCircleOutlined style={{ color: "green" }} />,
        });
        navigate("/admin/cms/highlight-videos/list");
      } else {
        const errMsg = (res && typeof res.message !== "undefined" ? res.message : null)
          || (res && res.response && res.response.data && res.response.data.statusMessage)
          || "Failed to save.";
        notification.error({
          message: "Error",
          description: errMsg,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
        });
      }
    } catch (err) {
      const errMsg = err?.message || err?.response?.data?.statusMessage || "Something went wrong.";
      notification.error({
        message: "Error",
        description: errMsg,
        placement: "topRight",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">
              {formData?.id ? "Edit Highlight & Video" : "Add Highlight & Video"}
            </h1>
            <p className="page-subtitle">
              {formData?.id
                ? "Update title and YouTube link"
                : "Add a new highlight or YouTube video with title and link"}
            </p>
          </div>
          <Link to="/admin/cms/highlight-videos/list">
            <button className="action-button secondary">
              <ArrowLeftOutlined />
              Back to List
            </button>
          </Link>
        </div>
      </div>

      <div className="page-body">
      <div className="content-card">
        <div className="content-card-body">
          <form onSubmit={handleSubmit} className="modern-form">
            <div className="form-section">
              <h3 className="form-section-title">
                <FontAwesomeIcon icon={faVideo} className="form-section-icon" />
                Video Information
              </h3>

              <div className="form-group">
                <label htmlFor="title" className="form-label required">
                  Title
                  <span className="required-mark">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  className="form-input"
                  placeholder="e.g. Product launch highlight"
                  value={formData.title || ""}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <CharCounter value={formData.title} min={LIMITS.title.min} max={LIMITS.title.max} />
                {error.title && <div className="form-error">{error.title}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="link" className="form-label required">
                  YouTube Video Link
                  <span className="required-mark">*</span>
                </label>
                <input
                  type="url"
                  name="link"
                  id="link"
                  className="form-input"
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  value={formData.link || ""}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {error.link && <div className="form-error">{error.link}</div>}
                <FieldHint text="Paste the full YouTube or Vimeo URL. Supported formats: youtube.com/watch?v=..., youtu.be/..., vimeo.com/..." />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="action-button secondary"
                onClick={() => navigate("/admin/cms/highlight-videos/list")}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="action-button primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner small"></div>
                    {formData?.id ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <SaveOutlined />
                    {formData?.id ? "Update Video" : "Create Video"}
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
}
