import React, { useEffect, useState, useRef, useMemo } from "react";
import { Dropdown, notification } from "antd";
import {
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
  fetchProductsList,
  changeProductStatus,
  setCurrentPage,
  setLimit,
  setShowRequest,
} from "../../../store/productSlice";
import ShowData from "../../../components/ShowData";
import { list as fetchCategories } from "../../../controllers/V1/categoryController";
import { list as fetchSubCategories } from "../../../controllers/V1/subCategoryController";
import EnhancedTable from "../../../components/EnhancedTable/EnhancedTable";

/**
 * ProductList Component - Uses EnhancedTable for Advanced TanStack React Table Features
 * 
 * This component uses the reusable EnhancedTable component which provides:
 * 1. ✅ Column Sorting - Click column headers to sort (CLIENT-SIDE: ascending/descending)
 * 2. ✅ Column Resizing - Drag the right edge of column headers to resize
 * 3. ✅ Column Reordering - Drag columns by the grip icon to reorder
 * 4. ✅ Row Selection - Select multiple rows with checkboxes
 * 5. ✅ Virtual Scrolling - Optimized rendering for large datasets
 * 6. ✅ Global Filtering - Search across all columns (CLIENT-SIDE: instant search)
 * 7. ✅ Column Filtering - Filter individual columns (SERVER-SIDE with 500ms debounce)
 * 8. ✅ Toggle Column Filters - Show/hide column filter row for cleaner view
 * 9. ✅ Server-Side Pagination - TanStack pagination with API integration
 * 10. ✅ Column Pinning - Freeze columns to left or right while scrolling
 * 11. ✅ Fullscreen Mode - Expand table to fill entire screen
 * 12. ✅ Column Visibility - Show/hide columns via modal
 * 
 * Filtering & Pagination modes:
 * - Global search: CLIENT-SIDE (instant, no API calls, searches loaded data)
 * - Column filters: SERVER-SIDE (debounced 500ms, sends to API)
 * - Pagination: SERVER-SIDE (fetches data from API per page)
 * - Column filters send: title, categorySearch, subCategorySearch, statusSearch
 * - Column filters automatically reset to page 1 when changed
 */
