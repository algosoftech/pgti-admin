import React, { useEffect, useState, useRef } from "react";
import { notification, Select, DatePicker } from 'antd';
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  BoxPlotOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import LoadingEffect from 'components/ui/Loading/LoadingEffect';
import { addEditProductVariant } from 'services/productVariant.service';
import { list as fetchProducts } from 'services/product.service';
import "styles/admin-pages.css";

const { Option } = Select;

const ProductVariantAddEditPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location?.state;
  const [error, setError] = useState([]);
  const [ADDEDITDATA, setAddEditData] = useState(state || {});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading, please wait...');
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Fetch products on component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const result = await fetchProducts({
          type: "",
          condition: { status: "A" },
          skip: 0,
          limit: 1000,
        });

        if (result.status === true && result.result) {
          setProducts(result.result);
        }
      } catch (error) {
        console.error("Error loading products:", error);
        notification.open({
          message: "Oops!",
          description: "Failed to load products. Please refresh the page.",
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
      } finally {
        setLoadingProducts(false);
      }
    };
    loadProducts();
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

  const handleProductChange = (value) => {
    setAddEditData((pre) => ({
      ...pre,
      product: value,
    }));
    setError((pre) => ({
      ...pre,
      product: "",
    }));
  };

  const handleDiscountTypeChange = (value) => {
    setAddEditData((pre) => ({
      ...pre,
      discount_type: value,
      ...(value === null || value === "" ? { discount_text: "", discount: "" } : {}),
    }));
  };

  const handlePackageTypeChange = (value) => {
    setAddEditData((pre) => ({
      ...pre,
      package_type: value
    }));
  };

  const handleUnitChange = (value) => {
    setAddEditData((pre) => ({
      ...pre,
      unit: value
    }));
  };

  const handleDateChange = (date, dateString) => {
    setAddEditData((pre) => ({
      ...pre,
      expire_date: dateString || null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const formData = new FormData(e.target);
      
      if (!ADDEDITDATA?.product) {
        notification.open({
          message: "Oops!",
          description: `Product is required.`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        setIsLoading(false);
        return;
      }

      if (!ADDEDITDATA?.unit || !ADDEDITDATA?.unit.trim()) {
        notification.open({
          message: "Oops!",
          description: `Unit is required.`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        setIsLoading(false);
        return;
      }

      if (!formData.get('rate') || parseFloat(formData.get('rate')) <= 0) {
        notification.open({
          message: "Oops!",
          description: `Rate is required and must be greater than 0.`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        setIsLoading(false);
        return;
      }

      if (!ADDEDITDATA?.id && (!formData.get('stock') || parseInt(formData.get('stock')) <= 0)) {
        notification.open({
          message: "Oops!",
          description: `Stock is required and must be greater than 0.`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        setIsLoading(false);
        return;
      }

      if (ADDEDITDATA?.discount_type && !formData.get('discount_text')) {
        notification.open({
          message: "Oops!",
          description: `Discount text is required when discount type is selected.`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        setIsLoading(false);
        return;
      }

      if (ADDEDITDATA?.discount_type && (!formData.get('discount') || parseFloat(formData.get('discount')) <= 0)) {
        notification.open({
          message: "Oops!",
          description: `Discount amount is required and must be greater than 0.`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        setIsLoading(false);
        return;
      }

      const param = {
        product: ADDEDITDATA?.product,
        unit: ADDEDITDATA?.unit,
        rate: parseFloat(formData.get('rate')),
        ...(formData.get('package_type') && { package_type: formData.get('package_type') }),
        ...(ADDEDITDATA?.expire_date && { expire_date: ADDEDITDATA.expire_date }),
        ...(ADDEDITDATA?.discount_type && {
          discount_type: parseInt(ADDEDITDATA.discount_type),
          discount_text: formData.get('discount_text'),
          discount: parseFloat(formData.get('discount')),
        }),
        ...(ADDEDITDATA?.id ? {} : { stock: parseInt(formData.get('stock')) }),
        ...(ADDEDITDATA?.id && { editId: ADDEDITDATA?.id }),
      };

      const res = await addEditProductVariant(param);
      if (res.status === true) {
        notification.open({
          message: "Success",
          description: ADDEDITDATA?.id ? `Product variant updated successfully` : `Product variant added successfully`,
          placement: "topRight",
          icon: <CheckCircleOutlined style={{ color: "green" }} />,
          duration: 2,
        });
        navigate('/admin/product-variants/list');
      } else {
        notification.open({
          message: "Oops!",
          description: `${res?.message || 'Failed to save product variant'}`,
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
    document.title = `Influencer || ${ADDEDITDATA?.id ? "Edit" : "Add"} Product Variant`;
    if (state?.product) {
      setAddEditData((pre) => ({
        ...pre,
        product: state.product,
      }));
    }
  }, [ADDEDITDATA?.id, state]);

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">
              {ADDEDITDATA?.id ? "Edit Product Variant" : "Add New Product Variant"}
            </h1>
            <p className="page-subtitle">
              {ADDEDITDATA?.id 
                ? "Update product variant information" 
                : "Create a new product variant with product, unit, rate, and stock"}
            </p>
          </div>
          <Link to="/admin/product-variants/list">
            <button className="action-button secondary">
              <ArrowLeftOutlined />
              Back to Variants
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
                <BoxPlotOutlined />
                Product Variant Information
              </h3>
              <div className="row">
                <div className="col-md-6 col-6">
                  <div className="form-group">
                    <label htmlFor="product" className="form-label required">
                      Product
                    </label>
                    <Select
                      name="product"
                      id="product"
                      placeholder="Select a product"
                      className="form-select"
                      value={ADDEDITDATA?.product}
                      onChange={handleProductChange}
                      loading={loadingProducts}
                      style={{ width: "100%" }}
                      size="large"
                    >
                      {products.map((prod) => (
                        <Option key={prod.id} value={prod.id}>
                          {prod.title}
                        </Option>
                      ))}
                    </Select>
                    {error.product && (
                      <div className="form-error">{error.product}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6 col-6">
                  <div className="form-group">
                    <label htmlFor="unit" className="form-label required">
                      Unit
                    </label>
                    <Select
                      name="unit" 
                      id="unit" 
                      placeholder="e.g., kilogram, gram, liter, milliliter" 
                      className="form-select" 
                      value={ADDEDITDATA?.unit} 
                      onChange={handleUnitChange} 
                      allowClear
                      style={{ width: "100%" }}
                      size="large"
                    >
                      <Option value="kilogram">Kilogram</Option>
                      <Option value="gram">Gram</Option>
                      <Option value="liter">Liter</Option>
                      <Option value="milliliter">Milliliter</Option>
                    </Select>
                    {error.unit && (
                      <div className="form-error">{error.unit}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6 col-6">
                  <div className="form-group">
                    <label htmlFor="rate" className="form-label required">
                      Rate (Price)
                    </label>
                    <input
                      type="number"
                      name="rate"
                      id="rate"
                      placeholder="Enter price"
                      className="form-input"
                      value={ADDEDITDATA?.rate || ""}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required
                    />
                    {error.rate && (
                      <div className="form-error">{error.rate}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6 col-6">
                  {!ADDEDITDATA?.id && (
                    <div className="form-group">
                      <label htmlFor="stock" className="form-label required">
                        Stock (Initial)
                      </label>
                      <input
                        type="number"
                        name="stock"
                        id="stock"
                        placeholder="Enter initial stock"
                        className="form-input"
                        value={ADDEDITDATA?.stock || ""}
                        onChange={handleChange}
                        min="1"
                        required
                      />
                      {error.stock && (
                        <div className="form-error">{error.stock}</div>
                      )}
                    </div>
                  )}
                </div>

                <div className="col-md-6 col-6">
                  <div className="form-group">
                    <label htmlFor="package_type" className="form-label">
                      Package Type
                    </label>
                    <Select 
                      name="package_type" 
                      id="package_type" 
                      placeholder="e.g, Box, Pack, Bottle" 
                      className="form-select" 
                      value={ADDEDITDATA?.package_type} 
                      onChange={handlePackageTypeChange} 
                      allowClear
                      style={{ width: "100%" }}
                      size="large"
                    >
                      <Option value="Box">Box</Option>
                      <Option value="Pack">Pack</Option>
                      <Option value="Bottle">Bottle</Option>
                      <Option value="Loose">Loose</Option>
                    </Select>

                    {error.package_type && (
                      <div className="form-error">{error.package_type}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6 col-6">
                  <div className="form-group">
                    <label htmlFor="expire_date" className="form-label">
                      Expiry Date
                    </label>
                    <DatePicker
                      name="expire_date"
                      id="expire_date"
                      className="form-input"
                      style={{ width: "100%" }}
                      size="large"
                      value={ADDEDITDATA?.expire_date ? moment(ADDEDITDATA.expire_date) : null}
                      onChange={handleDateChange}
                      format="YYYY-MM-DD"
                    />
                    {error.expire_date && (
                      <div className="form-error">{error.expire_date}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6 col-6">
                  <div className="form-group">
                    <label htmlFor="discount_type" className="form-label">
                      Discount Type
                    </label>
                    <Select
                      name="discount_type"
                      id="discount_type"
                      placeholder="Select discount type (optional)"
                      className="form-select"
                      value={ADDEDITDATA?.discount_type}
                      onChange={handleDiscountTypeChange}
                      allowClear
                      style={{ width: "100%" }}
                      size="large"
                    >
                      <Option value={1}>Fixed Amount</Option>
                      <Option value={2}>Percentage</Option>
                    </Select>
                    {error.discount_type && (
                      <div className="form-error">{error.discount_type}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6 col-6">
                  
                </div>
                {ADDEDITDATA?.discount_type && (<>
                  <div className="col-md-6 col-6">
                    <div className="form-group">
                      <label htmlFor="discount_text" className="form-label required">
                        Discount Text
                      </label>
                      <input
                        type="text"
                        name="discount_text"
                        id="discount_text"
                        placeholder="e.g., Save 20%, Special Offer"
                        className="form-input"
                        value={ADDEDITDATA?.discount_text || ""}
                        onChange={handleChange}
                        required
                      />
                      {error.discount_text && (
                        <div className="form-error">{error.discount_text}</div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6 col-6">
                    <div className="form-group">
                      <label htmlFor="discount" className="form-label required">
                        Discount Amount
                      </label>
                      <input
                        type="number"
                        name="discount"
                        id="discount"
                        placeholder="Enter discount amount"
                        className="form-input"
                        value={ADDEDITDATA?.discount || ""}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        required
                      />
                      {error.discount && (
                        <div className="form-error">{error.discount}</div>
                      )}
                    </div>
                  </div>
                </>
                )}
              </div>            

            </div>

            <div className="form-actions">
              <button
                type="button"
                className="action-button secondary"
                onClick={() => navigate("/admin/product-variants/list")}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="action-button primary"
                disabled={isLoading || loadingProducts}
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner small"></div>
                    {ADDEDITDATA?.id ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <SaveOutlined />
                    {ADDEDITDATA?.id ? "Update Variant" : "Create Variant"}
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

export default ProductVariantAddEditPage;

