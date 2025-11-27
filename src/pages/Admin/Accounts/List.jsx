import React, { useEffect, useState, useRef, useMemo } from "react";
import PropTypes from "prop-types";
import { Dropdown, notification } from "antd";
import { 
  faEdit, 
  faEllipsis, 
  faPlus, 
  faRefresh, 
  faUserShield,
  faEye,
  faTrash,
  faThumbsUp,
  faThumbsDown
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Top_navbar from "../components/Top_navbar";
import { Link, useNavigate } from "react-router-dom";

import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  LikeOutlined,
  DislikeOutlined,
} from "@ant-design/icons";

import moment from "moment";
import SkeltonList from "../components/SkeltonEffect/list";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  fetchAccountsList,
  changeAccountStatus,
  setCurrentPage,
  setLimit,
  setShowRequest,
} from "../../../store/accountsSlice";
import ShowData from "../../../components/ShowData";
import "../admin-pages.css";
import EnhancedTable from "../../../components/EnhancedTable/EnhancedTable";


export default function SubAdminList() {
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
    count,
  } = useAppSelector((state) => state.accounts);

  const [popUpOpen, setPopUpOpen] = useState(false);
  const togglePopUp = () => {
    setPopUpOpen(!popUpOpen);
  };

  const [activeTab, setActiveTab] = useState("all");
  
  // Server-side filter state
  const [serverColumnFilters, setServerColumnFilters] = useState({
    name: "",
    email: "",
    phone: "",
    status: "",
  });
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    dispatch(setShowRequest(tab === "all" ? "" : tab.toUpperCase()));
  };

  const handleEdit = async (item = {}) => {
    navigate("/sub-admin/addeditdata", { state: item });
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
        size: 90,
        enableSorting: false,
        enableGlobalFilter: false,
      },
      {
        accessorKey: 'name',
        header: 'Administrator',
        cell: ({ getValue }) => (
          <div className="d-flex align-items-center">
            <div>
              <div className="font-weight-600">{getValue()}</div>
            </div>
          </div>
        ),
        size: 210,
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: 'contact',
        header: 'Contact',
        accessorFn: (row) => `${row.phone || ""} ${row.email || ""}`,
        cell: ({ row }) => (
          <div>
            <div className="font-weight-500">{row.original.phone}</div>
            <div className="text-muted small">{row.original.email}</div>
          </div>
        ),
        size: 250,
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: 'login_at',
        header: 'Last Login',
        accessorFn: (row) => row.login_at ? moment(row.login_at).format("MMM DD, YYYY HH:mm") : "Never",
        cell: ({ row }) => (
          <div className="text-muted">
            {row.original.login_at ? (
              <>
                <div>{moment(row.original.login_at).format("MMM DD, YYYY")}</div>
                <div className="small">{moment(row.original.login_at).format("HH:mm")}</div>
              </>
            ) : (
              <span className="text-muted">Never</span>
            )}
          </div>
        ),
        size: 180,
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        accessorFn: (row) => row.status === "A" ? "Active" : "Inactive",
        cell: ({ row }) => (
          <span className={`status-badge ${row.original.status === "A" ? "active" : "inactive"}`}>
            {row.original.status === "A" ? "Active" : "Inactive"}
          </span>
        ),
        size: 150,
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="action-dropdown">
              <Dropdown overlay={() => dropdownMenu(item)} placement="bottomRight" trigger={['click']}>
                <button className="action-dropdown-trigger">
                  <FontAwesomeIcon icon={faEllipsis} />
                </button>
              </Dropdown>
            </div>
          );
        },
        size: 120,
        enableSorting: false,
        enableResizing: false,
        enableGlobalFilter: false,
      },
    ],
    [SKIP]
  );

  /*********************************************************
   *  This function is use to fetch accounts list
   *********************************************************/
  const getList = () => {
    console.log("serverColumnFilters : ", serverColumnFilters);
    const {name, contact } = serverColumnFilters;
    let email = "";
    let phone = "";
    if(contact) {
      const isNumberOnly = (contact) => /^[0-9]+$/.test(contact);
      if(isNumberOnly === true){
        phone = parseInt(contact);
      } else{
        email = contact;
      }
    }
    const options = {
      type: "",
      condition: {
        ...(name ? { name: name } : null),
        ...(email ? { email: email } : null),
        ...(phone ? { phone: phone } : null),
        ...(showRequest ? { status: showRequest } : null),
      },
      sort: { id: -1 },
      skip: SKIP ? SKIP : 0,
      limit: LIMIT ? LIMIT : 10,
    };
    dispatch(fetchAccountsList(options));
  }; //End
  /*********************************************************
   *  This function is use to handle status change
   *********************************************************/
  const handleStatusChange = async (status = "", id) => {
    try {
      const result = await dispatch(changeAccountStatus({ id, status }));
      if (changeAccountStatus.fulfilled.match(result)) {
        notification.open({
          message: "Data updated.",
          description: `Data updated successfully.`,
          placement: "topRight",
          icon: <CheckCircleOutlined style={{ color: "green" }} />,
          duration: 2,
        });
        // Refresh the list
        getList();
      } else {
        notification.open({
          message: "Opps!",
          description: result.payload || "Failed to update status.",
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
      }
    } catch (error) {
      notification.open({
        message: "Opps!",
        description: `Operation not perform yet! please try in some time.`,
        placement: "topRight",
        icon: <InfoCircleOutlined style={{ color: "red" }} />,
        duration: 2,
      });
    }
  };


  const dropdownMenu = (items) => {
    return (
      <div className="action-dropdown-menu">
        <button
          className="action-dropdown-item"
          onClick={() => handleEdit(items)}
        >
          <FontAwesomeIcon icon={faEdit} />
          <span>Edit</span>
        </button>
        {items?.status === "I" && (
          <button
            className="action-dropdown-item"
            onClick={() => {
              handleStatusChange("A", items.id);
            }}
          >
            <FontAwesomeIcon icon={faThumbsUp} />
            <span>Activate</span>
          </button>
        )}
        {items?.status === "A" && (
          <button
            className="action-dropdown-item danger"
            onClick={() => {
              handleStatusChange("I", items.id);
            }}
          >
            <FontAwesomeIcon icon={faThumbsDown} />
            <span>Deactivate</span>
          </button>
        )}
      </div>
    );
  };

  /*********************************************************
   *  This function is ued for handle filter input chnage
   *********************************************************/
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
    targetRef.current.scrollIntoView({
      behavior:'smooth',
    });
    window.scrollTo({top: 0,behavior: "smooth"});
    document.title = "Farmer Store || Admin || Sub Admin List";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, showRequest, popUpOpen, LIMIT]);

  return (
    <>
      <div className="admin-page-container" ref={targetRef}>
        <Top_navbar title="Sub Administrators" />
        
        {/* <div className="page-header">
          <h1 className="page-title">Sub Administrator Management</h1>
          <p className="page-subtitle">Manage sub administrators, their permissions, and access levels</p>
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
              <ShowData setLimit={(limit) => {
                dispatch(setLimit(Number(limit)));
                if (targetRef.current) {
                  targetRef.current.scrollIntoView({ behavior: "smooth" });
                }
              }} limit={LIMIT} />
              
              <button
                className="action-button secondary"
                onClick={() => getList()}
              >
                <FontAwesomeIcon icon={faRefresh} />
                Refresh
              </button>
              
              <button
                className="action-button primary"
                onClick={() => handleEdit()}
              >
                <FontAwesomeIcon icon={faPlus} />
                Create
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
              permission={{}}
              emptyStateMessage="No administrators found"
              activeTab={activeTab}
              targetRef={targetRef}
            />
          </div>
        </div>
      </div>
    </>
  );
}
