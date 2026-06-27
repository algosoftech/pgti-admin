import React, { useRef, useState } from "react";
import { notification } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  FolderOpenOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  PictureOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { resolvePreviewMediaUrl, uploadMedia } from "services/media.service";
import { validateImageFile } from "utils/fieldValidation";
import ImageEditor from "components/ui/ImageEditor";
import { FieldHint } from "components/ui/FieldHint";
import "styles/admin-pages.css";

const notify = (message, description, color = "red") => {
  notification.open({
    message,
    description,
    placement: "topRight",
    icon: <InfoCircleOutlined style={{ color }} />,
    duration: 3,
  });
};

const ImageUploadField = ({
  value = "",
  onChange,
  folder = "common",
  label,
  required = false,
  hint,
  previewH = 110,
  error,
  spec,
}) => {
  const editInputRef = useRef(null);
  const directInputRef = useRef(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loadingCurrentImage, setLoadingCurrentImage] = useState(false);

  const createFileFromCurrentImage = async () => {
    const imageUrl = resolvePreviewMediaUrl(value);
    if (!imageUrl) throw new Error("Missing image URL");

    const response = await fetch(imageUrl, { mode: "cors" });
    if (!response.ok) throw new Error("Image not accessible");

    const blob = await response.blob();
    const contentType = blob.type || "image/jpeg";
    const extension = contentType.includes("png")
      ? "png"
      : contentType.includes("webp")
        ? "webp"
        : "jpg";

    return new File([blob], `current-image.${extension}`, { type: contentType });
  };

  const handleEditCurrentImage = async () => {
    if (!value || loadingCurrentImage || uploading) return;

    try {
      setLoadingCurrentImage(true);
      const file = await createFileFromCurrentImage();
      setPendingFile(file);
      setEditorOpen(true);
    } catch {
      notify(
        "Edit unavailable",
        "The existing image could not be loaded for editing. Please use Replace (Upload & Edit) to upload it again."
      );
    } finally {
      setLoadingCurrentImage(false);
    }
  };

  const handleEditFlowSelect = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (spec && !validateImageFile(file, spec)) return;
    setPendingFile(file);
    setEditorOpen(true);
  };

  const handleDirectUploadSelect = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (spec && !validateImageFile(file, spec)) return;

    try {
      setUploading(true);
      const res = await uploadMedia(file, folder);
      if (res?.status === true) {
        onChange?.(res?.url || "");
        notification.open({
          message: "Uploaded",
          description: "Image uploaded successfully.",
          placement: "topRight",
          icon: <CheckCircleOutlined style={{ color: "green" }} />,
          duration: 2,
        });
      } else {
        notify("Upload failed", res?.message || "Could not upload image.");
      }
    } catch {
      notify("Error", "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleEditorSave = async (editedFile) => {
    try {
      setUploading(true);
      setEditorOpen(false);
      setPendingFile(null);
      const res = await uploadMedia(editedFile, folder);
      if (res?.status === true) {
        onChange?.(res?.url || "");
        notification.open({
          message: "Uploaded",
          description: "Image uploaded successfully.",
          placement: "topRight",
          icon: <CheckCircleOutlined style={{ color: "green" }} />,
          duration: 2,
        });
      } else {
        notify("Upload failed", res?.message || "Could not upload image.");
      }
    } catch {
      notify("Error", "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const clear = () => onChange?.("");

  return (
    <div className="form-group" style={{ marginBottom: 0 }}>
      {label && (
        <label className="form-label">
          {label} {required && <span className="required-mark">*</span>}
        </label>
      )}

      <div
        style={{
          border: `2px dashed ${error ? "#ef4444" : value ? "#0ea5e9" : "#e2e8f0"}`,
          borderRadius: 10,
          overflow: "hidden",
          background: "#f8fafc",
          transition: "border-color 0.2s",
        }}
      >
        {value ? (
          <div style={{ position: "relative" }}>
            <img
              src={resolvePreviewMediaUrl(value)}
              alt="preview"
              style={{ width: "100%", height: previewH, objectFit: "contain", display: "block", background: "#fff" }}
              onError={(e) => {
                e.target.style.opacity = "0";
                if (e.target.nextElementSibling) e.target.nextElementSibling.style.opacity = "1";
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0,
                pointerEvents: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "#f1f5f9",
                color: "#94a3b8",
                fontSize: 12,
                gap: 6,
                transition: "opacity 0.2s",
              }}
            >
              <PictureOutlined style={{ fontSize: 28 }} />
              <span>Image not accessible</span>
            </div>
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: 0,
                transition: "opacity 0.2s",
              }}
              className="img-field-overlay"
              onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = 0; }}
            >
              <button
                type="button"
                className="action-button secondary"
                style={{ background: "#fff", fontSize: 12, padding: "5px 10px" }}
                onClick={handleEditCurrentImage}
                disabled={uploading || loadingCurrentImage}
              >
                {loadingCurrentImage ? <><LoadingOutlined /> Loading...</> : <><EditOutlined /> Edit Current</>}
              </button>
              <button
                type="button"
                className="action-button secondary"
                style={{ background: "#fff", fontSize: 12, padding: "5px 10px" }}
                onClick={() => editInputRef.current?.click()}
                disabled={uploading || loadingCurrentImage}
              >
                {uploading ? <><LoadingOutlined /> Uploading...</> : <><UploadOutlined /> Upload & Edit</>}
              </button>
              <button
                type="button"
                className="action-button secondary"
                style={{ background: "#fff", fontSize: 12, padding: "5px 10px" }}
                onClick={() => directInputRef.current?.click()}
                disabled={uploading || loadingCurrentImage}
              >
                <FolderOpenOutlined /> Quick Upload
              </button>
              <button
                type="button"
                className="action-button danger"
                style={{ fontSize: 12, padding: "5px 10px" }}
                onClick={clear}
                disabled={loadingCurrentImage || uploading}
              >
                <CloseCircleOutlined /> Remove
              </button>
            </div>
            {uploading && (
              <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
                <LoadingOutlined style={{ fontSize: 28, color: "#0369a1" }} />
                <span style={{ fontSize: 13, color: "#0369a1", fontWeight: 600 }}>Uploading...</span>
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: "24px 16px", textAlign: "center" }}>
            <PictureOutlined style={{ fontSize: 36, color: "#94a3b8", display: "block", marginBottom: 10 }} />
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>No image selected</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                className="action-button secondary"
                style={{ fontSize: 12 }}
                onClick={() => editInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <><LoadingOutlined /> Uploading...</> : <><UploadOutlined /> Upload & Edit</>}
              </button>
              <button
                type="button"
                className="action-button secondary"
                style={{ fontSize: 12 }}
                onClick={() => directInputRef.current?.click()}
                disabled={uploading}
              >
                <FolderOpenOutlined /> Quick Upload
              </button>
            </div>
          </div>
        )}
      </div>

      {value && (
        <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            className="action-button secondary"
            style={{ fontSize: 11, padding: "3px 10px" }}
            onClick={handleEditCurrentImage}
            disabled={uploading || loadingCurrentImage}
          >
            {loadingCurrentImage ? <><LoadingOutlined /> Loading...</> : <><EditOutlined /> Edit Current Image</>}
          </button>
          <button
            type="button"
            className="action-button secondary"
            style={{ fontSize: 11, padding: "3px 10px" }}
            onClick={() => editInputRef.current?.click()}
            disabled={uploading || loadingCurrentImage}
          >
            <UploadOutlined /> Replace (Upload & Edit)
          </button>
          <button
            type="button"
            className="action-button secondary"
            style={{ fontSize: 11, padding: "3px 10px" }}
            onClick={() => directInputRef.current?.click()}
            disabled={uploading || loadingCurrentImage}
          >
            <FolderOpenOutlined /> Replace (Quick Upload)
          </button>
        </div>
      )}

      <FieldHint text="Use Edit Current Image to adjust the uploaded image. Use Upload & Edit to crop, zoom, rotate, or apply a preset aspect ratio before saving a new image. Use Quick Upload to pick one image from your PC and save it directly without opening the editor." />
      {hint && !error && <div className="form-hint" style={{ marginTop: 6, fontSize: 12, color: "#64748b" }}>{hint}</div>}
      {error && <div className="form-error" style={{ marginTop: 6 }}>{error}</div>}

      <input
        ref={editInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleEditFlowSelect}
      />
      <input
        ref={directInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleDirectUploadSelect}
      />

      <ImageEditor
        open={editorOpen}
        onClose={() => { setEditorOpen(false); setPendingFile(null); }}
        onSave={handleEditorSave}
        folder={folder}
        initialFile={pendingFile}
        spec={spec}
      />
    </div>
  );
};

export default ImageUploadField;
