import React, { useEffect, useMemo, useState } from "react";
import { notification, Select } from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  PictureOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";

import LoadingEffect from "components/ui/Loading/LoadingEffect";
import ImageUploadField from "components/ui/ImageUploadField";
import { CharCounter, FieldHint, ImageHint } from "components/ui/FieldHint";
import { addEditGallery } from "services/gallery.service";
import { list as listEvents } from "services/events.service";
import { IMAGE_SPECS, LIMITS, validateLength } from "utils/fieldValidation";
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

const buildInitialState = (state = {}) => ({
  id: state?.id || "",
  title: state?.title || "",
  description: state?.description || "",
  image: state?.image || "",
  event_id: state?.event_id || undefined,
  season: state?.season || currentYear,
  gallery_month: state?.gallery_month || undefined,
  sort_order: state?.sort_order || 0,
  status: state?.status || "A",
});

export default function GalleryAddEditData() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location?.state || {};

  const [formData, setFormData] = useState(buildInitialState(state));
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    document.title = `PGTI || ${formData?.id ? "Edit" : "Add"} Gallery Item`;
  }, [formData?.id]);

  useEffect(() => {
    const loadEvents = async () => {
      setLoadingEvents(true);
      const res = await listEvents({ skip: 0, limit: 1000, condition: { status: "A" } });
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
  }, []);

  const eventOptions = useMemo(
    () =>
      (events || []).map((item) => ({
        value: item.id,
        label: item.title || item.article_title || `Event ${item.id}`,
      })),
    [events]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const notifyError = (description) => {
    notification.open({
      message: "Oops!",
      description,
      placement: "topRight",
      icon: <InfoCircleOutlined style={{ color: "red" }} />,
      duration: 3,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setIsLoading(true);

      if (!formData.title?.trim()) {
        notifyError("Gallery title is required.");
        setIsLoading(false);
        return;
      }
      if (!validateLength(formData.title, "Gallery Title", LIMITS.title)) {
        setIsLoading(false);
        return;
      }
      if (!formData.description?.trim()) {
        notifyError("Gallery description is required.");
        setIsLoading(false);
        return;
      }
      if (!validateLength(formData.description, "Gallery Description", LIMITS.short_description)) {
        setIsLoading(false);
        return;
      }
      if (!formData.image) {
        notifyError("Gallery image is required.");
        setIsLoading(false);
        return;
      }
      if (!formData.event_id) {
        notifyError("Please select an event / tournament.");
        setIsLoading(false);
        return;
      }
      if (!formData.season) {
        notifyError("Season is required.");
        setIsLoading(false);
        return;
      }
      if (!formData.gallery_month) {
        notifyError("Month is required.");
        setIsLoading(false);
        return;
      }

      const res = await addEditGallery({
        ...(formData.id && { editId: formData.id }),
        title: formData.title.trim(),
        description: formData.description.trim(),
        image: formData.image,
        event_id: Number(formData.event_id),
        season: Number(formData.season),
        gallery_month: Number(formData.gallery_month),
        sort_order: Number(formData.sort_order || 0),
        status: formData.status || "A",
      });

      if (res?.status) {
        notification.open({
          message: "Success",
          description: formData.id ? "Gallery item updated successfully." : "Gallery item created successfully.",
          placement: "topRight",
          icon: <CheckCircleOutlined style={{ color: "green" }} />,
          duration: 2,
        });
        navigate("/admin/cms/gallery/list");
      } else {
        notifyError(res?.message || "Failed to save gallery item.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">{formData?.id ? "Edit Gallery Item" : "Add Gallery Item"}</h1>
            <p className="page-subtitle">
              Add photo gallery items with season, month, and event / tournament mapping for the front filters.
            </p>
          </div>
          <Link to="/admin/cms/gallery/list">
            <button className="action-button secondary">
              <ArrowLeftOutlined />
              Back to Gallery
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
                  <PictureOutlined />
                  Gallery Content
                </h3>

                <div className="row">
                  <div className="col-md-12 col-12 mb-3">
                    <ImageUploadField
                      label="Gallery Image"
                      required
                      value={formData.image}
                      onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
                      folder="cms/gallery"
                      previewH={240}
                      spec={IMAGE_SPECS["cms/gallery"]}
                    />
                    <ImageHint
                      recommended={IMAGE_SPECS["cms/gallery"].recommended}
                      maxSize={`${IMAGE_SPECS["cms/gallery"].maxMB}MB`}
                      note={IMAGE_SPECS["cms/gallery"].note}
                    />
                  </div>

                  <div className="col-md-12 col-12 mb-3">
                    <label className="form-label required">Gallery Title</label>
                    <input
                      type="text"
                      className="form-input"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter the gallery card title"
                    />
                    <CharCounter value={formData.title} min={LIMITS.title.min} max={LIMITS.title.max} />
                  </div>

                  <div className="col-md-12 col-12 mb-3">
                    <label className="form-label required">Gallery Description</label>
                    <textarea
                      className="form-input"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter the short description shown below the image"
                    />
                    <CharCounter value={formData.description} min={LIMITS.short_description.min} max={LIMITS.short_description.max} />
                    <FieldHint text="This text appears under the gallery image on the front listing card." />
                  </div>

                  <div className="col-md-6 col-12 mb-3">
                    <label className="form-label required">Event / Tournament</label>
                    <Select
                      value={formData.event_id}
                      onChange={(value) => setFormData((prev) => ({ ...prev, event_id: value }))}
                      placeholder="Select event / tournament"
                      className="form-select"
                      style={{ width: "100%" }}
                      loading={loadingEvents}
                      size="large"
                      showSearch
                      optionFilterProp="children"
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
                    <label className="form-label required">Season</label>
                    <Select
                      value={formData.season}
                      onChange={(value) => setFormData((prev) => ({ ...prev, season: value }))}
                      placeholder="Select season"
                      className="form-select"
                      style={{ width: "100%" }}
                      size="large"
                    >
                      {SEASON_OPTIONS.map((item) => (
                        <Option key={item} value={item}>
                          {item}
                        </Option>
                      ))}
                    </Select>
                  </div>

                  <div className="col-md-3 col-12 mb-3">
                    <label className="form-label required">Month</label>
                    <Select
                      value={formData.gallery_month}
                      onChange={(value) => setFormData((prev) => ({ ...prev, gallery_month: value }))}
                      placeholder="Select month"
                      className="form-select"
                      style={{ width: "100%" }}
                      size="large"
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
                      className="form-input"
                      name="sort_order"
                      min="0"
                      value={formData.sort_order}
                      onChange={handleChange}
                      placeholder="0"
                    />
                  </div>

                  <div className="col-md-3 col-12 mb-3">
                    <label className="form-label">Status</label>
                    <Select
                      value={formData.status}
                      onChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                      className="form-select"
                      style={{ width: "100%" }}
                      size="large"
                    >
                      <Option value="A">Active</Option>
                      <Option value="I">Inactive</Option>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="action-button secondary" onClick={() => navigate("/admin/cms/gallery/list")}>
                  Cancel
                </button>
                <button type="submit" className="action-button primary" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="loading-spinner small"></div>
                      {formData?.id ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <SaveOutlined />
                      {formData?.id ? "Update Gallery Item" : "Create Gallery Item"}
                    </>
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
