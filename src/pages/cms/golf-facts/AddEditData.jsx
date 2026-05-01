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
  BulbOutlined,
  OrderedListOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import ImageUploadField from "components/ui/ImageUploadField";
import { addEditGolfFacts } from "services/golfFacts.service";
import { CharCounter, FieldHint, ImageHint } from "components/ui/FieldHint";
import { LIMITS, IMAGE_SPECS } from "utils/fieldValidation";
import "styles/admin-pages.css";

/* ── defaults ─────────────────────────────────────────────── */
const emptyFact = () => ({ title: "", description: "" });

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
        heading: c.introSection?.heading || "",
        description: c.introSection?.description || "",
      },
      facts: Array.isArray(c.facts) && c.facts.length ? c.facts : [emptyFact()],
    };
  } catch {
    return {
      heroBanner: { bg_image: "", title: "", subtitle: "" },
      introSection: { heading: "", description: "" },
      facts: [emptyFact()],
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
export default function GolfFactsAddEditData() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location?.state || {};

  const [isLoading, setIsLoading] = useState(false);
  const [id, setId] = useState(state?.id ?? "");

  const raw = state?.content ?? state?.result?.content ?? state;
  const [form, setForm] = useState(() => parseContent(raw));

  useEffect(() => {
    document.title = `PGTI || ${id ? "Edit" : "Setup"} Golf Facts`;
  }, [id]);

  /* ── field helpers ─────────────────────────────────────── */
  const setHero = (field, val) =>
    setForm(f => ({ ...f, heroBanner: { ...f.heroBanner, [field]: val } }));

  const setIntro = (field, val) =>
    setForm(f => ({ ...f, introSection: { ...f.introSection, [field]: val } }));

  /* ── facts helpers ──────────────────────────────────────── */
  const updateFact = (idx, field, val) => {
    setForm(f => {
      const facts = f.facts.map((fact, i) => i === idx ? { ...fact, [field]: val } : fact);
      return { ...f, facts };
    });
  };

  const addFact = () =>
    setForm(f => ({ ...f, facts: [...f.facts, emptyFact()] }));

  const removeFact = (idx) => {
    setForm(f => {
      const facts = f.facts.filter((_, i) => i !== idx);
      return { ...f, facts: facts.length ? facts : [emptyFact()] };
    });
  };

  const moveFact = (idx, direction) => {
    setForm(f => {
      const facts = [...f.facts];
      const target = idx + direction;
      if (target < 0 || target >= facts.length) return f;
      [facts[idx], facts[target]] = [facts[target], facts[idx]];
      return { ...f, facts };
    });
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
      const res = await addEditGolfFacts({ ...(id && { editId: id }), status: "A", content: JSON.stringify(form) });
      if (res.status === true) {
        if (!id && res.result?.id) setId(res.result.id);
        notification.open({ message: "Success", description: id ? "Golf Facts page updated successfully" : "Golf Facts page created successfully", placement: "topRight", icon: <CheckCircleOutlined style={{ color: "green" }} />, duration: 2 });
        navigate("/admin/cms/golf-facts/list");
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
            <h1 className="page-title">{id ? "Edit Golf Facts Page" : "Setup Golf Facts Page"}</h1>
            <p className="page-subtitle">Manage all sections of the Golf Facts page</p>
          </div>
          <Link to="/admin/cms/golf-facts/list">
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
            folder="cms/golf-facts"
            previewH={160}
            spec={IMAGE_SPECS['cms/golf-facts']}
          />
          <ImageHint
            recommended={IMAGE_SPECS['cms/golf-facts'].recommended}
            maxSize={`${IMAGE_SPECS['cms/golf-facts'].maxMB}MB`}
            note={IMAGE_SPECS['cms/golf-facts'].note}
          />
          <div className="row" style={{ marginTop: 16 }}>
            <div className="col-md-6 col-12 mb-3">
              <div className="form-group">
                <label className="form-label required">Page Title</label>
                <input
                  className="form-input"
                  value={form.heroBanner.title}
                  onChange={e => setHero("title", e.target.value)}
                  placeholder="e.g. Little Golf Facts"
                />
              </div>
            </div>
            <div className="col-md-6 col-12 mb-3">
              <div className="form-group">
                <label className="form-label">Subtitle</label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={form.heroBanner.subtitle}
                  onChange={e => setHero("subtitle", e.target.value)}
                  placeholder="Short description shown below the title..."
                />
                <CharCounter value={form.heroBanner.subtitle} max={LIMITS.short_description.max} />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── 2. Introduction Section ──────────────────────── */}
        <SectionCard number="2" title="Introduction Section" icon={<BulbOutlined />}>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label required">Section Heading</label>
            <input
              className="form-input"
              value={form.introSection.heading}
              onChange={e => setIntro("heading", e.target.value)}
              placeholder="e.g. India's Most Fascinating Golf Facts"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <ReactQuill
              theme="snow"
              value={form.introSection.description || ""}
              onChange={val => setIntro("description", val)}
              placeholder="Introductory paragraph shown below the heading..."
              style={{ backgroundColor: "white", borderRadius: 8, marginBottom: 8 }}
              modules={QUILL_MODULES}
            />
            <CharCounter value={(form.introSection.description || "").replace(/<[^>]*>/g, "")} max={LIMITS.description.max} />
          </div>
        </SectionCard>

        {/* ── 3. Golf Facts List ───────────────────────────── */}
        <SectionCard number="3" title="Golf Facts List" icon={<OrderedListOutlined />}>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
            Add each golf fact below. Toggle <strong>Featured</strong> to give a fact a dark highlighted background (like the Madras Gymkhana example in the design).
            Use the ↑ ↓ arrows to reorder.
          </p>

          {form.facts.map((fact, idx) => (
            <div
              key={idx}
              style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 16, marginBottom: 16, background: "#f8fafc" }}
            >
                      {/* Item header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontWeight: 700, color: "#0369a1", fontSize: 16 }}>
                  {String(idx + 1).padStart(2, "0")}.
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button type="button" className="action-button secondary" style={{ fontSize: 11, padding: "3px 8px" }} onClick={() => moveFact(idx, -1)} disabled={idx === 0} title="Move up">↑</button>
                  <button type="button" className="action-button secondary" style={{ fontSize: 11, padding: "3px 8px" }} onClick={() => moveFact(idx, 1)} disabled={idx === form.facts.length - 1} title="Move down">↓</button>
                  <button type="button" className="action-button danger" style={{ fontSize: 11, padding: "3px 10px" }} onClick={() => removeFact(idx)}>
                    <DeleteOutlined /> Remove
                  </button>
                </div>
              </div>

              {/* Title */}
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label required">Fact Title</label>
                <input
                  className="form-input"
                  value={fact.title}
                  onChange={e => updateFact(idx, "title", e.target.value)}
                  placeholder="e.g. Royal Calcutta Golf Club in Kolkata"
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label required">Fact Description</label>
                <ReactQuill
                  theme="snow"
                  value={fact.description || ""}
                  onChange={val => updateFact(idx, "description", val)}
                  placeholder="Enter the detailed description for this fact..."
                  style={{ backgroundColor: "white", borderRadius: 8, marginBottom: 8 }}
                  modules={QUILL_MODULES}
                />
                <CharCounter value={(fact.description || "").replace(/<[^>]*>/g, "")} min={LIMITS.description.min} max={LIMITS.description.max} />
                <FieldHint text="Describe the golf fact in detail. Include historical context, significance, and interesting details." />
              </div>
            </div>
          ))}

          <button type="button" className="action-button secondary" onClick={addFact}>
            <PlusOutlined /> Add Golf Fact
          </button>
        </SectionCard>

        {/* ── Form Actions ─────────────────────────────────── */}
        <div className="form-actions">
          <button type="button" className="action-button secondary" onClick={() => navigate("/admin/cms/golf-facts/list")}>
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
