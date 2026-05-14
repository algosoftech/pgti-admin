import React, { useMemo } from "react";
import { Modal } from "antd";
import { EditOutlined, PictureOutlined } from "@ant-design/icons";

import { resolvePreviewMediaUrl } from "services/media.service";
import "styles/admin-pages.css";

const PreviewImage = ({ src, alt, height, maxWidth, emptyLabel }) => {
  const resolved = useMemo(() => resolvePreviewMediaUrl(String(src || "").trim()), [src]);

  if (!src) {
    return (
      <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
        {emptyLabel}
      </div>
    );
  }

  return (
    <div style={{ position: "relative", background: "#fff", padding: 16 }}>
      <img
        key={resolved || alt}
        src={resolved}
        alt={alt}
        style={{
          width: "100%",
          maxWidth: maxWidth || "100%",
          height,
          objectFit: "contain",
          display: "block",
          background: "#fff",
          margin: "0 auto",
          borderRadius: 10,
          border: "1px solid #e2e8f0",
        }}
        onError={(e) => {
          e.target.style.opacity = "0";
          if (e.target.nextElementSibling) e.target.nextElementSibling.style.opacity = "1";
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          top: 16,
          bottom: 16,
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
          borderRadius: 10,
          border: "1px solid #e2e8f0",
        }}
      >
        <PictureOutlined style={{ fontSize: 26 }} />
        <span>Image not accessible</span>
      </div>
    </div>
  );
};

export default function ListingBannerPreviewModal({
  open,
  onCancel,
  banner,
  title,
  description,
  onEdit,
}) {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={700}
      centered
      destroyOnClose
    >
      <div style={{ paddingTop: 6 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>
          {title}
        </div>
        <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7, marginBottom: 18 }}>
          {description}
        </div>

        <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", background: "#f8fafc", marginBottom: 18 }}>
          <div style={{ padding: "14px 16px 6px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.4 }}>
            Desktop Banner
          </div>
          <PreviewImage
            src={banner?.image}
            alt={banner?.title || "Listing banner"}
            height={220}
            emptyLabel="No desktop image configured"
          />

          <div style={{ padding: "0 16px 8px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.4 }}>
            Mobile Banner
          </div>
          <PreviewImage
            src={banner?.mobile_image}
            alt={`${banner?.title || "Listing banner"} mobile`}
            height={180}
            maxWidth={320}
            emptyLabel="No mobile image configured"
          />

          <div style={{ padding: 16, borderTop: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
              {banner?.title || "Untitled Banner"}
            </div>
            <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
              {banner?.subtitle || "No subtitle added yet."}
            </div>
            <span className={`status-badge ${banner?.status === "A" ? "active" : "inactive"}`}>
              {banner?.status === "A" ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
          <button type="button" className="action-button secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="action-button primary" onClick={onEdit}>
            <EditOutlined /> Edit Banner
          </button>
        </div>
      </div>
    </Modal>
  );
}
