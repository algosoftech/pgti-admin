import React, { useEffect, useState } from "react";
import { notification } from 'antd';
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  PictureOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LoadingEffect from "../../../../components/Loading/LoadingEffect";
import { addEditBanner } from "../../../../controllers/V1/bannerController";
import ClipArtPicker from "../../../../components/ClipArtPicker";
import "../../admin-pages.css";

const BannerAddEditPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location?.state;
  const [error, setError] = useState([]);
  const [ADDEDITDATA, setAddEditData] = useState(state || {});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading, please wait...');
  const [imagePreview, setImagePreview] = useState(state?.image || null);
  const [clipartPickerOpen, setClipartPickerOpen] = useState(false);

  /*********************************************************
   *  This function is use to handle input change
   *********************************************************/
  const handleChange = (e) => {
    setAddEditData((pre) => ({
      ...pre,
      [e.target.name]: e.target.value,
    }));
    setError((pre) => ({
      ...pre,
      [e.target.name]: "",
    }));
  };

  /*********************************************************
   *  This function is use to handle image selection from clipart picker
   *********************************************************/
  const handleImageSelect = (imageUrl) => {
    setImagePreview(imageUrl);
    setAddEditData((pre) => ({
      ...pre,
      image: imageUrl,
    }));
    setClipartPickerOpen(false);
  };

  const handleOpenClipartPicker = () => {
    setClipartPickerOpen(true);
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
    document.title = `Influencer || ${ADDEDITDATA?.id ? "Edit" : "Add"} Banner`;
    if (state?.image) {
      setImagePreview(state.image);
    }
  }, [ADDEDITDATA?.id, state]);

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

      <div className="content-card">
        <div className="content-card-body">
          <form onSubmit={handleSubmit} className="modern-form">
            <input type="hidden" name="editId" id="editId" value={ADDEDITDATA?.id} />
            
            <div className="form-section">
              <h3 className="form-section-title">
                <PictureOutlined />
                Banner Information
              </h3>
              
              <div className="form-group">
                <label htmlFor="image" className="form-label required">
                  Banner Image
                  {!ADDEDITDATA?.id && <span className="required-mark">*</span>}
                </label>
                <div className="image-upload-container">
                  {imagePreview ? (
                    <div className="image-preview-wrapper">
                      <img
                        src={`${process.env.REACT_APP_IMAGE_BASE_URL}${imagePreview}`}
                        alt="Banner preview"
                        className="image-preview"
                      />
                      <button
                        type="button"
                        className="image-change-button"
                        onClick={handleOpenClipartPicker}
                      >
                        <UploadOutlined />
                        Change Image
                      </button>
                    </div>
                  ) : (
                    <div
                      className="image-upload-placeholder"
                      onClick={handleOpenClipartPicker}
                    >
                      <UploadOutlined style={{ fontSize: "48px", color: "#9ca3af" }} />
                      <p>Click to select banner image</p>
                      <p className="text-muted small">Select from gallery or upload new</p>
                    </div>
                  )}
                </div>
                {error.image && (
                  <div className="form-error">{error.image}</div>
                )}
              </div>

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

      <LoadingEffect isLoading={isLoading} text={loadingText} />
      
      <ClipArtPicker
        open={clipartPickerOpen}
        onClose={() => setClipartPickerOpen(false)}
        onSelect={handleImageSelect}
        selectedImage={imagePreview}
        folder="banners"
      />
    </div>
  );
};

export default BannerAddEditPage;
