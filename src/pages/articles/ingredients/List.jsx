import React, { useEffect, useState, useRef, useMemo } from "react";
import { Dropdown, notification, Modal, Select } from "antd";
import {
  faEdit,
  faThumbsUp,
  faThumbsDown,
  faPlus,
  faRefresh,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";

import Top_navbar from 'components/layout/TopNavbar';
import EnhancedTable from 'components/table/EnhancedTable/EnhancedTable';

import { useNavigate, useLocation } from "react-router-dom";

import { InfoCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

import moment from "moment";
import { usePermissions } from 'contexts/PermissionContext';
import "styles/admin-pages.css";
import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
  fetchIngredientsList,
  changeIngredientStatus,
  deleteIngredientAction,
  setCurrentPage,
  setLimit,
  setShowRequest,
} from 'store/slices/ingredients.slice';
import { list as fetchArticles } from 'services/articles.service';
import { list as fetchProducts } from 'services/product.service';
import { list as fetchProductVariants } from 'services/productVariant.service';

const { Option } = Select;

export default function IngredientList() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const targetRef = useRef(null);
  const articleIdFromState = location?.state?.article_id;

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
  } = useAppSelector((state) => state.ingredients);

  const PERMISSION = usePermissions("ingredients");
  const [activeTab, setActiveTab] = useState("all");
  const [articles, setArticles] = useState([]);
  const [products, setProducts] = useState([]);
  const [productVariants, setProductVariants] = useState([]);
  const [selectedArticleId, setSelectedArticleId] = useState(articleIdFromState || "");
  
  // Server-side filter state
  const [serverColumnFilters, setServerColumnFilters] = useState({
    article_id: articleIdFromState || "",
    product_id: "",
    status: "",
  });

  // Fetch articles, products, and variants for display
  useEffect(() => {
    const loadData = async () => {
      try {
        const [articlesResult, productsResult, variantsResult] = await Promise.all([
          fetchArticles({
            type: "",
            condition: { status: "A" },
            skip: 0,
            limit: 1000,
          }),
          fetchProducts({
            type: "",
            condition: { status: "A" },
            skip: 0,
            limit: 1000,
          }),
          fetchProductVariants({
            type: "",
            condition: { status: "A" },
            skip: 0,
            limit: 1000,
          }),
        ]);

        if (articlesResult.status === true && articlesResult.result) {
          setArticles(articlesResult.result);
        }
        if (productsResult.status === true && productsResult.result) {
          setProducts(productsResult.result);
        }
        if (variantsResult.status === true && variantsResult.result) {
          setProductVariants(variantsResult.result);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
  }, []);

  const getArticleTitle = (articleId) => {
    const article = articles.find((art) => art.id === articleId);
    return article?.title || "Unknown Article";
  };

  const getProductTitle = (productId) => {
    const product = products.find((prod) => prod.id === productId);
    return product?.title || "Unknown Product";
  };

  const getVariantTitle = (variantId) => {
    const variant = productVariants.find((varItem) => varItem.id === variantId);
    return variant?.title || variant?.unit || "N/A";
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    dispatch(setShowRequest(tab === "all" ? "" : tab.toUpperCase()));
  };
  
  const handleEdit = async (item = {}) => {
    navigate("/admin/articles/ingredients/addeditdata", { state: item });
  };

  const handleArticleFilterChange = (value) => {
    setSelectedArticleId(value);
    setServerColumnFilters(prev => ({ ...prev, article_id: value || "" }));
  };

  // Define table columns
  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            style={{ cursor: 'pointer' }}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            style={{ cursor: 'pointer' }}
          />
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
        size: 80,
        enableSorting: true,
        enableGlobalFilter: false,
        enableHiding: true,
      },
      {
        accessorKey: 'article_id',
        header: 'Article',
        cell: ({ getValue }) => (
          <div className="font-weight-600">
            {getValue() ? getArticleTitle(getValue()) : "N/A"}
          </div>
        ),
        size: 250,
        enableSorting: true,
        enableColumnFilter: true,
        enableHiding: true,
      },
      {
        accessorKey: 'product_id',
        header: 'Product',
        cell: ({ getValue }) => (
          <div className="font-weight-600">
            {getValue() ? getProductTitle(getValue()) : "N/A"}
          </div>
        ),
        size: 250,
        enableSorting: true,
        enableColumnFilter: true,
        enableHiding: true,
      },
      {
        accessorKey: 'variant_id',
        header: 'Variant',
        cell: ({ getValue }) => (
          <div className="text-muted">
            {getValue() ? getVariantTitle(getValue()) : "N/A"}
          </div>
        ),
        size: 200,
        enableSorting: true,
        enableColumnFilter: true,
        enableHiding: true,
      },
      {
        accessorKey: 'qty',
        header: 'Quantity',
        cell: ({ getValue }) => (
          <div className="font-weight-600">
            {getValue() || 0}
          </div>
        ),
        size: 120,
        enableSorting: true,
        enableColumnFilter: false,
        enableHiding: true,
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
        enableColumnFilter: false,
        enableHiding: true,
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
        size: 120,
        enableSorting: true,
        enableColumnFilter: true,
        enableHiding: true,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const item = row.original;
          return (PERMISSION?.add_edit === "Y" || PERMISSION?.change_status === "Y" || PERMISSION?.delete === "Y" || PERMISSION?.fullAccess === "Y") ? (
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
    [SKIP, PERMISSION, articles, products, productVariants]
  );

  /*********************************************************
   *  This function is use to fetch ingredients list
   *********************************************************/ 
  const getList = () => {
    const options = {
      type: "",
      condition: {
        ...(serverColumnFilters.article_id ? { article_id: serverColumnFilters.article_id } : null),
        ...(serverColumnFilters.product_id ? { product_id: serverColumnFilters.product_id } : null),
        ...(serverColumnFilters.status ? { statusSearch: serverColumnFilters.status } : null),
        ...(showRequest ? { status: showRequest } : null),
      },
      skip: SKIP ? SKIP : 0,
      limit: LIMIT ? LIMIT : 10,
    };
    dispatch(fetchIngredientsList(options));
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
        changeIngredientStatus({ editId: id, status })
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
   *  This function is use to handle delete ingredient
   *********************************************************/
  const handleDelete = (item) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this ingredient?',
      icon: <ExclamationCircleOutlined />,
      content: `Article: ${getArticleTitle(item?.article_id)}, Product: ${getProductTitle(item?.product_id)}`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const result = await dispatch(
            deleteIngredientAction({ editId: item.id })
          ).unwrap();
          
          notification.open({
            message: "Success",
            description: result.message || `Ingredient deleted successfully.`,
            placement: "topRight",
            icon: <CheckCircleOutlined style={{ color: "green" }} />,
            duration: 2,
          });
          
          // Refresh the list after delete
          getList();
        } catch (error) {
          notification.open({
            message: "Oops!",
            description: error || `Failed to delete ingredient. Please try again.`,
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
    document.title = "PGTI || Admin || Ingredients List";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, showRequest, LIMIT]);

  return (
    <>
      <div className="admin-page-container" ref={targetRef}>
        <Top_navbar title="Ingredients" />
        
        <div className="page-header">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="form-group" style={{ minWidth: "300px" }}>
              <label htmlFor="article_filter" className="form-label">
                Filter by Article
              </label>
              <Select
                id="article_filter"
                placeholder="Select an article"
                value={selectedArticleId || undefined}
                onChange={handleArticleFilterChange}
                allowClear
                style={{ width: "100%" }}
                size="large"
              >
                {articles.map((article) => (
                  <Option key={article.id} value={article.id}>
                    {article.title}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
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
                  onClick={() => handleEdit({ article_id: selectedArticleId })}
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
              emptyStateMessage="No ingredients found"
              activeTab={activeTab}
              targetRef={targetRef}
            />
          </div>
        </div>
      </div>
    </>
  );
}

