import React, { useEffect, useState } from "react";
import { notification, Select } from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  PictureOutlined,
  SaveOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import LoadingEffect from "components/ui/Loading/LoadingEffect";
import { CharCounter, FieldHint } from "components/ui/FieldHint";
import { addEditGolfCourse } from "services/golfCourses.service";
import { TOUR_TYPE_OPTIONS } from "utils/tourType";
import { LIMITS, validateLength } from "utils/fieldValidation";
import "styles/admin-pages.css";

const { Option } = Select;

const buildInitialState = (state = {}) => ({
  id: state?.id || "",
  name: state?.name || "",
  detail: state?.detail || "",
  tour_type: state?.tour_type || "M",
  sort_order: state?.sort_order || 0,
  status: state?.status || "A",
});

export default function GolfCourseAddEditData() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState(buildInitialState(location?.state || {}));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = `PGTI || ${formData?.id ? "Edit" : "Add"} Golf Course`;
  }, [formData?.id]);

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
    setIsLoading(true);
    try {
      if (!formData.name?.trim()) {
        notifyError("Golf course name is required.");
        return;
      }
      if (!validateLength(formData.name, "Golf Course Name", LIMITS.title)) return;
      if (formData.detail && !validateLength(formData.detail, "Golf Course Detail", LIMITS.description, true)) return;

      const res = await addEditGolfCourse({
        ...(formData.id && { editId: formData.id }),
        name: formData.name.trim(),
        detail: formData.detail || "",
        tour_type: formData.tour_type || "M",
        sort_order: Number(formData.sort_order || 0),
        status: formData.status || "A",
      });

      if (res?.status) {
        notification.open({
          message: "Success",
          description: formData.id ? "Golf course updated successfully." : "Golf course created successfully.",
          placement: "topRight",
          icon: <CheckCircleOutlined style={{ color: "green" }} />,
          duration: 2,
        });
        navigate("/admin/cms/golf-courses/list");
      } else {
        notifyError(res?.message || "Failed to save golf course.");
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
            <h1 className="page-title">{formData?.id ? "Edit Golf Course" : "Add Golf Course"}</h1>
            <p className="page-subtitle">Maintain course description content used by the front golf course section.</p>
          </div>
          <Link to="/admin/cms/golf-courses/list">
            <button className="action-button secondary">
              <ArrowLeftOutlined />
              Back to Golf Courses
            </button>
          </Link>
        </div>
      </div>

      <div className="page-body">
        <div className="content-card">
          <div className="content-card-body">
            <form onSubmit={handleSubmit} className="modern-form">
              <div className="form-section">
                <h3 className="form-section-title">Golf Course Detail</h3>

                <div className="row">
                  <div className="col-md-8 col-12 mb-3">
                    <label className="form-label required">Golf Course Name</label>
                    <input
                      className="form-input"
                      value={formData.name}
                      onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                      placeholder="e.g. Chandigarh Golf Club"
                    />
                    <CharCounter value={formData.name} min={LIMITS.title.min} max={LIMITS.title.max} />
                  </div>

                  <div className="col-md-4 col-12 mb-3">
                    <label className="form-label">Tour Type</label>
                    <Select
                      value={formData.tour_type}
                      onChange={(value) => setFormData((prev) => ({ ...prev, tour_type: value }))}
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
                  </div>

                  <div className="col-md-3 col-12 mb-3">
                    <label className="form-label">Sort Order</label>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      value={formData.sort_order}
                      onChange={(event) => setFormData((prev) => ({ ...prev, sort_order: event.target.value }))}
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

                  <div className="col-12 mb-3">
                    <label className="form-label">Golf Detail</label>
                    <ReactQuill
                      theme="snow"
                      value={formData.detail}
                      onChange={(value) => setFormData((prev) => ({ ...prev, detail: value }))}
                      placeholder="Add golf course history, details, course record, and notes..."
                      style={{ backgroundColor: "white", borderRadius: 8, marginBottom: 8 }}
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
                    <FieldHint text="This rich text is returned to the front in the golf course detail API." />
                  </div>
                </div>
              </div>

              {formData.id ? (
                <div className="form-section">
                  <h3 className="form-section-title">Photos & Videos</h3>
                  <div className="row">
                    <div className="col-md-6 col-12 mb-3">
                      <div className="content-card" style={{ margin: 0 }}>
                        <div className="content-card-body d-flex justify-content-between align-items-center gap-3">
                          <div>
                            <h4 className="mb-1">Course Photos</h4>
                            <p className="page-subtitle mb-0">Add gallery images for this golf course.</p>
                          </div>
                          <button
                            type="button"
                            className="action-button secondary"
                            onClick={() =>
                              navigate("/admin/cms/golf-courses/media", {
                                state: { course: formData, media_type: "photos" },
                              })
                            }
                          >
                            <PictureOutlined />
                            Manage Photos
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6 col-12 mb-3">
                      <div className="content-card" style={{ margin: 0 }}>
                        <div className="content-card-body d-flex justify-content-between align-items-center gap-3">
                          <div>
                            <h4 className="mb-1">Course Videos</h4>
                            <p className="page-subtitle mb-0">Add video URLs and thumbnails for this golf course.</p>
                          </div>
                          <button
                            type="button"
                            className="action-button secondary"
                            onClick={() =>
                              navigate("/admin/cms/golf-courses/media", {
                                state: { course: formData, media_type: "videos" },
                              })
                            }
                          >
                            <VideoCameraOutlined />
                            Manage Videos
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <FieldHint text="Create or save the golf course first, then use these buttons to add photos and videos." />
                </div>
              ) : (
                <div className="form-section">
                  <h3 className="form-section-title">Photos & Videos</h3>
                  <FieldHint text="Save this golf course first. After it is created, the edit page will show Manage Photos and Manage Videos buttons." />
                </div>
              )}

              <div className="form-actions">
                <button type="button" className="action-button secondary" onClick={() => navigate("/admin/cms/golf-courses/list")}>
                  Cancel
                </button>
                <button type="submit" className="action-button primary" disabled={isLoading}>
                  <SaveOutlined />
                  {formData.id ? "Update Golf Course" : "Create Golf Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <LoadingEffect isLoading={isLoading} text="Saving golf course..." />
    </div>
  );
}
