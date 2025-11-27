import React, { useEffect, useState, useRef, useMemo } from "react";
import { Dropdown, notification } from "antd";
import {
  faEye,
  faEdit,
  faThumbsUp,
  faThumbsDown,
  faPlus,
  faRefresh,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";

import Top_navbar from "../components/Top_navbar";

import { useNavigate } from "react-router-dom";

import { InfoCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";

import moment from "moment";
import { usePermissions } from "../../../controllers/PermissionContext";
import "../admin-pages.css";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  fetchPromocodesList,
  changePromocodeStatus,
  setCurrentPage,
  setLimit,
  setShowRequest,
} from "../../../store/promocodeSlice";
import ShowData from "../../../components/ShowData";
import EnhancedTable from "../../../components/EnhancedTable/EnhancedTable";

export default function PromocodeList() {
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
  } = useAppSelector((state) => state.promocodes);

  const PERMISSION = usePermissions("promocodes");
  const [activeTab, setActiveTab] = useState("all");

  // Server-side filter state
  const [serverColumnFilters, setServerColumnFilters] = useState({
    code: "",
    discount_type: "",
    status: "",
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    dispatch(setShowRequest(tab === "all" ? "" : tab.toUpperCase()));
  };

  const handleEdit = async (item = {}) => {
    navigate("/admin/promocodes/addeditdata", { state: item });
  };

  // Define table columns
  const columns = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            style={{ cursor: "pointer" }}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            style={{ cursor: "pointer" }}
          />
        ),
        size: 60,
        enableSorting: false,
        enableResizing: false,
        enableGlobalFilter: false,
      },
      {
        accessorKey: "index",
        header: "#",
        cell: ({ row }) => row.index + SKIP + 1,
        size: 100,
        enableSorting: false,
        enableGlobalFilter: false,
      },
      {
        accessorKey: "code",
        header: "Promo Code",
        cell: ({ getValue }) => (
          <div className="font-weight-600">{getValue()}</div>
        ),
        size: 200,
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: "discount_type",
        header: "Discount Type",
        cell: ({ getValue }) => {
          const type = getValue();
          return type === 2 || type === "2"
            ? "Percentage (%)"
            : type === 1
            ? "Fixed Amount"
            : type;
        },
        size: 220,
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: "discount",
        header: "Discount",
        cell: ({ getValue, row }) => {
          const value = getValue();
          const type = row.original?.discount_type;
          return type === "percentage" ? `${value}%` : `${value}`;
        },
        size: 220,
        enableSorting: true,
      },
      {
        accessorKey: "min_cap",
        header: "Min Order",
        cell: ({ getValue }) => (getValue() ? `${getValue()}` : "No minimum"),
        size: 180,
        enableSorting: true,
      },
      {
        accessorKey: "max_cap",
        header: "Max Discount",
        cell: ({ getValue }) => (getValue() ? `${getValue()}` : "No limit"),
        size: 180,
        enableSorting: true,
      },
      {
        accessorKey: "usage_limit",
        header: "Usage Limit",
        cell: ({ getValue }) => (getValue() ? getValue() : "Unlimited"),
        size: 180,
        enableSorting: true,
      },
      {
        accessorKey: "used_count",
        header: "Used",
        cell: ({ getValue }) => getValue() || 0,
        size: 120,
        enableSorting: true,
      },
      {
        accessorKey: "valid_from",
        header: "Valid From",
        accessorFn: (row) => moment(row.valid_from).format("MMM DD, YYYY"),
        cell: ({ row }) => (
          <div className="text-muted">
            {moment(row.original.valid_from).format("MMM DD, YYYY")}
          </div>
        ),
        size: 190,
        enableSorting: true,
      },
      {
        accessorKey: "valid_to",
        header: "Valid To",
        accessorFn: (row) => moment(row.valid_to).format("MMM DD, YYYY"),
        cell: ({ row }) => (
          <div className="text-muted">
            {moment(row.original.valid_to).format("MMM DD, YYYY")}
          </div>
        ),
        size: 160,
        enableSorting: true,
      },
      {
        accessorKey: "status",
        header: "Status",
        accessorFn: (row) => (row.status === "A" ? "Active" : "Inactive"),
        cell: ({ row }) => (
          <span
            className={`status-badge ${
              row.original.status === "A" ? "active" : "inactive"
            }`}
          >
            {row.original.status === "A" ? "Active" : "Inactive"}
          </span>
        ),
        size: 170,
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const item = row.original;
          return PERMISSION?.add_edit === "Y" ||
            PERMISSION?.change_status === "Y" ||
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
        size: 150,
        enableSorting: false,
        enableResizing: false,
        enableGlobalFilter: false,
      },
    ],
    [SKIP, PERMISSION]
  );

  /*********************************************************
   *  This function is use to fetch promocode list
   *********************************************************/
  const getList = () => {
    const options = {
      type: "",
      condition: {
        ...(serverColumnFilters.code
          ? { code: serverColumnFilters.code }
          : null),
        ...(serverColumnFilters.discount_type
          ? { discount_type: serverColumnFilters.discount_type }
          : null),
        ...(serverColumnFilters.status
          ? { statusSearch: serverColumnFilters.status }
          : null),
        ...(showRequest ? { status: showRequest } : null),
      },
      skip: SKIP ? SKIP : 0,
      limit: LIMIT ? LIMIT : 10,
    };
    dispatch(fetchPromocodesList(options));
  }; //End

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
        changePromocodeStatus({ editId: id, status })
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
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = "Farmer Store || Admin || Promocode's List";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, showRequest, LIMIT]);

  return (
    <>
      <div className="admin-page-container" ref={targetRef}>
        <Top_navbar title="Promocodes" />

        {/* <div className="page-header">
          <h1 className="page-title">Promocode Management</h1>
          <p className="page-subtitle">Manage your promocodes, view their details, and track their activity</p>
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
              emptyStateMessage="No promocodes found"
              activeTab={activeTab}
              targetRef={targetRef}
            />
          </div>
        </div>
      </div>
    </>
  );
}
