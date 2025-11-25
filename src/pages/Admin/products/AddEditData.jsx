import React, { useEffect, useState, useRef } from "react";
import { notification, Select } from 'antd';
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  ProductOutlined,
  UploadOutlined,
  SettingFilled,
  SettingOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import LoadingEffect from "../../../components/Loading/LoadingEffect";
import { addEditProduct } from "../../../controllers/V1/productController";
import { list as fetchCategories } from "../../../controllers/V1/categoryController";
import { list as fetchSubCategories } from "../../../controllers/V1/subCategoryController";
import ClipArtPicker from "../../../components/ClipArtPicker";
import "../admin-pages.css";

const { Option } = Select;

const ProductAddEditPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location?.state;
  const [error, setError] = useState([]);
  const [ADDEDITDATA, setAddEditData] = useState(state || {});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading, please wait...');
  const [imagePreview, setImagePreview] = useState(() => {
    if (!state?.image) return [];
    if (Array.isArray(state.image)) return state.image;
    if (typeof state.image === 'string') {
      // Try to parse as JSON first
      try {
        const parsed = JSON.parse(state.image);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        // Not JSON, continue with other formats
      }
      // Handle comma-separated strings (legacy format)
      if (state.image.includes(',')) {
        return state.image.split(',').map(img => img.trim()).filter(img => img);
      }
      // Single image string
      return [state.image];
    }
    return [state.image];
  });
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [clipartPickerOpen, setClipartPickerOpen] = useState(false);

  // Fetch categories and sub-categories on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingCategories(true);
        const [catResult, subCatResult] = await Promise.all([
          fetchCategories({
            type: "",
            condition: { status: "A" },
            skip: 0,
            limit: 1000,
          }),
          fetchSubCategories({
            type: "",
            condition: { status: "A" },
            skip: 0,
            limit: 1000,
          }),
        ]);

        if (catResult.status === true && catResult.result) {
          setCategories(catResult.result);
        }
        if (subCatResult.status === true && subCatResult.result) {
          setSubCategories(subCatResult.result);
          // If editing and category is already selected, filter sub-categories
          if (state?.category) {
            const filtered = subCatResult.result.filter(
              (subCat) => subCat.category === state.category
            );
            setFilteredSubCategories(filtered);
          }
        }
      } catch (error) {
        console.error("Error loading categories/sub-categories:", error);
        notification.open({
          message: "Oops!",
          description: "Failed to load categories/sub-categories. Please refresh the page.",
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
      } finally {
        setLoadingCategories(false);
      }
    };
    loadData();
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

  const handleCategoryChange = (value) => {
    // Filter sub-categories based on selected category
    const filtered = subCategories.filter(
      (subCat) => subCat.category === value
    );
    setFilteredSubCategories(filtered);
    
    setAddEditData((pre) => ({
      ...pre,
      category: value,
      // Reset sub-category if it doesn't belong to the new category
      subCategory: filtered.find((subCat) => subCat.id === pre.subCategory)
        ? pre.subCategory
        : null,
    }));
    setError((pre) => ({
      ...pre,
      category: "",
    }));
  };

  const handleSubCategoryChange = (value) => {
    setAddEditData((pre) => ({
      ...pre,
      subCategory: value,
    }));
    setError((pre) => ({
      ...pre,
      subCategory: "",
    }));
  };

  /*********************************************************
   *  This function is use to handle image selection from clipart picker
   *********************************************************/
  const handleImageSelect = (imageUrl) => {
    if (imageUrl && !imagePreview.includes(imageUrl)) {
      const updatedImages = [...imagePreview, imageUrl];
      setImagePreview(updatedImages);
      setAddEditData((pre) => ({
        ...pre,
        image: updatedImages,
      }));
    }
    setClipartPickerOpen(false);
    setError((pre) => ({
      ...pre,
      image: "",
    }));
  };

  /*********************************************************
   *  This function is use to remove an image from the list
   *********************************************************/
  const handleRemoveImage = (imageUrl) => {
    const updatedImages = imagePreview.filter(img => img !== imageUrl);
    setImagePreview(updatedImages);
    setAddEditData((pre) => ({
      ...pre,
      image: updatedImages.length > 0 ? updatedImages : null,
    }));
  };

  const handleOpenClipartPicker = () => {
    setClipartPickerOpen(true);
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

      if (!ADDEDITDATA?.subCategory) {
        notification.open({
          message: "Oops!",
          description: `Sub-Category is required.`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        setIsLoading(false);
        return;
      }

      if (!ADDEDITDATA?.id && (!ADDEDITDATA?.image || (Array.isArray(ADDEDITDATA?.image) && ADDEDITDATA.image.length === 0))) {
        notification.open({
          message: "Oops!",
          description: `At least one image is required for new product.`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        setIsLoading(false);
        return;
      }
      const imageArray = Array.isArray(ADDEDITDATA.image) 
        ? ADDEDITDATA.image 
        : ADDEDITDATA.image 
          ? [ADDEDITDATA.image] 
          : [];
      
      const param = {
        title                 : formData.get('title'),
        category              : ADDEDITDATA?.category,
        subCategory           : ADDEDITDATA?.subCategory,
        made_two_order        : ADDEDITDATA?.made_two_order || "N", 
        subscription_products : ADDEDITDATA?.subscription_products || "N", 
        fresh_item            : ADDEDITDATA?.fresh_item || "N", 
        ...(formData.get('description') && { description: formData.get('description') }),
        ...(ADDEDITDATA?.id && { editId: ADDEDITDATA?.id }),
        ...(imageArray.length > 0 && { 
          image: JSON.stringify(imageArray)
        }),
      };

      const res = await addEditProduct(param);
      if (res.status === true) {
        notification.open({
          message: "Success",
          description: ADDEDITDATA?.id ? `Product updated successfully` : `Product added successfully`,
          placement: "topRight",
          icon: <CheckCircleOutlined style={{ color: "green" }} />,
          duration: 2,
        });
        navigate('/admin/products/list');
      } else {
        notification.open({
          message: "Oops!",
          description: `${res?.message || 'Failed to save product'}`,
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

  const handleSettingChange = (name="") => {
    try {
      setAddEditData((pre)=>({
        ...pre,
        [name] : ADDEDITDATA[name] === "Y"? "N" : "Y"
      }))
    } catch (error) {
      console.log('error : ', error);
    }
  }

  useEffect(() => {
    document.title = `Influencer || ${ADDEDITDATA?.id ? "Edit" : "Add"} Product`;
    if (state?.image) {
      let images = [];
      if (Array.isArray(state.image)) {
        images = state.image;
      } else if (typeof state.image === 'string') {
        // Try to parse as JSON first
        try {
          const parsed = JSON.parse(state.image);
          if (Array.isArray(parsed)) {
            images = parsed;
          } else {
            images = [state.image];
          }
        } catch (e) {
          // Not JSON, handle comma-separated strings (legacy format)
          if (state.image.includes(',')) {
            images = state.image.split(',').map(img => img.trim()).filter(img => img);
          } else {
            images = [state.image];
          }
        }
      } else {
        images = [state.image];
      }
      setImagePreview(images);
      setAddEditData((pre) => ({
        ...pre,
        image: images,
      }));
    }
    if (state?.category) {
      setAddEditData((pre) => ({
        ...pre,
        category: state.category,
      }));
      // Filter sub-categories when category is set
      if (subCategories.length > 0) {
        const filtered = subCategories.filter(
          (subCat) => subCat.category === state.category
        );
        setFilteredSubCategories(filtered);
      }
    }
    if (state?.subCategory) {
      setAddEditData((pre) => ({
        ...pre,
        subCategory: state.subCategory,
      }));
    }
  }, [ADDEDITDATA?.id, state, subCategories]);

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">
              {ADDEDITDATA?.id ? "Edit Product" : "Add New Product"}
            </h1>
            <p className="page-subtitle">
              {ADDEDITDATA?.id 
                ? "Update product information" 
                : "Create a new product with title, description, category, sub-category, and image"}
            </p>
          </div>
          <Link to="/admin/products/list">
            <button className="action-button secondary">
              <ArrowLeftOutlined />
              Back to Products
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
                <ProductOutlined />
                Product Information
              </h3>
              <div className="row">
                <div class="col-md-6 col-12">
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
                <div className="col-md-6 col-12">
                  <div className="form-group">
                    <label htmlFor="subCategory" className="form-label required">
                      Sub-Category
                    </label>
                    <Select
                      name="subCategory"
                      id="subCategory"
                      placeholder="Select a sub-category"
                      className="form-select"
                      value={ADDEDITDATA?.subCategory}
                      onChange={handleSubCategoryChange}
                      disabled={!ADDEDITDATA?.category}
                      loading={loadingCategories}
                      style={{ width: "100%" }}
                      size="large"
                    >
                      {filteredSubCategories.map((subCat) => (
                        <Option key={subCat.id} value={subCat.id}>
                          {subCat.name}
                        </Option>
                      ))}
                    </Select>
                    {!ADDEDITDATA?.category && (
                      <div className="form-error" style={{ color: "#3b82f6" }}>
                        Please select a category first
                      </div>
                    )}
                    {error.subCategory && (
                      <div className="form-error">{error.subCategory}</div>
                    )}
                  </div>
                </div>
                <div className="col-md-12 col-12">
                  <div className="form-group">
                    <label htmlFor="title" className="form-label required">
                      Product Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      placeholder="Enter product title"
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
                <div className="col-md-12 col-12 mt-3">
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
                <div className="col-md-12 col-12 mt-3">
                  <div className="form-group">
                    <label htmlFor="image" className="form-label required">
                      Product Images
                      {!ADDEDITDATA?.id && <span className="required-mark">*</span>}
                    </label>
                    <div className="image-upload-container">
                      {imagePreview && imagePreview.length > 0 ? (
                        <div className="multiple-images-wrapper">
                          <div className="images-grid">
                            {imagePreview.map((img, index) => (
                              <div key={index} className="image-preview-item">
                                <img
                                  src={`${process.env.REACT_APP_IMAGE_BASE_URL}${img}`}
                                  alt={`Product preview ${index + 1}`}
                                  className="image-preview"
                                />
                                <button
                                  type="button"
                                  className="image-remove-button"
                                  onClick={() => handleRemoveImage(img)}
                                  title="Remove image"
                                >
                                  <DeleteOutlined />
                                </button>
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            className="image-add-button"
                            onClick={handleOpenClipartPicker}
                          >
                            <UploadOutlined />
                            Add More Images
                          </button>
                        </div>
                      ) : (
                        <div
                          className="image-upload-placeholder"
                          onClick={handleOpenClipartPicker}
                        >
                          <UploadOutlined style={{ fontSize: "48px", color: "#9ca3af" }} />
                          <p>Click to select product images</p>
                          <p className="text-muted small">Select from gallery or upload new (multiple selection)</p>
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

            <div className="form-section">
              <h3 className="form-section-title">
                <SettingOutlined />
                Setting
              </h3>
              <div className="row">
                <div class="col-md-3 col-2 mb-3">
                  <div className="form-group">
                    <div className="permission-item" onClick={()=>handleSettingChange("made_two_order")}>
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={ADDEDITDATA?.made_two_order === "Y"}
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">Made 2 Order</label>
                        <p className="permission-description">View product in Made 2 Order</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-md-3 col-2 mb-3">
                  <div className="form-group">
                    <div className="permission-item" onClick={()=>handleSettingChange("subscription_products")}>
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={ADDEDITDATA?.subscription_products === "Y"}
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">Subscription Product</label>
                        <p className="permission-description">View product in subscription list</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-md-3 col-2 mb-3">
                  <div className="form-group">
                    <div className="permission-item" onClick={()=>handleSettingChange("fresh_item")}>
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={ADDEDITDATA?.fresh_item === "Y"}
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label"> Fresh New Item</label>
                        <p className="permission-description">View product in Fresh New Items</p>
                      </div>
                    </div>
                  </div>
                </div>


              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="action-button secondary"
                onClick={() => navigate("/admin/products/list")}
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
                    {ADDEDITDATA?.id ? "Update Product" : "Create Product"}
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
        selectedImage={imagePreview && imagePreview.length > 0 ? imagePreview[imagePreview.length - 1] : null}
        folder="products"
      />
    </div>
  );
};

export default ProductAddEditPage;

