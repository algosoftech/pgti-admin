import React, { useEffect, useState, useRef, useMemo } from "react";
import { Dropdown, notification } from "antd";
import {
  faEye,
  faEdit,
  faRefresh,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";

import Top_navbar from 'components/layout/TopNavbar';

import { useNavigate } from "react-router-dom";

import { InfoCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";

import moment from "moment";
import { usePermissions } from 'contexts/PermissionContext';
import "styles/admin-pages.css";
import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
  fetchOrdersList,
  changeOrderStatusAction,
  setCurrentPage,
  setLimit,
  setShowRequest,
} from 'store/slices/orders.slice';
import ShowData from 'components/table/ShowData';
import EnhancedTable from 'components/table/EnhancedTable/EnhancedTable';

export default function OrdersList() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const targetRef = useRef(null);

  // Redux state
  const {
    listData: ALLLISTDATA,
    isLoading,
    currentPage,
    totalPages: TOTALPAGES,
    limit: LIMIT,
    skip: SKIP,
    showRequest,
    error,
    count,
  } = useAppSelector((state) => state.orders);

  const PERMISSION = usePermissions("orders");
  const [activeTab, setActiveTab] = useState("all");
  
  // Server-side filter state
  const [serverColumnFilters, setServerColumnFilters] = useState({
    order_no: "",
    name: "",
    phone: "",
    email: "",
    order_status: "",
    payment_status: "",
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    dispatch(setShowRequest(tab === "all" ? "" : tab));
  };

  const handleView = async (item = {}) => {
    navigate("/admin/orders/addeditdata", { state: item });
  };

  // Define table columns
  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input type="checkbox" checked={table.getIsAllRowsSelected()} onChange={table.getToggleAllRowsSelectedHandler()} style={{ cursor: 'pointer' }} />
        ),
        cell: ({ row }) => (
          <input type="checkbox" checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} style={{ cursor: 'pointer' }} />
        ),
        size: 60,
        enableSorting: false,
        enableResizing: false,
        enableGlobalFilter: false,
      },
      {
        accessorKey: 'index',
        header: '#',
        cell: ({ row }) => row.index + SKIP + 1,
        size: 100,
        enableSorting: true,
        enableGlobalFilter: false,
      },
      {
        accessorKey: 'order_no',
        header: 'Order No',
        cell: ({ getValue }) => <div className="font-weight-600">{getValue()}</div>,
        size: 150,
        enableSorting: true,
        enableColumnFilter: true,
        enableResizing: true,
        enableGlobalFilter: true,
      },
      {
        accessorKey: 'users_name',
        header: 'Customer Name',
        cell: ({ getValue }) => <div className="font-weight-500">{getValue()}</div>,
        size: 180,
        enableSorting: true,
        enableColumnFilter: true,
        enableResizing: true,
        enableGlobalFilter: true,
      },
      {
        accessorKey: 'users_phone',
        header: 'Phone',
        cell: ({ getValue }) => <div>{getValue()}</div>,
        size: 130,
        enableSorting: true,
        enableColumnFilter: true,
        enableResizing: true,
        enableGlobalFilter: true,
      },
      {
        accessorKey: 'users_email',
        header: 'Email',
        cell: ({ getValue }) => <div>{getValue()}</div>,
        size: 200,
        enableSorting: true,
        enableColumnFilter: true,
        enableResizing: true,
        enableGlobalFilter: true,
      },
      {
        accessorKey: 'subtotal',
        header: 'Subtotal',
        cell: ({ getValue }) => (
          <div className="font-weight-600">₹{parseFloat(getValue() || 0).toFixed(2)}</div>
        ),
        size: 120,
        enableSorting: true,
        enableResizing: true,
        enableGlobalFilter: false,
      },
      {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ getValue }) => (
          <div className="font-weight-600" style={{ color: '#1e3a5f' }}>₹{parseFloat(getValue() || 0).toFixed(2)}</div>
        ),
        size: 120,
        enableSorting: true,
        enableResizing: true,
        enableGlobalFilter: false,
      },
      {
        accessorKey: 'payment_method',
        header: 'Payment Method',
        cell: ({ getValue }) => {
          const method = getValue();
          return (
            <span className={`status-badge ${method === 'COD' ? 'active' : 'inactive'}`}>
              {method || 'N/A'}
            </span>
          );
        },
        size: 230,
        enableSorting: true,
        enableResizing: true,
        enableGlobalFilter: false,
      },
      {
        accessorKey: 'payment_status',
        header: 'Payment Status',
        accessorFn: (row) => {
          const status = row.payment_status;
          if (status === 'Pending') return 'Unpaid';
          if (status === 'Success') return 'Paid';
          if (status === 'Refunded') return 'Refunded';
          return status || 'Pending';
        },
        cell: ({ row }) => {
          const status = row.original.payment_status;
          let statusText = 'Pending';
          let statusClass = 'inactive';
          
          if (status === 'Success') {
            statusText = 'Paid';
            statusClass = 'active';
          } else if (status === 'Pending') {
            statusText = 'Unpaid';
            statusClass = 'inactive';
          } else if (status === 'Refunded') {
            statusText = 'Refunded';
            statusClass = 'inactive';
          }
          
          return (
            <span className={`status-badge ${statusClass}`}>
              {status}
            </span>
          );
        },
        size: 230,
        enableSorting: true,
        enableColumnFilter: true,
        enableResizing: true,
      },
      {
        accessorKey: 'order_status',
        header: 'Order Status',
        accessorFn: (row) => {
          return row.order_status;
        },
        cell: ({ row }) => {
          const status = row.original.order_status;
          let statusClass = 'inactive';
          
          if (status === 'Pending') {
            statusClass = 'inactive';
          } else if (status === 'Success') {
            statusClass = 'active';
          } else if (status === 'Confirmed') {
            statusClass = 'active';
          } else if (status === 'Shipped') {
            statusClass = 'active';
          } else if (status === 'Delivered') {
            statusClass = 'active';
          } else if (status === 'Cancelled') {
            statusClass = 'inactive';
          }
          
          return (
            <span className={`status-badge ${statusClass}`}>
              {status}
            </span>
          );
        },
        size: 230,
        enableSorting: true,
        enableColumnFilter: true,
        enableResizing: true,
      },
      {
        accessorKey: 'created_at',
        header: 'Created',
        accessorFn: (row) => moment(row.created_at).format("MMM DD, YYYY HH:mm"),
        cell: ({ row }) => (
          <>
            <div className="text-muted">{moment(row.original.created_at).format("MMM DD, YYYY")}</div>
            <div className="text-muted small">{moment(row.original.created_at).format("HH:mm")}</div>
          </>
        ),
        size: 200,
        enableSorting: true,
        enableColumnFilter: true,
        enableResizing: true,
        enableGlobalFilter: true,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const item = row.original;
          return (PERMISSION?.add_edit === "Y" || PERMISSION?.view === "Y" || PERMISSION?.fullAccess === "Y") ? (
            <div className="action-dropdown">
              <Dropdown overlay={() => dropdownMenu(item)} placement="bottomRight" trigger={['click']}>
                <button className="action-dropdown-trigger">
                  <FontAwesomeIcon icon={faEllipsis} />
                </button>
              </Dropdown>
            </div>
          ) : (
            <span className="text-muted">--</span>
          );
        },
        size: 120,
        enableSorting: false,
        enableResizing: false,
        enableGlobalFilter: false,
      },
    ],
    [SKIP, PERMISSION]
  );

  /*********************************************************
   *  This function is use to fetch orders list
   *********************************************************/
  const getList = () => {
    const options = {
      type: "",
      condition: {
        ...(serverColumnFilters.order_no ? { order_no: serverColumnFilters.order_no } : null),
        ...(serverColumnFilters.name ? { name: serverColumnFilters.users_name } : null),
        ...(serverColumnFilters.phone ? { phone: serverColumnFilters.users_phone } : null),
        ...(serverColumnFilters.email ? { email: serverColumnFilters.users_email } : null),
        ...(serverColumnFilters.order_status ? { order_status: serverColumnFilters.order_status } : null),
        ...(serverColumnFilters.payment_status ? { payment_status: serverColumnFilters.payment_status } : null),
        ...(showRequest ? { order_status: showRequest } : null),
      },
      skip: SKIP ? SKIP : 0,
      limit: LIMIT ? LIMIT : 10,
    };
    dispatch(fetchOrdersList(options));
  }; //End

  const handleLimitChange = (limit) => {
    dispatch(setLimit(Number(limit)));
    if (targetRef.current) {
      targetRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  /*********************************************************
   *  This function is use to handle change order status
   *********************************************************/
  const handleChangeStatus = async (id = "", status = "") => {
    if (!id) {
      notification.open({
        message: "Oops!",
        description: `Order ID is required.`,
        placement: "topRight",
        icon: <InfoCircleOutlined style={{ color: "red" }} />,
        duration: 2,
      });
      return;
    }
    
    if (!status || status === "") {
      notification.open({
        message: "Oops!",
        description: `Status is required.`,
        placement: "topRight",
        icon: <InfoCircleOutlined style={{ color: "red" }} />,
        duration: 2,
      });
      return;
    }

    try {
      const result = await dispatch(
        changeOrderStatusAction({ order_id: id, status })
      ).unwrap();
      
      notification.open({
        message: "Success",
        description: result.message || `Order status changed successfully.`,
        placement: "topRight",
        icon: <CheckCircleOutlined style={{ color: "green" }} />,
        duration: 2,
      });
      
      // Refresh the list after status change
      getList();
    } catch (error) {
      notification.open({
        message: "Oops!",
        description: error || `Operation not perform yet! please try in some time.`,
        placement: "topRight",
        icon: <InfoCircleOutlined style={{ color: "red" }} />,
        duration: 2,
      });
    }
  };

  const dropdownMenu = (items) => {
    return (
      <div className="action-dropdown-menu">
        {(PERMISSION?.view === "Y" || PERMISSION?.add_edit === "Y" || PERMISSION?.fullAccess === "Y") && (
          <button
            className="action-dropdown-item"
            onClick={() => handleView(items)}
          >
            <FontAwesomeIcon icon={faEye} />
            <span>View Details</span>
          </button>
        )}
        {(PERMISSION?.add_edit === "Y" || PERMISSION?.fullAccess === "Y") && items?.order_status !== 'D' && items?.order_status !== 'X' && (
          <button
            className="action-dropdown-item"
            onClick={() => handleView(items)}
          >
            <FontAwesomeIcon icon={faEdit} />
            <span>Update Status</span>
          </button>
        )}
      </div>
    );
  };

  /*********************************************************
   *  Debounce effect for server-side column filters
   *********************************************************/
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (currentPage !== 1) {
        dispatch(setCurrentPage(1));
      } else {
        getList();
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverColumnFilters]);

  /*********************************************************
   *  This function will load when page load and with dependency update
   *********************************************************/
  useEffect(() => {
    getList();
    if (targetRef.current) {
      targetRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
    window.scrollTo({top: 0,behavior: "smooth"});
    document.title = "PGTI || Admin || Orders List";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, showRequest, LIMIT]);

  return (
    <>
      <div className="admin-page-container" ref={targetRef}>
        <Top_navbar title="Orders" />
        
        {/* <div className="page-header">
          <h1 className="page-title">Order Management</h1>
          <p className="page-subtitle">Manage orders, view details, and track order status</p>
        </div> */}

        <div className="content-card">
          <div className="tabs-header">
            <div className="tabs-container">
              <button
                className={`tab-item ${activeTab === "all" ? "active" : ""}`}
                onClick={() => handleTabChange("all")}
              >
                All
              </button>
              <button
                className={`tab-item ${activeTab === "Pending" ? "active" : ""}`}
                onClick={() => handleTabChange("Pending")}
              >
                Pending
              </button>
              <button
                className={`tab-item ${activeTab === "C" ? "active" : ""}`}
                onClick={() => handleTabChange("C")}
              >
                Confirmed
              </button>
              <button
                className={`tab-item ${activeTab === "S" ? "active" : ""}`}
                onClick={() => handleTabChange("S")}
              >
                Shipped
              </button>
              <button
                className={`tab-item ${activeTab === "D" ? "active" : ""}`}
                onClick={() => handleTabChange("D")}
              >
                Delivered
              </button>
              <button
                className={`tab-item ${activeTab === "X" ? "active" : ""}`}
                onClick={() => handleTabChange("X")}
              >
                Cancelled
              </button>
            </div>

            <div className="tabs-actions">
              <ShowData setLimit={handleLimitChange} limit={LIMIT} />
              
              <button
                className="action-button secondary"
                onClick={() => getList()}
              >
                <FontAwesomeIcon icon={faRefresh} />
                Refresh Data
              </button>
            </div>
          </div>

          <div className="content-card-body">
            <EnhancedTable
              data={ALLLISTDATA}
              columns={columns}
              isLoading={isLoading}
              currentPage={currentPage}
              totalPages={TOTALPAGES}
              limit={LIMIT}
              skip={SKIP}
              count={count}
              onPageChange={(page) => {
                dispatch(setCurrentPage(page));
                if (targetRef.current) {
                  targetRef.current.scrollIntoView({ behavior: "smooth" });
                }
              }}
              onLimitChange={(newLimit) => {
                dispatch(setLimit(Number(newLimit)));
                if (targetRef.current) {
                  targetRef.current.scrollIntoView({ behavior: "smooth" });
                }
              }}
              serverColumnFilters={serverColumnFilters}
              onServerColumnFiltersChange={setServerColumnFilters}
              onRefresh={getList}
              permission={PERMISSION}
              emptyStateMessage="No orders found"
              activeTab={activeTab}
              targetRef={targetRef}
            />
          </div>
        </div>
      </div>
    </>
  );
}

