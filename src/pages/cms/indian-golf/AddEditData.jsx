import React, { useEffect, useState } from "react";
import { notification } from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  PictureOutlined,
  HistoryOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import ImageUploadField from "components/ui/ImageUploadField";
import { addEditIndianGolf } from "services/indianGolf.service";
import { CharCounter, FieldHint, ImageHint } from "components/ui/FieldHint";
import { LIMITS, IMAGE_SPECS } from "utils/fieldValidation";
import "styles/admin-pages.css";

/* ── defaults ─────────────────────────────────────────────── */
const emptyItem = () => ({
  year: "",
  title: "",
  description: "",
  image: "",
});

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ["link"],
    ["clean"],
  ],
};

const parseContent = (raw) => {
  try {
    const c = typeof raw === "string" ? JSON.parse(raw) : (raw || {});
    return {
      heroBanner: {
        bg_image: c.heroBanner?.bg_image || "",
        title: c.heroBanner?.title || "",
        subtitle: c.heroBanner?.subtitle || "",
      },
      introSection: {
        image: c.introSection?.image || "",
        heading: c.introSection?.heading || "",
        content: c.introSection?.content || "",
      },
      greatMoments: {
        heading: c.greatMoments?.heading || "",
        description: c.greatMoments?.description || "",
        items: c.greatMoments?.items?.length ? c.greatMoments.items : [emptyItem()],
      },
    };
  } catch {
    return {
      heroBanner: { bg_image: "", title: "", subtitle: "" },
      introSection: { image: "", heading: "", content: "" },
      greatMoments: { heading: "", description: "", items: [emptyItem()] },
    };
  }
};

