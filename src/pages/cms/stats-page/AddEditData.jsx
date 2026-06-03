import React, { useEffect, useMemo, useState } from "react";
import { Modal, notification } from "antd";
import {
  ArrowLeftOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  SaveOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

import Top_navbar from "components/layout/TopNavbar";
import ImageUploadField from "components/ui/ImageUploadField";
import LoadingEffect from "components/ui/Loading/LoadingEffect";
import CmsSetupTopActions from "components/cms/CmsSetupTopActions";
import { FieldHint, ImageHint } from "components/ui/FieldHint";
import { getStatsPageSettings, saveStatsPageSettings } from "services/statsPage.service";
import { IMAGE_SPECS } from "utils/fieldValidation";
import { TOUR_TYPE_OPTIONS } from "utils/tourType";
import "styles/admin-pages.css";

const TAB_FIELDS = [
  ["pgti_wins", "PGTI Wins"],
  ["pgti_career_earning", "PGTI Career Earning"],
  ["first_time_winner", "First Time Winner"],
  ["birdie_leaders", "Birdie Leaders"],
  ["eagle_leaders", "Eagle Leaders"],
  ["albatross", "Albatross"],
  ["hole_in_one", "Hole in One"],
  ["putts_and_stats", "Putts & Stats"],
  ["play_off", "Play Off"],
];

const METRIC_FIELDS = [
  ["driving_accuracy", "Driving Accuracy"],
  ["sand_saves", "Sand Saves"],
  ["greens_in_regulation", "Green in Regulation"],
  ["putting_average", "Putting Average"],
];

const buildInitialState = (data = {}) => ({
  hero_title: data?.hero_title || "STATS",
  hero_subtitle:
    data?.hero_subtitle ||
    "Discover the talented athletes shaping the tour. Browse player profiles, career achievements, and season performance stats.",
  hero_image: data?.hero_image || "",
  hero_mobile_image: data?.hero_mobile_image || "",
  list_type_label: data?.list_type_label || "List Type",
  season_label: data?.season_label || "Season",
  sort_by_label: data?.sort_by_label || "Sort By",
  search_placeholder: data?.search_placeholder || "Search Player Here...",
  download_pdf_label: data?.download_pdf_label || "Download PDF",
  tour_type: data?.tour_type || "M",
  tab_labels: Object.fromEntries(TAB_FIELDS.map(([key, label]) => [key, data?.tab_labels?.[key] || label])),
  metric_labels: Object.fromEntries(METRIC_FIELDS.map(([key, label]) => [key, data?.metric_labels?.[key] || label])),
});

const sectionTitleStyle = {
  marginBottom: 18,
};

const twoColumnGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 18,
  alignItems: "start",
};

const fourColumnGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 18,
  alignItems: "start",
};

const threeColumnGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 18,
  alignItems: "start",
};

