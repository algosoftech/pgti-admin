import React, { useEffect, useMemo, useState } from "react";
import { Modal, notification } from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import Top_navbar from "components/layout/TopNavbar";
import ImageUploadField from "components/ui/ImageUploadField";
import { CharCounter, FieldHint, ImageHint } from "components/ui/FieldHint";
import LoadingEffect from "components/ui/Loading/LoadingEffect";
import {
  addEditOtherArticlePage,
  getOtherArticlePageTypes,
  listOtherArticlePages,
} from "services/otherArticlePages.service";
import { IMAGE_SPECS, LIMITS, stripHtml, validateLength } from "utils/fieldValidation";
import { TOUR_TYPE_OPTIONS, getTourTypeFromState } from "utils/tourType";
import "styles/admin-pages.css";

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ["link", "image", "table"],
    ["clean"],
  ],
};

const DEFAULT_PAGE_TYPES = [
  { page_key: "indian-open-champions", link_name: "Indian Open Champions", slug: "indian-open-champions" },
  { page_key: "international-wins", link_name: "International Wins", slug: "international-wins" },
  { page_key: "indians-at-majors", link_name: "Indians at Majors", slug: "indians-at-majors" },
];

export default function OtherArticlePagesAddEditData() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = useMemo(() => location?.state || {}, [location?.state]);
  const queryId = useMemo(() => new URLSearchParams(location.search).get("id"), [location.search]);
  const imageSpec = IMAGE_SPECS["cms/article-pages"] || IMAGE_SPECS["cms/homepage"];

  const [pageTypes, setPageTypes] = useState(DEFAULT_PAGE_TYPES);
  const [isLoading, setIsLoading] = useState(false);
  const [id, setId] = useState(state?.id || queryId || "");
  const [form, setForm] = useState({
    page_key: state?.page_key || DEFAULT_PAGE_TYPES[0].page_key,
    link_name: state?.link_name || DEFAULT_PAGE_TYPES[0].link_name,
    hero_image: state?.hero_image || "",
    mobile_hero_image: state?.mobile_hero_image || "",
    hero_title: state?.hero_title || state?.link_name || "",
    hero_subtitle: state?.hero_subtitle || "",
    title: state?.title || "",
    sub_title: state?.sub_title || "",
    heading: state?.heading || "",
    link_detail: state?.link_detail || "",
    meta_title: state?.meta_title || "",
    meta_description: state?.meta_description || "",
    sort_order: Number.isFinite(Number(state?.sort_order)) ? Number(state.sort_order) : 0,
    status: state?.status || "A",
    tour_type: getTourTypeFromState(state, "M"),
  });

  const notify = (description, success = false) => {
    notification.open({
      message: success ? "Success" : "Oops!",
      description,
      placement: "topRight",
      icon: success ? <CheckCircleOutlined style={{ color: "green" }} /> : <InfoCircleOutlined style={{ color: "red" }} />,
      duration: 3,
    });
  };

  const hydrate = (record = {}) => {
    setId(record.id || "");
    setForm({
      page_key: record.page_key || DEFAULT_PAGE_TYPES[0].page_key,
      link_name: record.link_name || DEFAULT_PAGE_TYPES[0].link_name,
      hero_image: record.hero_image || "",
      mobile_hero_image: record.mobile_hero_image || "",
      hero_title: record.hero_title || record.link_name || "",
      hero_subtitle: record.hero_subtitle || "",
      title: record.title || "",
      sub_title: record.sub_title || "",
      heading: record.heading || "",
      link_detail: record.link_detail || "",
      meta_title: record.meta_title || "",
      meta_description: record.meta_description || "",
      sort_order: Number.isFinite(Number(record.sort_order)) ? Number(record.sort_order) : 0,
      status: record.status || "A",
      tour_type: record.tour_type || "M",
    });
  };

  useEffect(() => {
    document.title = `PGTI || ${id ? "Edit" : "Add"} Other Article Page`;
    const load = async () => {
      setIsLoading(true);
      try {
        const [typesRes, detailRes] = await Promise.all([
          getOtherArticlePageTypes(),
          queryId ? listOtherArticlePages({ id: queryId, skip: 0, limit: 1 }) : Promise.resolve(null),
        ]);
        if (typesRes?.status && typesRes.result?.length) setPageTypes(typesRes.result);
        if (detailRes?.status && detailRes.result?.length) hydrate(detailRes.result[0]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryId]);

  const selectedType = pageTypes.find((item) => item.page_key === form.page_key) || pageTypes[0];

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePageTypeChange = (pageKey) => {
    const next = pageTypes.find((item) => item.page_key === pageKey) || pageTypes[0];
    setForm((prev) => ({
      ...prev,
      page_key: next.page_key,
      link_name: next.link_name,
      hero_title: prev.hero_title || next.link_name,
    }));
  };

  const validate = () => {
    if (!form.page_key) { notify("Please select a page."); return false; }
    if (!form.hero_image) { notify("Hero banner image is required."); return false; }
    if (!form.hero_title?.trim()) { notify("Hero title is required."); return false; }
    if (!validateLength(form.hero_title, "Hero Title", LIMITS.title)) return false;
    if (form.title?.trim() && !validateLength(form.title, "Title", LIMITS.title)) return false;
    if (form.heading?.trim() && !validateLength(form.heading, "Heading", LIMITS.title)) return false;
    if (!form.link_detail?.trim() || !stripHtml(form.link_detail)) { notify("Link detail is required."); return false; }
    return true;
  };

  const save = () => {
    if (!validate()) return;
    Modal.confirm({
      title: "Save other article page?",
      icon: <ExclamationCircleOutlined />,
      content: `This will save "${selectedType?.link_name || form.link_name}" for the selected tour type.`,
      okText: "Yes, Save",
      cancelText: "Cancel",
      onOk: async () => {
        setIsLoading(true);
        const res = await addEditOtherArticlePage({
          ...(id && { editId: id }),
          ...form,
          link_name: selectedType?.link_name || form.link_name,
        });
        setIsLoading(false);
        if (res?.status) {
          notify("Other article page saved successfully.", true);
          if (!id && res.result?.id) setId(res.result.id);
          setTimeout(() => navigate("/admin/cms/other-article-pages/list"), 400);
          return;
        }
        notify(res?.message || "Failed to save other article page.");
      },
    });
  };

  return (
    <div>
      <Top_navbar title="Articles" />
      <div className="admin-page-container">
        <div className="page-header">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="page-title">{id ? "Edit Other Article Page" : "Add Other Article Page"}</h1>
              <p className="page-subtitle">Simple hero and rich-text content pages under the Articles section.</p>
            </div>
            <Link to="/admin/cms/other-article-pages/list">
              <button type="button" className="action-button secondary">
                <ArrowLeftOutlined /> Back
              </button>
            </Link>
          </div>
        </div>

        <div className="page-body">
          <div className="content-card" style={{ marginBottom: 24 }}>
            <div className="content-card-body">
              <div className="form-section">
                <h3 className="form-section-title">0. General</h3>
                <div className="row">
                  <div className="col-md-4 col-12 mb-3">
                    <label className="form-label required">Page</label>
                    <select className="form-input" value={form.page_key} onChange={(e) => handlePageTypeChange(e.target.value)} disabled={!!id}>
                      {pageTypes.map((type) => (
                        <option key={type.page_key} value={type.page_key}>{type.link_name}</option>
                      ))}
                    </select>
                    <FieldHint text={id ? "Page type cannot be changed after creation." : "Choose one of the fixed website article pages."} />
                  </div>
                  <div className="col-md-4 col-12 mb-3">
                    <label className="form-label">Tour Type</label>
                    <select className="form-input" value={form.tour_type} onChange={(e) => handleChange("tour_type", e.target.value)}>
                      {TOUR_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-2 col-12 mb-3">
                    <label className="form-label">Sort Order</label>
                    <input type="number" className="form-input" value={form.sort_order} onChange={(e) => handleChange("sort_order", e.target.value)} />
                  </div>
                  <div className="col-md-2 col-12 mb-3">
                    <label className="form-label">Status</label>
                    <select className="form-input" value={form.status} onChange={(e) => handleChange("status", e.target.value)}>
                      <option value="A">Active</option>
                      <option value="I">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="content-card" style={{ marginBottom: 24 }}>
            <div className="content-card-body">
              <div className="form-section">
                <h3 className="form-section-title">1. Hero Banner</h3>
                <div className="row">
                  <div className="col-md-6 col-12 mb-3">
                    <ImageUploadField
                      label="Desktop Hero Image"
                      required
                      value={form.hero_image}
                      onChange={(url) => handleChange("hero_image", url)}
                      folder="cms/article-pages"
                      previewH={220}
                      spec={imageSpec}
                    />
                    <ImageHint recommended={imageSpec.recommended} maxSize={`${imageSpec.maxMB}MB`} note={imageSpec.note} />
                  </div>
                  <div className="col-md-6 col-12 mb-3">
                    <ImageUploadField
                      label="Mobile Hero Image"
                      value={form.mobile_hero_image}
                      onChange={(url) => handleChange("mobile_hero_image", url)}
                      folder="cms/article-pages"
                      previewH={220}
                      spec={IMAGE_SPECS.hero_banner_mobile}
                    />
                    <ImageHint recommended={IMAGE_SPECS.hero_banner_mobile.recommended} maxSize={`${IMAGE_SPECS.hero_banner_mobile.maxMB}MB`} note={IMAGE_SPECS.hero_banner_mobile.note} />
                  </div>
                  <div className="col-md-6 col-12 mb-3">
                    <label className="form-label required">Hero Title</label>
                    <input className="form-input" value={form.hero_title} onChange={(e) => handleChange("hero_title", e.target.value)} placeholder={selectedType?.link_name || "Hero title"} />
                    <CharCounter value={form.hero_title} min={LIMITS.title.min} max={LIMITS.title.max} />
                  </div>
                  <div className="col-md-6 col-12 mb-3">
                    <label className="form-label">Hero Subtitle</label>
                    <input className="form-input" value={form.hero_subtitle} onChange={(e) => handleChange("hero_subtitle", e.target.value)} placeholder="Optional short subtitle for this page" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="content-card" style={{ marginBottom: 24 }}>
            <div className="content-card-body">
              <div className="form-section">
                <h3 className="form-section-title">2. Page Intro</h3>
                <div className="row">
                  <div className="col-md-6 col-12 mb-3">
                    <label className="form-label">Title</label>
                    <input
                      className="form-input"
                      value={form.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      placeholder="Total 92 wins by 26 Indian professionals"
                    />
                    <CharCounter value={form.title} min={0} max={LIMITS.title.max} />
                  </div>
                  <div className="col-md-6 col-12 mb-3">
                    <label className="form-label">Heading</label>
                    <input
                      className="form-input"
                      value={form.heading}
                      onChange={(e) => handleChange("heading", e.target.value)}
                      placeholder="Winning Players"
                    />
                    <CharCounter value={form.heading} min={0} max={LIMITS.title.max} />
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label">Sub Title</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      value={form.sub_title}
                      onChange={(e) => handleChange("sub_title", e.target.value)}
                      placeholder="Optional short description below the title"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="content-card" style={{ marginBottom: 24 }}>
            <div className="content-card-body">
              <div className="form-section">
                <h3 className="form-section-title">3. Link Detail</h3>
                <div className="mb-3">
                  <label className="form-label required">Link Detail</label>
                  <ReactQuill
                    theme="snow"
                    value={form.link_detail}
                    onChange={(value) => handleChange("link_detail", value)}
                    modules={QUILL_MODULES}
                    placeholder="Add page content here."
                  />
                </div>
                <div className="row">
                  <div className="col-md-6 col-12 mb-3">
                    <label className="form-label">Meta Title</label>
                    <input className="form-input" value={form.meta_title} onChange={(e) => handleChange("meta_title", e.target.value)} />
                  </div>
                  <div className="col-md-6 col-12 mb-3">
                    <label className="form-label">Meta Description</label>
                    <input className="form-input" value={form.meta_description} onChange={(e) => handleChange("meta_description", e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="content-card">
            <div className="content-card-body">
              <div className="form-actions">
                <Link to="/admin/cms/other-article-pages/list">
                  <button type="button" className="action-button secondary">Cancel</button>
                </Link>
                <button type="button" className="action-button primary" onClick={save}>
                  <SaveOutlined /> Save Page
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <LoadingEffect isLoading={isLoading} text="Please wait..." />
    </div>
  );
}