/* ── section card wrapper ─────────────────────────────────── */
const SectionCard = ({ number, title, icon, children }) => (
  <div className="content-card" style={{ marginBottom: 24 }}>
    <div className="content-card-body">
      <div className="form-section">
        <h3 className="form-section-title">
          {icon}&nbsp;<span style={{ fontSize: 13, color: "#94a3b8", marginRight: 6 }}>{number}.</span>{title}
        </h3>
        {children}
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════ */
export default function IndianGolfAddEditData() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location?.state || {};

  const [isLoading, setIsLoading] = useState(false);
  const [id, setId] = useState(state?.id ?? "");

  const raw = state?.content ?? state?.result?.content ?? state;
  const [form, setForm] = useState(() => parseContent(raw));

  useEffect(() => {
    document.title = `PGTI || ${id ? "Edit" : "Setup"} Indian Golf`;
  }, [id]);

  /* ── field helpers ─────────────────────────────────────── */
  const setHero = (field, val) =>
    setForm(f => ({ ...f, heroBanner: { ...f.heroBanner, [field]: val } }));

  const setIntro = (field, val) =>
    setForm(f => ({ ...f, introSection: { ...f.introSection, [field]: val } }));

  const setMoments = (field, val) =>
    setForm(f => ({ ...f, greatMoments: { ...f.greatMoments, [field]: val } }));

  /* ── timeline item helpers ──────────────────────────────── */
  const updateItem = (idx, field, val) => {
    setForm(f => {
      const items = f.greatMoments.items.map((item, i) =>
        i === idx ? { ...item, [field]: val } : item
      );
      return { ...f, greatMoments: { ...f.greatMoments, items } };
    });
  };

  const addItem = () =>
    setMoments("items", [...form.greatMoments.items, emptyItem()]);

  const removeItem = (idx) => {
    const updated = form.greatMoments.items.filter((_, i) => i !== idx);
    setMoments("items", updated.length ? updated : [emptyItem()]);
  };

  /* ── submit ────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      if (!form.heroBanner.title.trim()) {
        notification.open({ message: "Oops!", description: "Hero banner title is required.", placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
        setIsLoading(false); return;
      }
      if (!form.introSection.heading.trim()) {
        notification.open({ message: "Oops!", description: "Introduction heading is required.", placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
        setIsLoading(false); return;
      }
      const res = await addEditIndianGolf({ ...(id && { editId: id }), status: "A", content: JSON.stringify(form) });
      if (res.status === true) {
        if (!id && res.result?.id) setId(res.result.id);
        notification.open({ message: "Success", description: id ? "Indian Golf page updated successfully" : "Indian Golf page created successfully", placement: "topRight", icon: <CheckCircleOutlined style={{ color: "green" }} />, duration: 2 });
        navigate("/admin/cms/indian-golf/list");
      } else {
        notification.open({ message: "Oops!", description: res?.message || "Failed to save", placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
      }
    } catch {
      notification.open({ message: "Oops!", description: "An error occurred. Please try again.", placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
    } finally {
      setIsLoading(false);
    }
  };

  /* ══════════════════════════════════════════════════════════ */
  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">{id ? "Edit Indian Golf Page" : "Setup Indian Golf Page"}</h1>
            <p className="page-subtitle">Manage all sections of the Indian Golf page</p>
          </div>
          <Link to="/admin/cms/indian-golf/list">
            <button className="action-button secondary"><ArrowLeftOutlined /> Back</button>
          </Link>
        </div>
      </div>

      <div className="page-body">
      <form onSubmit={handleSubmit}>

        {/* ── 1. Hero Banner ──────────────────────────────── */}
        <SectionCard number="1" title="Hero Banner" icon={<PictureOutlined />}>
          <ImageUploadField
            label="Background Image"
            required
            value={form.heroBanner.bg_image}
            onChange={(url) => setHero("bg_image", url)}
            folder="cms/indian-golf"
            previewH={160}
            spec={IMAGE_SPECS['cms/indian-golf']}
          />
          <ImageHint
            recommended={IMAGE_SPECS['cms/indian-golf'].recommended}
            maxSize={`${IMAGE_SPECS['cms/indian-golf'].maxMB}MB`}
            note={IMAGE_SPECS['cms/indian-golf'].note}
          />
          <div className="row" style={{ marginTop: 16 }}>
            <div className="col-md-6 col-12 mb-3">
              <div className="form-group">
                <label className="form-label required">Page Title</label>
                <input
                  className="form-input"
                  value={form.heroBanner.title}
                  onChange={e => setHero("title", e.target.value)}
                  placeholder="e.g. Indian Golf"
                />
              </div>
            </div>
            <div className="col-md-6 col-12 mb-3">
              <div className="form-group">
                <label className="form-label">Subtitle / Author</label>
                <input
                  className="form-input"
                  value={form.heroBanner.subtitle}
                  onChange={e => setHero("subtitle", e.target.value)}
                  placeholder="e.g. By V Krishnaswamy"
                />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── 2. Introduction Section ──────────────────────── */}
        <SectionCard number="2" title="Introduction Section" icon={<HistoryOutlined />}>
          <div className="row">
            <div className="col-md-4 col-12 mb-3">
              <ImageUploadField
                label="Feature Image"
                value={form.introSection.image}
                onChange={(url) => setIntro("image", url)}
                folder="cms/indian-golf"
                previewH={200}
                spec={IMAGE_SPECS['cms/indian-golf']}
              />
              <ImageHint
                recommended="800×600 px"
                maxSize="2MB"
                note="Book cover, author portrait, or section illustration."
              />
            </div>
            <div className="col-md-8 col-12 mb-3">
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label required">Section Heading</label>
                <input
                  className="form-input"
                  value={form.introSection.heading}
                  onChange={e => setIntro("heading", e.target.value)}
                  placeholder="e.g. PGTI History"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Content</label>
                <ReactQuill
                  theme="snow"
                  value={form.introSection.content || ""}
                  onChange={val => setIntro("content", val)}
                  placeholder="Enter the introductory content about Indian golf history..."
                  style={{ backgroundColor: "white", borderRadius: 8, marginBottom: 8 }}
                  modules={QUILL_MODULES}
                />
                <CharCounter value={(form.introSection.content || "").replace(/<[^>]*>/g, "")} min={LIMITS.description.min} max={LIMITS.description.max} />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── 3. Great Moments Timeline ────────────────────── */}
        <SectionCard number="3" title="Great Moments Timeline" icon={<StarOutlined />}>
          <div className="row" style={{ marginBottom: 20 }}>
            <div className="col-md-6 col-12 mb-3">
              <div className="form-group">
                <label className="form-label required">Section Heading</label>
                <input
                  className="form-input"
                  value={form.greatMoments.heading}
                  onChange={e => setMoments("heading", e.target.value)}
                  placeholder="e.g. Great Moments"
                />
              </div>
            </div>
            <div className="col-md-6 col-12 mb-3">
              <div className="form-group">
                <label className="form-label">Section Description</label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={form.greatMoments.description}
                  onChange={e => setMoments("description", e.target.value)}
                  placeholder="Brief intro shown above the timeline..."
                />
                <CharCounter value={form.greatMoments.description} max={LIMITS.short_description.max} />
              </div>
            </div>
          </div>

          <h4 style={{ fontSize: 14, fontWeight: 600, color: "#334155", margin: "0 0 12px" }}>
            Timeline Items
            <span style={{ marginLeft: 8, fontWeight: 400, fontSize: 12, color: "#94a3b8" }}>
              (each item becomes a year dot in the timeline + a detailed section below it)
            </span>
          </h4>

          {form.greatMoments.items.map((item, idx) => (
            <div key={idx} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 20, marginBottom: 16, background: "#f8fafc" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontWeight: 700, color: "#0369a1", fontSize: 18 }}>
                  {item.year || `Item ${idx + 1}`}
                </span>
                <button type="button" className="action-button danger" style={{ fontSize: 11, padding: "3px 10px" }} onClick={() => removeItem(idx)}>
                  <DeleteOutlined /> Remove
                </button>
              </div>
              <div className="row">
                <div className="col-md-3 col-12 mb-3">
                  <div className="form-group">
                    <label className="form-label required">Year</label>
                    <input
                      className="form-input"
                      value={item.year}
                      onChange={e => updateItem(idx, "year", e.target.value)}
                      placeholder="e.g. 1964"
                      maxLength={4}
                    />
                  </div>
                </div>
                <div className="col-md-9 col-12 mb-3">
                  <div className="form-group">
                    <label className="form-label required">Event Title</label>
                    <input
                      className="form-input"
                      value={item.title}
                      onChange={e => updateItem(idx, "title", e.target.value)}
                      placeholder="e.g. INCEPTION OF INDIAN OPEN"
                    />
                  </div>
                </div>
                <div className="col-md-8 col-12 mb-3">
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <ReactQuill
                      theme="snow"
                      value={item.description || ""}
                      onChange={val => updateItem(idx, "description", val)}
                      placeholder="Detailed description of this milestone..."
                      style={{ backgroundColor: "white", borderRadius: 8, marginBottom: 8 }}
                      modules={QUILL_MODULES}
                    />
                    <CharCounter value={(item.description || "").replace(/<[^>]*>/g, "")} min={LIMITS.description.min} max={LIMITS.description.max} />
                  </div>
                </div>
                <div className="col-md-4 col-12 mb-3">
                  <ImageUploadField
                    label="Event Image"
                    value={item.image}
                    onChange={(url) => updateItem(idx, "image", url)}
                    folder="cms/indian-golf"
                    previewH={150}
                    spec={IMAGE_SPECS['cms/indian-golf']}
                  />
                  <ImageHint recommended="800×500 px" maxSize="2MB" note="Historical photo or illustration for this milestone." />
                </div>
              </div>
            </div>
          ))}

          <button type="button" className="action-button secondary" onClick={addItem}>
            <PlusOutlined /> Add Timeline Item
          </button>
        </SectionCard>

        {/* ── Form Actions ─────────────────────────────────── */}
        <div className="form-actions">
          <button type="button" className="action-button secondary" onClick={() => navigate("/admin/cms/indian-golf/list")}>
            Cancel
          </button>
          <button type="submit" className="action-button primary" disabled={isLoading}>
            {isLoading ? (
              <><div className="loading-spinner small"></div>{id ? "Updating..." : "Creating..."}</>
            ) : (
              <><SaveOutlined /> {id ? "Update Page" : "Create Page"}</>
            )}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
