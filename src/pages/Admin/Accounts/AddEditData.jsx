import React, { useEffect, useState } from "react";
import { Flex, notification, Modal } from "antd";
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  addeditdata,
  getPermission,
} from "../../../controllers/subAdmin/subAdminControllers";

import LoadingEffect from "../../../components/Loading/LoadingEffect";
import "../admin-pages.css";

const UserListEditPage = () => {
  const loginUserData = JSON.parse(sessionStorage.getItem("ADMIN-INFO"));
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const [error, setError] = useState([]);
  const [ADDEDITDATA, setAddEditSata] = useState(state ? state : []);

  const [isLoading, setIsLoading] = useState(false);

  /***************  Define Permission States ***************/
  const [assignPermission, setAssignPermission] = useState("");

  const [module_permissions, setPermissions] = useState({
    users: {
      list: "N",
      add_edit: "N",
      change_status: "N",
      points: "N",
      export: "N",
    },
    influencer: {
      list: "N",
      add_edit: "N",
      change_status: "N",
      filter: "N",
      bulk_upload: "N",
      profile: "N",
      export: "N",
    },
    products: {
      list: "N",
      add_edit: "N",
      change_status: "N",
      filter: "N",
      delete: "N",
    },
    industry: {
      list: "N",
      add_edit: "N",
      change_status: "N",
    },
    categories: {
      list: "N",
      add_edit: "N",
      change_status: "N",
      filter: "N",
    },
    subCategories: {
      list: "N",
      add_edit: "N",
      change_status: "N",
      filter: "N",
    },
    banners: {
      list: "N",
      add_edit: "N",
      change_status: "N",
      filter: "N",
    },
    faqs: {
      list: "N",
      add_edit: "N",
      change_status: "N",
      delete: "N",
      filter: "N",
    },
    contact_shops: {
      list: "N",
      add_edit: "N",
      change_status: "N",
      delete: "N",
      filter: "N",
    },
    articles: {
      list: "N",
      add_edit: "N",
      change_status: "N",
      delete: "N",
      filter: "N",
    },
    ingredients: {
      list: "N",
      add_edit: "N",
      change_status: "N",
      delete: "N",
      filter: "N",
    },
    events: {
      list: "N",
      add_edit: "N",
      change_status: "N",
      delete: "N",
      filter: "N",
    },
    promocodes: {
      list: "N",
      add_edit: "N",
      change_status: "N",
      filter: "N",
    },
    transaction: {
      list: "N",
      filter: "N",
    },
  });

  /*********************** End ************************ */
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

  /*********************************************************
   *  This function is use to handle form submit
   *********************************************************/
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const form = new FormData(event.target);
      if (
        ADDEDITDATA?.id &&
        ADDEDITDATA?.id !== "undefined" &&
        ADDEDITDATA?.id !== null
      ) {
        form.append("edit_id", ADDEDITDATA?.id);
      }
      form.append("phone", ADDEDITDATA?.phone);
      const isValidate = validateFormData(form);
      const permissions = [
        {
          module: "users",
          permissions_json: JSON.stringify(module_permissions?.users),
        },
        {
          module: "influencer",
          permissions_json: JSON.stringify(module_permissions?.influencer),
        },
        {
          module: "products",
          permissions_json: JSON.stringify(module_permissions?.products),
        },
        {
          module: "industry",
          permissions_json: JSON.stringify(module_permissions?.industry),
        },
        {
          module: "categories",
          permissions_json: JSON.stringify(module_permissions?.categories),
        },
        {
          module: "subCategories",
          permissions_json: JSON.stringify(module_permissions?.subCategories),
        },
        {
          module: "banners",
          permissions_json: JSON.stringify(module_permissions?.banners),
        },
        {
          module: "faqs",
          permissions_json: JSON.stringify(module_permissions?.faqs),
        },
        {
          module: "contact_shops",
          permissions_json: JSON.stringify(module_permissions?.contact_shops),
        },
        {
          module: "articles",
          permissions_json: JSON.stringify(module_permissions?.articles),
        },
        {
          module: "ingredients",
          permissions_json: JSON.stringify(module_permissions?.ingredients),
        },
        {
          module: "events",
          permissions_json: JSON.stringify(module_permissions?.events),
        },
        {
          module: "promocodes",
          permissions_json: JSON.stringify(module_permissions?.promocodes),
        },
        {
          module: "transaction",
          permissions_json: JSON.stringify(module_permissions?.transaction),
        },
      ];
      if (isValidate) {
        const rowData = {};
        form.forEach((value, key) => {
          rowData[key] = value;
        });
        const options = {
          postData: { ...rowData, permissions },
        };

        const res = await addeditdata(options);
        if (res.status === true) {
          notification.open({
            message: "Data updated.",
            description: `Data updated Successfully.`,
            placement: "topRight",
            icon: <CheckCircleOutlined style={{ color: "green" }} />,
            duration: 2,
          });
          navigate("/sub-admin/list");
        } else {
          notification.open({
            message: "Oops!",
            description: `${res?.message}`,
            placement: "topRight",
            icon: <InfoCircleOutlined style={{ color: "red" }} />,
            duration: 2,
          });
        }
      } else {
        notification.open({
          message: "Oops!",
          description: `Please enter the required fields.`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
        });
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  /*********************************************************
   *  This function is used to validate form data before submit
   *********************************************************/
  const validateFormData = (formData) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const vendor_country_code = "+971";
    if (!formData.get("name")?.trim()) {
      setError((prevError) => ({
        ...prevError,
        name: "Name is required",
      }));
      return false;
    }

    if (!formData.get("email")?.trim()) {
      setError((prevError) => ({
        ...prevError,
        email: "Email address is required",
      }));
      return false;
    }
    if (!emailPattern.test(formData.get("email"))) {
      setError((prevError) => ({
        ...prevError,
        email: "Please enter a valid email address",
      }));
      return false;
    }

    return true;
  };

  const getUserpermission = async () => {
    try {
      setIsLoading(true);
      const option = { admin_id: ADDEDITDATA?.id };
      const res = await getPermission(option);
      if (
        res.status === true &&
        res.result !== "undefined" &&
        res.result?.length > 0
      ) {
        const updatedPermissions = { ...module_permissions };
        res?.result.forEach((item) => {
          const moduleName = item.module;
          const parsedPermissions = JSON.parse(item.permissions_json || "{}");

          if (updatedPermissions[moduleName]) {
            // merge Y/N from DB into default structure
            updatedPermissions[moduleName] = {
              ...updatedPermissions[moduleName],
              ...parsedPermissions,
            };
          }
        });
        setPermissions((pre) => ({
          ...pre,
          ...updatedPermissions,
        }));
        // setInvoicePermission(res.result?.invoice);
        // setCustomerDuePermission(res.result?.customer_due);
        // setAnalyserPermission(res.result?.analyser);
      } else {
        setAssignPermission([]);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (ADDEDITDATA?.id) {
      getUserpermission();
    }
    document.title = `Farmer Store || ${
      ADDEDITDATA?.id ? "Edit" : "Add"
    } Sub Admin`;
  }, []);

  /*********************************************************
   *  Handles permissions dynamically for any section/type
   *********************************************************/
  const handlePermission = (type, value) => {
    try {
      setPermissions((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          [value]: prev[type][value] === "Y" ? "N" : "Y",
        },
      }));
    } catch (error) {
      console.error("Error handling permission:", error);
    }
  };

  /*********************************************************
   *  Check all permissions (set all to 'Y')
   *********************************************************/
  const handleCheckAllPermissions = () => {
    try {
      const allChecked = {};
      Object.keys(module_permissions).forEach((module) => {
        allChecked[module] = {};
        Object.keys(module_permissions[module]).forEach((permission) => {
          allChecked[module][permission] = "Y";
        });
      });
      setPermissions(allChecked);
      notification.success({
        message: "Success",
        description: "All permissions have been checked.",
        placement: "topRight",
      });
    } catch (error) {
      console.error("Error checking all permissions:", error);
      notification.error({
        message: "Error",
        description: "Failed to check all permissions.",
        placement: "topRight",
      });
    }
  };

  /*********************************************************
   *  Reset all permissions (set all to 'N')
   *********************************************************/
  const handleResetAllPermissions = () => {
    Modal.confirm({
      title: "Reset All Permissions",
      content:
        "Are you sure you want to reset all permissions? This will uncheck all permission checkboxes.",
      okText: "Yes, Reset All",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        try {
          const allReset = {};
          Object.keys(module_permissions).forEach((module) => {
            allReset[module] = {};
            Object.keys(module_permissions[module]).forEach((permission) => {
              allReset[module][permission] = "N";
            });
          });
          setPermissions(allReset);
          notification.success({
            message: "Success",
            description: "All permissions have been reset.",
            placement: "topRight",
          });
        } catch (error) {
          console.error("Error resetting all permissions:", error);
          notification.error({
            message: "Error",
            description: "Failed to reset all permissions.",
            placement: "topRight",
          });
        }
      },
    });
  };

  /*********************************************************
   *  Check all permissions for a specific module
   *********************************************************/
  const handleCheckModulePermissions = (moduleName) => {
    try {
      if (!module_permissions[moduleName]) {
        notification.error({
          message: "Error",
          description: `Module "${moduleName}" not found.`,
          placement: "topRight",
        });
        return;
      }

      setPermissions((prev) => ({
        ...prev,
        [moduleName]: Object.keys(prev[moduleName]).reduce(
          (acc, permission) => {
            acc[permission] = "Y";
            return acc;
          },
          {}
        ),
      }));

      // notification.success({
      //   message: "Success",
      //   description: `All ${moduleName} permissions have been checked.`,
      //   placement: "topRight",
      // });
    } catch (error) {
      console.error("Error checking module permissions:", error);
      notification.error({
        message: "Error",
        description: `Failed to check ${moduleName} permissions.`,
        placement: "topRight",
      });
    }
  };

  /*********************************************************
   *  Uncheck all permissions for a specific module
   *********************************************************/
  const handleUncheckModulePermissions = (moduleName) => {
    try {
      if (!module_permissions[moduleName]) {
        notification.error({
          message: "Error",
          description: `Module "${moduleName}" not found.`,
          placement: "topRight",
        });
        return;
      }

      setPermissions((prev) => ({
        ...prev,
        [moduleName]: Object.keys(prev[moduleName]).reduce(
          (acc, permission) => {
            acc[permission] = "N";
            return acc;
          },
          {}
        ),
      }));

      // notification.success({
      //   message: "Success",
      //   description: `All ${moduleName} permissions have been unchecked.`,
      //   placement: "topRight",
      // });
    } catch (error) {
      console.error("Error unchecking module permissions:", error);
      notification.error({
        message: "Error",
        description: `Failed to uncheck ${moduleName} permissions.`,
        placement: "topRight",
      });
    }
  };

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">
              {loginUserData?.id && loginUserData?.admin_type === "Super Admin"
                ? "Profile Settings"
                : ADDEDITDATA?.id
                ? "Edit Administrator"
                : "Add New Administrator"}
            </h1>
            <p className="page-subtitle">
              {loginUserData?.id && loginUserData?.admin_type === "Super Admin"
                ? "Manage your profile information and settings"
                : ADDEDITDATA?.id
                ? "Update administrator information and permissions"
                : "Create a new administrator account with appropriate permissions"}
            </p>
          </div>
          <Link
            to={
              loginUserData?.admin_type === "Super Admin"
                ? "/sub-admin/list"
                : "/admin/dashboard"
            }
          >
            <button className="action-button secondary">
              <ArrowLeftOutlined />
              Back
            </button>
          </Link>
        </div>
      </div>

      <div className="content-card">
        <div className="content-card-body">
          <form onSubmit={handleSubmit} className="modern-form">
            <div className="form-section">
              <h3 className="form-section-title">
                <UserOutlined />
                Administrator Information
              </h3>
              <div className="row">
                <div className="col-md-4 col-12 mb-3">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label required">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      placeholder="Enter administrator's full name"
                      className="form-input"
                      value={ADDEDITDATA?.name}
                      onChange={handleChange}
                    />
                    {error.name && (
                      <div className="form-error">{error.name}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-4 col-12 mb-3">
                  <div className="form-group">
                    <label htmlFor="email" className="form-label required">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      placeholder="Enter email address"
                      className="form-input"
                      readOnly={ADDEDITDATA?.id ? true : false}
                      value={ADDEDITDATA?.email}
                      onChange={handleChange}
                    />
                    {error.email && (
                      <div className="form-error">{error.email}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-4 col-12 mb-3">
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
                      value={ADDEDITDATA?.phone}
                      onChange={handleChange}
                    />
                    {error.phone && (
                      <div className="form-error">{error.phone}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="form-section-center">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="form-section-title">
                  <SafetyOutlined />
                  Permission Settings
                </h3>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="action-button secondary"
                    onClick={handleCheckAllPermissions}
                    style={{ fontSize: "14px", padding: "8px 16px" }}
                  >
                    <CheckCircleOutlined />
                    Check All
                  </button>
                  <button
                    type="button"
                    className="action-button secondary"
                    onClick={handleResetAllPermissions}
                    style={{ fontSize: "14px", padding: "8px 16px" }}
                  >
                    <InfoCircleOutlined />
                    Reset All
                  </button>
                </div>
              </div>

              {/* Users Permission */}
              <div className="permission-module">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h4 className="permission-module-title">
                    <UserOutlined />
                    Customer Management
                  </h4>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="action-button secondary"
                      onClick={() => handleCheckModulePermissions("users")}
                      style={{ fontSize: "12px", padding: "4px 12px" }}
                    >
                      <CheckCircleOutlined />
                      Check All
                    </button>
                    <button
                      type="button"
                      className="action-button secondary"
                      onClick={() => handleUncheckModulePermissions("users")}
                      style={{ fontSize: "12px", padding: "4px 12px" }}
                    >
                      <InfoCircleOutlined />
                      Uncheck All
                    </button>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() => handlePermission("users", "list")}
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={module_permissions?.users?.list === "Y"}
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          View Customers
                        </label>
                        <p className="permission-description">
                          View customer list and details
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() => handlePermission("users", "add_edit")}
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={module_permissions?.users?.add_edit === "Y"}
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Add/Edit Customers
                        </label>
                        <p className="permission-description">
                          Create and modify customer accounts
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() => handlePermission("users", "change_status")}
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={
                            module_permissions?.users?.change_status === "Y"
                          }
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Change Status
                        </label>
                        <p className="permission-description">
                          Activate/deactivate customers
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() => handlePermission("users", "points")}
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={module_permissions?.users?.points === "Y"}
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Manage Points
                        </label>
                        <p className="permission-description">
                          Add or modify customer points
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() => handlePermission("users", "export")}
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={module_permissions?.users?.export === "Y"}
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Manage Export
                        </label>
                        <p className="permission-description">
                          Export customers data
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Permission */}
              <div className="permission-module">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h4 className="permission-module-title">
                    <SettingOutlined />
                    Product Management
                  </h4>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="action-button secondary"
                      onClick={() => handleCheckModulePermissions("products")}
                      style={{ fontSize: "12px", padding: "4px 12px" }}
                    >
                      <CheckCircleOutlined />
                      Check All
                    </button>
                    <button
                      type="button"
                      className="action-button secondary"
                      onClick={() => handleUncheckModulePermissions("products")}
                      style={{ fontSize: "12px", padding: "4px 12px" }}
                    >
                      <InfoCircleOutlined />
                      Uncheck All
                    </button>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() => handlePermission("products", "list")}
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={module_permissions?.products?.list === "Y"}
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          View Products
                        </label>
                        <p className="permission-description">
                          View product list and details
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() => handlePermission("products", "add_edit")}
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={
                            module_permissions?.products?.add_edit === "Y"
                          }
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Add/Edit Products
                        </label>
                        <p className="permission-description">
                          Create and modify products
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() =>
                        handlePermission("products", "change_status")
                      }
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={
                            module_permissions?.products?.change_status === "Y"
                          }
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Change Status
                        </label>
                        <p className="permission-description">
                          Activate/deactivate products
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() => handlePermission("products", "filter")}
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={module_permissions?.products?.filter === "Y"}
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Filter Products
                        </label>
                        <p className="permission-description">
                          Search and filter product data
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() => handlePermission("products", "delete")}
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={module_permissions?.products?.delete === "Y"}
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Delete Products
                        </label>
                        <p className="permission-description">
                          Delete products from the system
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories Permission */}
              <div className="permission-module">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h4 className="permission-module-title">
                    <SettingOutlined />
                    Category Management
                  </h4>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="action-button secondary"
                      onClick={() => handleCheckModulePermissions("categories")}
                      style={{ fontSize: "12px", padding: "4px 12px" }}
                    >
                      <CheckCircleOutlined />
                      Check All
                    </button>
                    <button
                      type="button"
                      className="action-button secondary"
                      onClick={() =>
                        handleUncheckModulePermissions("categories")
                      }
                      style={{ fontSize: "12px", padding: "4px 12px" }}
                    >
                      <InfoCircleOutlined />
                      Uncheck All
                    </button>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() => handlePermission("categories", "list")}
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={module_permissions?.categories?.list === "Y"}
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          View Categories
                        </label>
                        <p className="permission-description">
                          View category list and details
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() => handlePermission("categories", "add_edit")}
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={
                            module_permissions?.categories?.add_edit === "Y"
                          }
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Add/Edit Categories
                        </label>
                        <p className="permission-description">
                          Create and modify categories
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() =>
                        handlePermission("categories", "change_status")
                      }
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={
                            module_permissions?.categories?.change_status ===
                            "Y"
                          }
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Change Status
                        </label>
                        <p className="permission-description">
                          Activate/deactivate categories
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() => handlePermission("categories", "filter")}
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={
                            module_permissions?.categories?.filter === "Y"
                          }
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Filter Categories
                        </label>
                        <p className="permission-description">
                          Search and filter category data
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-Categories Permission */}
              <div className="permission-module">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h4 className="permission-module-title">
                    <SettingOutlined />
                    Sub-Category Management
                  </h4>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="action-button secondary"
                      onClick={() =>
                        handleCheckModulePermissions("subCategories")
                      }
                      style={{ fontSize: "12px", padding: "4px 12px" }}
                    >
                      <CheckCircleOutlined />
                      Check All
                    </button>
                    <button
                      type="button"
                      className="action-button secondary"
                      onClick={() =>
                        handleUncheckModulePermissions("subCategories")
                      }
                      style={{ fontSize: "12px", padding: "4px 12px" }}
                    >
                      <InfoCircleOutlined />
                      Uncheck All
                    </button>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() => handlePermission("subCategories", "list")}
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={
                            module_permissions?.subCategories?.list === "Y"
                          }
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          View Sub-Categories
                        </label>
                        <p className="permission-description">
                          View sub-category list and details
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() =>
                        handlePermission("subCategories", "add_edit")
                      }
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={
                            module_permissions?.subCategories?.add_edit === "Y"
                          }
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Add/Edit Sub-Categories
                        </label>
                        <p className="permission-description">
                          Create and modify sub-categories
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() =>
                        handlePermission("subCategories", "change_status")
                      }
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={
                            module_permissions?.subCategories?.change_status ===
                            "Y"
                          }
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Change Status
                        </label>
                        <p className="permission-description">
                          Activate/deactivate sub-categories
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() =>
                        handlePermission("subCategories", "filter")
                      }
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={
                            module_permissions?.subCategories?.filter === "Y"
                          }
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Filter Sub-Categories
                        </label>
                        <p className="permission-description">
                          Search and filter sub-category data
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CMS - Banners Permission */}
              <div className="permission-module">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h4 className="permission-module-title">
                    <SettingOutlined />
                    CMS - Banners Management
                  </h4>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="action-button secondary"
                      onClick={() => handleCheckModulePermissions("banners")}
                      style={{ fontSize: "12px", padding: "4px 12px" }}
                    >
                      <CheckCircleOutlined />
                      Check All
                    </button>
                    <button
                      type="button"
                      className="action-button secondary"
                      onClick={() => handleUncheckModulePermissions("banners")}
                      style={{ fontSize: "12px", padding: "4px 12px" }}
                    >
                      <InfoCircleOutlined />
                      Uncheck All
                    </button>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() => handlePermission("banners", "list")}
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={module_permissions?.banners?.list === "Y"}
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">View Banners</label>
                        <p className="permission-description">
                          View banner list and details
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() => handlePermission("banners", "add_edit")}
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={
                            module_permissions?.banners?.add_edit === "Y"
                          }
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Add/Edit Banners
                        </label>
                        <p className="permission-description">
                          Create and modify banners
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() =>
                        handlePermission("banners", "change_status")
                      }
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={
                            module_permissions?.banners?.change_status === "Y"
                          }
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Change Status
                        </label>
                        <p className="permission-description">
                          Activate/deactivate banners
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() => handlePermission("banners", "filter")}
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={module_permissions?.banners?.filter === "Y"}
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Filter Banners
                        </label>
                        <p className="permission-description">
                          Search and filter banner data
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CMS - FAQs Permission */}
              <div className="permission-module">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h4 className="permission-module-title">
                    <SettingOutlined />
                    CMS - FAQs Management
                  </h4>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="action-button secondary"
                      onClick={() => handleCheckModulePermissions("faqs")}
                      style={{ fontSize: "12px", padding: "4px 12px" }}
                    >
                      <CheckCircleOutlined />
                      Check All
                    </button>
                    <button
                      type="button"
                      className="action-button secondary"
                      onClick={() => handleUncheckModulePermissions("faqs")}
                      style={{ fontSize: "12px", padding: "4px 12px" }}
                    >
                      <InfoCircleOutlined />
                      Uncheck All
                    </button>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() => handlePermission("faqs", "list")}
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={module_permissions?.faqs?.list === "Y"}
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">View FAQs</label>
                        <p className="permission-description">
                          View FAQ list and details
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() => handlePermission("faqs", "add_edit")}
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={module_permissions?.faqs?.add_edit === "Y"}
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Add/Edit FAQs
                        </label>
                        <p className="permission-description">
                          Create and modify FAQs
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() => handlePermission("faqs", "change_status")}
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={
                            module_permissions?.faqs?.change_status === "Y"
                          }
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Change Status
                        </label>
                        <p className="permission-description">
                          Activate/deactivate FAQs
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() => handlePermission("faqs", "delete")}
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={module_permissions?.faqs?.delete === "Y"}
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">Delete FAQs</label>
                        <p className="permission-description">
                          Delete FAQs from the system
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() => handlePermission("faqs", "filter")}
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={module_permissions?.faqs?.filter === "Y"}
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">Filter FAQs</label>
                        <p className="permission-description">
                          Search and filter FAQ data
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CMS - Contact Shops Permission */}
              <div className="permission-module">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h4 className="permission-module-title">
                    <SettingOutlined />
                    CMS - Contact Shops Management
                  </h4>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="action-button secondary"
                      onClick={() =>
                        handleCheckModulePermissions("contact_shops")
                      }
                      style={{ fontSize: "12px", padding: "4px 12px" }}
                    >
                      <CheckCircleOutlined />
                      Check All
                    </button>
                    <button
                      type="button"
                      className="action-button secondary"
                      onClick={() =>
                        handleUncheckModulePermissions("contact_shops")
                      }
                      style={{ fontSize: "12px", padding: "4px 12px" }}
                    >
                      <InfoCircleOutlined />
                      Uncheck All
                    </button>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() => handlePermission("contact_shops", "list")}
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={
                            module_permissions?.contact_shops?.list === "Y"
                          }
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          View Contact Shops
                        </label>
                        <p className="permission-description">
                          View contact shop list and details
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() =>
                        handlePermission("contact_shops", "add_edit")
                      }
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={
                            module_permissions?.contact_shops?.add_edit === "Y"
                          }
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Add/Edit Contact Shops
                        </label>
                        <p className="permission-description">
                          Create and modify contact shops
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() =>
                        handlePermission("contact_shops", "change_status")
                      }
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={
                            module_permissions?.contact_shops?.change_status ===
                            "Y"
                          }
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Change Status
                        </label>
                        <p className="permission-description">
                          Activate/deactivate contact shops
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() =>
                        handlePermission("contact_shops", "delete")
                      }
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={
                            module_permissions?.contact_shops?.delete === "Y"
                          }
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Delete Contact Shops
                        </label>
                        <p className="permission-description">
                          Delete contact shops from the system
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() =>
                        handlePermission("contact_shops", "filter")
                      }
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={
                            module_permissions?.contact_shops?.filter === "Y"
                          }
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Filter Contact Shops
                        </label>
                        <p className="permission-description">
                          Search and filter contact shop data
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Articles Permission */}
              <div className="permission-module">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h4 className="permission-module-title">
                    <SettingOutlined />
                    Articles Management
                  </h4>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="action-button secondary"
                      onClick={() => handleCheckModulePermissions("articles")}
                      style={{ fontSize: "12px", padding: "4px 12px" }}
                    >
                      <CheckCircleOutlined />
                      Check All
                    </button>
                    <button
                      type="button"
                      className="action-button secondary"
                      onClick={() => handleUncheckModulePermissions("articles")}
                      style={{ fontSize: "12px", padding: "4px 12px" }}
                    >
                      <InfoCircleOutlined />
                      Uncheck All
                    </button>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() => handlePermission("articles", "list")}
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={module_permissions?.articles?.list === "Y"}
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          View Articles
                        </label>
                        <p className="permission-description">
                          View article list and details
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() => handlePermission("articles", "add_edit")}
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={
                            module_permissions?.articles?.add_edit === "Y"
                          }
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Add/Edit Articles
                        </label>
                        <p className="permission-description">
                          Create and modify articles
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() =>
                        handlePermission("articles", "change_status")
                      }
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={
                            module_permissions?.articles?.change_status === "Y"
                          }
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Change Status
                        </label>
                        <p className="permission-description">
                          Activate/deactivate articles
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() => handlePermission("articles", "delete")}
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={module_permissions?.articles?.delete === "Y"}
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Delete Articles
                        </label>
                        <p className="permission-description">
                          Delete articles from the system
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() => handlePermission("articles", "filter")}
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={module_permissions?.articles?.filter === "Y"}
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Filter Articles
                        </label>
                        <p className="permission-description">
                          Search and filter article data
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ingredients Permission */}
              <div className="permission-module">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h4 className="permission-module-title">
                    <SettingOutlined />
                    Ingredients Management
                  </h4>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="action-button secondary"
                      onClick={() =>
                        handleCheckModulePermissions("ingredients")
                      }
                      style={{ fontSize: "12px", padding: "4px 12px" }}
                    >
                      <CheckCircleOutlined />
                      Check All
                    </button>
                    <button
                      type="button"
                      className="action-button secondary"
                      onClick={() =>
                        handleUncheckModulePermissions("ingredients")
                      }
                      style={{ fontSize: "12px", padding: "4px 12px" }}
                    >
                      <InfoCircleOutlined />
                      Uncheck All
                    </button>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() => handlePermission("ingredients", "list")}
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={
                            module_permissions?.ingredients?.list === "Y"
                          }
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          View Ingredients
                        </label>
                        <p className="permission-description">
                          View ingredient list and details
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() =>
                        handlePermission("ingredients", "add_edit")
                      }
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={
                            module_permissions?.ingredients?.add_edit === "Y"
                          }
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Add/Edit Ingredients
                        </label>
                        <p className="permission-description">
                          Create and modify ingredients
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() =>
                        handlePermission("ingredients", "change_status")
                      }
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={
                            module_permissions?.ingredients?.change_status ===
                            "Y"
                          }
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Change Status
                        </label>
                        <p className="permission-description">
                          Activate/deactivate ingredients
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() => handlePermission("ingredients", "delete")}
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={
                            module_permissions?.ingredients?.delete === "Y"
                          }
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Delete Ingredients
                        </label>
                        <p className="permission-description">
                          Delete ingredients from the system
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() => handlePermission("ingredients", "filter")}
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={
                            module_permissions?.ingredients?.filter === "Y"
                          }
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Filter Ingredients
                        </label>
                        <p className="permission-description">
                          Search and filter ingredient data
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Events Permission */}
              <div className="permission-module">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h4 className="permission-module-title">
                    <SettingOutlined />
                    Events Management
                  </h4>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="action-button secondary"
                      onClick={() => handleCheckModulePermissions("events")}
                      style={{ fontSize: "12px", padding: "4px 12px" }}
                    >
                      <CheckCircleOutlined />
                      Check All
                    </button>
                    <button
                      type="button"
                      className="action-button secondary"
                      onClick={() => handleUncheckModulePermissions("events")}
                      style={{ fontSize: "12px", padding: "4px 12px" }}
                    >
                      <InfoCircleOutlined />
                      Uncheck All
                    </button>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() => handlePermission("events", "list")}
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={module_permissions?.events?.list === "Y"}
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">View Events</label>
                        <p className="permission-description">
                          View event list and details
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() => handlePermission("events", "add_edit")}
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={module_permissions?.events?.add_edit === "Y"}
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Add/Edit Events
                        </label>
                        <p className="permission-description">
                          Create and modify events
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() =>
                        handlePermission("events", "change_status")
                      }
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={
                            module_permissions?.events?.change_status === "Y"
                          }
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Change Status
                        </label>
                        <p className="permission-description">
                          Activate/deactivate events
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() => handlePermission("events", "delete")}
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={module_permissions?.events?.delete === "Y"}
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Delete Events
                        </label>
                        <p className="permission-description">
                          Delete events from the system
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() => handlePermission("events", "filter")}
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={module_permissions?.events?.filter === "Y"}
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Filter Events
                        </label>
                        <p className="permission-description">
                          Search and filter event data
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Promocodes Permission */}
              <div className="permission-module">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h4 className="permission-module-title">
                    <SettingOutlined />
                    Promocodes Management
                  </h4>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="action-button secondary"
                      onClick={() => handleCheckModulePermissions("promocodes")}
                      style={{ fontSize: "12px", padding: "4px 12px" }}
                    >
                      <CheckCircleOutlined />
                      Check All
                    </button>
                    <button
                      type="button"
                      className="action-button secondary"
                      onClick={() =>
                        handleUncheckModulePermissions("promocodes")
                      }
                      style={{ fontSize: "12px", padding: "4px 12px" }}
                    >
                      <InfoCircleOutlined />
                      Uncheck All
                    </button>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() => handlePermission("promocodes", "list")}
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={module_permissions?.promocodes?.list === "Y"}
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          View Promocodes
                        </label>
                        <p className="permission-description">
                          View promocode list and details
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() => handlePermission("promocodes", "add_edit")}
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={
                            module_permissions?.promocodes?.add_edit === "Y"
                          }
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Add/Edit Promocodes
                        </label>
                        <p className="permission-description">
                          Create and modify promocodes
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() =>
                        handlePermission("promocodes", "change_status")
                      }
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={
                            module_permissions?.promocodes?.change_status ===
                            "Y"
                          }
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Change Status
                        </label>
                        <p className="permission-description">
                          Activate/deactivate promocodes
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() => handlePermission("promocodes", "filter")}
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={
                            module_permissions?.promocodes?.filter === "Y"
                          }
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Filter Promocodes
                        </label>
                        <p className="permission-description">
                          Search and filter promocode data
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Orders Permission */}
              <div className="permission-module">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h4 className="permission-module-title">
                    <SettingOutlined />
                    Order Management
                  </h4>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="action-button secondary"
                      onClick={() =>
                        handleCheckModulePermissions("transaction")
                      }
                      style={{ fontSize: "12px", padding: "4px 12px" }}
                    >
                      <CheckCircleOutlined />
                      Check All
                    </button>
                    <button
                      type="button"
                      className="action-button secondary"
                      onClick={() =>
                        handleUncheckModulePermissions("transaction")
                      }
                      style={{ fontSize: "12px", padding: "4px 12px" }}
                    >
                      <InfoCircleOutlined />
                      Uncheck All
                    </button>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() => handlePermission("transaction", "list")}
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={
                            module_permissions?.transaction?.list === "Y"
                          }
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">View Orders</label>
                        <p className="permission-description">
                          View order list and details
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <div
                      className="permission-item"
                      onClick={() => handlePermission("transaction", "filter")}
                    >
                      <div className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={
                            module_permissions?.transaction?.filter === "Y"
                          }
                          readOnly
                        />
                      </div>
                      <div className="permission-content">
                        <label className="permission-label">
                          Filter Orders
                        </label>
                        <p className="permission-description">
                          Search and filter order data
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <div className="row">
                <div className="col-12 d-flex justify-content-end gap-3">
                  <button
                    type="button"
                    className="action-button secondary"
                    onClick={() =>
                      navigate(
                        loginUserData?.admin_type === "Super Admin"
                          ? "/sub-admin/list"
                          : "/admin/dashboard"
                      )
                    }
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
                        {ADDEDITDATA?.id
                          ? "Update Administrator"
                          : "Create Administrator"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <LoadingEffect isLoading={isLoading} />
    </div>
  );
};

export default UserListEditPage;
