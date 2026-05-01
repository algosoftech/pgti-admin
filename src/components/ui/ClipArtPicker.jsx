import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, notification, Button, Input } from "antd";
import {
  CheckOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { deleteMedia, listMedia, uploadMedia, uploadMultipleMedia } from "services/media.service";
import { validateImageFile } from "utils/fieldValidation";
import "styles/admin-pages.css";

const { Search } = Input;

const resolveImageSrc = (value) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value) || value.startsWith("//") || value.startsWith("blob:")) return value;
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(value)) return `https://${value}`;

  const cdnBase = (process.env.REACT_APP_BUNNY_CDN_PULL_ZONE || "").replace(/\/$/, "");
  if (cdnBase && !value.startsWith("/")) {
    const base = /^https?:\/\//i.test(cdnBase) ? cdnBase : `https://${cdnBase}`;
    return `${base}/${value.replace(/^\//, "")}`;
  }

  const imageBase = (process.env.REACT_APP_IMAGE_BASE_URL || "").replace(/\/$/, "");
  return `${imageBase}/${value.replace(/^\//, "")}`;
};

const getImageUrl = (image) => {
  if (typeof image === "string") return image;
  return image?.url || "";
};

const openToast = (message, description, color = "red") => {
  notification.open({
    message,
    description,
    placement: "topRight",
    icon: <InfoCircleOutlined style={{ color }} />,
    duration: 2,
  });
};

