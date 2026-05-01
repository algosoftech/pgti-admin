import React, { useEffect, useState } from "react";
import { notification } from 'antd';
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LoadingEffect from 'components/ui/Loading/LoadingEffect';
import { addEditBanner } from 'services/banner.service';
import ImageUploadField from 'components/ui/ImageUploadField';
import { ImageHint } from 'components/ui/FieldHint';
import { IMAGE_SPECS } from 'utils/fieldValidation';
import "styles/admin-pages.css";

const BannerAddEditPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location?.state;
  const [error, setError] = useState({});
  const [ADDEDITDATA, setAddEditData] = useState(state || {});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText] = useState('Saving, please wait...');

  const handleChange = (e) => {
    setAddEditData((pre) => ({ ...pre, [e.target.name]: e.target.value }));
    setError((pre) => ({ ...pre, [e.target.name]: '' }));
  };

  const handleImageChange = (url) => {
    setAddEditData((pre) => ({ ...pre, image: url }));
    setError((pre) => ({ ...pre, image: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const formData = new FormData(e.target);
      
      if (!ADDEDITDATA?.id && !ADDEDITDATA?.image) {
        notification.open({
          message: "Oops!",
          description: `Image is required for new banner.`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        setIsLoading(false);
        return;
      }

      const param = {
        ...(ADDEDITDATA?.id && { editId: ADDEDITDATA?.id }),
        ...(ADDEDITDATA?.image && { image: ADDEDITDATA?.image }),
        ...(formData.get('type') && { type: formData.get('type') }),
        ...(formData.get('page') && { page: formData.get('page') }),
      };

      const res = await addEditBanner(param);
      if (res.status === true) {
        notification.open({
          message: "Success",
          description: ADDEDITDATA?.id ? `Banner updated successfully` : `Banner added successfully`,
          placement: "topRight",
          icon: <CheckCircleOutlined style={{ color: "green" }} />,
          duration: 2,
        });
        navigate('/admin/cms/banners/list');
      } else {
        notification.open({
          message: "Oops!",
          description: `${res?.message || 'Failed to save banner'}`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
      }
    } catch (error) {
      console.log('error : ', error);
      notification.open({
        message: "Oops!",
        description: `An error occurred. Please try again.`,
        placement: "topRight",
        icon: <InfoCircleOutlined style={{ color: "red" }} />,
        duration: 2,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = `PGTI || ${ADDEDITDATA?.id ? "Edit" : "Add"} Banner`;
  }, [ADDEDITDATA?.id]);

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">
              {ADDEDITDATA?.id ? "Edit Banner" : "Add New Banner"}
            </h1>
            <p className="page-subtitle">
              {ADDEDITDATA?.id 
                ? "Update banner information" 
                : "Create a new banner with image, type, and page"}
            </p>
          </div>
          <Link to="/admin/cms/banners/list">
            <button className="action-button secondary">
              <ArrowLeftOutlined />
              Back to Banners
            </button>
          </Link>
        </div>
      </div>

      <div className="page-body">
      <div className="content-card">
        <div className="content-card-body">
          <form onSubmit={handleSubmit} className="modern-form">
            <input type="hidden" name="editId" id="editId" value={ADDEDITDATA?.id} />
            
            <div className="form-section">
              <h3 className="form-section-title">
                <PictureOutlined />
                Banner Information
              </h3>
              
              <ImageUploadField
                label="Banner Image"
                required={!ADDEDITDATA?.id}
                value={ADDEDITDATA?.image || ''}
                onChange={handleImageChange}
                folder="banners"
                previewH={160}
                error={error.image}
                spec={IMAGE_SPECS.banners}
              />
              <ImageHint
                recommended={IMAGE_SPECS.banners.recommended}
                maxSize={`${IMAGE_SPECS.banners.maxMB}MB`}
                note={IMAGE_SPECS.banners.note}
              />

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="type" className="form-label">
                    Type
                  </label>
                  <input
                    type="text"
                    name="type"
                    id="type"
                    placeholder="Enter banner type (e.g., home, product, category)"
                    className="form-input"
                    value={ADDEDITDATA?.type || ""}
                    onChange={handleChange}
                  />
                  {error.type && (
                    <div className="form-error">{error.type}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="page" className="form-label">
                    Page
                  </label>
                  <input
                    type="text"
                    name="page"
                    id="page"
                    placeholder="Enter page name (e.g., home, products, about)"
                    className="form-input"
                    value={ADDEDITDATA?.page || ""}
                    onChange={handleChange}
                  />
                  {error.page && (
                    <div className="form-error">{error.page}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="action-button secondary"
                onClick={() => navigate("/admin/cms/banners/list")}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="action-button primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner small"></div>
                    {ADDEDITDATA?.id ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <SaveOutlined />
                    {ADDEDITDATA?.id ? "Update Banner" : "Create Banner"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      </div>

      <LoadingEffect isLoading={isLoading} text={loadingText} />
    </div>
  );
};

export default BannerAddEditPage;
