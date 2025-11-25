import React, { useEffect, useState, useRef } from "react";
import { notification } from 'antd';
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LoadingEffect from "../../../components/Loading/LoadingEffect";
import { addEditUsers } from "../../../controllers/V1/usersController";
import "../admin-pages.css";
const UserListEditPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location?.state;
  const [error, setError] = useState([]);
  const [ADDEDITDATA, setAddEditSata] = useState(state || {} );
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading, please wait...');
 
  //End


  /*********************************************************
   *  This function is use to handle imput chnage
   *********************************************************/
  const handleChange = (e) => {
    setAddEditSata((pre) => ({
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
      const formData = new FormData(e.target);
      if(!formData.get('name')){
        notification.open({
            message: "Oops!",
            description: `Name is required.`,
            placement: "topRight",
            icon: <InfoCircleOutlined style={{ color: "red" }} />,
            duration: 2,
          });
      } else if(!formData.get('editId') && !formData.get('email')){
          notification.open({
            message: "Oops!",
            description: `Email is required.`,
            placement: "topRight",
            icon: <InfoCircleOutlined style={{ color: "red" }} />,
            duration: 2,
          });
      } else if (!formData.get('editId') && !formData.get('phone')){
          notification.open({
            message: "Oops!",
            description: `Phone is required.`,
            placement: "topRight",
            icon: <InfoCircleOutlined style={{ color: "red" }} />,
            duration: 2,
          });
      } else if(!formData.get('editId') && !formData.get('available_points')){
          notification.open({
            message: "Oops!",
            description: `Points is required.`,
            placement: "topRight",
            icon: <InfoCircleOutlined style={{ color: "red" }} />,
            duration: 2,
          });
      } else if (!formData.get('address')){
          notification.open({
            message: "Oops!",
            description: `Address is required.`,
            placement: "topRight",
            icon: <InfoCircleOutlined style={{ color: "red" }} />,
            duration: 2,
          });
      } else {
        const param = {
          name : formData.get('name'),
          ...(formData.get('editId') && {editId : formData.get('editId')}),
          ...(formData.get('password') && {password : formData.get('password')}),
          email : formData.get('email') || ADDEDITDATA?.email,
          phone : formData.get('phone') || ADDEDITDATA?.phone,
          ...(formData.get('available_points') && {
            total_points : parseFloat(formData.get('available_points')),
            available_points : parseFloat(formData.get('available_points'))
          }),
          ...(formData.get('address') && {address : formData.get('address')})
        }
        const res = await addEditUsers(param);
        if(res.status === true){
          notification.open({
            message: "Oops!",
            description: `User added successfully`,
            placement: "topRight",
            icon: < CheckCircleOutlined style={{ color: "green" }} />,
            duration: 2,
          });
          navigate('/admin/users/list');
        } else {
          notification.open({
            message: "Oops!",
            description: `${res?.message}`,
            placement: "topRight",
            icon: <InfoCircleOutlined style={{ color: "red" }} />,
            duration: 2,
          });
        }
      }
    } catch (error) {
      console.log('error : ', error);
    }
  }



  useEffect(() => {
    document.title = `Influencer || ${ADDEDITDATA?.id ? "Edit" : "Add"
      } user`;
  }, []);

  
  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">
              {ADDEDITDATA?.id ? "Edit Customer" : "Add New Customer"}
            </h1>
            <p className="page-subtitle">
              {ADDEDITDATA?.id 
                ? "Update customer information and settings" 
                : "Create a new customer account with all necessary details"}
            </p>
          </div>
          <Link to="/admin/users/list">
            <button className="action-button secondary">
              <ArrowLeftOutlined />
              Back to Customers
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
                <UserOutlined />
                Personal Information
              </h3>
              <div className="row">
                <div className="col-md-6 col-12 mb-3">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label required">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      placeholder="Enter customer's full name"
                      className="form-input"
                      value={ADDEDITDATA?.name}
                      onChange={handleChange}
                    />
                    {error.name && (
                      <div className="form-error">{error.name}</div>
                    )}
                  </div>
                </div>
                <div className="col-md-6 col-12 mb-3">
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      placeholder="Enter email address"
                      className="form-input"
                      value={ADDEDITDATA?.email}
                      onChange={handleChange}
                    />
                    {error.email && (
                      <div className="form-error">{error.email}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6 col-12 mb-3">
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label required">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      placeholder="Enter phone number"
                      className="form-input"
                      disabled={ADDEDITDATA?.id ? true : false}
                      value={ADDEDITDATA?.phone}
                    />
                    {error.phone && (
                      <div className="form-error">{error.phone}</div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* <div className="form-section">
              <h3 className="form-section-title">
                <HomeOutlined />
                Address Information
              </h3>
              <div className="row">
                <div className="col-md-12 col-12 mb-3">
                  <div className="form-group">
                    <label htmlFor="address" className="form-label">
                      Address
                    </label>
                    <textarea
                      name="address"
                      id="address"
                      placeholder="Enter complete address"
                      className="form-input"
                      rows="3"
                      value={ADDEDITDATA?.address}
                      onChange={handleChange}
                    />
                    {error.address && (
                      <div className="form-error">{error.address}</div>
                    )}
                  </div>
                </div>
              </div>
            </div> */}

            <div className="form-actions">
              <button
                type="button"
                className="action-button secondary"
                onClick={() => navigate("/admin/users/list")}
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
                    {ADDEDITDATA?.id ? "Update Customer" : "Create Customer"}
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

export default UserListEditPage;
