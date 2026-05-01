import React, { useEffect, useState } from "react";
import { notification, Select } from 'antd';
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import LoadingEffect from 'components/ui/Loading/LoadingEffect';
import { addEditArticle } from 'services/articles.service';
import { list as fetchCategories } from 'services/category.service';
import ImageUploadField from 'components/ui/ImageUploadField';
import { CharCounter, FieldHint, ImageHint } from 'components/ui/FieldHint';
import { LIMITS, IMAGE_SPECS, validateLength } from 'utils/fieldValidation';
import "styles/admin-pages.css";

const { Option } = Select;

const ArticleAddEditPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location?.state;
  const [error, setError] = useState([]);
  const [ADDEDITDATA, setAddEditData] = useState(state || {});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading, please wait...');
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
      if (!validateLength(formData.get('title'), 'Title', LIMITS.title)) { setIsLoading(false); return; }

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
      if (!validateLength(formData.get('sort_description'), 'Short Description', LIMITS.short_description)) { setIsLoading(false); return; }

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
      if (!validateLength(ADDEDITDATA.description, 'Description', LIMITS.description, true)) { setIsLoading(false); return; }

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
    document.title = `PGTI || ${ADDEDITDATA?.id ? "Edit" : "Add"} Article`;
  }, [ADDEDITDATA?.id]);

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

      <div className="page-body">
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
                    <CharCounter value={ADDEDITDATA?.title} min={LIMITS.title.min} max={LIMITS.title.max} />
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
                    <CharCounter value={ADDEDITDATA?.sort_description} min={LIMITS.short_description.min} max={LIMITS.short_description.max} />
                    <FieldHint text="A brief summary shown on listing cards and search results. Keep it concise and engaging." />
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
                    <CharCounter value={ADDEDITDATA?.description?.replace(/<[^>]*>/g, '') || ""} min={LIMITS.description.min} max={LIMITS.description.max} />
                    <FieldHint text="Full article body. Use headings, bullet lists, and bold text to improve readability. Rich formatting is supported." />
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
                      placeholder="e.g., golf, tournament, pgti"
                      className="form-input"
                      value={ADDEDITDATA?.tags || ""}
                      onChange={handleChange}
                    />
                    <FieldHint text="Comma-separated keywords that help users discover this article." />
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
                    <FieldHint text="Optional YouTube or Vimeo URL embedded alongside the article." />
                    {error.video_url && (
                      <div className="form-error">{error.video_url}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-12 col-12 mb-3">
                  <ImageUploadField
                    label="Article Image"
                    required={!ADDEDITDATA?.id}
                    value={ADDEDITDATA?.image || ''}
                    onChange={(url) => {
                      setAddEditData(p => ({ ...p, image: url }));
                      setError(p => ({ ...p, image: '' }));
                    }}
                    folder="articles"
                    previewH={200}
                    error={error.image}
                    spec={IMAGE_SPECS.articles}
                  />
                  <ImageHint
                    recommended={IMAGE_SPECS.articles.recommended}
                    maxSize={`${IMAGE_SPECS.articles.maxMB}MB`}
                    note={IMAGE_SPECS.articles.note}
                  />
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
      </div>

      <LoadingEffect isLoading={isLoading} text={loadingText} />
    </div>
  );
};

export default ArticleAddEditPage;
