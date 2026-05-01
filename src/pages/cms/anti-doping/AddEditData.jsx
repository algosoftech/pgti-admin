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
  TeamOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import ImageUploadField from "components/ui/ImageUploadField";
import { addEditAntiDoping } from "services/antiDoping.service";
import { CharCounter, FieldHint, ImageHint } from "components/ui/FieldHint";
import { LIMITS, IMAGE_SPECS } from "utils/fieldValidation";
import "styles/admin-pages.css";

/* ── defaults ─────────────────────────────────────────────── */
const emptyMember = () => ({
  photo: "",
  name: "",
  designation: "",
  know_more_content: "",  // rich text — what shows on the "Know More" popup/page
  know_more_url: "",      // optional external link (not mandatory)
});
const emptyResource = () => ({ title: "", file_url: "", show_download_button: false, button_text: "Download PDF" });

const DEFAULT_TABS = [
  { tab_name: "Committees", members: [emptyMember()] },
  { tab_name: "Hearing Panel", members: [emptyMember()] },
  { tab_name: "TUE Committee", members: [emptyMember()] },
];

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
      heroBanner: c.heroBanner || { bg_image: "", title: "", subtitle: "" },
      membersSection: {
        heading: c.membersSection?.heading || "",
        description: c.membersSection?.description || "",
        tabs: c.membersSection?.tabs?.length ? c.membersSection.tabs : DEFAULT_TABS,
      },
      resourcesSection: {
        bg_image: c.resourcesSection?.bg_image || "",
        heading: c.resourcesSection?.heading || "",
        description: c.resourcesSection?.description || "",
        resources: c.resourcesSection?.resources?.length ? c.resourcesSection.resources : [emptyResource()],
      },
    };
  } catch {
    return {
      heroBanner: { bg_image: "", title: "", subtitle: "" },
      membersSection: { heading: "", description: "", tabs: DEFAULT_TABS },
      resourcesSection: { bg_image: "", heading: "", description: "", resources: [emptyResource()] },
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
export default function AntiDopingAddEditData() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location?.state || {};

  const [isLoading, setIsLoading] = useState(false);
  const [id, setId] = useState(state?.id ?? "");
  const [activeTab, setActiveTab] = useState(0);

  const raw = state?.content ?? state?.result?.content ?? state;
  const [form, setForm] = useState(() => parseContent(raw));

  useEffect(() => {
    document.title = `PGTI || ${id ? "Edit" : "Setup"} Anti-Doping`;
  }, [id]);

  /* ── field helpers ─────────────────────────────────────── */
  const setHero = (field, val) =>
    setForm(f => ({ ...f, heroBanner: { ...f.heroBanner, [field]: val } }));

  const setMembers = (field, val) =>
    setForm(f => ({ ...f, membersSection: { ...f.membersSection, [field]: val } }));

  const setResources = (field, val) =>
    setForm(f => ({ ...f, resourcesSection: { ...f.resourcesSection, [field]: val } }));

  /* ── tab member helpers ─────────────────────────────────── */
  const updateMember = (tabIdx, memberIdx, field, val) => {
    setForm(f => {
      const tabs = f.membersSection.tabs.map((tab, ti) => {
        if (ti !== tabIdx) return tab;
        return { ...tab, members: tab.members.map((m, mi) => mi === memberIdx ? { ...m, [field]: val } : m) };
      });
      return { ...f, membersSection: { ...f.membersSection, tabs } };
    });
  };

  const addMember = (tabIdx) => {
    setForm(f => {
      const tabs = f.membersSection.tabs.map((tab, ti) =>
        ti === tabIdx ? { ...tab, members: [...tab.members, emptyMember()] } : tab
      );
      return { ...f, membersSection: { ...f.membersSection, tabs } };
    });
  };

  const removeMember = (tabIdx, memberIdx) => {
    setForm(f => {
      const tabs = f.membersSection.tabs.map((tab, ti) => {
        if (ti !== tabIdx) return tab;
        const members = tab.members.filter((_, mi) => mi !== memberIdx);
        return { ...tab, members: members.length ? members : [emptyMember()] };
      });
      return { ...f, membersSection: { ...f.membersSection, tabs } };
    });
  };

  /* ── resource helpers ──────────────────────────────────── */
  const updateResource = (idx, field, val) => {
    setForm(f => {
      const resources = f.resourcesSection.resources.map((r, i) => i === idx ? { ...r, [field]: val } : r);
      return { ...f, resourcesSection: { ...f.resourcesSection, resources } };
    });
  };

  const addResource = () =>
    setResources("resources", [...form.resourcesSection.resources, emptyResource()]);

  const removeResource = (idx) => {
    const updated = form.resourcesSection.resources.filter((_, i) => i !== idx);
    setResources("resources", updated.length ? updated : [emptyResource()]);
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
      const res = await addEditAntiDoping({ ...(id && { editId: id }), status: "A", content: JSON.stringify(form) });
      if (res.status === true) {
        if (!id && res.result?.id) setId(res.result.id);
        notification.open({ message: "Success", description: id ? "Anti-Doping page updated successfully" : "Anti-Doping page created successfully", placement: "topRight", icon: <CheckCircleOutlined style={{ color: "green" }} />, duration: 2 });
        navigate("/admin/cms/anti-doping/list");
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
            <h1 className="page-title">{id ? "Edit Anti-Doping Page" : "Setup Anti-Doping Page"}</h1>
            <p className="page-subtitle">Manage all sections of the Anti-Doping page</p>
          </div>
          <Link to="/admin/cms/anti-doping/list">
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
            folder="cms/anti-doping"
            previewH={160}
            spec={IMAGE_SPECS['cms/anti-doping']}
          />
          <ImageHint
            recommended={IMAGE_SPECS['cms/anti-doping'].recommended}
            maxSize={`${IMAGE_SPECS['cms/anti-doping'].maxMB}MB`}
            note={IMAGE_SPECS['cms/anti-doping'].note}
          />
          <div className="form-row" style={{ marginTop: 16 }}>
            <div className="form-group">
              <label className="form-label required">Title</label>
              <input className="form-input" value={form.heroBanner.title} onChange={e => setHero("title", e.target.value)} placeholder="e.g. Anti-Doping" />
            </div>
            <div className="form-group">
              <label className="form-label">Subtitle / Description</label>
              <textarea className="form-input" rows={3} value={form.heroBanner.subtitle} onChange={e => setHero("subtitle", e.target.value)} placeholder="Brief description shown under the title..." />
              <CharCounter value={form.heroBanner.subtitle} max={LIMITS.short_description.max} />
            </div>
          </div>
        </SectionCard>

        {/* ── 2. Anti-Doping Members ──────────────────────── */}
        <SectionCard number="2" title="Anti-Doping Members" icon={<TeamOutlined />}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Section Heading</label>
              <input className="form-input" value={form.membersSection.heading} onChange={e => setMembers("heading", e.target.value)} placeholder="e.g. Anti-Doping Members" />
            </div>
            <div className="form-group">
              <label className="form-label">Section Description</label>
              <textarea className="form-input" rows={3} value={form.membersSection.description} onChange={e => setMembers("description", e.target.value)} placeholder="Short description below the heading..." />
              <CharCounter value={form.membersSection.description} max={LIMITS.short_description.max} />
            </div>
          </div>

          {/* Tab selector */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, marginTop: 8, borderBottom: "2px solid #e2e8f0" }}>
            {form.membersSection.tabs.map((tab, ti) => (
              <button key={ti} type="button" onClick={() => setActiveTab(ti)} style={{ padding: "8px 20px", border: "none", borderBottom: activeTab === ti ? "3px solid #0369a1" : "3px solid transparent", background: "none", fontWeight: activeTab === ti ? 700 : 400, color: activeTab === ti ? "#0369a1" : "#64748b", cursor: "pointer", fontSize: 14, transition: "all 0.2s" }}>
                {tab.tab_name}
                <span style={{ marginLeft: 6, background: "#e2e8f0", borderRadius: 10, padding: "1px 7px", fontSize: 11 }}>
                  {tab.members.length}
                </span>
              </button>
            ))}
          </div>

          {/* Members for active tab */}
          {form.membersSection.tabs[activeTab]?.members.map((member, mi) => (
            <div key={mi} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 16, marginBottom: 16, background: "#f8fafc" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontWeight: 600, color: "#334155", fontSize: 13 }}>Member {mi + 1}</span>
                <button type="button" className="action-button danger" style={{ fontSize: 11, padding: "3px 10px" }} onClick={() => removeMember(activeTab, mi)}>
                  <DeleteOutlined /> Remove
                </button>
              </div>
              <div className="row">
                <div className="col-md-3 col-12 mb-3">
                  <ImageUploadField
                    label="Photo"
                    value={member.photo}
                    onChange={(url) => updateMember(activeTab, mi, "photo", url)}
                    folder="cms/anti-doping"
                    previewH={120}
                    spec={IMAGE_SPECS.users}
                  />
                  <ImageHint
                    recommended={IMAGE_SPECS.users.recommended}
                    maxSize={`${IMAGE_SPECS.users.maxMB}MB`}
                    note="Square crop preferred. Professional headshot of the committee member."
                  />
                </div>
                <div className="col-md-9 col-12 mb-3">
                  <div className="row">
                    <div className="col-md-6 col-12 mb-3">
                      <div className="form-group">
                        <label className="form-label required">Name</label>
                        <input className="form-input" value={member.name} onChange={e => updateMember(activeTab, mi, "name", e.target.value)} placeholder="Full name" />
                      </div>
                    </div>
                    <div className="col-md-6 col-12 mb-3">
                      <div className="form-group">
                        <label className="form-label">Designation / Role</label>
                        <input className="form-input" value={member.designation} onChange={e => updateMember(activeTab, mi, "designation", e.target.value)} placeholder="e.g. Chairman, Member" />
                      </div>
                    </div>
                    <div className="col-md-12 col-12 mb-3">
                      <div className="form-group">
                        <label className="form-label">Know More — External URL <span style={{ color: "#94a3b8", fontWeight: 400, fontSize: 12 }}>(optional — overrides content below if filled)</span></label>
                        <input
                          className="form-input"
                          value={member.know_more_url}
                          onChange={e => updateMember(activeTab, mi, "know_more_url", e.target.value)}
                          placeholder="Leave blank to use the rich-text content below instead of a link"
                        />
                      </div>
                    </div>
                    <div className="col-md-12 col-12 mb-3">
                      <div className="form-group">
                        <label className="form-label">Know More — Content <span style={{ color: "#94a3b8", fontWeight: 400, fontSize: 12 }}>(shown in a popup / detail page)</span></label>
                        <ReactQuill
                          theme="snow"
                          value={member.know_more_content || ""}
                          onChange={val => updateMember(activeTab, mi, "know_more_content", val)}
                          placeholder="Enter detailed bio, achievements, or any content to display when the user clicks 'Know More'..."
                          style={{ backgroundColor: "white", borderRadius: 8, marginBottom: 8 }}
                          modules={QUILL_MODULES}
                        />
                        <CharCounter value={(member.know_more_content || "").replace(/<[^>]*>/g, "")} max={LIMITS.description.max} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button type="button" className="action-button secondary" onClick={() => addMember(activeTab)}>
            <PlusOutlined /> Add Member to {form.membersSection.tabs[activeTab]?.tab_name}
          </button>
        </SectionCard>

        {/* ── 3. Anti-Doping Resources ────────────────────── */}
        <SectionCard number="3" title="Anti-Doping Resources" icon={<FileTextOutlined />}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Section Heading</label>
              <input className="form-input" value={form.resourcesSection.heading} onChange={e => setResources("heading", e.target.value)} placeholder="e.g. Anti-Doping Resources" />
            </div>
            <div className="form-group">
              <label className="form-label">Section Description</label>
              <textarea className="form-input" rows={3} value={form.resourcesSection.description} onChange={e => setResources("description", e.target.value)} placeholder="Description shown on the left panel..." />
              <CharCounter value={form.resourcesSection.description} max={LIMITS.short_description.max} />
            </div>
          </div>

          <div style={{ marginTop: 8, marginBottom: 20 }}>
            <ImageUploadField
              label="Left Background Image"
              value={form.resourcesSection.bg_image}
              onChange={(url) => setResources("bg_image", url)}
              folder="cms/anti-doping"
              previewH={140}
              spec={IMAGE_SPECS['cms/anti-doping']}
            />
            <ImageHint
              recommended="800×600 px"
              maxSize="2MB"
              note="Background image for the resources panel. Dark or neutral tones work best."
            />
          </div>

          <h4 style={{ fontSize: 14, fontWeight: 600, color: "#334155", margin: "0 0 12px" }}>Resource Items</h4>
          {form.resourcesSection.resources.map((res, idx) => (
            <div key={idx} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 16, marginBottom: 12, background: "#f8fafc" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontWeight: 600, color: "#0369a1", fontSize: 13 }}>
                  {String(idx + 1).padStart(2, "0")}. Resource
                </span>
                <button type="button" className="action-button danger" style={{ fontSize: 11, padding: "3px 10px" }} onClick={() => removeResource(idx)}>
                  <DeleteOutlined /> Remove
                </button>
              </div>
              <div className="row">
                <div className="col-md-5 col-12 mb-3">
                  <div className="form-group">
                    <label className="form-label required">Resource Title</label>
                    <input className="form-input" value={res.title} onChange={e => updateResource(idx, "title", e.target.value)} placeholder="e.g. PGTI Anti-Doping Policy" />
                  </div>
                </div>
                <div className="col-md-5 col-12 mb-3">
                  <div className="form-group">
                    <label className="form-label">File / PDF URL</label>
                    <input className="form-input" value={res.file_url} onChange={e => updateResource(idx, "file_url", e.target.value)} placeholder="https://cdn.example.com/document.pdf" />
                  </div>
                </div>
                <div className="col-md-2 col-12 mb-3">
                  <div className="form-group">
                    <label className="form-label">Download Button</label>
                    <div className="permission-item" style={{ marginTop: 4 }} onClick={() => updateResource(idx, "show_download_button", !res.show_download_button)}>
                      <div className="permission-checkbox">
                        <input type="checkbox" checked={!!res.show_download_button} readOnly />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">Show</label>
                      </div>
                    </div>
                  </div>
                </div>
                {res.show_download_button && (
                  <div className="col-md-4 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label">Button Label</label>
                      <input className="form-input" value={res.button_text} onChange={e => updateResource(idx, "button_text", e.target.value)} placeholder="e.g. Download PDF" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          <button type="button" className="action-button secondary" onClick={addResource}>
            <PlusOutlined /> Add Resource
          </button>
        </SectionCard>

        {/* ── Form Actions ─────────────────────────────────── */}
        <div className="form-actions">
          <button type="button" className="action-button secondary" onClick={() => navigate("/admin/cms/anti-doping/list")}>
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
