import React, { useEffect, useMemo, useState } from "react";
import { notification, Select } from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  SaveOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import LoadingEffect from "components/ui/Loading/LoadingEffect";
import { FieldHint } from "components/ui/FieldHint";
import { addEditTvTiming } from "services/tvTimings.service";
import { list as listEvents } from "services/events.service";
import { TOUR_TYPE_OPTIONS } from "utils/tourType";
import "styles/admin-pages.css";

const { Option } = Select;

const buildInitialState = (state = {}) => ({
  id: state?.id || "",
  event_id: state?.event_id || undefined,
  detail: state?.detail || "",
  status: state?.status || "A",
  tour_type: state?.tour_type || "M",
});

export default function TvTimingsAddEditData() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location?.state || {};

  const [formData, setFormData] = useState(buildInitialState(state));
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    document.title = `PGTI || ${formData?.id ? "Edit" : "Add"} TV Timings`;
  }, [formData?.id]);

  useEffect(() => {
    const loadEvents = async () => {
      setLoadingEvents(true);
      const res = await listEvents({ skip: 0, limit: 1000, condition: { status: "A", tour_type: formData.tour_type || "M" } });
      if (res?.status) {
        setEvents(res.result || []);
      } else {
        notification.open({
          message: "Oops!",
          description: res?.message || "Failed to load tournament options.",
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 3,
        });
      }
      setLoadingEvents(false);
    };

    loadEvents();
  }, [formData.tour_type]);

  const eventOptions = useMemo(
    () =>
      (events || []).map((item) => ({
        value: item.id,
        label: item.title || item.article_title || `Event ${item.id}`,
      })),
    [events]
  );

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

      if (!formData.event_id) {
        notifyError("Please select a tournament.");
        setIsLoading(false);
        return;
      }
      if (!formData.detail?.trim()) {
        notifyError("TV timing detail is required.");
        setIsLoading(false);
        return;
      }

      const res = await addEditTvTiming({
        ...(formData.id && { editId: formData.id }),
        event_id: Number(formData.event_id),
        detail: formData.detail,
        status: formData.status || "A",
        tour_type: formData.tour_type || "M",
      });

      if (res?.status) {
        notification.open({
          message: "Success",
          description: formData.id ? "TV timing updated successfully." : "TV timing created successfully.",
          placement: "topRight",
          icon: <CheckCircleOutlined style={{ color: "green" }} />,
          duration: 2,
        });
        navigate("/admin/cms/tv-timings/list");
      } else {
        notifyError(res?.message || "Failed to save TV timing.");
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
            <h1 className="page-title">{formData?.id ? "Edit TV Timings" : "Add TV Timings"}</h1>
            <p className="page-subtitle">
              Link TV timing detail content to a tournament so it appears in tournament detail tabs.
            </p>
          </div>
          <Link to="/admin/cms/tv-timings/list">
            <button className="action-button secondary">
              <ArrowLeftOutlined />
              Back to TV Timings
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
                  <VideoCameraOutlined />
                  TV Timings Content
                </h3>

                <div className="row">
                  <div className="col-md-8 col-12 mb-3">
                    <label className="form-label required">Tournament / Tour Id</label>
                    <Select
                      value={formData.event_id}
                      onChange={(value) => setFormData((prev) => ({ ...prev, event_id: value }))}
                      placeholder="Select tournament"
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
                    <FieldHint text="These tournament options come from the Events / Tournaments admin module." />
                  </div>

                  <div className="col-md-4 col-12 mb-3">
                    <label className="form-label">Tour Type</label>
                    <Select
                      value={formData.tour_type}
                      onChange={(value) => setFormData((prev) => ({ ...prev, tour_type: value, event_id: undefined }))}
                      className="form-select"
                      style={{ width: "100%" }}
                      size="large"
                    >
                      {TOUR_TYPE_OPTIONS.map((option) => (
                        <Option key={option.value} value={option.value}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  </div>

                  <div className="col-md-4 col-12 mb-3">
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

                  <div className="col-12 mb-3">
                    <label className="form-label required">Detail</label>
                    <ReactQuill
                      theme="snow"
                      value={formData.detail}
                      onChange={(value) => setFormData((prev) => ({ ...prev, detail: value }))}
                      placeholder="Add TV timings detail for this tournament..."
                      style={{ backgroundColor: "white", borderRadius: "8px", marginBottom: "8px" }}
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
                    <FieldHint text="This rich text content will be returned in the tournament detail API for the TV Timings tab." />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="action-button secondary" onClick={() => navigate("/admin/cms/tv-timings/list")}>
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
                      {formData?.id ? "Update TV Timings" : "Create TV Timings"}
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