export default function StatsPageAddEditData() {
  const [formData, setFormData] = useState(buildInitialState());
  const [isLoading, setIsLoading] = useState(false);
  const statsImageSpec = useMemo(
    () => IMAGE_SPECS["cms/homepage"] || IMAGE_SPECS.homepage || IMAGE_SPECS.events,
    []
  );

  const shellStyle = useMemo(
    () => ({
      width: "100%",
      margin: 0,
    }),
    []
  );

  const loadSettings = async (tourType = "M", showError = true) => {
    setIsLoading(true);
    const res = await getStatsPageSettings({ tour_type: tourType });
    if (res?.status && res.result) {
      setFormData(buildInitialState({ ...res.result, tour_type: tourType }));
    } else {
      setFormData(buildInitialState({ tour_type: tourType }));
      if (showError) {
        notification.open({
          message: "Oops!",
          description: res?.message || "Failed to load stats page settings.",
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 3,
        });
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    document.title = "PGTI || Admin || Stats Page Settings";
    loadSettings("M");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateField = (key, value) =>
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));

  const updateNestedField = (group, key, value) =>
    setFormData((prev) => ({
      ...prev,
      [group]: {
        ...(prev[group] || {}),
        [key]: value,
      },
    }));

  const handleTourTypeChange = (value) => {
    loadSettings(value, false);
  };

  const copyFromMainTour = async () => {
    setIsLoading(true);
    const res = await getStatsPageSettings({ tour_type: "M" });
    if (res?.status && res.result) {
      setFormData(buildInitialState({ ...res.result, tour_type: "F" }));
      notification.open({
        message: "Copied from Main Tour",
        description: "Edit the copied NextGen settings and save to create or update the separate NextGen record.",
        placement: "topRight",
        icon: <CheckCircleOutlined style={{ color: "green" }} />,
        duration: 2,
      });
    } else {
      notification.open({
        message: "Main Tour data not found",
        description: "Please save the Main Tour Stats Page Settings first.",
        placement: "topRight",
        icon: <InfoCircleOutlined style={{ color: "red" }} />,
        duration: 3,
      });
    }
    setIsLoading(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    const res = await saveStatsPageSettings(formData);
    if (res?.status) {
      notification.open({
        message: "Success",
        description: "Stats page settings saved successfully.",
        placement: "topRight",
        icon: <CheckCircleOutlined style={{ color: "green" }} />,
        duration: 2,
      });
    } else {
      notification.open({
        message: "Oops!",
        description: res?.message || "Failed to save stats page settings.",
        placement: "topRight",
        icon: <InfoCircleOutlined style={{ color: "red" }} />,
        duration: 3,
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="admin-page-container">
      <Top_navbar title="Stats Page Settings" />

      <div className="page-body modern-form" style={shellStyle}>
        <div className="content-card" style={{ overflow: "hidden" }}>
          <div className="content-card-body">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: 20,
                alignItems: "start",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#eff6ff",
                    color: "#1d4ed8",
                    border: "1px solid #bfdbfe",
                    borderRadius: 999,
                    padding: "6px 12px",
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 0.4,
                    marginBottom: 14,
                  }}
                >
                  <BarChartOutlined />
                  Front Stats Page
                </div>

                <h1 className="page-title" style={{ marginBottom: 10 }}>
                  Stats Page Settings
                </h1>
                <p className="page-subtitle" style={{ lineHeight: 1.65, maxWidth: 760 }}>
                  Manage the stats page banner, control labels, tab names, and Putts &amp; Stats metric labels from
                  one clean configuration screen.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "flex-start",
                  minWidth: 0,
                }}
              >
                <Link to="/admin/dashboard">
                  <button className="action-button secondary" type="button">
                    <ArrowLeftOutlined />
                    Back
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <CmsSetupTopActions
          tourType={formData.tour_type || "M"}
          onCopyFromMain={copyFromMainTour}
          onSaveAll={() =>
            Modal.confirm({
              title: "Save all changes?",
              content: "Please confirm to save the full Stats Page Settings form.",
              okText: "Yes, Save All",
              cancelText: "Cancel",
              onOk: () => document.getElementById("stats-page-settings-form")?.requestSubmit(),
            })
          }
          saveAllDisabled={false}
          isWorking={isLoading}
        />

        <form id="stats-page-settings-form" onSubmit={handleSubmit}>
          <div className="content-card">
            <div className="content-card-body">
              <h3 className="form-section-title" style={sectionTitleStyle}>
                <BarChartOutlined />
                Hero Banner
              </h3>

              <div style={twoColumnGrid}>
                <div>
                  <label className="form-label">Tour Type</label>
                  <select
                    className="form-input"
                    value={formData.tour_type || "M"}
                    onChange={(e) => handleTourTypeChange(e.target.value)}
                  >
                    {TOUR_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {(formData.tour_type || "M") === "F" && (
                    <button
                      type="button"
                      className="action-button secondary"
                      onClick={copyFromMainTour}
                      disabled={isLoading}
                      style={{ marginTop: 12 }}
                    >
                      Copy from Main Tour
                    </button>
                  )}
                  <FieldHint text="This settings record controls either the PGTI Main Tour or PGTI NextGen stats page." />
                </div>

                <div>
                  <label className="form-label required">Hero Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.hero_title}
                    onChange={(e) => updateField("hero_title", e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label">Search Placeholder</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.search_placeholder}
                    onChange={(e) => updateField("search_placeholder", e.target.value)}
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label required">Hero Subtitle</label>
                  <textarea
                    className="form-input"
                    rows={4}
                    value={formData.hero_subtitle}
                    onChange={(e) => updateField("hero_subtitle", e.target.value)}
                  />
                </div>

                <div style={{ minWidth: 0 }}>
                  <ImageUploadField
                    label="Desktop Hero Image"
                    value={formData.hero_image}
                    onChange={(url) => updateField("hero_image", url)}
                    folder="cms/stats"
                    previewH={220}
                    spec={statsImageSpec}
                  />
                  <ImageHint
                    recommended={statsImageSpec?.recommended}
                    maxSize={`${statsImageSpec?.maxMB || 5}MB`}
                    note="Optional. Returned in the stats page response for the main desktop hero."
                  />
                </div>

                <div style={{ minWidth: 0 }}>
                  <ImageUploadField
                    label="Mobile Hero Image"
                    value={formData.hero_mobile_image}
                    onChange={(url) => updateField("hero_mobile_image", url)}
                    folder="cms/stats"
                    previewH={220}
                    spec={statsImageSpec}
                  />
                  <ImageHint
                    recommended={statsImageSpec?.recommended}
                    maxSize={`${statsImageSpec?.maxMB || 5}MB`}
                    note="Optional. Returned in the stats page response for mobile hero usage."
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="content-card">
            <div className="content-card-body">
              <h3 className="form-section-title" style={sectionTitleStyle}>
                <TagsOutlined />
                Global Labels
              </h3>
              <div style={fourColumnGrid}>
                <div>
                  <label className="form-label">List Type Label</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.list_type_label}
                    onChange={(e) => updateField("list_type_label", e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Season Label</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.season_label}
                    onChange={(e) => updateField("season_label", e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Sort By Label</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.sort_by_label}
                    onChange={(e) => updateField("sort_by_label", e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Download PDF Label</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.download_pdf_label}
                    onChange={(e) => updateField("download_pdf_label", e.target.value)}
                  />
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <FieldHint text="These values are returned directly in the front stats API so the integration team can render page-level labels without hardcoding them." />
              </div>
            </div>
          </div>

          <div className="content-card">
            <div className="content-card-body">
              <h3 className="form-section-title" style={sectionTitleStyle}>
                <TagsOutlined />
                Stats Tabs
              </h3>
              <div style={threeColumnGrid}>
                {TAB_FIELDS.map(([key, label]) => (
                  <div key={key}>
                    <label className="form-label">{label}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.tab_labels[key] || ""}
                      onChange={(e) => updateNestedField("tab_labels", key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="content-card">
            <div className="content-card-body">
              <h3 className="form-section-title" style={sectionTitleStyle}>
                <TagsOutlined />
                Putts &amp; Stats Metric Labels
              </h3>
              <div style={twoColumnGrid}>
                {METRIC_FIELDS.map(([key, label]) => (
                  <div key={key}>
                    <label className="form-label">{label}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.metric_labels[key] || ""}
                      onChange={(e) => updateNestedField("metric_labels", key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="action-button primary" disabled={isLoading}>
              <SaveOutlined />
              Save Stats Settings
            </button>
          </div>
        </form>
      </div>

      <LoadingEffect isLoading={isLoading} text="Saving stats page settings..." />
    </div>
  );
}
