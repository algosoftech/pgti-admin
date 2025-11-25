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

import { InfoCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

import moment from "moment";
import { usePermissions } from "../../../../controllers/PermissionContext";
import "../../admin-pages.css";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import {
  fetchFaqsList,
  changeFaqStatus,
  deleteFaqAction,
  setCurrentPage,
  setLimit,
  setFilter,
  resetFilter,
  setShowRequest,
} from "../../../../store/faqSlice";
import ShowData from "../../../../components/ShowData";

export default function FaqList() {
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
  } = useAppSelector((state) => state.faqs);

  const [isFilterShow, setFilterShow] = useState(false);
  const handleFilterDrawer = () => setFilterShow(!isFilterShow);
  const PERMISSION = usePermissions("faqs");
  const [activeTab, setActiveTab] = useState("all");
  const [helpText, setHelpText] = useState("");
  const [serverColumnFilters, setServerColumnFilters] = useState({});

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    dispatch(setShowRequest(tab === "all" ? "" : tab.toUpperCase()));
  };
  
  const handleEdit = async (item = {}) => {
    navigate("/admin/cms/faqs/addeditdata", { state: item });
  };

  /*********************************************************
   *  This function is use to fetch FAQ list
   *********************************************************/
  const getList = () => {
    const options = {
      type: "",
      condition: {        
        ...(serverColumnFilters.question ? { question: serverColumnFilters.question } : null),
        ...(serverColumnFilters.answer ? { answer: serverColumnFilters.answer } : null),
        ...(serverColumnFilters.tag ? { tag: serverColumnFilters.tag } : null),
        ...(showRequest ? { status: showRequest } : null),
      },
      skip: SKIP ? SKIP : 0,
      limit: LIMIT ? LIMIT : 10,
    };
    dispatch(fetchFaqsList(options));
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
        changeFaqStatus({ editId: id, status })
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

  /*********************************************************
   *  This function is use to handle delete FAQ
   *********************************************************/
  const handleDelete = (item) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this FAQ?',
      icon: <ExclamationCircleOutlined />,
      content: `Question: ${item?.question?.substring(0, 50)}${item?.question?.length > 50 ? '...' : ''}`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const result = await dispatch(
            deleteFaqAction({ editId: item.id })
          ).unwrap();
          
          notification.open({
            message: "Success",
            description: result.message || `FAQ deleted successfully.`,
            placement: "topRight",
            icon: <CheckCircleOutlined style={{ color: "green" }} />,
            duration: 2,
          });
          
          // Refresh the list after delete
          getList();
        } catch (error) {
          notification.open({
            message: "Oops!",
            description: error || `Failed to delete FAQ. Please try again.`,
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
   *  Debounce effect for server-side COLUMN filters only
   *********************************************************/
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      // Reset to page 1 when filters change
      if (currentPage !== 1) {
        dispatch(setCurrentPage(1));
      } else {
        getList();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverColumnFilters]); // Only column filters, NOT global search
  
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
    document.title = "Farmer Store || Admin || FAQ's List";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, showRequest, filter, LIMIT]);

  // Define columns for EnhancedTable
  const columns = useMemo(
    () => [
      {
        id: 'index',
        header: '#',
        cell: ({ row }) => {
          const index = ALLLISTDATA.findIndex(item => item.id === row.original.id);
          return <div>{index + SKIP + 1}</div>;
        },
        size: 60,
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: 'question',
        header: 'Question',
        cell: ({ getValue }) => (
          <div className="font-weight-600" style={{ maxWidth: "300px" }}>
            {getValue() || "N/A"}
          </div>
        ),
        size: 300,
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: 'answer',
        header: 'Answer',
        cell: ({ getValue }) => {
          const answer = getValue() || "N/A";
          return (
            <div className="text-muted" style={{ maxWidth: "300px" }}>
              {answer.length > 100 ? `${answer.substring(0, 100)}...` : answer}
            </div>
          );
        },
        size: 300,
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: 'tag',
        header: 'Tag',
        cell: ({ getValue }) => (
          <div className="font-weight-600">
            {getValue() || "N/A"}
          </div>
        ),
        size: 150,
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: 'created_at',
        header: 'Created',
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
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
          const status = getValue();
          return (
            <span className={`status-badge ${status === "A" ? "active" : "inactive"}`}>
              {status === "A" ? "Active" : "Inactive"}
            </span>
          );
        },
        size: 120,
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const item = row.original;
          return (
            (PERMISSION?.add_edit === "Y" || 
             PERMISSION?.change_status === "Y" || 
             PERMISSION?.delete === "Y" ||
             PERMISSION?.fullAccess === "Y") ? (
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
            )
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
        <Top_navbar title="FAQs" />
        
        <div className="page-header">
          {/* <h1 className="page-title">FAQ Management</h1> */}
          {/* <p className="page-subtitle">Manage your FAQs, view their details, and track their activity</p> */}
        </div>

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
              emptyStateMessage="No FAQs found"
              activeTab={activeTab}
              targetRef={targetRef}
              exportFileName="faqs"
            />
          </div>
        </div>
      </div>
    </>
  );
}

