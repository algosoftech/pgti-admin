import React, { useEffect, useState, useRef, useMemo } from "react";
import { Dropdown, notification, Drawer, Button, Space, Modal } from "antd";
import {
  faFilter,
  faEye,
  faEdit,
  faThumbsUp,
  faThumbsDown,
  faPlus,
  faRefresh,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";

import Top_navbar from "../../components/Top_navbar";
import EnhancedTable from "../../../../components/EnhancedTable/EnhancedTable";

import { useNavigate } from "react-router-dom";

import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

import moment from "moment";
import { usePermissions } from "../../../../controllers/PermissionContext";
import "../../admin-pages.css";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import {
  fetchContactShopsList,
  changeContactShopStatus,
  deleteContactShopAction,
  setCurrentPage,
  setLimit,
  setFilter,
  resetFilter,
  setShowRequest,
} from "../../../../store/contactShopSlice";
import ShowData from "../../../../components/ShowData";

export default function ContactShopList() {
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
    filter,
    showRequest,
    error,
    count,
  } = useAppSelector((state) => state.contactShops);

  const PERMISSION = usePermissions("contact_shops");
  const [activeTab, setActiveTab] = useState("all");
  const [serverColumnFilters, setServerColumnFilters] = useState({});

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    dispatch(setShowRequest(tab === "all" ? "" : tab.toUpperCase()));
  };

  const handleEdit = async (item = {}) => {
    navigate("/admin/cms/contact-shops/addeditdata", { state: item });
  };

  /*********************************************************
   *  This function is use to fetch Contact Shop list
   *********************************************************/
  const getList = () => {
    const options = {
      type: "",
      condition: {
        ...(serverColumnFilters.name
          ? { name: serverColumnFilters.name }
          : null),
        ...(serverColumnFilters.address
          ? { address: serverColumnFilters.address }
          : null),
        ...(serverColumnFilters.email
          ? { email: serverColumnFilters.email }
          : null),
        ...(serverColumnFilters.phone
          ? { phone: serverColumnFilters.phone }
          : null),
        ...(showRequest ? { status: showRequest } : null),
      },
      skip: SKIP ? SKIP : 0,
      limit: LIMIT ? LIMIT : 10,
    };
    dispatch(fetchContactShopsList(options));
  }; //End

  /*********************************************************
   *  This function is for handle page change
   *********************************************************/
  const handlePageChange = (newPage) => {
    dispatch(setCurrentPage(newPage));
    if (targetRef.current) {
      targetRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  const handleLimitChange = (limit) => {
    dispatch(setLimit(Number(limit)));
    if (targetRef.current) {
      targetRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
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
        changeContactShopStatus({ editId: id, status })
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
        description:
          error || `Operation not perform yet! please try in some time.`,
        placement: "topRight",
        icon: <InfoCircleOutlined style={{ color: "red" }} />,
        duration: 2,
      });
    }
  };

  /*********************************************************
   *  This function is use to handle delete Contact Shop
   *********************************************************/
  const handleDelete = (item) => {
    Modal.confirm({
      title: "Are you sure you want to delete this Contact Shop?",
      icon: <ExclamationCircleOutlined />,
      content: `Name: ${item?.name || "N/A"}`,
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const result = await dispatch(
            deleteContactShopAction({ editId: item.id })
          ).unwrap();

          notification.open({
            message: "Success",
            description: result.message || `Contact Shop deleted successfully.`,
            placement: "topRight",
            icon: <CheckCircleOutlined style={{ color: "green" }} />,
            duration: 2,
          });

          // Refresh the list after delete
          getList();
        } catch (error) {
          notification.open({
            message: "Oops!",
            description:
              error || `Failed to delete Contact Shop. Please try again.`,
            placement: "topRight",
            icon: <InfoCircleOutlined style={{ color: "red" }} />,
            duration: 2,
          });
        }
      },
    });
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
        {(PERMISSION?.change_status === "Y" ||
          PERMISSION?.fullAccess === "Y") &&
          (items?.status === "A" ? (
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
          ))}
        {(PERMISSION?.delete === "Y" || PERMISSION?.fullAccess === "Y") && (
          <button
            className="action-dropdown-item danger"
            onClick={() => handleDelete(items)}
          >
            <FontAwesomeIcon icon={faTrash} />
            <span>Delete</span>
          </button>
        )}
      </div>
    );
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
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = "Farmer Store || Admin || Contact Shops List";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, showRequest, filter, LIMIT]);

  // Debounce server column filters
  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        Object.keys(serverColumnFilters).length > 0 ||
        Object.values(serverColumnFilters).some((v) => v)
      ) {
        dispatch(setCurrentPage(1));
        getList();
      }
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverColumnFilters]);

  // Define columns for EnhancedTable
  const columns = useMemo(
    () => [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => {
          const index = ALLLISTDATA.findIndex(
            (item) => item.id === row.original.id
          );
          return <div>{index + SKIP + 1}</div>;
        },
        size: 60,
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ getValue }) => (
          <div className="font-weight-600" style={{ maxWidth: "200px" }}>
            {getValue() || "N/A"}
          </div>
        ),
        size: 200,
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: "address",
        header: "Address",
        cell: ({ getValue }) => {
          const address = getValue() || "N/A";
          return (
            <div className="text-muted" style={{ maxWidth: "300px" }}>
              {address.length > 50 ? `${address.substring(0, 50)}...` : address}
            </div>
          );
        },
        size: 300,
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ getValue }) => (
          <div className="font-weight-600">{getValue() || "N/A"}</div>
        ),
        size: 150,
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ getValue }) => (
          <div className="font-weight-600" style={{ maxWidth: "200px" }}>
            {getValue() || "N/A"}
          </div>
        ),
        size: 200,
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ getValue }) => {
          const date = getValue();
          return (
            <div>
              <div className="text-muted">
                {moment(date).format("MMM DD, YYYY")}
              </div>
              <div className="text-muted small">
                {moment(date).format("HH:mm")}
              </div>
            </div>
          );
        },
        size: 150,
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue();
          return (
            <span
              className={`status-badge ${
                status === "A" ? "active" : "inactive"
              }`}
            >
              {status === "A" ? "Active" : "Inactive"}
            </span>
          );
        },
        size: 120,
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const item = row.original;
          return PERMISSION?.add_edit === "Y" ||
            PERMISSION?.change_status === "Y" ||
            PERMISSION?.delete === "Y" ||
            PERMISSION?.fullAccess === "Y" ? (
            <div className="action-dropdown">
              <Dropdown
                overlay={() => dropdownMenu(item)}
                placement="bottomRight"
                trigger={["click"]}
              >
                <button className="action-dropdown-trigger">
                  <FontAwesomeIcon icon={faEllipsis} />
                </button>
              </Dropdown>
            </div>
          ) : (
            <span className="text-muted">--</span>
          );
        },
        size: 100,
        enableSorting: false,
        enableColumnFilter: false,
      },
    ],
    [SKIP, PERMISSION, ALLLISTDATA]
  );

  return (
    <>
      <div className="admin-page-container" ref={targetRef}>
        <Top_navbar title="Contact Shops" />

        {/* <div className="page-header">
          <h1 className="page-title">Contact Shop Management</h1>
          <p className="page-subtitle">Manage your contact shops, view their details, and track their activity</p>
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

              <button
                className="action-button secondary"
                onClick={() => getList()}
              >
                <FontAwesomeIcon icon={faRefresh} />
                Refresh
              </button>

              {(PERMISSION?.add_edit === "Y" ||
                PERMISSION?.fullAccess === "Y") && (
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
            <EnhancedTable
              data={ALLLISTDATA}
              columns={columns}
              isLoading={isLoading}
              currentPage={currentPage}
              totalPages={TOTALPAGES}
              limit={LIMIT}
              skip={SKIP}
              count={count}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
              serverColumnFilters={serverColumnFilters}
              onServerColumnFiltersChange={setServerColumnFilters}
              onRefresh={getList}
              permission={PERMISSION}
              emptyStateMessage="No Contact Shops found"
              activeTab={activeTab}
              targetRef={targetRef}
              exportFileName="contact_shops"
            />
          </div>
        </div>
      </div>
    </>
  );
}
