import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, notification } from "antd";
import {
  AppstoreOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  DownOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  RightOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import { addEditDisclaimer, listDisclaimer } from "services/disclaimer.service";
import CmsSetupTopActions from "components/cms/CmsSetupTopActions";
import { CharCounter } from "components/ui/FieldHint";
import { LIMITS } from "utils/fieldValidation";
import { TOUR_TYPE_OPTIONS, shouldUseExistingTourTypeRecord } from "utils/tourType";
import "styles/admin-pages.css";

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

const SECTION_KEYS = ["header", "content"];
const SECTION_META = {
  header: { number: "1", title: "Page Header" },
  content: { number: "2", title: "Page Content" },
};
const SECTION_NAV_ITEMS = SECTION_KEYS.map((key) => ({
  key,
  label: `${SECTION_META[key].number}. ${SECTION_META[key].title}`,
}));

const parseContent = (raw) => {
  try {
    const c = typeof raw === "string" ? JSON.parse(raw) : (raw || {});
    return { title: c.title || "", subtitle: c.subtitle || "", content: c.content || "" };
  } catch {
    return { title: "", subtitle: "", content: "" };
  }
};

const normalizeOpenSectionKey = (value = "") => (SECTION_KEYS.includes(value) ? value : "");
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
  sectionKey,
  children,
  isOpen,
  onToggleOpen,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  isSaving,
  onLockedClick,
}) => {
  const meta = SECTION_META[sectionKey];
  return (
    <div className="content-card" style={{ marginBottom: 24 }}>
      <div className="content-card-body">
        <div className="form-section" style={{ marginBottom: 0 }}>
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              textAlign: "left",
            }}
          >
            <button
              type="button"
              onClick={onToggleOpen}
              style={{
                border: "none",
                background: "transparent",
                padding: 0,
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flex: 1,
              }}
            >
              <h3 className="form-section-title" style={{ marginBottom: 0 }}>
                <span style={{ fontSize: 13, color: "#94a3b8", marginRight: 6 }}>{meta.number}.</span>
                {meta.title}
              </h3>
              <span style={{ color: "#64748b", fontSize: 14, flexShrink: 0 }}>
                {isOpen ? <DownOutlined /> : <RightOutlined />}
              </span>
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              {isEditing ? (
                <>
                  <button type="button" className="action-button secondary" onClick={onCancel} disabled={isSaving}>
                    <CloseOutlined /> Cancel
                  </button>
                  <button type="button" className="action-button primary" onClick={onSave} disabled={isSaving}>
                    <SaveOutlined /> {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              ) : (
                <button type="button" className="action-button secondary" onClick={onEdit}>
                  <EditOutlined /> Edit
                </button>
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
                  style={{
                    position: "absolute",
                    inset: 0,
                    border: "none",
                    background: "rgba(248, 250, 252, 0.28)",
                    cursor: "not-allowed",
                    borderRadius: 12,
                  }}
                  aria-label={`This ${meta.title} section is read-only until you click edit`}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function DisclaimerAddEditData() {
  const location = useLocation();
  const sectionRefs = useRef({});
  const state = useMemo(() => location?.state || {}, [location?.state]);
  const requestedOpenSectionKey = state?.openSectionKey || state?.sectionKey || "";
  const raw = state?.content ?? state?.result?.content ?? state;
  const initialContent = parseContent(raw);

  const [id, setId] = useState(state?.id ?? state?.result?.id ?? "");
  const [status, setStatus] = useState(state?.status ?? "A");
  const [savedStatus, setSavedStatus] = useState(state?.status ?? "A");
  const [tourType, setTourType] = useState(state?.tour_type ?? state?.result?.tour_type ?? "M");
  const [savedTourType, setSavedTourType] = useState(state?.tour_type ?? state?.result?.tour_type ?? "M");
  const [isFetching, setIsFetching] = useState(false);
  const [savingSection, setSavingSection] = useState("");
  const [activeEditSection, setActiveEditSection] = useState(() => normalizeOpenSectionKey(requestedOpenSectionKey));
  const [openSections, setOpenSections] = useState(() => buildSectionOpenState({ openKey: requestedOpenSectionKey }));
  const [quickJumpOpen, setQuickJumpOpen] = useState(false);

  const [form, setForm] = useState(initialContent);
  const [savedForm, setSavedForm] = useState(initialContent);

  useEffect(() => {
    document.title = `PGTI || ${id ? "Edit" : "Setup"} Disclaimer`;
  }, [id]);

  useEffect(() => {
    let active = true;

    const hydrate = (record = {}) => {
      const next = parseContent(record?.content ?? record?.result?.content ?? record);
      setForm(next);
      setSavedForm(next);
      if (record?.id) setId(record.id);
      if (record?.result?.id) setId(record.result.id);
      if (record?.status) setStatus(record.status);
      if (record?.result?.status) setStatus(record.result.status);
      if (record?.status) setSavedStatus(record.status);
      if (record?.result?.status) setSavedStatus(record.result.status);
      if (record?.tour_type) {
        setTourType(record.tour_type);
        setSavedTourType(record.tour_type);
      }
      if (record?.result?.tour_type) {
        setTourType(record.result.tour_type);
        setSavedTourType(record.result.tour_type);
      }
    };

    const loadRecord = async () => {
      if (state && Object.keys(state).length > 0) hydrate(state);

      try {
        setIsFetching(true);
        const res = await listDisclaimer({ tour_type: tourType });
        if (active && res?.status && res?.result) {
          hydrate(res.result);
          setOpenSections(buildSectionOpenState({ openKey: requestedOpenSectionKey }));
          setActiveEditSection(normalizeOpenSectionKey(requestedOpenSectionKey));
        }
      } finally {
        if (active) setIsFetching(false);
      }
    };

    loadRecord();
    return () => {
      active = false;
    };
  }, [requestedOpenSectionKey, state, tourType]);

  const notifyReadOnly = (sectionTitle) => {
    notification.open({
      message: "Section is locked",
      description: `Click Edit in "${sectionTitle}" before changing anything here.`,
      placement: "topRight",
      icon: <InfoCircleOutlined style={{ color: "#1d4ed8" }} />,
      duration: 2.5,
    });
  };

  const startEditingSection = (sectionKey) => {
    setActiveEditSection(sectionKey);
    setOpenSections((prev) => ({ ...prev, [sectionKey]: true }));
  };

  const cancelEditingSection = (sectionKey) => {
    setForm(savedForm);
    setStatus(savedStatus);
    setTourType(savedTourType);
    setActiveEditSection((prev) => (prev === sectionKey ? "" : prev));
  };

  const copyFromMainTour = async () => {
    try {
      setIsFetching(true);
      const res = await listDisclaimer({ tour_type: "M" });
      if (!res?.status || !res?.result?.id) {
        notification.warning({
          message: "Main Tour data not found",
          description: "Please save the Main Tour Disclaimer page first.",
          placement: "topRight",
          duration: 3,
        });
        return;
      }
      const next = parseContent(res.result?.content ?? res.result);
      setForm(next);
      setSavedForm(next);
      setStatus(res.result?.status || "A");
      setSavedStatus(res.result?.status || "A");
      setId("");
      setTourType("F");
      setSavedTourType("F");
      notification.success({
        message: "Copied from Main Tour",
        description: "Edit the copied NextGen draft and save to create a separate record.",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setIsFetching(false);
    }
  };

  const saveSection = (sectionKey) => {
    Modal.confirm({
      title: "Save these changes?",
      icon: <ExclamationCircleOutlined style={{ color: "#1d4ed8" }} />,
      content: "Do you really want to edit and save these changes for this Disclaimer section?",
      okText: "Yes, Save Changes",
      cancelText: "Cancel",
      onOk: async () => {
        if (!form.title.trim()) {
          notification.open({
            message: "Oops!",
            description: "Page title is required.",
            placement: "topRight",
            icon: <InfoCircleOutlined style={{ color: "red" }} />,
            duration: 2,
          });
          return;
        }

        try {
          setSavingSection(sectionKey);
          const res = await addEditDisclaimer({
            ...(shouldUseExistingTourTypeRecord(id, savedTourType, tourType) && { editId: id }),
            status,
            tour_type: tourType,
            content: JSON.stringify(form),
          });

          if (res?.status === true) {
            if (res.result?.id) setId(res.result.id);
            setSavedForm(form);
            setSavedStatus(status);
            setSavedTourType(tourType);
            setActiveEditSection("");
            notification.open({
              message: "Success",
              description: "Disclaimer section saved successfully.",
              placement: "topRight",
              icon: <CheckCircleOutlined style={{ color: "green" }} />,
              duration: 2,
            });
          } else {
            notification.open({
              message: "Oops!",
              description: res?.message || "Failed to save Disclaimer.",
              placement: "topRight",
              icon: <InfoCircleOutlined style={{ color: "red" }} />,
              duration: 2,
            });
          }
        } catch {
          notification.open({
            message: "Oops!",
            description: "An error occurred. Please try again.",
            placement: "topRight",
            icon: <InfoCircleOutlined style={{ color: "red" }} />,
            duration: 2,
          });
        } finally {
          setSavingSection("");
        }
      },
    });
  };

  const focusSection = (sectionKey) => {
    setOpenSections(buildSectionOpenState({ openKey: sectionKey }));
    setQuickJumpOpen(false);
    setTimeout(() => {
      sectionRefs.current?.[sectionKey]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  };

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">{id ? "Edit Disclaimer" : "Setup Disclaimer"}</h1>
            <p className="page-subtitle">Manage the Disclaimer page content section by section.</p>
            {isFetching && <p className="page-subtitle" style={{ marginTop: 6 }}>Loading saved Disclaimer data...</p>}
          </div>
          <Link to="/admin/cms/disclaimer/list">
            <button className="action-button secondary"><ArrowLeftOutlined /> Back</button>
          </Link>
        </div>
      </div>

      <CmsSetupTopActions
        tourType={tourType}
        onCopyFromMain={copyFromMainTour}
        onSaveAll={() => saveSection(activeEditSection)}
        saveAllDisabled={!activeEditSection}
        isWorking={Boolean(isFetching || savingSection)}
      />

      <div className="page-body">
        <div className="modern-form">
          <div ref={(node) => { sectionRefs.current.header = node; }}>
            <SectionCard
              sectionKey="header"
              isOpen={openSections.header}
              onToggleOpen={() => setOpenSections((prev) => ({ ...prev, header: !prev.header }))}
              isEditing={activeEditSection === "header"}
              onEdit={() => startEditingSection("header")}
              onSave={() => saveSection("header")}
              onCancel={() => cancelEditingSection("header")}
              isSaving={savingSection === "header"}
              onLockedClick={() => notifyReadOnly(SECTION_META.header.title)}
            >
              <fieldset disabled={activeEditSection !== "header"} style={{ border: "none", padding: 0, margin: 0 }}>
                <div className="row">
                  <div className="col-md-6 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label">Tour Type</label>
                      <select className="form-input" value={tourType} onChange={(e) => setTourType(e.target.value)}>
                        {TOUR_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {tourType === "F" && (
                        <button
                          type="button"
                          className="action-button secondary"
                          onClick={copyFromMainTour}
                          disabled={isFetching}
                          style={{ marginTop: 12 }}
                        >
                          Copy from Main Tour
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label required">Page Title</label>
                      <input
                        className="form-input"
                        value={form.title}
                        onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g. Disclaimer"
                      />
                    </div>
                  </div>
                  <div className="col-md-6 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label">Subtitle</label>
                      <textarea
                        className="form-input"
                        rows={2}
                        value={form.subtitle}
                        onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
                        placeholder="e.g. We make every effort to ensure accuracy..."
                      />
                      <CharCounter value={form.subtitle} max={LIMITS.short_description.max} />
                    </div>
                  </div>
                </div>
              </fieldset>
            </SectionCard>
          </div>

          <div ref={(node) => { sectionRefs.current.content = node; }}>
            <SectionCard
              sectionKey="content"
              isOpen={openSections.content}
              onToggleOpen={() => setOpenSections((prev) => ({ ...prev, content: !prev.content }))}
              isEditing={activeEditSection === "content"}
              onEdit={() => startEditingSection("content")}
              onSave={() => saveSection("content")}
              onCancel={() => cancelEditingSection("content")}
              isSaving={savingSection === "content"}
              onLockedClick={() => notifyReadOnly(SECTION_META.content.title)}
            >
              <fieldset disabled={activeEditSection !== "content"} style={{ border: "none", padding: 0, margin: 0 }}>
                <div className="form-group">
                  <label className="form-label required">Page Content</label>
                  <ReactQuill
                    theme="snow"
                    value={form.content || ""}
                    onChange={(value) => setForm((prev) => ({ ...prev, content: value }))}
                    placeholder="Enter the full Disclaimer content here..."
                    style={{ backgroundColor: "white", borderRadius: 8, marginBottom: 8, minHeight: 400 }}
                    modules={QUILL_MODULES}
                  />
                  <CharCounter value={(form.content || "").replace(/<[^>]*>/g, "")} min={LIMITS.description.min} max={LIMITS.description.max} />
                </div>
              </fieldset>
            </SectionCard>
          </div>

          <div className="content-card">
            <div className="content-card-body">
              <div className="form-actions">
                <Link to="/admin/cms/disclaimer/list">
                  <button type="button" className="action-button secondary">Cancel</button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "fixed",
          right: 20,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 1200,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        {quickJumpOpen && (
          <div
            style={{
              width: 240,
              maxHeight: "70vh",
              overflowY: "auto",
              background: "#ffffff",
              border: "1px solid #dbe7f5",
              borderRadius: 24,
              boxShadow: "0 18px 44px rgba(15, 23, 42, 0.16)",
              padding: "14px 12px",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1e3a8a", marginBottom: 10, paddingLeft: 4 }}>
              Quick Jump
            </div>
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
                      borderRadius: 999,
                      padding: "12px 14px",
                      textAlign: "left",
                      fontSize: 14,
                      fontWeight: isActive ? 700 : 600,
                      cursor: "pointer",
                      boxShadow: isActive ? "0 8px 20px rgba(37, 99, 235, 0.12)" : "none",
                      marginLeft: offset,
                      marginRight: offset,
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
          style={{
            width: 58,
            height: 58,
            borderRadius: "50%",
            border: "none",
            background: "#1e3a8a",
            color: "#ffffff",
            boxShadow: "0 14px 30px rgba(30, 58, 138, 0.26)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: 22,
          }}
          aria-label="Open quick jump for Disclaimer sections"
          title="Quick Jump"
        >
          <AppstoreOutlined />
        </button>
      </div>
    </div>
  );
}
