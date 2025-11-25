import React, { useEffect, useState, useRef } from "react";
import { notification, Select } from 'antd';
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  FolderOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LoadingEffect from "../../../components/Loading/LoadingEffect";
import { addEditSubCategory } from "../../../controllers/V1/subCategoryController";
import { list as fetchCategories } from "../../../controllers/V1/categoryController";
import ClipArtPicker from "../../../components/ClipArtPicker";
import "../admin-pages.css";

const { Option } = Select;

const SubCategoryAddEditPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location?.state;
  const [error, setError] = useState([]);
  const [ADDEDITDATA, setAddEditData] = useState(state || {});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading, please wait...');
  const [imagePreview, setImagePreview] = useState(state?.image || null);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [clipartPickerOpen, setClipartPickerOpen] = useState(false);

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

      // if (!ADDEDITDATA?.id && !ADDEDITDATA?.image) {
      //   notification.open({
      //     message: "Oops!",
      //     description: `Image is required for new sub-category.`,
      //     placement: "topRight",
      //     icon: <InfoCircleOutlined style={{ color: "red" }} />,
      //     duration: 2,
      //   });
      //   setIsLoading(false);
      //   return;
      // }

      const param = {
        name: formData.get('name'),
        seq_order: parseInt(formData.get('seq_order')),
        category: ADDEDITDATA?.category,
        ...(ADDEDITDATA?.id && { editId: ADDEDITDATA?.id }),
        ...(ADDEDITDATA?.image && { image: ADDEDITDATA?.image }),
      };

      const res = await addEditSubCategory(param);
      if (res.status === true) {
        notification.open({
          message: "Success",
          description: ADDEDITDATA?.id ? `Sub-category updated successfully` : `Sub-category added successfully`,
          placement: "topRight",
          icon: <CheckCircleOutlined style={{ color: "green" }} />,
          duration: 2,
        });
        navigate('/admin/sub-categories/list');
      } else {
        notification.open({
          message: "Oops!",
          description: `${res?.message || 'Failed to save sub-category'}`,
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
    document.title = `Influencer || ${ADDEDITDATA?.id ? "Edit" : "Add"} Sub-Category`;
    if (state?.image) {
      setImagePreview(state.image);
    }
    if (state?.category) {
      setAddEditData((pre) => ({
        ...pre,
        category: state.category,
      }));
    }
  }, [ADDEDITDATA?.id, state]);

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">
              {ADDEDITDATA?.id ? "Edit Sub-Category" : "Add New Sub-Category"}
            </h1>
            <p className="page-subtitle">
              {ADDEDITDATA?.id 
                ? "Update sub-category information" 
                : "Create a new sub-category with name, category, and image"}
            </p>
          </div>
          <Link to="/admin/sub-categories/list">
            <button className="action-button secondary">
              <ArrowLeftOutlined />
              Back to Sub-Categories
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
                Sub-Category Information
              </h3>
              <div className="row">
                <div className="col-md-6 col-6 mb-3">
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

                <div className="col-md-6 col-6 mb-3">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label required">
                      Sub-Category Name 
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      placeholder="Enter sub-category name"
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

                <div className="col-md-6 col-6 mb-3">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label required">
                      Seq. Order 
                    </label>
                    <input
                      type="number"
                      name="seq_order"
                      id="seq_order"
                      placeholder="Enter sequence order"
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
              </div>

              <div className="col-md-12 col-12 mb-3">
                <div className="form-group">
                  <label htmlFor="image" className="form-label">
                    Sub-Category Image
                  </label>
                  <div className="image-upload-container">
                    {imagePreview ? (
                      <div className="image-preview-wrapper">
                        <img
                          src={imagePreview}
                          alt="Sub-category preview"
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
                        <p>Click to select sub-category image</p>
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

            <div className="form-actions">
              <button
                type="button"
                className="action-button secondary"
                onClick={() => navigate("/admin/sub-categories/list")}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="action-button primary"
                disabled={isLoading || loadingCategories}
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner small"></div>
                    {ADDEDITDATA?.id ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <SaveOutlined />
                    {ADDEDITDATA?.id ? "Update Sub-Category" : "Create Sub-Category"}
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
        folder="sub-categories"
      />
    </div>
  );
};

export default SubCategoryAddEditPage;

