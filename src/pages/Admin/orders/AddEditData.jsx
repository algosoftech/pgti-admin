import React, { useEffect, useState } from "react";
import { notification, Select } from 'antd';
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  EnvironmentOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LoadingEffect from "../../../components/Loading/LoadingEffect";
import { changeOrderStatus } from "../../../controllers/V1/orderController";
import "../admin-pages.css";

const { Option } = Select;

const OrderAddEditPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location?.state;
  const [error, setError] = useState([]);
  const [ORDERDATA, setOrderData] = useState(state || {});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading, please wait...');

  useEffect(() => {
    document.title = `Admin || Order Details - ${ORDERDATA?.order_no || 'N/A'}`;
  }, [ORDERDATA?.order_no]);

  /*********************************************************
   *  This function is use to handle order status change
   *********************************************************/
  const handleStatusChange = (value) => {
    setOrderData((pre) => ({
      ...pre,
      order_status: value,
    }));
    setError((pre) => ({
      ...pre,
      order_status: "",
    }));
  };

  /*********************************************************
   *  This function is use to handle form submit
   *********************************************************/
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setLoadingText('Updating order status...');

      if (!ORDERDATA?.id) {
        notification.open({
          message: "Oops!",
          description: `Order ID is required.`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        setIsLoading(false);
        return;
      }

      if (!ORDERDATA?.order_status) {
        notification.open({
          message: "Oops!",
          description: `Order status is required.`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        setIsLoading(false);
        return;
      }

      const param = {
        order_id: ORDERDATA?.id,
        status: ORDERDATA?.order_status,
      };

      const res = await changeOrderStatus(param);
      if (res.status === true) {
        notification.open({
          message: "Success",
          description: `Order status updated successfully`,
          placement: "topRight",
          icon: <CheckCircleOutlined style={{ color: "green" }} />,
          duration: 2,
        });
        navigate('/admin/orders/list');
      } else {
        notification.open({
          message: "Oops!",
          description: `${res?.message || 'Failed to update order status'}`,
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

  const getStatusLabel = (status) => {
    const statusMap = {
      'P': 'Pending',
      'C': 'Confirmed',
      'S': 'Shipped',
      'D': 'Delivered',
      'X': 'Cancelled',
    };
    return statusMap[status] || status;
  };

  const getPaymentStatusLabel = (status) => {
    const statusMap = {
      'P': 'Paid',
      'U': 'Unpaid',
      'R': 'Refunded',
    };
    return statusMap[status] || status;
  };

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">
              Order Details - {ORDERDATA?.order_no || 'N/A'}
            </h1>
            <p className="page-subtitle">
              View and manage order information
            </p>
          </div>
          <Link to="/admin/orders/list">
            <button className="action-button secondary">
              <ArrowLeftOutlined />
              Back to Orders
            </button>
          </Link>
        </div>
      </div>

      <div className="content-card">
        <div className="content-card-body">
          <form onSubmit={handleSubmit} className="modern-form">
            {/* Order Information */}
            <div className="form-section">
              <h3 className="form-section-title">
                <ShoppingCartOutlined />
                Order Information
              </h3>
              <div className="row">
                <div className="col-md-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Order Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={ORDERDATA?.order_no || ''}
                      readOnly
                      disabled
                    />
                  </div>
                </div>
                <div className="col-md-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Order Date</label>
                    <input
                      type="text"
                      className="form-input"
                      value={ORDERDATA?.created_at ? new Date(ORDERDATA.created_at).toLocaleString() : ''}
                      readOnly
                      disabled
                    />
                  </div>
                </div>
                <div className="col-md-6 col-12">
                  <div className="form-group">
                    <label className="form-label required">Order Status</label>
                    <Select
                      value={ORDERDATA?.order_status}
                      onChange={handleStatusChange}
                      className="form-select"
                      style={{ width: "100%" }}
                      size="large"
                    >
                      <Option value="P">Pending</Option>
                      <Option value="C">Confirmed</Option>
                      <Option value="S">Shipped</Option>
                      <Option value="D">Delivered</Option>
                      <Option value="X">Cancelled</Option>
                    </Select>
                    {error.order_status && (
                      <div className="form-error">{error.order_status}</div>
                    )}
                  </div>
                </div>
                <div className="col-md-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Payment Status</label>
                    <input
                      type="text"
                      className="form-input"
                      value={getPaymentStatusLabel(ORDERDATA?.payment_status) || 'N/A'}
                      readOnly
                      disabled
                    />
                  </div>
                </div>
                <div className="col-md-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Payment Method</label>
                    <input
                      type="text"
                      className="form-input"
                      value={ORDERDATA?.payment_method || 'N/A'}
                      readOnly
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="form-section">
              <h3 className="form-section-title">
                <UserOutlined />
                Customer Information
              </h3>
              <div className="row">
                <div className="col-md-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Customer Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={ORDERDATA?.name || 'N/A'}
                      readOnly
                      disabled
                    />
                  </div>
                </div>
                <div className="col-md-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-input"
                      value={ORDERDATA?.phone || 'N/A'}
                      readOnly
                      disabled
                    />
                  </div>
                </div>
                <div className="col-md-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="text"
                      className="form-input"
                      value={ORDERDATA?.email || 'N/A'}
                      readOnly
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            {ORDERDATA?.address && (
              <div className="form-section">
                <h3 className="form-section-title">
                  <EnvironmentOutlined />
                  Delivery Address
                </h3>
                <div className="row">
                  <div className="col-md-12 col-12">
                    <div className="form-group">
                      <label className="form-label">Address</label>
                      <textarea
                        className="form-input"
                        rows="4"
                        value={
                          ORDERDATA?.address?.house && ORDERDATA?.address?.area
                            ? `${ORDERDATA.address.house}, ${ORDERDATA.address.floor || ''}, ${ORDERDATA.address.locality || ''}, ${ORDERDATA.address.area}`
                            : 'N/A'
                        }
                        readOnly
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="form-section">
              <h3 className="form-section-title">
                <DollarOutlined />
                Order Summary
              </h3>
              <div className="row">
                <div className="col-md-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Subtotal</label>
                    <input
                      type="text"
                      className="form-input"
                      value={`₹${parseFloat(ORDERDATA?.subtotal || 0).toFixed(2)}`}
                      readOnly
                      disabled
                    />
                  </div>
                </div>
                <div className="col-md-6 col-12">
                  <div className="form-group">
                    <label className="form-label">Total Amount</label>
                    <input
                      type="text"
                      className="form-input"
                      value={`₹${parseFloat(ORDERDATA?.total || 0).toFixed(2)}`}
                      readOnly
                      disabled
                      style={{ fontWeight: 'bold', color: '#39B54A' }}
                    />
                  </div>
                </div>
                {ORDERDATA?.promo_code && (
                  <div className="col-md-6 col-12">
                    <div className="form-group">
                      <label className="form-label">Promo Code</label>
                      <input
                        type="text"
                        className="form-input"
                        value={ORDERDATA.promo_code}
                        readOnly
                        disabled
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            {ORDERDATA?.items && Array.isArray(ORDERDATA.items) && ORDERDATA.items.length > 0 && (
              <div className="form-section">
                <h3 className="form-section-title">
                  <ShoppingCartOutlined />
                  Order Items
                </h3>
                <div className="modern-table-container">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Rate</th>
                        <th>Discount</th>
                        <th>Subtotal</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ORDERDATA.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.product_title || 'N/A'}</td>
                          <td>{item.quantity || 0}</td>
                          <td>₹{parseFloat(item.rate || 0).toFixed(2)}</td>
                          <td>₹{parseFloat(item.discount_amount || 0).toFixed(2)}</td>
                          <td>₹{parseFloat(item.subtotal || 0).toFixed(2)}</td>
                          <td>₹{parseFloat(item.total || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="action-button secondary"
                onClick={() => navigate("/admin/orders/list")}
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
                    Updating...
                  </>
                ) : (
                  <>
                    <SaveOutlined />
                    Update Order Status
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

export default OrderAddEditPage;

