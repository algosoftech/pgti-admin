import React, { useEffect, useState } from "react";
import { notification, Select } from 'antd';
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  ProductOutlined,
  PlusOutlined,
  DeleteOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import LoadingEffect from 'components/ui/Loading/LoadingEffect';
import { addEditProduct } from 'services/product.service';
import { list as fetchCategories } from 'services/category.service';
import { list as fetchSubCategories } from 'services/subCategory.service';
import ImageUploadField from 'components/ui/ImageUploadField';
import "styles/admin-pages.css";

const { Option } = Select;

const parseImageArray = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) { /* not JSON */ }
    if (raw.includes(',')) return raw.split(',').map(s => s.trim()).filter(Boolean);
    return [raw];
  }
  return [raw];
};

const ProductAddEditPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location?.state;
  const [error, setError] = useState([]);
  const [ADDEDITDATA, setAddEditData] = useState(() => ({
    ...(state || {}),
    image: parseImageArray(state?.image),
  }));
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading, please wait...');
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch categories and sub-categories on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingCategories(true);
        const [catResult, subCatResult] = await Promise.all([
          fetchCategories({ type: "", condition: { status: "A" }, skip: 0, limit: 1000 }),
          fetchSubCategories({ type: "", condition: { status: "A" }, skip: 0, limit: 1000 }),
        ]);
        if (catResult.status === true && catResult.result) {
          setCategories(catResult.result);
        }
        if (subCatResult.status === true && subCatResult.result) {
          setSubCategories(subCatResult.result);
          if (state?.category) {
            setFilteredSubCategories(subCatResult.result.filter(s => s.category === state.category));
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

  useEffect(() => {
    document.title = `PGTI || ${ADDEDITDATA?.id ? "Edit" : "Add"} Product`;
    if (state?.category && subCategories.length > 0) {
      setFilteredSubCategories(subCategories.filter(s => s.category === state.category));
    }
  }, [ADDEDITDATA?.id, state, subCategories]);

  /*********************************************************
   *  Input handlers
   *********************************************************/
  const handleChange = (e) => {
    setAddEditData(pre => ({ ...pre, [e.target.name]: e.target.value }));
    setError(pre => ({ ...pre, [e.target.name]: "" }));
  };

  const handleDescriptionChange = (value) => {
    setAddEditData(pre => ({ ...pre, description: value }));
    setError(pre => ({ ...pre, description: "" }));
  };

  const handleCategoryChange = (value) => {
    const filtered = subCategories.filter(s => s.category === value);
    setFilteredSubCategories(filtered);
    setAddEditData(pre => ({
      ...pre,
      category: value,
      subCategory: filtered.find(s => s.id === pre.subCategory) ? pre.subCategory : null,
    }));
    setError(pre => ({ ...pre, category: "" }));
  };

  const handleSubCategoryChange = (value) => {
    setAddEditData(pre => ({ ...pre, subCategory: value }));
    setError(pre => ({ ...pre, subCategory: "" }));
  };

  const handleSettingChange = (name) => {
    setAddEditData(pre => ({ ...pre, [name]: pre[name] === "Y" ? "N" : "Y" }));
  };

  /*********************************************************
   *  Multi-image handlers
   *********************************************************/
  const images = Array.isArray(ADDEDITDATA?.image) ? ADDEDITDATA.image : [];

  const handleImageChange = (index, url) => {
    const updated = [...images];
    if (url) {
      updated[index] = url;
    } else {
      updated.splice(index, 1);
    }
    setAddEditData(pre => ({ ...pre, image: updated }));
    setError(pre => ({ ...pre, image: '' }));
  };

  const addImageSlot = () => {
    setAddEditData(pre => ({ ...pre, image: [...images, ''] }));
  };

  /*********************************************************
   *  Submit
   *********************************************************/
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const formData = new FormData(e.target);

      if (!formData.get('title') || !formData.get('title').trim()) {
        notification.open({ message: "Oops!", description: `Title is required.`, placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
        setIsLoading(false); return;
      }
      if (!ADDEDITDATA?.category) {
        notification.open({ message: "Oops!", description: `Category is required.`, placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
        setIsLoading(false); return;
      }
      if (!ADDEDITDATA?.subCategory) {
        notification.open({ message: "Oops!", description: `Sub-Category is required.`, placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
        setIsLoading(false); return;
      }

      const filledImages = images.filter(Boolean);
      if (!ADDEDITDATA?.id && filledImages.length === 0) {
        notification.open({ message: "Oops!", description: `At least one image is required for new product.`, placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
        setIsLoading(false); return;
      }

      const param = {
        title: formData.get('title'),
        category: ADDEDITDATA?.category,
        subCategory: ADDEDITDATA?.subCategory,
        made_two_order: ADDEDITDATA?.made_two_order || "N",
        subscription_products: ADDEDITDATA?.subscription_products || "N",
        fresh_item: ADDEDITDATA?.fresh_item || "N",
        ...(ADDEDITDATA?.description && { description: ADDEDITDATA.description }),
        ...(ADDEDITDATA?.id && { editId: ADDEDITDATA?.id }),
        ...(filledImages.length > 0 && { image: JSON.stringify(filledImages) }),
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
      notification.open({ message: "Oops!", description: `An error occurred. Please try again.`, placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
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
              {ADDEDITDATA?.id ? "Edit Product" : "Add New Product"}
            </h1>
            <p className="page-subtitle">
              {ADDEDITDATA?.id
                ? "Update product information"
                : "Create a new product with title, description, category, sub-category, and images"}
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

      <div className="page-body">
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
                <div className="col-md-6 col-12">
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
                        <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                      ))}
                    </Select>
                    {error.category && <div className="form-error">{error.category}</div>}
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
                        <Option key={subCat.id} value={subCat.id}>{subCat.name}</Option>
                      ))}
                    </Select>
                    {!ADDEDITDATA?.category && (
                      <div className="form-error" style={{ color: "#3b82f6" }}>Please select a category first</div>
                    )}
                    {error.subCategory && <div className="form-error">{error.subCategory}</div>}
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
                    {error.title && <div className="form-error">{error.title}</div>}
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
                      style={{ backgroundColor: 'white', borderRadius: '8px', marginBottom: '8px' }}
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, 3, false] }],
                          ['bold', 'italic', 'underline', 'strike'],
                          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                          [{ 'color': [] }, { 'background': [] }],
                          [{ 'align': [] }],
                          ['link', 'image'],
                          ['clean']
                        ],
                      }}
                    />
                    <input type="hidden" name="description" value={ADDEDITDATA?.description || ""} />
                    {error.description && <div className="form-error">{error.description}</div>}
                  </div>
                </div>

                {/* Product Images — multi-slot grid */}
                <div className="col-md-12 col-12 mt-3">
                  <div className="form-group">
                    <label className="form-label required">
                      Product Images {!ADDEDITDATA?.id && <span className="required-mark">*</span>}
                    </label>
                    <div className="row g-3">
                      {(images.length > 0 ? images : ['']).map((img, idx) => (
                        <div key={idx} className="col-md-4 col-sm-6 col-12" style={{ position: 'relative' }}>
                          <ImageUploadField
                            value={img || ''}
                            onChange={(url) => handleImageChange(idx, url)}
                            folder="products"
                            previewH={150}
                          />
                          {images.length > 1 && (
                            <button
                              type="button"
                              className="action-button danger"
                              style={{ fontSize: 11, padding: '3px 10px', marginTop: 6 }}
                              onClick={() => handleImageChange(idx, '')}
                            >
                              <DeleteOutlined /> Remove
                            </button>
                          )}
                        </div>
                      ))}
                      <div className="col-md-4 col-sm-6 col-12 d-flex align-items-center justify-content-center">
                        <button
                          type="button"
                          className="action-button secondary"
                          style={{ width: '100%', minHeight: 60 }}
                          onClick={addImageSlot}
                        >
                          <PlusOutlined /> Add Image
                        </button>
                      </div>
                    </div>
                    {error.image && <div className="form-error mt-2">{error.image}</div>}
                  </div>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">
                <SettingOutlined />
                Settings
              </h3>
              <div className="row">
                <div className="col-md-3 col-6 mb-3">
                  <div className="form-group">
                    <div className="permission-item" onClick={() => handleSettingChange("made_two_order")}>
                      <div className="permission-checkbox">
                        <input type="checkbox" checked={ADDEDITDATA?.made_two_order === "Y"} readOnly />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">Made 2 Order</label>
                        <p className="permission-description">View product in Made 2 Order</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-3 col-6 mb-3">
                  <div className="form-group">
                    <div className="permission-item" onClick={() => handleSettingChange("subscription_products")}>
                      <div className="permission-checkbox">
                        <input type="checkbox" checked={ADDEDITDATA?.subscription_products === "Y"} readOnly />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">Subscription Product</label>
                        <p className="permission-description">View product in subscription list</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-3 col-6 mb-3">
                  <div className="form-group">
                    <div className="permission-item" onClick={() => handleSettingChange("fresh_item")}>
                      <div className="permission-checkbox">
                        <input type="checkbox" checked={ADDEDITDATA?.fresh_item === "Y"} readOnly />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">Fresh New Item</label>
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
      </div>

      <LoadingEffect isLoading={isLoading} text={loadingText} />
    </div>
  );
};

export default ProductAddEditPage;
