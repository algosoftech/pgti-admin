import React, { useEffect, useState, useRef } from "react";
import { Dropdown, notification, Drawer, Button, Space } from "antd";
import {
  faFilter,
  faEye,
  faEdit,
  faThumbsUp,
  faThumbsDown,
  faPlus,
  faRefresh,
} from "@fortawesome/free-solid-svg-icons";
import Pagination from "@mui/material/Pagination";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";

import Top_navbar from "../../components/Top_navbar";

import { useNavigate } from "react-router-dom";

import { InfoCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";

import moment from "moment";
import { usePermissions } from "../../../../controllers/PermissionContext";
import "../../admin-pages.css";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import {
  fetchBannersList,
  changeBannerStatus,
  setCurrentPage,
  setLimit,
  setFilter,
  resetFilter,
  setShowRequest,
} from "../../../../store/bannerSlice";
import ShowData from "../../../../components/ShowData";

export default function BannerList() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const targetRef = useRef(null);
  const inputRef1 = useRef(null);
  const inputRef2 = useRef(null);
  const inputRef3 = useRef(null);
  const inputRef4 = useRef(null);

  // Redux state
  const {
    listData: ALLLISTDATA,
    isLoading,
    currentPage,
    totalPages: TOTALPAGES,
    limit: LIMIT,
    skip: SKIP,
    filter,
    showRequest,
    error,
    count,
  } = useAppSelector((state) => state.banners);

  const [isFilterShow, setFilterShow] = useState(false);
  const handleFilterDrawer = () => setFilterShow(!isFilterShow);
  const PERMISSION = usePermissions("banners");
  const [activeTab, setActiveTab] = useState("all");
  const [helpText, setHelpText] = useState("");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    dispatch(setShowRequest(tab === "all" ? "" : tab.toUpperCase()));
  };
  
  const handleEdit = async (item = {}) => {
    navigate("/admin/cms/banners/addeditdata", { state: item });
  };

  /*********************************************************
   *  This function is use to fetch banner list
   *********************************************************/
  const getList = () => {
    const options = {
      type: "",
      condition: {
        ...(filter.filter_by === "type" ? { type: filter?.search } : null),
        ...(filter.filter_by === "page" ? { page: filter?.search } : null),
        ...(filter.filter_by === "status"
          ? { status: filter?.search }
          : null),
        ...(showRequest ? { status: showRequest } : null),
      },
      skip: SKIP ? SKIP : 0,
      limit: LIMIT ? LIMIT : 10,
    };
    dispatch(fetchBannersList(options));
  }; //End

  /*********************************************************
   *  This function is for handle page change
   *********************************************************/
  const handlePageChange = (event, newPage) => {
    dispatch(setCurrentPage(newPage));
    targetRef.current.scrollIntoView({
      behavior: "smooth",
    });
  };

  const handleLimitChange = (limit) => {
    dispatch(setLimit(Number(limit)));
  };

  /*********************************************************
   *  This function is use to handle change status
   *********************************************************/
  const handleChangeStatus = async (id = "", status = "") => {
    if (!id) {
      notification.open({
        message: "Oops!",
        description: `Id is required.`,
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
        changeBannerStatus({ editId: id, status })
      ).unwrap();
      
      notification.open({
        message: "Success",
        description: result.message || `Status changed successfully.`,
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
        {(PERMISSION?.add_edit === "Y" || PERMISSION?.fullAccess === "Y") && (
          <button
            className="action-dropdown-item"
            onClick={() => handleEdit(items)}
          >
            <FontAwesomeIcon icon={faEdit} />
            <span>Edit</span>
          </button>
        )}
        {(PERMISSION?.change_status === "Y" || PERMISSION?.fullAccess === "Y") && (
          items?.status === "A" ? (
            <button
              className="action-dropdown-item danger"
              onClick={() => {
                handleChangeStatus(items.id, "I");
              }}
            >
              <FontAwesomeIcon icon={faThumbsDown} />
              <span>Deactivate</span>
            </button>
          ) : (
            <button
              className="action-dropdown-item"
              onClick={() => {
                handleChangeStatus(items.id, "A");
              }}
            >
              <FontAwesomeIcon icon={faThumbsUp} />
              <span>Activate</span>
            </button>
          )
        )}
      </div>
    );
  };

  /*********************************************************
   *  This function is ued for handle filter input change
   *********************************************************/
  const handleFilterReset = () => {
    try {
      dispatch(resetFilter());
      if (inputRef1.current) inputRef1.current.value = "";
      if (inputRef2.current) inputRef2.current.value = "";
      if (inputRef3.current) inputRef3.current.value = "";
      if (inputRef4.current) inputRef4.current.value = "";
    } catch (error) {}
  };

  const handleFilterApply = (e) => {
    try {
      e.preventDefault();
      const form = new FormData(e.target);
      dispatch(setFilter({
        filter_by: form.get("filter_by") || "",
        search: form.get("search") || "",
        to: form.get("to_date") || "",
        from: form.get("from_date") || "",
      }));
      handleFilterDrawer();
    } catch (error) {}
  };

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
    document.title = "Farmer Store || Admin || Banner's List";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, showRequest, filter, LIMIT]);

  return (
    <>
      <div className="admin-page-container" ref={targetRef}>
        <Top_navbar title="Banners" />
        
        {/* <div className="page-header">
          <h1 className="page-title">Banner Management</h1>
          <p className="page-subtitle">Manage your banners, view their details, and track their activity</p>
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
                className={`tab-item ${activeTab === "A" ? "active" : ""}`}
                onClick={() => handleTabChange("A")}
              >
                Active
              </button>
              <button
                className={`tab-item ${activeTab === "I" ? "active" : ""}`}
                onClick={() => handleTabChange("I")}
              >
                Inactive
              </button>
            </div>

            <div className="tabs-actions">
              <ShowData setLimit={handleLimitChange} limit={LIMIT} />
              
              {(PERMISSION?.filter === "Y" || PERMISSION?.fullAccess === "Y") && (
                <button
                  className="action-button filter"
                  onClick={handleFilterDrawer}
                >
                  <FontAwesomeIcon icon={faFilter} />
                  Filters
                </button>
              )}
              
              <button
                className="action-button secondary"
                onClick={() => getList()}
              >
                <FontAwesomeIcon icon={faRefresh} />
                Refresh
              </button>
              
              {(PERMISSION?.add_edit === "Y" || PERMISSION?.fullAccess === "Y") && (
                <button
                  className="action-button primary"
                  onClick={() => handleEdit()}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Create
                </button>
              )}
            </div>
          </div>

          <div className="content-card-body">
            <div className="modern-table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Image</th>
                    <th>Type</th>
                    <th>Page</th>
                    <th>Created</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ALLLISTDATA?.length > 0 ? (
                    ALLLISTDATA.map((item, index) => (
                      <tr key={index}>
                        <td>{index + SKIP + 1}</td>
                        <td>
                          {item?.image ? (
                            <img
                              src={`${process.env.REACT_APP_IMAGE_BASE_URL}${item.image}`}
                              alt="Banner"
                              style={{
                                width: "80px",
                                height: "50px",
                                objectFit: "cover",
                                borderRadius: "8px",
                              }}
                            />
                          ) : (
                            <span className="text-muted">No Image</span>
                          )}
                        </td>
                        <td>
                          <div className="font-weight-600">{item?.type || "N/A"}</div>
                        </td>
                        <td>
                          <div className="font-weight-600">{item?.page || "N/A"}</div>
                        </td>
                        <td>
                          <div className="text-muted">
                            {moment(item?.created_at).format("MMM DD, YYYY")}
                          </div>
                          <div className="text-muted small">
                            {moment(item?.created_at).format("HH:mm")}
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${item?.status === "A" ? "active" : "inactive"}`}>
                            {item?.status === "A" ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          {(
                            PERMISSION?.add_edit === "Y" || 
                            PERMISSION?.change_status === "Y" || 
                            PERMISSION?.fullAccess === "Y"
                          ) ? (
                            <div className="action-dropdown">
                              <Dropdown
                                overlay={() => dropdownMenu(item)}
                                placement="bottomRight"
                                trigger={['click']}
                              >
                                <button className="action-dropdown-trigger">
                                  <FontAwesomeIcon icon={faEllipsis} />
                                </button>
                              </Dropdown>
                            </div>
                          ) : (
                            <span className="text-muted">--</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : isLoading ? (
                    <tr>
                      <td colSpan="7" className="text-center">
                        <div className="loading-container">
                          <div className="loading-spinner"></div>
                          <div className="loading-text">Loading banners...</div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">
                        <div className="empty-state">
                          <div className="empty-state-icon">
                            <FontAwesomeIcon icon={faEye} />
                          </div>
                          <h3 className="empty-state-title">No banners found</h3>
                          <p className="empty-state-description">
                            {activeTab === "all" 
                              ? "No banners have been created yet." 
                              : `No ${activeTab} banners found.`}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              
              <div className="modern-pagination">
                <div className="pagination-info">
                  Showing {SKIP + 1} to {Math.min(SKIP + LIMIT, count)} of {count} banners
                </div>
                {TOTALPAGES > 1 && (
                  <Pagination
                    count={TOTALPAGES}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Filter Drawer */}
      <Drawer
        title={
          <div className="filter-header">
            <h3 className="filter-title">Filter Banners</h3>
          </div>
        }
        placement="right"
        width={400}
        onClose={handleFilterDrawer}
        open={isFilterShow}
        className="filter-drawer"
        extra={
          <Space>
            <Button onClick={handleFilterDrawer}>Cancel</Button>
            <Button
              type="primary"
              onClick={handleFilterReset}
              style={{ backgroundColor: "#ef4444", color: "white" }}
            >
              Reset
            </Button>
          </Space>
        }
      >
        <div className="filter-body">
          <form id="filter_form" onSubmit={handleFilterApply}>
            <div className="form-group">
              <label htmlFor="filter_by" className="form-label">
                Search Field
              </label>
              <select
                name="filter_by"
                className="form-select"
                id="filter_by"
                ref={inputRef1}
              >
                <option value="">Select search field</option>
                <option
                  value="type"
                  selected={filter?.filter_by === "type" ? true : false}
                >
                  Type
                </option>
                <option
                  value="page"
                  selected={filter?.filter_by === "page" ? true : false}
                >
                  Page
                </option>
                <option
                  value="status"
                  selected={filter?.filter_by === "status" ? true : false}
                >
                  Status
                </option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="search" className="form-label">
                Search Text
              </label>
              <input
                title="Enter search text"
                placeholder="Enter search text"
                type="text"
                name="search"
                className="form-input"
                id="search"
                ref={inputRef2}
              />
              {helpText && (
                <div className="form-error" style={{ color: "#3b82f6" }}>
                  {helpText}
                </div>
              )}
            </div>

            <div className="filter-actions">
              <button
                type="button"
                className="action-button secondary"
                onClick={handleFilterDrawer}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="action-button primary"
              >
                Apply Filters
              </button>
            </div>
          </form>
        </div>
      </Drawer>
    </>
  );
}

