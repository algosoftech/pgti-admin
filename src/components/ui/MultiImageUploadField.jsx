import React, { useMemo, useRef, useState } from "react";
import { notification } from "antd";
import {
  CheckCircleOutlined,
  InfoCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { FieldHint, ImageHint } from "components/ui/FieldHint";
import { resolvePreviewMediaUrl, uploadMedia, uploadMultipleMedia } from "services/media.service";
import { validateImageFile } from "utils/fieldValidation";

const normalizeImages = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
};

const showError = (description) => {
  notification.open({
    message: "Oops!",
    description,
    placement: "topRight",
    icon: <InfoCircleOutlined style={{ color: "red" }} />,
    duration: 2,
  });
};

export default function MultiImageUploadField({
  label,
  value,
  onChange,
  folder = "common",
  spec,
  required = false,
  previewH = 100,
  minRequired = 0,
  helperText,
  guidelineNote,
}) {
  const singleInputRef = useRef(null);
  const multiInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const images = useMemo(() => normalizeImages(value), [value]);

  const updateImages = (nextImages) => {
    onChange?.(nextImages.filter(Boolean));
  };

  const handleSingleUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (spec && !validateImageFile(file, spec)) return;

    try {
      setIsUploading(true);
      const res = await uploadMedia(file, folder);
      if (!res?.status || !res?.url) {
        showError(res?.message || "Failed to upload image.");
        return;
      }
      updateImages([...images, res.url]);
      notification.open({
        message: "Uploaded",
        description: "Image added successfully.",
        placement: "topRight",
        icon: <CheckCircleOutlined style={{ color: "green" }} />,
        duration: 2,
      });
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
      const res = await uploadMultipleMedia(validFiles, folder);
      if (!res?.status || !Array.isArray(res?.urls)) {
        showError(res?.message || "Failed to upload images.");
        return;
      }
      updateImages([...images, ...res.urls]);
      notification.open({
        message: "Uploaded",
        description: `${res.urls.length} image(s) added successfully.`,
        placement: "topRight",
        icon: <CheckCircleOutlined style={{ color: "green" }} />,
        duration: 2,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeAt = (index) => {
    updateImages(images.filter((_, currentIndex) => currentIndex !== index));
  };

  return (
    <div className="form-group">
      {label && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
          <label className="form-label" style={{ marginBottom: 0 }}>
            {label} {required && <span className="required-mark">*</span>}
          </label>
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
      )}

      <FieldHint
        text={
          helperText
          || "Use Add Single to upload one image quickly. Use Add Multiple to upload the full set in one go."
        }
      />
      {spec && (
        <ImageHint
          recommended={spec.recommended}
          maxSize={`${spec.maxMB}MB`}
          note={guidelineNote || spec.note}
        />
      )}
      {minRequired > 0 && images.length < minRequired && (
        <div className="form-error" style={{ marginTop: 8 }}>
          At least {minRequired} image{minRequired > 1 ? "s are" : " is"} required.
        </div>
      )}

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

      <div
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 12,
        }}
      >
        {images.length === 0 && (
          <div
            style={{
              border: "1px dashed #cbd5e1",
              borderRadius: 10,
              minHeight: previewH,
              padding: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              color: "#64748b",
              background: "#f8fafc",
              gridColumn: "1 / -1",
            }}
          >
            No images selected yet.
          </div>
        )}

        {images.map((image, index) => (
          <div
            key={`${image}-${index}`}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              overflow: "hidden",
              background: "#f8fafc",
            }}
          >
            <div style={{ height: previewH, background: "#e2e8f0" }}>
              <img
                src={resolvePreviewMediaUrl(image)}
                alt={`${label || "Image"} ${index + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", background: "#fff" }}
              />
            </div>
            <div style={{ padding: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span style={{ fontSize: 12, color: "#334155", fontWeight: 600 }}>
                Image {index + 1}
              </span>
              <button
                type="button"
                className="action-button secondary"
                style={{ fontSize: 11, padding: "2px 8px" }}
                onClick={() => removeAt(index)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
