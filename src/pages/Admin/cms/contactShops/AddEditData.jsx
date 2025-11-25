import React, { useEffect, useState } from "react";
import { notification } from 'antd';
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LoadingEffect from "../../../../components/Loading/LoadingEffect";
import { addEditContactShop } from "../../../../controllers/V1/contactShopController";
import "../../admin-pages.css";

const ContactShopAddEditPage = () => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const formData = new FormData(e.target);
      
      if (!formData.get('name') || formData.get('name').trim() === '') {
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

      if (!formData.get('address') || formData.get('address').trim() === '') {
        notification.open({
          message: "Oops!",
          description: `Address is required.`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        setIsLoading(false);
        return;
      }

      if (!formData.get('phone') || formData.get('phone').trim() === '') {
        notification.open({
          message: "Oops!",
          description: `Phone is required.`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        setIsLoading(false);
        return;
      }

      if (!formData.get('email') || formData.get('email').trim() === '') {
        notification.open({
          message: "Oops!",
          description: `Email is required.`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        setIsLoading(false);
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.get('email'))) {
        notification.open({
          message: "Oops!",
          description: `Please enter a valid email address.`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        setIsLoading(false);
        return;
      }

      const param = {
        ...(ADDEDITDATA?.id && { editId: ADDEDITDATA?.id }),
        name: formData.get('name'),
        address: formData.get('address'),
        phone: formData.get('phone'),
        email: formData.get('email'),
      };

      const res = await addEditContactShop(param);
      if (res.status === true) {
        notification.open({
          message: "Success",
          description: ADDEDITDATA?.id ? `Contact Shop updated successfully` : `Contact Shop added successfully`,
          placement: "topRight",
          icon: <CheckCircleOutlined style={{ color: "green" }} />,
          duration: 2,
        });
        navigate('/admin/cms/contact-shops/list');
      } else {
        notification.open({
          message: "Oops!",
          description: `${res?.message || 'Failed to save Contact Shop'}`,
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
    document.title = `Farmer Store || ${ADDEDITDATA?.id ? "Edit" : "Add"} Contact Shop`;
  }, [ADDEDITDATA?.id]);

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">
              {ADDEDITDATA?.id ? "Edit Contact Shop" : "Add New Contact Shop"}
            </h1>
            <p className="page-subtitle">
              {ADDEDITDATA?.id 
                ? "Update contact shop information" 
                : "Create a new contact shop with name, address, phone, and email"}
            </p>
          </div>
          <Link to="/admin/cms/contact-shops/list">
            <button className="action-button secondary">
              <ArrowLeftOutlined />
              Back to Contact Shops
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
                <ShopOutlined />
                Contact Shop Information
              </h3>
              
              <div className="form-group">
                <label htmlFor="name" className="form-label required">
                  Name
                  <span className="required-mark">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  placeholder="Enter shop name"
                  className="form-input"
                  value={ADDEDITDATA?.name || ""}
                  onChange={handleChange}
                  required
                />
                {error.name && (
                  <div className="form-error">{error.name}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="address" className="form-label required">
                  Address
                  <span className="required-mark">*</span>
                </label>
                <textarea
                  name="address"
                  id="address"
                  placeholder="Enter shop address"
                  className="form-input"
                  rows="3"
                  value={ADDEDITDATA?.address || ""}
                  onChange={handleChange}
                  required
                />
                {error.address && (
                  <div className="form-error">{error.address}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label required">
                  Phone
                  <span className="required-mark">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  placeholder="Enter phone number"
                  className="form-input"
                  value={ADDEDITDATA?.phone || ""}
                  onChange={handleChange}
                  required
                />
                {error.phone && (
                  <div className="form-error">{error.phone}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label required">
                  Email
                  <span className="required-mark">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Enter email address"
                  className="form-input"
                  value={ADDEDITDATA?.email || ""}
                  onChange={handleChange}
                  required
                />
                {error.email && (
                  <div className="form-error">{error.email}</div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="action-button secondary"
                onClick={() => navigate("/admin/cms/contact-shops/list")}
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
                    {ADDEDITDATA?.id ? "Update Contact Shop" : "Create Contact Shop"}
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

export default ContactShopAddEditPage;

