import React, { useCallback, useEffect, useState } from "react";
import { Modal, notification, Select } from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import {
  faEdit,
  faThumbsDown,
  faThumbsUp,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import LoadingEffect from "components/ui/Loading/LoadingEffect";
import ImageUploadField from "components/ui/ImageUploadField";
import { FieldHint, ImageHint } from "components/ui/FieldHint";
import ListSortFilter from "components/common/ListSortFilter";
import {
  addEditGolfCourseMedia,
  changeGolfCourseMediaStatus,
  deleteGolfCourseMedia,
  listGolfCourseMedia,
} from "services/golfCourses.service";
import { IMAGE_SPECS } from "utils/fieldValidation";
import "styles/admin-pages.css";

const { Option } = Select;

const blankForm = {
  id: "",
  title: "",
  image: "",
  video_url: "",
  thumbnail: "",
  sort_order: 0,
  status: "A",
};

export default function GolfCourseMedia() {
  const navigate = useNavigate();
  const location = useLocation();
  const course = location?.state?.course || null;
  const mediaType = location?.state?.media_type || "photos";
  const isPhotos = mediaType === "photos";

  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(blankForm);
  const [sortState, setSortState] = useState({ sort_by: "", order: "asc" });

  const toast = (message, description, success = false) =>
    notification.open({
      message,
      description,
      placement: "topRight",
      icon: success ? <CheckCircleOutlined style={{ color: "green" }} /> : <InfoCircleOutlined style={{ color: "red" }} />,
      duration: 3,
    });

  const loadMedia = useCallback(async () => {
    if (!course?.id) return;
    setIsLoading(true);
    const res = await listGolfCourseMedia({
      skip: (page - 1) * limit,
      limit,
      course_id: course.id,
      media_type: mediaType,
      ...(sortState.sort_by ? { sort_by: sortState.sort_by, order: sortState.order } : {}),
    });
    if (res?.status) {
      setRows(res.result || []);
      setCount(res.count || 0);
    } else {
      toast("Oops!", res?.message || "Failed to load media.");
    }
    setIsLoading(false);
  }, [course?.id, limit, mediaType, page, sortState.order, sortState.sort_by]);

  useEffect(() => {
    if (!course?.id) {
      navigate("/admin/cms/golf-courses/list");
      return;
    }
    document.title = `PGTI || Admin || Golf Course ${isPhotos ? "Photos" : "Videos"}`;
    loadMedia();
  }, [course?.id, isPhotos, loadMedia, navigate]);

  const openAdd = () => {
    setFormData(blankForm);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setFormData({
      id: item.id || "",
      title: item.title || "",
      image: item.image || "",
      video_url: item.video_url || "",
      thumbnail: item.thumbnail || "",
      sort_order: item.sort_order || 0,
      status: item.status || "A",
    });
    setModalOpen(true);
  };

  const submitMedia = async () => {
    if (!formData.title?.trim()) {
      toast("Oops!", "Title is required.");
      return;
    }
    if (isPhotos && !formData.image) {
      toast("Oops!", "Photo image is required.");
      return;
    }
    if (!isPhotos && !formData.video_url?.trim()) {
      toast("Oops!", "Video URL is required.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await addEditGolfCourseMedia({
        ...(formData.id && { editId: formData.id }),
        course_id: course.id,
        media_type: mediaType,
        title: formData.title.trim(),
        image: formData.image,
        video_url: formData.video_url.trim(),
        thumbnail: formData.thumbnail,
        sort_order: Number(formData.sort_order || 0),
        status: formData.status || "A",
      });

      if (res?.status) {
        toast("Success", `${isPhotos ? "Photo" : "Video"} saved successfully.`, true);
        setModalOpen(false);
        loadMedia();
      } else {
        toast("Oops!", res?.message || "Failed to save media.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const changeStatus = async (item, status) => {
    const res = await changeGolfCourseMediaStatus({ id: item.id, media_type: mediaType, status });
    if (res?.status) {
      toast("Success", "Media status updated successfully.", true);
      loadMedia();
    } else {
      toast("Oops!", res?.message || "Failed to update status.");
    }
  };

  const deleteMedia = (item) => {
    Modal.confirm({
      title: `Delete this ${isPhotos ? "photo" : "video"}?`,
      content: item?.title || "This media item will be removed.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        const res = await deleteGolfCourseMedia({ id: item.id, media_type: mediaType });
        if (res?.status) {
          toast("Success", "Media deleted successfully.", true);
          loadMedia();
        } else {
          toast("Oops!", res?.message || "Failed to delete media.");
        }
      },
    });
  };

  const totalPages = Math.max(1, Math.ceil((count || 0) / limit));

  const handleSortChange = (next) => {
    setSortState(next);
    setPage(1);
  };

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">{isPhotos ? "Golf Course Photos" : "Golf Course Videos"}</h1>
            <p className="page-subtitle">{course?.name || "Selected golf course"}</p>
          </div>
          <div className="d-flex gap-2">
            <button className="action-button secondary" onClick={() => navigate("/admin/cms/golf-courses/list")}>
              <ArrowLeftOutlined />
              Back
            </button>
            <button className="action-button primary" onClick={openAdd}>
              <PlusOutlined />
              Add {isPhotos ? "Photo" : "Video"}
            </button>
          </div>
        </div>
      </div>

      <div className="page-body">
        <div className="content-card">
          <div className="content-card-body">
            <ListSortFilter
              value={sortState}
              onChange={handleSortChange}
              options={[
                { value: "title", label: "Title" },
                { value: "sort_order", label: "Sort Order" },
                { value: "created_at", label: "Created Date" },
                { value: "updated_at", label: "Updated Date" },
              ]}
            />
            <div className="table-responsive">
              <table className="table modern-table">
                <thead>
                  <tr>
                    <th style={{ width: 70 }}>#</th>
                    <th>Title</th>
                    <th style={{ width: 220 }}>{isPhotos ? "Image" : "Video"}</th>
                    <th style={{ width: 110 }}>Status</th>
                    <th style={{ width: 220 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length ? rows.map((item, index) => (
                    <tr key={item.id}>
                      <td>{(page - 1) * limit + index + 1}</td>
                      <td>
                        <div className="font-weight-600">{item.title}</div>
                        <div className="text-muted">Sort order: {item.sort_order || 0}</div>
                      </td>
                      <td>
                        {isPhotos ? (
                          item.image ? <img src={item.image} alt={item.title} style={{ width: 96, height: 64, objectFit: "cover", borderRadius: 8 }} /> : "No image"
                        ) : (
                          <a href={item.video_url} target="_blank" rel="noreferrer">Open video</a>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${item.status === "A" ? "active" : "inactive"}`}>
                          {item.status === "A" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          <button className="action-button secondary small" onClick={() => openEdit(item)}>
                            <FontAwesomeIcon icon={faEdit} />
                            Edit
                          </button>
                          {item.status === "A" ? (
                            <button className="action-button secondary small" onClick={() => changeStatus(item, "I")}>
                              <FontAwesomeIcon icon={faThumbsDown} />
                              Deactivate
                            </button>
                          ) : (
                            <button className="action-button secondary small" onClick={() => changeStatus(item, "A")}>
                              <FontAwesomeIcon icon={faThumbsUp} />
                              Activate
                            </button>
                          )}
                          <button className="action-button danger small" onClick={() => deleteMedia(item)}>
                            <FontAwesomeIcon icon={faTrash} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted">No {isPhotos ? "photos" : "videos"} added yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3">
              <select className="form-input" style={{ width: 130 }} value={limit} onChange={(event) => { setLimit(Number(event.target.value)); setPage(1); }}>
                {[10, 20, 50].map((item) => <option key={item} value={item}>{item} / page</option>)}
              </select>
              <div className="d-flex gap-2">
                <button className="action-button secondary" disabled={page <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>Previous</button>
                <span className="d-flex align-items-center px-3">Page {page} of {totalPages}</span>
                <button className="action-button secondary" disabled={page >= totalPages} onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}>Next</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        title={`${formData.id ? "Edit" : "Add"} ${isPhotos ? "Photo" : "Video"}`}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={submitMedia}
        okText={formData.id ? "Update" : "Save"}
        width={820}
      >
        <div className="modern-form">
          <div className="row">
            <div className="col-md-8 col-12 mb-3">
              <label className="form-label required">Title</label>
              <input
                className="form-input"
                value={formData.title}
                onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
                placeholder={isPhotos ? "e.g. The 18th Fairway" : "e.g. Course flyover video"}
              />
            </div>
            <div className="col-md-4 col-12 mb-3">
              <label className="form-label">Status</label>
              <Select
                value={formData.status}
                onChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                style={{ width: "100%" }}
              >
                <Option value="A">Active</Option>
                <Option value="I">Inactive</Option>
              </Select>
            </div>
            <div className="col-md-4 col-12 mb-3">
              <label className="form-label">Sort Order</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={formData.sort_order}
                onChange={(event) => setFormData((prev) => ({ ...prev, sort_order: event.target.value }))}
              />
            </div>

            {isPhotos ? (
              <div className="col-12 mb-3">
                <ImageUploadField
                  label="Photo Image"
                  required
                  value={formData.image}
                  onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
                  folder="cms/golf-courses/photos"
                  previewH={220}
                  spec={IMAGE_SPECS.common}
                />
                <ImageHint recommended={IMAGE_SPECS.common.recommended} maxSize={`${IMAGE_SPECS.common.maxMB}MB`} note="Shown in the golf course photo gallery." />
              </div>
            ) : (
              <>
                <div className="col-12 mb-3">
                  <label className="form-label required">Video URL</label>
                  <input
                    className="form-input"
                    value={formData.video_url}
                    onChange={(event) => setFormData((prev) => ({ ...prev, video_url: event.target.value }))}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <FieldHint text="Use a YouTube, Vimeo, or hosted video URL." />
                </div>
                <div className="col-12 mb-3">
                  <ImageUploadField
                    label="Video Thumbnail"
                    value={formData.thumbnail}
                    onChange={(url) => setFormData((prev) => ({ ...prev, thumbnail: url }))}
                    folder="cms/golf-courses/videos"
                    previewH={180}
                    spec={IMAGE_SPECS.common}
                  />
                  <ImageHint recommended={IMAGE_SPECS.common.recommended} maxSize={`${IMAGE_SPECS.common.maxMB}MB`} note="Optional thumbnail for the video card." />
                </div>
              </>
            )}
          </div>
        </div>
      </Modal>

      <LoadingEffect isLoading={isLoading} text="Working..." />
    </div>
  );
}
