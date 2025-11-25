import React, { useEffect, useState, useRef } from "react";
import { notification } from 'antd';
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  FolderOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import LoadingEffect from "../../../components/Loading/LoadingEffect";
import { addEditCategory } from "../../../controllers/V1/categoryController";
import ClipArtPicker from "../../../components/ClipArtPicker";
import "../admin-pages.css";

const CategoryAddEditPage = () => {
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
      
      if (!formData.get('name') || !formData.get('name').trim()) {
        notification.open({
          message: "Oops!",
          description: `Name is required.`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        setIsLoading(false);
        return;
      }

      if (!ADDEDITDATA?.id && !ADDEDITDATA?.image) {
        notification.open({
          message: "Oops!",
          description: `Image is required for new category.`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        setIsLoading(false);
        return;
      }

      const param = {
        name: formData.get('name'),
        seq_order: parseInt(formData.get('seq_order')),
        ...(ADDEDITDATA?.id && { editId: ADDEDITDATA?.id }),
        ...(ADDEDITDATA?.image && { image: ADDEDITDATA?.image }),
      };

      const res = await addEditCategory(param);
      if (res.status === true) {
        notification.open({
          message: "Success",
          description: ADDEDITDATA?.id ? `Category updated successfully` : `Category added successfully`,
          placement: "topRight",
          icon: <CheckCircleOutlined style={{ color: "green" }} />,
          duration: 2,
        });
        navigate('/admin/categories/list');
      } else {
        notification.open({
          message: "Oops!",
          description: `${res?.message || 'Failed to save category'}`,
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

  /*********************************************************
   *  This function is use to handle Quill editor change
   *********************************************************/
  const handleDescriptionChange = (value) => {
    setAddEditData((pre) => ({
      ...pre,
      description: value,
    }));
    setError((pre) => ({
      ...pre,
      description: "",
    }));
  };

  useEffect(() => {
    document.title = `Influencer || ${ADDEDITDATA?.id ? "Edit" : "Add"} Category`;
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
              {ADDEDITDATA?.id ? "Edit Category" : "Add New Category"}
            </h1>
            <p className="page-subtitle">
              {ADDEDITDATA?.id 
                ? "Update category information" 
                : "Create a new category with name and image"}
            </p>
          </div>
          <Link to="/admin/categories/list">
            <button className="action-button secondary">
              <ArrowLeftOutlined />
              Back to Categories
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
                <FolderOutlined />
                Category Information
              </h3>
              <div className="row">
                <div className="col-md-9 col-9 mb-3">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label required">
                      Category Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      placeholder="Enter category name"
                      className="form-input"
                      value={ADDEDITDATA?.name || ""}
                      onChange={handleChange}
                      required
                    />
                    {error.name && (
                      <div className="form-error">{error.name}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-3 col-3 mb-3">
                  <div className="form-group">
                    <label htmlFor="seq_order" className="form-label required">
                      Seq. Order
                    </label>
                    <input
                      type="number"
                      name="seq_order"
                      id="seq_order"
                      placeholder="Enter category name"
                      className="form-input"
                      value={ADDEDITDATA?.seq_order || ""}
                      onChange={handleChange}
                      required
                    />
                    {error.seq_order && (
                      <div className="form-error">{error.seq_order}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-12 col-12 mb-3">
                  <div className="form-group">
                    <label htmlFor="description" className="form-label">
                      Description
                    </label>
                    <ReactQuill
                      theme="snow"
                      value={ADDEDITDATA?.description || ""}
                      onChange={handleDescriptionChange}
                      placeholder="Enter product description"
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        marginBottom: '8px'
                      }}
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, 3, false] }],
                          ['bold', 'italic', 'underline', 'strike'],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                          [{ 'color': [] }, { 'background': [] }],
                          [{ 'align': [] }],
                          ['link', 'image'],
                          ['clean']
                        ],
                      }}
                    />
                    <input
                      type="hidden"
                      name="description"
                      value={ADDEDITDATA?.description || ""}
                    />
                    {error.description && (
                      <div className="form-error">{error.description}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-12 col-12 mb-3">
                  <div className="form-group">
                    <label htmlFor="image" className="form-label required">
                      Category Image
                      {!ADDEDITDATA?.id && <span className="required-mark">*</span>}
                    </label>
                    <div className="image-upload-container">
                      {imagePreview ? (
                        <div className="image-preview-wrapper">
                          <img
                            src={`${process.env.REACT_APP_IMAGE_BASE_URL}${imagePreview}`}
                            alt="Category preview"
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
                          <p>Click to select category image</p>
                          <p className="text-muted small">Select from gallery or upload new</p>
                        </div>
                      )}
                    </div>
                    {error.image && (
                      <div className="form-error">{error.image}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="action-button secondary"
                onClick={() => navigate("/admin/categories/list")}
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
                    {ADDEDITDATA?.id ? "Update Category" : "Create Category"}
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
        folder="categories"
      />
    </div>
  );
};

export default CategoryAddEditPage;