export default function ProductList() {
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
  } = useAppSelector((state) => state.products);

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const PERMISSION = usePermissions("products");
  const [activeTab, setActiveTab] = useState("all");
  
  // Filter state (server-side column filters)
  const [serverColumnFilters, setServerColumnFilters] = useState({
    title: "",
    category: "",
    subCategory: "",
    status: "",
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    dispatch(setShowRequest(tab === "all" ? "" : tab.toUpperCase()));
  };
  
  const handleEdit = async (item = {}) => {
    navigate("/admin/products/addeditdata", { state: item });
  };

  // Fetch categories and sub-categories for display
  useEffect(() => {
    const loadData = async () => {
      try {
        const [catResult, subCatResult] = await Promise.all([
          fetchCategories({
            type: "",
            condition: { status: "A" },
            skip: 0,
            limit: 1000,
          }),
          fetchSubCategories({
            type: "",
            condition: { status: "A" },
            skip: 0,
            limit: 1000,
          }),
        ]);

        if (catResult.status === true && catResult.result) {
          setCategories(catResult.result);
        }
        if (subCatResult.status === true && subCatResult.result) {
          setSubCategories(subCatResult.result);
        }
      } catch (error) {
        console.error("Error loading categories/sub-categories:", error);
      }
    };
    loadData();
  }, []);

  // Define table columns
  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            style={{ cursor: 'pointer' }}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
            style={{ cursor: 'pointer' }}
          />
        ),
        size: 60,
        enableSorting: false,
        enableResizing: false,
        enableGlobalFilter: false, // Don't search checkbox column
      },
      {
        accessorKey: 'index',
        header: '#',
        cell: ({ row }) => row.index + SKIP + 1,
        size: 100,
        enableSorting: true,
        enableGlobalFilter: false, // Don't search index column
      },
      {
        accessorKey: 'title',
        header: 'Product',
        cell: ({ getValue }) => (
          <div className="font-weight-600">{getValue()}</div>
        ),
        size: 250,
        enableSorting: true,
        enableColumnFilter: true, 
        enableResizing: true,
        enableGlobalFilter: true,
      },
      {
        accessorKey: 'category_name',
        header: 'Category',
        cell: ({ getValue }) => (
          <div className="font-weight-500">
            {getValue()}
          </div>
        ),
        size: 180,
        enableSorting: true,
        enableColumnFilter: true,
        enableResizing: true,
        enableGlobalFilter: true,
      },
      {
        accessorKey: 'sub_category_name',
        header: 'Sub-Category',
        cell: ({ getValue }) => (
          <div className="font-weight-500">
            {getValue()}
          </div>
        ),
        size: 220,
        enableSorting: true,
        enableColumnFilter: true, 
        enableResizing: true,
        enableGlobalFilter: true,
      },
      {
        accessorKey: 'image',
        header: 'Image',
        cell: ({ getValue, row }) => {
          const image = getValue();
          const imageArray = image ? JSON.parse(image) : [];
          return imageArray.length > 0 ? (
            <img
              src={`${process.env.REACT_APP_IMAGE_BASE_URL}${imageArray[0]}`}
              alt={row.original?.title}
              style={{
                width: "50px",
                height: "50px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
          ) : (
            <span className="text-muted">No Image</span>
          );
        },
        size: 100,
        enableSorting: false,
        enableGlobalFilter: false, 
        enableColumnFilter: false
      },
      {
        accessorKey: 'created_at',
        header: 'Created',
        accessorFn: (row) => moment(row.created_at).format("MMM DD, YYYY HH:mm"),
        cell: ({ row }) => {
          const date = row.original.created_at;
          return (
            <>
              <div className="text-muted">
                {moment(date).format("MMM DD, YYYY")}
              </div>
              <div className="text-muted small">
                {moment(date).format("HH:mm")}
              </div>
            </>
          );
        },
        size: 180,
        enableSorting: true,
        enableColumnFilter: false,
        enableResizing: true,
        enableGlobalFilter: true,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        accessorFn: (row) => row.status === "A" ? "Active" : "Inactive",
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <span className={`status-badge ${status === "A" ? "active" : "inactive"}`}>
              {status === "A" ? "Active" : "Inactive"}
            </span>
          );
        },
        size: 120,
        enableSorting: true,
        enableColumnFilter: false
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const item = row.original;
          return (
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
          );
        },
        size: 120,
        enableSorting: false,
        enableResizing: false,
        enableGlobalFilter: false, // Don't search actions column
      },
    ],
    [SKIP, categories, subCategories, PERMISSION]
  );


  /*********************************************************
   *  This function is use to fetch product list with server-side column filters
   *********************************************************/
  const getList = () => {
    const {title, category_name, sub_category_name} = serverColumnFilters;
    const options = {
      type: "",
      condition: {
        // Server-side column filters
        ...(title ? { title: title } : null),
        ...(category_name ? { category_name: category_name } : null),
        ...(sub_category_name ? { sub_category_name: sub_category_name } : null),
        
        // Tab filter (status)
        ...(showRequest ? { status: showRequest } : null),
      },
      skip: SKIP ? SKIP : 0,
      limit: LIMIT ? LIMIT : 10,
    };
    dispatch(fetchProductsList(options));
  }; //End

  const handleLimitChange = (limit) => {
    dispatch(setLimit(Number(limit)));
    // Scroll to top when limit changes
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
        changeProductStatus({ editId: id, status })
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
    document.title = "Farmer Store || Admin || Product's List";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, showRequest, LIMIT]);

  return (
    <>
      <div className="admin-page-container" ref={targetRef}>
        <Top_navbar title="Products" />
        
        <div className="page-header">
          {/* <h1 className="page-title">Product Management</h1> */}
          {/* <p className="page-subtitle">Manage your products, view their details, and track their activity</p> */}
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
                Refresh Data
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
              emptyStateMessage="No products found"
              activeTab={activeTab}
              targetRef={targetRef}
            />
          </div>
        </div>
      </div>
    </>
  );
}