const ClipArtPicker = ({ open, onClose, onSelect, selectedImage, folder = "images", spec }) => {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isUploading, setIsUploading] = useState(false);

  const singleInputRef = useRef(null);
  const multiInputRef = useRef(null);
  const limit = 20;

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      const result = await listMedia({
        folder,
        skip: (currentPage - 1) * limit,
        limit,
      });

      if (result.status === true) {
        setImages(result.result || []);
        setTotalPages(Math.max(1, Math.ceil((result.count || 0) / limit)));
      } else {
        openToast("Oops!", result.message || "Failed to load gallery images.");
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      openToast("Oops!", "Failed to load images. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    fetchImages();
    setSearchTerm("");
  }, [open, currentPage, folder]);

  const filteredImages = useMemo(() => {
    if (!searchTerm.trim()) return images;
    const term = searchTerm.toLowerCase();
    return images.filter((img) =>
      [img?.filename, img?.folder, img?.url].some((field) => field?.toLowerCase().includes(term))
    );
  }, [images, searchTerm]);

  const handleDelete = (imageUrl, event) => {
    event.stopPropagation();

    Modal.confirm({
      title: "Delete Image",
      icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      content: "Are you sure you want to delete this image? This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const result = await deleteMedia(imageUrl);
          if (result.status === true) {
            notification.open({
              message: "Success",
              description: "Image deleted successfully.",
              placement: "topRight",
              icon: <CheckCircleOutlined style={{ color: "green" }} />,
              duration: 2,
            });
            await fetchImages();
          } else {
            openToast("Oops!", result.message || "Failed to delete image.");
          }
        } catch (error) {
          console.error("Delete error:", error);
          openToast("Oops!", "Failed to delete image. Please try again.");
        }
      },
    });
  };

  const handleSelect = (image) => {
    const imageUrl = getImageUrl(image);
    if (!imageUrl) return;
    onSelect?.(imageUrl);
    onClose?.();
  };

  const handleSingleUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (spec && !validateImageFile(file, spec)) return;

    try {
      setIsUploading(true);
      const result = await uploadMedia(file, folder);
      if (result?.status && result?.url) {
        notification.open({
          message: "Uploaded",
          description: "Image uploaded successfully.",
          placement: "topRight",
          icon: <CheckCircleOutlined style={{ color: "green" }} />,
          duration: 2,
        });
        await fetchImages();
        onSelect?.(result.url);
        onClose?.();
      } else {
        openToast("Oops!", result?.message || "Failed to upload image.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleMultipleUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (files.length === 0) return;

    const validFiles = spec ? files.filter((file) => validateImageFile(file, spec)) : files;
    if (validFiles.length === 0) return;

    try {
      setIsUploading(true);
      const result = await uploadMultipleMedia(validFiles, folder);
      if (result?.status && Array.isArray(result?.urls)) {
        notification.open({
          message: "Uploaded",
          description: `${result.urls.length} image(s) uploaded successfully.`,
          placement: "topRight",
          icon: <CheckCircleOutlined style={{ color: "green" }} />,
          duration: 2,
        });
        await fetchImages();
      } else {
        openToast("Oops!", result?.message || "Failed to upload images.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      title={<h3 style={{ margin: 0 }}>Select Image</h3>}
      open={open}
      onCancel={onClose}
      footer={null}
      width={960}
      className="clipart-picker-modal"
    >
      <div className="clipart-picker-container">
        <div
          className="clipart-picker-header"
          style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}
        >
          <Search
            placeholder="Search images..."
            allowClear
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", maxWidth: "400px" }}
            prefix={<SearchOutlined />}
          />

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              className="action-button secondary"
              onClick={() => singleInputRef.current?.click()}
              disabled={isUploading}
            >
              <UploadOutlined /> Add Single
            </button>
            <button
              type="button"
              className="action-button secondary"
              onClick={() => multiInputRef.current?.click()}
              disabled={isUploading}
            >
              <UploadOutlined /> Add Multiple
            </button>
          </div>
        </div>

        <div
          style={{
            marginBottom: 14,
            padding: "10px 12px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            fontSize: 12,
            color: "#475569",
          }}
        >
          Upload a new image here or select one that is already in the <strong>{folder}</strong> gallery.
        </div>

        <input
          ref={singleInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleSingleUpload}
        />
        <input
          ref={multiInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={handleMultipleUpload}
        />

        <div className="clipart-picker-grid">
          {isLoading || isUploading ? (
            <div className="clipart-picker-loading">
              <div className="loading-spinner"></div>
              <p>{isUploading ? "Uploading images..." : "Loading images..."}</p>
            </div>
          ) : filteredImages.length > 0 ? (
            filteredImages.map((image, index) => {
              const imageUrl = getImageUrl(image);
              const isSelected = selectedImage === imageUrl || selectedImage === image?.url;

              return (
                <div
                  key={image.id || index}
                  className={`clipart-picker-item ${isSelected ? "selected" : ""}`}
                  onClick={() => handleSelect(image)}
                >
                  <div className="clipart-picker-item-overlay">
                    <Button
                      type="primary"
                      icon={<CheckOutlined />}
                      className="clipart-picker-select-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(image);
                      }}
                    >
                      Select
                    </Button>
                    <Button
                      type="primary"
                      danger
                      icon={<DeleteOutlined />}
                      className="clipart-picker-delete-btn"
                      onClick={(e) => handleDelete(image.url || imageUrl, e)}
                    >
                      Delete
                    </Button>
                  </div>
                  {imageUrl && (
                    <img
                      src={resolveImageSrc(imageUrl)}
                      alt={image.filename || "Image"}
                      className="clipart-picker-image"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                  <div style={{ padding: "6px 8px", fontSize: 11, color: "#475569", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {image.filename || "Uploaded image"}
                  </div>
                  {isSelected && (
                    <div className="clipart-picker-selected-badge">
                      <CheckOutlined />
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="clipart-picker-empty">
              <p style={{ marginBottom: 10 }}>No images found in this gallery yet.</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                <button type="button" className="action-button secondary" onClick={() => singleInputRef.current?.click()}>
                  <UploadOutlined /> Add Single
                </button>
                <button type="button" className="action-button secondary" onClick={() => multiInputRef.current?.click()}>
                  <UploadOutlined /> Add Multiple
                </button>
              </div>
              {searchTerm && (
                <Button style={{ marginTop: 10 }} onClick={() => setSearchTerm("")}>
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="clipart-picker-pagination">
            <Button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
              Previous
            </Button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
              Next
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ClipArtPicker;
