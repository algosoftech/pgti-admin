import React, { useEffect, useState } from "react";
import { notification, Select, DatePicker } from 'antd';
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import LoadingEffect from "../../../components/Loading/LoadingEffect";
import { addEditPromocode } from "../../../controllers/V1/promocodeController";
import "../admin-pages.css";

const { Option } = Select;

const PromocodeAddEditPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location?.state;
  const [error, setError] = useState([]);
  const [ADDEDITDATA, setAddEditData] = useState(state || {});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading, please wait...');

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
   *  This function is use to handle select change
   *********************************************************/
  const handleSelectChange = (name, value) => {
    setAddEditData((pre) => ({
      ...pre,
      [name]: value,
    }));
    setError((pre) => ({
      ...pre,
      [name]: "",
    }));
  };

  /*********************************************************
   *  This function is use to handle date change
   *********************************************************/
  const handleDateChange = (name, date) => {
    setAddEditData((pre) => ({
      ...pre,
      [name]: date ? date.format('YYYY-MM-DD') : null,
    }));
    setError((pre) => ({
      ...pre,
      [name]: "",
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
      
      if (!formData.get('code') || !formData.get('code').trim()) {
        notification.open({
          message: "Oops!",
          description: `Promo code is required.`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        setIsLoading(false);
        return;
      }

      if (!ADDEDITDATA?.discount_type) {
        notification.open({
          message: "Oops!",
          description: `Discount type is required.`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        setIsLoading(false);
        return;
      }

      if (!formData.get('discount') || parseFloat(formData.get('discount')) <= 0) {
        notification.open({
          message: "Oops!",
          description: `Discount value is required and must be greater than 0.`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        setIsLoading(false);
        return;
      }

      if (!ADDEDITDATA?.start_date) {
        notification.open({
          message: "Oops!",
          description: `Start date is required.`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        setIsLoading(false);
        return;
      }

      if (!ADDEDITDATA?.end_date) {
        notification.open({
          message: "Oops!",
          description: `End date is required.`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        setIsLoading(false);
        return;
      }

      if (moment(ADDEDITDATA?.end_date).isBefore(moment(ADDEDITDATA?.start_date))) {
        notification.open({
          message: "Oops!",
          description: `End date must be after start date.`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        setIsLoading(false);
        return;
      }

      const param = {
        code: formData.get('code').trim().toUpperCase(),
        title: formData.get('title')?.trim() || null,
        description: formData.get('description')?.trim() || null,
        discount: parseFloat(formData.get('discount')),
        discount_type: parseInt(ADDEDITDATA?.discount_type),
        min_cap: formData.get('min_cap') ? parseFloat(formData.get('min_cap')) : null,
        max_cap: formData.get('max_cap') ? parseFloat(formData.get('max_cap')) : null,
        eligible_amount: formData.get('eligible_amount') ? parseFloat(formData.get('eligible_amount')) : null,
        start_date: ADDEDITDATA?.start_date,
        end_date: ADDEDITDATA?.end_date,
        ...(ADDEDITDATA?.id && { editId: ADDEDITDATA?.id }),
      };

      const res = await addEditPromocode(param);
      if (res.status === true) {
        notification.open({
          message: "Success",
          description: ADDEDITDATA?.id ? `Promocode updated successfully` : `Promocode added successfully`,
          placement: "topRight",
          icon: <CheckCircleOutlined style={{ color: "green" }} />,
          duration: 2,
        });
        navigate('/admin/promocodes/list');
      } else {
        notification.open({
          message: "Oops!",
          description: `${res?.message || 'Failed to save promocode'}`,
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
    document.title = `Influencer || ${ADDEDITDATA?.id ? "Edit" : "Add"} Promocode`;
  }, [ADDEDITDATA?.id]);

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">
              {ADDEDITDATA?.id ? "Edit Promocode" : "Add New Promocode"}
            </h1>
            <p className="page-subtitle">
              {ADDEDITDATA?.id 
                ? "Update promocode information" 
                : "Create a new promocode with discount details and validity period"}
            </p>
          </div>
          <Link to="/admin/promocodes/list">
            <button className="action-button secondary">
              <ArrowLeftOutlined />
              Back to Promocodes
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
                <TagOutlined />
                Promocode Information
              </h3>
              <div className="row">
                <div className="col-md-6 col-12 mb-3">
                  <div className="form-group">
                    <label htmlFor="code" className="form-label required">
                      Promo Code
                    </label>
                    <input
                      type="text"
                      name="code"
                      id="code"
                      placeholder="Enter promo code (e.g., SAVE20)"
                      className="form-input"
                      value={ADDEDITDATA?.code || ""}
                      onChange={handleChange}
                      required
                      style={{ textTransform: 'uppercase' }}
                    />
                    {error.code && (
                      <div className="form-error">{error.code}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6 col-12 mb-3">
                  <div className="form-group">
                    <label htmlFor="discount_type" className="form-label required">
                      Discount Type
                    </label>
                    <Select
                      name="discount_type"
                      id="discount_type"
                      placeholder="Select discount type"
                      className="form-select"
                      value={ADDEDITDATA?.discount_type}
                      onChange={(value) => handleSelectChange('discount_type', value)}
                      style={{ width: "100%" }}
                      size="large"
                    >
                      <Option value="2" selected={ADDEDITDATA?.discount_type === 2}>Percentage (%)</Option>
                      <Option value="1" selected={ADDEDITDATA?.discount_type === 1}>Fixed Amount ($)</Option>
                    </Select>
                    {error.discount_type && (
                      <div className="form-error">{error.discount_type}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-12 col-12 mb-3">
                  <div className="form-group">
                    <label htmlFor="title" className="form-label required">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      placeholder="Enter promocode title"
                      className="form-input"
                      value={ADDEDITDATA?.title || ""}
                      onChange={handleChange}
                    />
                    {error.title && (
                      <div className="form-error">{error.title}</div>
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
                      placeholder="Enter promocode description"
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
                    <label htmlFor="discount" className="form-label required">
                      Discount Value
                    </label>
                    <input
                      type="number"
                      name="discount"
                      id="discount"
                      placeholder={ADDEDITDATA?.discount_type === 'percentage' ? "Enter percentage (e.g., 20)" : "Enter amount (e.g., 10)"}
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

                <div className="col-md-6 col-12 mb-3">
                  <div className="form-group">
                    <label htmlFor="eligible_amount" className="form-label required">
                      Eligible Amount ($)
                    </label>
                    <input
                      type="number"
                      name="eligible_amount"
                      id="eligible_amount"
                      placeholder="Enter minimum eligible amount"
                      className="form-input"
                      value={ADDEDITDATA?.eligible_amount || ""}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                    />
                    {error.eligible_amount && (
                      <div className="form-error">{error.eligible_amount}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6 col-12 mb-3">
                  <div className="form-group">
                    <label htmlFor="min_cap" className="form-label required">
                      Minimum Cap ($)
                    </label>
                    <input
                      type="number"
                      name="min_cap"
                      id="min_cap"
                      placeholder="Enter minimum cap"
                      className="form-input"
                      value={ADDEDITDATA?.min_cap || ""}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                    />
                    {error.min_cap && (
                      <div className="form-error">{error.min_cap}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6 col-12 mb-3">
                  <div className="form-group">
                    <label htmlFor="max_cap" className="form-label required">
                      Maximum Cap ($)
                    </label>
                    <input
                      type="number"
                      name="max_cap"
                      id="max_cap"
                      placeholder="Enter maximum cap"
                      className="form-input"
                      value={ADDEDITDATA?.max_cap || ""}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                    />
                    {error.max_cap && (
                      <div className="form-error">{error.max_cap}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6 col-12 mb-3">
                  <div className="form-group">
                    <label htmlFor="start_date" className="form-label required">
                      Start Date
                    </label>
                    <DatePicker
                      name="start_date"
                      id="start_date"
                      placeholder="Select start date"
                      className="form-input"
                      style={{ width: "100%" }}
                      size="large"
                      value={ADDEDITDATA?.start_date ? moment(ADDEDITDATA.start_date) : null}
                      onChange={(date) => handleDateChange('start_date', date)}
                      format="YYYY-MM-DD"
                    />
                    {error.start_date && (
                      <div className="form-error">{error.start_date}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6 col-12 mb-3">
                  <div className="form-group">
                    <label htmlFor="end_date" className="form-label required">
                      End Date
                    </label>
                    <DatePicker
                      name="end_date"
                      id="end_date"
                      placeholder="Select end date"
                      className="form-input"
                      style={{ width: "100%" }}
                      size="large"
                      value={ADDEDITDATA?.end_date ? moment(ADDEDITDATA.end_date) : null}
                      onChange={(date) => handleDateChange('end_date', date)}
                      format="YYYY-MM-DD"
                      disabledDate={(current) => {
                        if (ADDEDITDATA?.start_date) {
                          return current && current < moment(ADDEDITDATA.start_date).startOf('day');
                        }
                        return false;
                      }}
                    />
                    {error.end_date && (
                      <div className="form-error">{error.end_date}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="action-button secondary"
                onClick={() => navigate("/admin/promocodes/list")}
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
                    {ADDEDITDATA?.id ? "Update Promocode" : "Create Promocode"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <LoadingEffect isLoading={isLoading} text={loadingText} />
    </div>
  );
};

export default PromocodeAddEditPage;

