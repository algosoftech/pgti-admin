import React, { useEffect, useState } from "react";
import { notification, Select } from 'antd';
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  FileTextOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import LoadingEffect from "../../../components/Loading/LoadingEffect";
import { addEditArticle } from "../../../controllers/V1/articleController";
import { list as fetchCategories } from "../../../controllers/V1/categoryController";
import ClipArtPicker from "../../../components/ClipArtPicker";
import "../admin-pages.css";

const { Option } = Select;

const ArticleAddEditPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location?.state;
  const [error, setError] = useState([]);
  const [ADDEDITDATA, setAddEditData] = useState(state || {});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading, please wait...');
  const [imagePreview, setImagePreview] = useState(state?.image || null);
  const [clipartPickerOpen, setClipartPickerOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Fetch categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const result = await fetchCategories({
          type: "",
          condition: { status: "A" },
          skip: 0,
          limit: 1000,
        });
        if (result.status === true && result.result) {
          setCategories(result.result);
        }
      } catch (error) {
        console.error("Error loading categories:", error);
        notification.open({
          message: "Oops!",
          description: "Failed to load categories. Please refresh the page.",
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

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
   *  This function is use to handle category change
   *********************************************************/
  const handleCategoryChange = (value) => {
    setAddEditData((pre) => ({
      ...pre,
      category: value,
    }));
    setError((pre) => ({
      ...pre,
      category: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const formData = new FormData(e.target);
      
      if (!formData.get('title') || !formData.get('title').trim()) {
        notification.open({
          message: "Oops!",
          description: `Title is required.`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        setIsLoading(false);
        return;
      }

      if (!formData.get('sort_description') || !formData.get('sort_description').trim()) {
        notification.open({
          message: "Oops!",
          description: `Short description is required.`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        setIsLoading(false);
        return;
      }

      if (!ADDEDITDATA?.description || !ADDEDITDATA?.description.trim()) {
        notification.open({
          message: "Oops!",
          description: `Description is required.`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        setIsLoading(false);
        return;
      }

      if (!ADDEDITDATA?.category) {
        notification.open({
          message: "Oops!",
          description: `Category is required.`,
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
          description: `Image is required for new article.`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        setIsLoading(false);
        return;
      }

      const param = {
        ...(ADDEDITDATA?.id && { editId: ADDEDITDATA?.id }),
        title: formData.get('title'),
        sort_description: formData.get('sort_description'),
        description: ADDEDITDATA?.description || "",
        category: ADDEDITDATA?.category,
        ...(ADDEDITDATA?.image && { image: ADDEDITDATA?.image }),
        ...(formData.get('video_url') && { video_url: formData.get('video_url') }),
        ...(formData.get('tags') && { tags: formData.get('tags') }),
      };

      const res = await addEditArticle(param);
      if (res.status === true) {
        notification.open({
          message: "Success",
          description: ADDEDITDATA?.id ? `Article updated successfully` : `Article added successfully`,
          placement: "topRight",
          icon: <CheckCircleOutlined style={{ color: "green" }} />,
          duration: 2,
        });
        navigate('/admin/articles/list');
      } else {
        notification.open({
          message: "Oops!",
          description: `${res?.message || 'Failed to save article'}`,
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
    document.title = `Farmer Store || ${ADDEDITDATA?.id ? "Edit" : "Add"} Article`;
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
              {ADDEDITDATA?.id ? "Edit Article" : "Add New Article"}
            </h1>
            <p className="page-subtitle">
              {ADDEDITDATA?.id 
                ? "Update article information" 
                : "Create a new article with title, description, image, and category"}
            </p>
          </div>
          <Link to="/admin/articles/list">
            <button className="action-button secondary">
              <ArrowLeftOutlined />
              Back to Articles
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
                <FileTextOutlined />
                Article Information
              </h3>
              <div className="row">
                <div className="col-md-12 col-12 mb-3">
                  <div className="form-group">
                    <label htmlFor="title" className="form-label required">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      placeholder="Enter article title"
                      className="form-input"
                      value={ADDEDITDATA?.title || ""}
                      onChange={handleChange}
                      required
                    />
                    {error.title && (
                      <div className="form-error">{error.title}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-12 col-12 mb-3">
                  <div className="form-group">
                    <label htmlFor="sort_description" className="form-label required">
                      Short Description
                    </label>
                    <textarea
                      name="sort_description"
                      id="sort_description"
                      placeholder="Enter short description"
                      className="form-input"
                      rows="3"
                      value={ADDEDITDATA?.sort_description || ""}
                      onChange={handleChange}
                      required
                    />
                    {error.sort_description && (
                      <div className="form-error">{error.sort_description}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-12 col-12 mb-3">
                  <div className="form-group">
                    <label htmlFor="description" className="form-label required">
                      Description
                    </label>
                    <ReactQuill
                      theme="snow"
                      value={ADDEDITDATA?.description || ""}
                      onChange={handleDescriptionChange}
                      placeholder="Enter article description"
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

                <div className="col-md-6 col-12 mb-3">
                  <div className="form-group">
                    <label htmlFor="category" className="form-label required">
                      Category
                    </label>
                    <Select
                      name="category"
                      id="category"
                      placeholder="Select a category"
                      className="form-select"
                      value={ADDEDITDATA?.category}
                      onChange={handleCategoryChange}
                      loading={loadingCategories}
                      style={{ width: "100%" }}
                      size="large"
                    >
                      {categories.map((cat) => (
                        <Option key={cat.id} value={cat.id}>
                          {cat.name}
                        </Option>
                      ))}
                    </Select>
                    {error.category && (
                      <div className="form-error">{error.category}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6 col-12 mb-3">
                  <div className="form-group">
                    <label htmlFor="tags" className="form-label">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      name="tags"
                      id="tags"
                      placeholder="e.g., farming, agriculture, tips"
                      className="form-input"
                      value={ADDEDITDATA?.tags || ""}
                      onChange={handleChange}
                    />
                    {error.tags && (
                      <div className="form-error">{error.tags}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-12 col-12 mb-3">
                  <div className="form-group">
                    <label htmlFor="video_url" className="form-label">
                      Video URL
                    </label>
                    <input
                      type="url"
                      name="video_url"
                      id="video_url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="form-input"
                      value={ADDEDITDATA?.video_url || ""}
                      onChange={handleChange}
                    />
                    {error.video_url && (
                      <div className="form-error">{error.video_url}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-12 col-12 mb-3">
                  <div className="form-group">
                    <label htmlFor="image" className="form-label required">
                      Article Image
                      {!ADDEDITDATA?.id && <span className="required-mark">*</span>}
                    </label>
                    <div className="image-upload-container">
                      {imagePreview ? (
                        <div className="image-preview-wrapper">
                          <img
                            src={`${process.env.REACT_APP_IMAGE_BASE_URL}${imagePreview}`}
                            alt="Article preview"
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
                          <p>Click to select article image</p>
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
                onClick={() => navigate("/admin/articles/list")}
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
                    {ADDEDITDATA?.id ? "Update Article" : "Create Article"}
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
        folder="articles"
      />
    </div>
  );
};

export default ArticleAddEditPage;

