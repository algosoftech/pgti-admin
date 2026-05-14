import React, { useEffect, useMemo, useState } from "react";
import { notification, Select } from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  PictureOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";

import LoadingEffect from "components/ui/Loading/LoadingEffect";
import ImageUploadField from "components/ui/ImageUploadField";
import { CharCounter, FieldHint, ImageHint } from "components/ui/FieldHint";
import { IMAGE_SPECS, LIMITS, validateLength } from "utils/fieldValidation";
import "styles/admin-pages.css";

const { Option } = Select;

const buildInitialState = (state = {}) => ({
  id: state?.id || "",
  title: state?.title || "",
  subtitle: state?.subtitle || "",
  image: state?.image || "",
  mobile_image: state?.mobile_image || "",
  status: state?.status || "A",
});

export default function ListingBannerForm({
  entityName,
  backPath,
  folder,
  specKey,
  loadBanner,
  saveBanner,
  uploadNote,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const state = useMemo(() => location?.state || {}, [location?.state]);

  const [formData, setFormData] = useState(buildInitialState(state));
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const spec = useMemo(
    () => IMAGE_SPECS[specKey] || IMAGE_SPECS[folder] || IMAGE_SPECS.common,
    [folder, specKey]
  );
  const mobileSpec = useMemo(
    () => IMAGE_SPECS.listing_banner_mobile || IMAGE_SPECS.common,
    []
  );

  useEffect(() => {
    document.title = `PGTI || ${formData?.id ? "Edit" : "Add"} ${entityName} Listing Banner`;
  }, [entityName, formData?.id]);

  useEffect(() => {
    const load = async () => {
      setIsFetching(true);
      const res = await loadBanner();
      if (res?.status && res.result) {
        setFormData(buildInitialState(res.result));
      } else if (state?.id) {
        setFormData(buildInitialState(state));
      }
      setIsFetching(false);
    };

    load();
  }, [loadBanner, state]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const notifyError = (description) => {
    notification.open({
      message: "Oops!",
      description,
      placement: "topRight",
      icon: <InfoCircleOutlined style={{ color: "red" }} />,
      duration: 3,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setIsLoading(true);

      if (!formData.title?.trim()) {
        notifyError("Banner title is required.");
        setIsLoading(false);
        return;
      }
      if (!validateLength(formData.title, "Banner Title", LIMITS.title)) {
        setIsLoading(false);
        return;
      }
      if (!formData.subtitle?.trim()) {
        notifyError("Banner subtitle is required.");
        setIsLoading(false);
        return;
      }
      if (!validateLength(formData.subtitle, "Banner Subtitle", LIMITS.short_description)) {
        setIsLoading(false);
        return;
      }
      if (!formData.image) {
        notifyError("Banner image is required.");
        setIsLoading(false);
        return;
      }
      if (!formData.mobile_image) {
        notifyError("Mobile banner image is required.");
        setIsLoading(false);
        return;
      }

      const res = await saveBanner({
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim(),
        image: formData.image,
        mobile_image: formData.mobile_image,
        status: formData.status || "A",
      });

      if (res?.status) {
        notification.open({
          message: "Success",
          description: formData.id
            ? `${entityName} listing banner updated successfully.`
            : `${entityName} listing banner created successfully.`,
          placement: "topRight",
          icon: <CheckCircleOutlined style={{ color: "green" }} />,
          duration: 2,
        });
        navigate(backPath);
      } else {
        notifyError(res?.message || `Failed to save ${entityName.toLowerCase()} listing banner.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">
              {formData?.id ? `Edit ${entityName} Listing Banner` : `Add ${entityName} Listing Banner`}
            </h1>
            <p className="page-subtitle">
              Manage the title, subtitle, and banner image shown at the top of the front {entityName.toLowerCase()} listing page.
            </p>
          </div>
          <Link to={backPath}>
            <button className="action-button secondary">
              <ArrowLeftOutlined />
              Back to {entityName}
            </button>
          </Link>
        </div>
      </div>

      <div className="page-body">
        <div className="content-card">
          <div className="content-card-body">
            <form onSubmit={handleSubmit} className="modern-form">
              <div className="form-section">
                <h3 className="form-section-title">
                  <PictureOutlined />
                  Listing Banner Content
                </h3>

                <div className="row">
                  <div className="col-md-12 col-12 mb-3">
                    <ImageUploadField
                      label="Desktop Banner Image"
                      required
                      value={formData.image}
                      onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
                      folder={folder}
                      previewH={220}
                      spec={spec}
                    />
                    <ImageHint
                      recommended={spec.recommended}
                      maxSize={`${spec.maxMB}MB`}
                      note={uploadNote || spec.note}
                    />
                  </div>

                  <div className="col-md-12 col-12 mb-3">
                    <ImageUploadField
                      label="Mobile Banner Image"
                      required
                      value={formData.mobile_image}
                      onChange={(url) => setFormData((prev) => ({ ...prev, mobile_image: url }))}
                      folder={folder}
                      previewH={180}
                      spec={mobileSpec}
                    />
                    <ImageHint
                      recommended={mobileSpec.recommended}
                      maxSize={`${mobileSpec.maxMB}MB`}
                      note={mobileSpec.note}
                    />
                  </div>

                  <div className="col-md-6 col-12 mb-3">
                    <label className="form-label required">Banner Title</label>
                    <input
                      type="text"
                      className="form-input"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter the listing banner title"
                    />
                    <CharCounter value={formData.title} min={LIMITS.title.min} max={LIMITS.title.max} />
                  </div>

                  <div className="col-md-6 col-12 mb-3">
                    <label className="form-label required">Banner Subtitle</label>
                    <textarea
                      className="form-input"
                      name="subtitle"
                      rows={3}
                      value={formData.subtitle}
                      onChange={handleChange}
                      placeholder="Enter the short subtitle shown under the title"
                    />
                    <CharCounter value={formData.subtitle} min={LIMITS.short_description.min} max={LIMITS.short_description.max} />
                    <FieldHint text={`This subtitle appears on the hero banner of the front ${entityName.toLowerCase()} listing page.`} />
                  </div>

                  <div className="col-md-3 col-12 mb-3">
                    <label className="form-label">Status</label>
                    <Select
                      value={formData.status}
                      onChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                      className="form-select"
                      style={{ width: "100%" }}
                      size="large"
                    >
                      <Option value="A">Active</Option>
                      <Option value="I">Inactive</Option>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="action-button secondary" onClick={() => navigate(backPath)}>
                  Cancel
                </button>
                <button type="submit" className="action-button primary" disabled={isLoading || isFetching}>
                  {isLoading ? (
                    <>
                      <div className="loading-spinner small"></div>
                      {formData?.id ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <SaveOutlined />
                      {formData?.id ? "Update Listing Banner" : "Create Listing Banner"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <LoadingEffect isLoading={isLoading || isFetching} text={isFetching ? "Loading banner..." : "Saving..."} />
    </div>
  );
}
