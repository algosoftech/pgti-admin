import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, notification } from "antd";
import {
  AppstoreOutlined, ArrowLeftOutlined, CheckCircleOutlined,
  CloseOutlined, DownOutlined, EditOutlined, EnvironmentOutlined,
  ExclamationCircleOutlined, InfoCircleOutlined, MessageOutlined,
  PhoneOutlined, PictureOutlined, SaveOutlined, UpOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import ImageUploadField from "components/ui/ImageUploadField";
import { addEditContactUs, listContactUs } from "services/contactUs.service";
import { CharCounter, ImageHint } from "components/ui/FieldHint";
import { LIMITS, IMAGE_SPECS } from "utils/fieldValidation";
import "styles/admin-pages.css";

const DEFAULT_TABS = [
  { tab_name: "Admin Inquiries", email: "", phone: "", address: "" },
  { tab_name: "Tour Entry Inquiries", email: "", phone: "", address: "" },
  { tab_name: "Marketing Inquiries", email: "", phone: "", address: "" },
  { tab_name: "Media Inquiries", email: "", phone: "", address: "" },
];

const parseContent = (raw) => {
  try {
    const c = typeof raw === "string" ? JSON.parse(raw) : (raw || {});
    return {
      heroBanner: { bg_image: c.heroBanner?.bg_image || "", mobile_bg_image: c.heroBanner?.mobile_bg_image || "", title: c.heroBanner?.title || "CONTACT US" },
      inquiryTabs: Array.isArray(c.inquiryTabs) && c.inquiryTabs.length ? c.inquiryTabs : DEFAULT_TABS,
      map_embed_url: c.map_embed_url || "",
    };
  } catch {
    return { heroBanner: { bg_image: "", mobile_bg_image: "", title: "CONTACT US" }, inquiryTabs: DEFAULT_TABS, map_embed_url: "" };
  }
};

const SECTION_KEYS = ["general", "heroBanner", "inquiryTabs", "googleMaps"];
const SECTION_META = {
  general:     { number: "0", title: "General" },
  heroBanner:  { number: "1", title: "Hero Banner" },
  inquiryTabs: { number: "2", title: "Inquiry Tabs" },
  googleMaps:  { number: "3", title: "Google Maps" },
};
const SECTION_NAV_ITEMS = SECTION_KEYS.map((key) => ({
  key,
  label: `${SECTION_META[key].number}. ${SECTION_META[key].title}`,
}));

const normalizeOpenSectionKey = (value = "") =>
  SECTION_KEYS.includes(value) ? value : "";

const buildSectionOpenState = ({ openKey = "" } = {}) => {
  const normalized = normalizeOpenSectionKey(openKey);
  return SECTION_KEYS.reduce((acc, key) => {
    acc[key] = normalized ? key === normalized : false;
    return acc;
  }, {});
};

const getQuickJumpCurveOffset = (index, total) => {
  if (total <= 1) return 0;
  const center = (total - 1) / 2;
  return Math.round(Math.abs(index - center) * 10);
};

const SectionCard = ({
  sectionKey, children, isOpen, onToggleOpen,
  isEditing, onEdit, onSave, onCancel, isSaving, onLockedClick,
}) => {
  const meta = SECTION_META[sectionKey];
  return (
    <div className="content-card" style={{ marginBottom: 24 }}>
      <div className="content-card-body">
        <div className="form-section" style={{ marginBottom: 0 }}>
          <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <button
              type="button"
              onClick={onToggleOpen}
              style={{ border: "none", background: "transparent", padding: 0, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12, flex: 1 }}
            >
              <h3 className="form-section-title" style={{ marginBottom: 0 }}>
                <span style={{ fontSize: 13, color: "#94a3b8", marginRight: 6 }}>{meta.number}.</span>
                {meta.title}
              </h3>
              <span style={{ color: "#64748b", fontSize: 14, flexShrink: 0 }}>
                {isOpen ? <UpOutlined /> : <DownOutlined />}
              </span>
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              {isEditing ? (
                <>
                  <button type="button" className="action-button secondary" onClick={onCancel} disabled={isSaving}><CloseOutlined /> Cancel</button>
                  <button type="button" className="action-button primary" onClick={onSave} disabled={isSaving}><SaveOutlined /> {isSaving ? "Saving..." : "Save Changes"}</button>
                </>
              ) : (
                <button type="button" className="action-button secondary" onClick={onEdit}><EditOutlined /> Edit</button>
              )}
            </div>
          </div>
          {isOpen && (
            <div style={{ paddingTop: 16, position: "relative" }}>
              {children}
              {!isEditing && (
                <button
                  type="button"
                  onClick={onLockedClick}
                  style={{ position: "absolute", inset: 0, border: "none", background: "rgba(248, 250, 252, 0.28)", cursor: "not-allowed", borderRadius: 12 }}
                  aria-label={`${meta.title} section is read-only. Click Edit to modify.`}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ContactUsAddEditData() {
  const location = useLocation();
  const sectionRefs = useRef({});
  const state = useMemo(() => location?.state || {}, [location?.state]);
  const requestedOpenSectionKey = state?.openSectionKey || state?.sectionKey || "";

  const raw = state?.content ?? state?.result?.content ?? state;
  const initial = parseContent(raw);

  const [isFetching, setIsFetching] = useState(false);
  const [id, setId] = useState(state?.id ?? state?.result?.id ?? "");
  const [status, setStatus] = useState(state?.status ?? "A");
  const [savedStatus, setSavedStatus] = useState(state?.status ?? "A");

  const [heroBanner, setHeroBanner] = useState(initial.heroBanner);
  const [savedHeroBanner, setSavedHeroBanner] = useState(initial.heroBanner);
  const [inquiryTabs, setInquiryTabs] = useState(initial.inquiryTabs);
  const [savedInquiryTabs, setSavedInquiryTabs] = useState(initial.inquiryTabs);
  const [mapEmbedUrl, setMapEmbedUrl] = useState(initial.map_embed_url);
  const [savedMapEmbedUrl, setSavedMapEmbedUrl] = useState(initial.map_embed_url);

  const [activeEditSection, setActiveEditSection] = useState(() => normalizeOpenSectionKey(requestedOpenSectionKey));
  const [savingSection, setSavingSection] = useState("");
  const [openSections, setOpenSections] = useState(() => buildSectionOpenState({ openKey: requestedOpenSectionKey }));
  const [quickJumpOpen, setQuickJumpOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const hydrateForm = (record = {}) => {
    const c = parseContent(record?.content ?? record?.result?.content ?? record);
    setHeroBanner(c.heroBanner); setSavedHeroBanner(c.heroBanner);
    setInquiryTabs(c.inquiryTabs); setSavedInquiryTabs(c.inquiryTabs);
    setMapEmbedUrl(c.map_embed_url); setSavedMapEmbedUrl(c.map_embed_url);
    if (record?.id) setId(record.id);
    if (record?.result?.id) setId(record.result.id);
    if (record?.status) { setStatus(record.status); setSavedStatus(record.status); }
    if (record?.result?.status) { setStatus(record.result.status); setSavedStatus(record.result.status); }
  };

  useEffect(() => {
    document.title = `PGTI || ${id ? "Edit" : "Setup"} Contact Us`;
    let active = true;
    const load = async () => {
      if (state && Object.keys(state).length > 0 && state.id) hydrateForm(state);
      try {
        setIsFetching(true);
        const res = await listContactUs();
        if (active && res?.status && res?.result?.id) {
          hydrateForm(res.result);
          setOpenSections(buildSectionOpenState({ openKey: requestedOpenSectionKey }));
          setActiveEditSection(normalizeOpenSectionKey(requestedOpenSectionKey));
        }
      } finally {
        if (active) setIsFetching(false);
      }
    };
    load();
    return () => { active = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedOpenSectionKey]);

  const buildContent = () => ({
    heroBanner,
    inquiryTabs,
    map_embed_url: mapEmbedUrl,
  });

  const notifyReadOnly = (sectionTitle) =>
    notification.open({
      message: "Section is locked",
      description: `Click Edit in "${sectionTitle}" before making changes.`,
      placement: "topRight",
      icon: <InfoCircleOutlined style={{ color: "#1d4ed8" }} />,
      duration: 2.5,
    });

  const startEditingSection = (sectionKey) => {
    setActiveEditSection(sectionKey);
    setOpenSections((prev) => ({ ...prev, [sectionKey]: true }));
  };

  const focusSection = (sectionKey) => {
    setOpenSections(buildSectionOpenState({ openKey: sectionKey }));
    setQuickJumpOpen(false);
    setTimeout(() => {
      sectionRefs.current?.[sectionKey]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  };

  const cancelEditingSection = (sectionKey) => {
    if (sectionKey === "general") setStatus(savedStatus);
    else if (sectionKey === "heroBanner") setHeroBanner(savedHeroBanner);
    else if (sectionKey === "inquiryTabs") setInquiryTabs(savedInquiryTabs);
    else if (sectionKey === "googleMaps") setMapEmbedUrl(savedMapEmbedUrl);
    setActiveEditSection((prev) => (prev === sectionKey ? "" : prev));
  };

  const saveSection = (sectionKey) => {
    Modal.confirm({
      title: "Save these changes?",
      icon: <ExclamationCircleOutlined style={{ color: "#1d4ed8" }} />,
      content: `Do you want to save changes for the "${SECTION_META[sectionKey]?.title}" section?`,
      okText: "Yes, Save Changes",
      cancelText: "Cancel",
      onOk: async () => {
        if (!heroBanner.title.trim()) {
          notification.open({ message: "Oops!", description: "Hero title is required.", placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
          return;
        }
        try {
          setSavingSection(sectionKey);
          const res = await addEditContactUs({
            ...(id && { editId: id }),
            status,
            content: JSON.stringify(buildContent()),
          });
          if (res?.status === true) {
            if (!id && res.result?.id) setId(res.result.id);
            setSavedStatus(status);
            setSavedHeroBanner({ ...heroBanner });
            setSavedInquiryTabs([...inquiryTabs]);
            setSavedMapEmbedUrl(mapEmbedUrl);
            setActiveEditSection("");
            notification.success({
              message: "Success",
              description: "Section saved successfully.",
              placement: "topRight",
              icon: <CheckCircleOutlined style={{ color: "green" }} />,
              duration: 2,
            });
          } else {
            notification.error({ message: "Failed to save", description: res?.message || "Something went wrong.", placement: "topRight", duration: 3 });
          }
        } catch {
          notification.error({ message: "Error", description: "An unexpected error occurred.", placement: "topRight", duration: 3 });
        } finally {
          setSavingSection("");
        }
      },
    });
  };

  const updateTab = (idx, field, val) =>
    setInquiryTabs((f) => f.map((t, i) => (i === idx ? { ...t, [field]: val } : t)));

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">{id ? "Edit Contact Us" : "Setup Contact Us"}</h1>
            <p className="page-subtitle">Manage the Contact Us page content and inquiry tabs</p>
            {isFetching && <p className="page-subtitle" style={{ marginTop: 6 }}>Loading saved data...</p>}
          </div>
          <Link to="/admin/cms/contact-us/list">
            <button type="button" className="action-button secondary"><ArrowLeftOutlined /> Back to List</button>
          </Link>
        </div>
      </div>

      <div className="page-body">
        <div className="modern-form">

          {/* 0. General */}
          <div ref={(node) => { sectionRefs.current.general = node; }}>
            <SectionCard sectionKey="general" isOpen={openSections.general}
              onToggleOpen={() => setOpenSections((prev) => ({ ...prev, general: !prev.general }))}
              isEditing={activeEditSection === "general"} onEdit={() => startEditingSection("general")}
              onSave={() => saveSection("general")} onCancel={() => cancelEditingSection("general")}
              isSaving={savingSection === "general"} onLockedClick={() => notifyReadOnly(SECTION_META.general.title)}
            >
              <fieldset disabled={activeEditSection !== "general"} style={{ border: "none", padding: 0, margin: 0 }}>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="A">Active</option>
                    <option value="I">Inactive</option>
                  </select>
                </div>
              </fieldset>
            </SectionCard>
          </div>

          {/* 1. Hero Banner */}
          <div ref={(node) => { sectionRefs.current.heroBanner = node; }}>
            <SectionCard sectionKey="heroBanner" isOpen={openSections.heroBanner}
              onToggleOpen={() => setOpenSections((prev) => ({ ...prev, heroBanner: !prev.heroBanner }))}
              isEditing={activeEditSection === "heroBanner"} onEdit={() => startEditingSection("heroBanner")}
              onSave={() => saveSection("heroBanner")} onCancel={() => cancelEditingSection("heroBanner")}
              isSaving={savingSection === "heroBanner"} onLockedClick={() => notifyReadOnly(SECTION_META.heroBanner.title)}
            >
              <fieldset disabled={activeEditSection !== "heroBanner"} style={{ border: "none", padding: 0, margin: 0 }}>
                <ImageUploadField
                  label="Background Image"
                  value={heroBanner.bg_image}
                  onChange={(url) => setHeroBanner((prev) => ({ ...prev, bg_image: url }))}
                  folder="cms/contact-us"
                  previewH={160}
                  spec={IMAGE_SPECS["cms/contact-us"]}
                />
                <ImageHint recommended={IMAGE_SPECS["cms/contact-us"]?.recommended} maxSize={`${IMAGE_SPECS["cms/contact-us"]?.maxMB}MB`} note={IMAGE_SPECS["cms/contact-us"]?.note} />
                <div style={{ marginTop: 16 }}>
                  <ImageUploadField
                    label="Mobile Banner Image"
                    value={heroBanner.mobile_bg_image}
                    onChange={(url) => setHeroBanner((prev) => ({ ...prev, mobile_bg_image: url }))}
                    folder="cms/contact-us"
                    previewH={160}
                    spec={IMAGE_SPECS.hero_banner_mobile}
                  />
                  <ImageHint recommended={IMAGE_SPECS.hero_banner_mobile?.recommended} maxSize={`${IMAGE_SPECS.hero_banner_mobile?.maxMB}MB`} note={IMAGE_SPECS.hero_banner_mobile?.note} />
                </div>
                <div className="form-group" style={{ marginTop: 16 }}>
                  <label className="form-label required">Hero Title</label>
                  <input className="form-input" value={heroBanner.title} onChange={(e) => setHeroBanner((prev) => ({ ...prev, title: e.target.value }))} placeholder="e.g. CONTACT US" />
                </div>
              </fieldset>
            </SectionCard>
          </div>

          {/* 2. Inquiry Tabs */}
          <div ref={(node) => { sectionRefs.current.inquiryTabs = node; }}>
            <SectionCard sectionKey="inquiryTabs" isOpen={openSections.inquiryTabs}
              onToggleOpen={() => setOpenSections((prev) => ({ ...prev, inquiryTabs: !prev.inquiryTabs }))}
              isEditing={activeEditSection === "inquiryTabs"} onEdit={() => startEditingSection("inquiryTabs")}
              onSave={() => saveSection("inquiryTabs")} onCancel={() => cancelEditingSection("inquiryTabs")}
              isSaving={savingSection === "inquiryTabs"} onLockedClick={() => notifyReadOnly(SECTION_META.inquiryTabs.title)}
            >
              <fieldset disabled={activeEditSection !== "inquiryTabs"} style={{ border: "none", padding: 0, margin: 0 }}>
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
                  Each tab shows on the Contact Us page with its own email, phone, and address.
                </p>
                <div style={{ display: "flex", gap: 8, marginBottom: 20, borderBottom: "2px solid #e2e8f0" }}>
                  {inquiryTabs.map((tab, ti) => (
                    <button key={ti} type="button" onClick={() => setActiveTab(ti)} style={{ padding: "8px 20px", border: "none", borderBottom: activeTab === ti ? "3px solid #0369a1" : "3px solid transparent", background: "none", fontWeight: activeTab === ti ? 700 : 400, color: activeTab === ti ? "#0369a1" : "#64748b", cursor: "pointer", fontSize: 13, transition: "all 0.2s" }}>
                      {tab.tab_name}
                    </button>
                  ))}
                </div>
                {inquiryTabs[activeTab] && (
                  <div className="row">
                    <div className="col-md-4 col-12 mb-3">
                      <div className="form-group">
                        <label className="form-label">Tab Name</label>
                        <input className="form-input" value={inquiryTabs[activeTab].tab_name} onChange={(e) => updateTab(activeTab, "tab_name", e.target.value)} placeholder="e.g. Admin Inquiries" />
                      </div>
                    </div>
                    <div className="col-md-4 col-12 mb-3">
                      <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input type="email" className="form-input" value={inquiryTabs[activeTab].email} onChange={(e) => updateTab(activeTab, "email", e.target.value)} placeholder="e.g. admin@pgti.com" />
                      </div>
                    </div>
                    <div className="col-md-4 col-12 mb-3">
                      <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <input className="form-input" value={inquiryTabs[activeTab].phone} onChange={(e) => updateTab(activeTab, "phone", e.target.value)} placeholder="e.g. +91-9910714848" />
                      </div>
                    </div>
                    <div className="col-12 mb-3">
                      <div className="form-group">
                        <label className="form-label">Address</label>
                        <textarea className="form-input" rows={3} value={inquiryTabs[activeTab].address} onChange={(e) => updateTab(activeTab, "address", e.target.value)} placeholder="e.g. Professional Golf Tour of India, Unit No. 303, ABW Tower..." />
                        <CharCounter value={inquiryTabs[activeTab].address} max={LIMITS.notes.max} />
                      </div>
                    </div>
                  </div>
                )}
              </fieldset>
            </SectionCard>
          </div>

          {/* 3. Google Maps */}
          <div ref={(node) => { sectionRefs.current.googleMaps = node; }}>
            <SectionCard sectionKey="googleMaps" isOpen={openSections.googleMaps}
              onToggleOpen={() => setOpenSections((prev) => ({ ...prev, googleMaps: !prev.googleMaps }))}
              isEditing={activeEditSection === "googleMaps"} onEdit={() => startEditingSection("googleMaps")}
              onSave={() => saveSection("googleMaps")} onCancel={() => cancelEditingSection("googleMaps")}
              isSaving={savingSection === "googleMaps"} onLockedClick={() => notifyReadOnly(SECTION_META.googleMaps.title)}
            >
              <fieldset disabled={activeEditSection !== "googleMaps"} style={{ border: "none", padding: 0, margin: 0 }}>
                <div className="form-group">
                  <label className="form-label">Google Maps Embed URL</label>
                  <input
                    className="form-input"
                    value={mapEmbedUrl}
                    onChange={(e) => setMapEmbedUrl(e.target.value)}
                    placeholder="https://www.google.com/maps/embed?pb=..."
                  />
                  <p className="form-hint">Go to Google Maps → Share → Embed a map → Copy the src URL from the iframe code</p>
                </div>
                {mapEmbedUrl && (
                  <div style={{ marginTop: 12, borderRadius: 10, overflow: "hidden", border: "1px solid #e2e8f0" }}>
                    <iframe title="Map Preview" src={mapEmbedUrl} width="100%" height="280" style={{ border: 0, display: "block" }} allowFullScreen loading="lazy" />
                  </div>
                )}
              </fieldset>
            </SectionCard>
          </div>

          <div className="content-card">
            <div className="content-card-body">
              <div className="form-actions">
                <Link to="/admin/cms/contact-us/list">
                  <button type="button" className="action-button secondary">Cancel</button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Jump */}
        <div style={{ position: "fixed", right: 20, top: "50%", transform: "translateY(-50%)", zIndex: 1200, display: "flex", alignItems: "center", gap: 12 }}>
          {quickJumpOpen && (
            <div style={{ width: 240, maxHeight: "70vh", overflowY: "auto", background: "#ffffff", border: "1px solid #dbe7f5", borderRadius: 24, boxShadow: "0 18px 44px rgba(15, 23, 42, 0.16)", padding: "14px 12px" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1e3a8a", marginBottom: 10, paddingLeft: 4 }}>Quick Jump</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {SECTION_NAV_ITEMS.map((item, index) => {
                  const isActive = !!openSections[item.key];
                  const offset = getQuickJumpCurveOffset(index, SECTION_NAV_ITEMS.length);
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => focusSection(item.key)}
                      style={{
                        border: "1px solid #d7e3f4",
                        background: isActive ? "#e8f0ff" : "#ffffff",
                        color: isActive ? "#2563eb" : "#0f172a",
                        borderRadius: 999, padding: "12px 14px",
                        textAlign: "left", fontSize: 14,
                        fontWeight: isActive ? 700 : 600,
                        cursor: "pointer",
                        boxShadow: isActive ? "0 8px 20px rgba(37, 99, 235, 0.12)" : "none",
                        marginLeft: offset, marginRight: offset,
                        transition: "all 0.2s ease",
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => setQuickJumpOpen((prev) => !prev)}
            style={{ width: 58, height: 58, borderRadius: "50%", border: "none", background: "#1e3a8a", color: "#ffffff", boxShadow: "0 14px 30px rgba(30, 58, 138, 0.26)", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 22 }}
            aria-label="Open quick jump for Contact Us sections"
            title="Quick Jump"
          >
            <AppstoreOutlined />
          </button>
        </div>
      </div>
    </div>
  );
}
