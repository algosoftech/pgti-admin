import React, { useEffect, useState, useRef, useMemo } from "react";
import { Dropdown, notification, Modal } from "antd";
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
import ListingBannerPreviewModal from "components/cms/ListingBannerPreviewModal";
import EnhancedTable from 'components/table/EnhancedTable/EnhancedTable';

import { useNavigate } from "react-router-dom";

import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  PictureOutlined,
} from "@ant-design/icons";

import moment from "moment";
import { usePermissions } from 'contexts/PermissionContext';
import "styles/admin-pages.css";
import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
  fetchArticlesList,
  changeArticleStatus,
  deleteArticleAction,
  setCurrentPage,
  setLimit,
  setShowRequest,
} from 'store/slices/articles.slice';
import { getArticleListingBanner } from 'services/articles.service';
import { resolvePreviewMediaUrl } from "services/media.service";

export default function ArticleList() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const targetRef = useRef(null);
  const user = JSON.parse(sessionStorage.getItem("ADMIN-INFO"));

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
  } = useAppSelector((state) => state.articles);

  const PERMISSION = usePermissions("articles");
  const [activeTab, setActiveTab] = useState("all");
  const [listingBanner, setListingBanner] = useState(null);
  const [bannerPreviewOpen, setBannerPreviewOpen] = useState(false);
  const canEdit = user?.admin_type === "Super Admin" || PERMISSION?.add_edit === "Y" || PERMISSION?.fullAccess === "Y";
  const canStatus = user?.admin_type === "Super Admin" || PERMISSION?.change_status === "Y" || PERMISSION?.fullAccess === "Y";
  const canDelete = user?.admin_type === "Super Admin" || PERMISSION?.delete === "Y" || PERMISSION?.fullAccess === "Y";

  // Server-side filter state
  const [serverColumnFilters, setServerColumnFilters] = useState({
    title: "",
    category: "",
    status: "",
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    dispatch(setShowRequest(tab === "all" ? "" : tab.toUpperCase()));
  };

  const handleEdit = async (item = {}) => {
    navigate("/admin/articles/addeditdata", { state: item });
  };

  const loadListingBanner = async () => {
    const response = await getArticleListingBanner();
    if (response?.status) {
      setListingBanner(response.result || null);
    }
  };

  const openListingBannerEditor = () => {
    navigate("/admin/articles/listing-banner", { state: listingBanner || {} });
  };

  const handleListingBannerClick = () => {
    if (!listingBanner) {
      openListingBannerEditor();
      return;
    }
    setBannerPreviewOpen(true);
  };

  const confirmBannerEdit = () => {
    Modal.confirm({
      title: "Edit articles listing banner?",
      icon: <ExclamationCircleOutlined />,
      content: "This will open the articles listing banner editor. Do you want to continue?",
      okText: "Yes, Edit",
      cancelText: "Cancel",
      onOk: () => {
        setBannerPreviewOpen(false);
        openListingBannerEditor();
      },
    });
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
        size: 110,
        enableSorting: true,
        enableGlobalFilter: false,
        enableHiding: true,
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ getValue }) => (
          <div className="font-weight-600">{getValue() || "N/A"}</div>
        ),
        size: 250,
        enableSorting: true,
        enableColumnFilter: true,
        enableHiding: true,
      },
      {
        accessorKey: "sort_description",
        header: "Short Description",
        cell: ({ getValue }) => {
          const desc = getValue() || "N/A";
          return (
            <div className="text-muted" style={{ maxWidth: "300px" }}>
              {desc.length > 100 ? `${desc.substring(0, 100)}...` : desc}
            </div>
          );
        },
        size: 250,
        enableSorting: false,
        enableGlobalFilter: true,
        enableHiding: true,
        enableColumnFilter: false,
      },
      {
        accessorKey: "image",
        header: "Image",
        cell: ({ getValue, row }) => {
          const image = getValue();
          return image ? (
            <img
              src={resolvePreviewMediaUrl(image)}
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
        size: 150,
        enableSorting: false,
        enableGlobalFilter: false,
        enableHiding: true,
        enableColumnFilter: false,
      },
      {
        accessorKey: "category_name",
        header: "Category",
        cell: ({ getValue }) => (
          <div className="font-weight-600">
            {getValue() ? getValue() : "N/A"}
          </div>
        ),
        size: 200,
        enableSorting: true,
        enableColumnFilter: true,
        enableHiding: true,
      },
      {
        accessorKey: "tags",
        header: "Tags",
        cell: ({ getValue }) => {
          const tags = getValue();
          if (!tags) return <span className="text-muted">N/A</span>;
          const tagArray =
            typeof tags === "string"
              ? tags.split(",").map((t) => t.trim())
              : tags;
          return (
            <div style={{ maxWidth: "200px" }}>
              {tagArray.slice(0, 2).map((tag, idx) => (
                <span
                  key={idx}
                  className="tag-badge"
                  style={{ marginRight: "4px", marginBottom: "4px" }}
                >
                  {tag}
                </span>
              ))}
              {tagArray.length > 2 && (
                <span className="text-muted">+{tagArray.length - 2}</span>
              )}
            </div>
          );
        },
        size: 200,
        enableSorting: false,
        enableGlobalFilter: true,
        enableHiding: true,
      },
      {
        accessorKey: "created_at",
        header: "Created",
        accessorFn: (row) =>
          moment(row.created_at).format("MMM DD, YYYY HH:mm"),
        cell: ({ row }) => (
          <>
            <div className="text-muted">
              {moment(row.original.created_at).format("MMM DD, YYYY")}
            </div>
            <div className="text-muted small">
              {moment(row.original.created_at).format("HH:mm")}
            </div>
          </>
        ),
        size: 250,
        enableSorting: true,
        enableColumnFilter: false,
        enableResizing: true,
        enableGlobalFilter: true,
        enableHiding: true,
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
        size: 120,
        enableSorting: true,
        enableColumnFilter: false,
        enableResizing: true,
        enableGlobalFilter: true,
        enableHiding: true,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const item = row.original;
          return canEdit || canStatus || canDelete ? (
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
        size: 120,
        enableSorting: false,
        enableResizing: false,
        enableGlobalFilter: false,
      },
    ],
    [SKIP, canDelete, canEdit, canStatus]
  );

  /*********************************************************
   *  This function is use to fetch articles list
   *********************************************************/
  const getList = () => {
    const options = {
      type: "",
      condition: {
        ...(serverColumnFilters.title
          ? { title: serverColumnFilters.title }
          : null),
        ...(serverColumnFilters.category_name
          ? { category_name: serverColumnFilters.category_name }
          : null),
        ...(showRequest ? { status: showRequest } : null),
      },
      skip: SKIP ? SKIP : 0,
      limit: LIMIT ? LIMIT : 10,
    };
    dispatch(fetchArticlesList(options));
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
        changeArticleStatus({ editId: id, status })
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
   *  This function is use to handle delete article
   *********************************************************/
  const handleDelete = (item) => {
    Modal.confirm({
      title: "Are you sure you want to delete this article?",
      icon: <ExclamationCircleOutlined />,
      content: `Title: ${item?.title?.substring(0, 50)}${
        item?.title?.length > 50 ? "..." : ""
      }`,
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const result = await dispatch(
            deleteArticleAction({ editId: item.id })
          ).unwrap();

          notification.open({
            message: "Success",
            description: result.message || `Article deleted successfully.`,
            placement: "topRight",
            icon: <CheckCircleOutlined style={{ color: "green" }} />,
            duration: 2,
          });

          // Refresh the list after delete
          getList();
        } catch (error) {
          notification.open({
            message: "Oops!",
            description: error || `Failed to delete article. Please try again.`,
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
        {canEdit && (
          <button
            className="action-dropdown-item"
            onClick={() => handleEdit(items)}
          >
            <FontAwesomeIcon icon={faEdit} />
            <span>Edit</span>
          </button>
        )}
        {canStatus &&
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
        {canDelete && (
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
    loadListingBanner();
    getList();
    if (targetRef.current) {
      targetRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = "PGTI || Admin || Articles List";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, showRequest, LIMIT]);

  return (
    <>
      <div className="admin-page-container" ref={targetRef}>
        <Top_navbar title="Articles" />

        {/* <div className="page-header">
          <h1 className="page-title">Article Management</h1>
          <p className="page-subtitle">Manage your articles, view their details, and track their activity</p>
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

              {canEdit && (
                <button
                  className="action-button secondary"
                  onClick={handleListingBannerClick}
                >
                  {listingBanner ? <EyeOutlined /> : <PictureOutlined />}
                  {listingBanner ? "Preview Listing Banner" : "Add Listing Banner"}
                </button>
              )}

              {canEdit && (
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
              emptyStateMessage="No articles found"
              activeTab={activeTab}
              targetRef={targetRef}
            />
          </div>
        </div>

        <ListingBannerPreviewModal
          open={bannerPreviewOpen}
          onCancel={() => setBannerPreviewOpen(false)}
          banner={listingBanner}
          title="Articles Listing Banner Preview"
          description="Review the current banner that will be sent in the front Articles listing API."
          onEdit={confirmBannerEdit}
        />
      </div>
    </>
  );
}
