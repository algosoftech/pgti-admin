import React, { useEffect, useRef, useMemo, useState } from "react";
import { Dropdown, notification, Modal } from "antd";
import {
  faEdit,
  faThumbsUp,
  faThumbsDown,
  faPlus,
  faRefresh,
  faTrash,
  faEllipsis,
  faNewspaper,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Top_navbar from "components/layout/TopNavbar";
import EnhancedTable from "components/table/EnhancedTable/EnhancedTable";
import ListSortFilter from "components/common/ListSortFilter";
import { useNavigate } from "react-router-dom";
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  GlobalOutlined,
  EyeOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { usePermissions } from "contexts/PermissionContext";
import "styles/admin-pages.css";
import ListingBannerPreviewModal from "components/cms/ListingBannerPreviewModal";
import { useAppDispatch, useAppSelector } from "store/hooks";
import { getTourTypeLabel } from "utils/tourType";
import {
  fetchNewsList,
  changeNewsStatus,
  deleteNewsAction,
  setCurrentPage,
  setLimit,
  setShowRequest,
} from "store/slices/news.slice";
import { getNewsListingBanner } from "services/news.service";

export default function NewsList() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const targetRef = useRef(null);
  const user = JSON.parse(sessionStorage.getItem("ADMIN-INFO"));

  const {
    listData: ALLLISTDATA,
    isLoading,
    currentPage,
    totalPages: TOTALPAGES,
    limit: LIMIT,
    skip: SKIP,
    showRequest,
    count,
  } = useAppSelector((state) => state.news);

  const PERMISSION = usePermissions("news");
  const [activeTab, setActiveTab] = useState("all");
  const [listingBanner, setListingBanner] = useState(null);
  const [bannerPreviewOpen, setBannerPreviewOpen] = useState(false);
  const [sortState, setSortState] = useState({ sort_by: "", order: "asc" });
  const canEdit = user?.admin_type === "Super Admin" || PERMISSION?.add_edit === "Y" || PERMISSION?.fullAccess === "Y";
  const canStatus = user?.admin_type === "Super Admin" || PERMISSION?.change_status === "Y" || PERMISSION?.fullAccess === "Y";
  const canDelete = user?.admin_type === "Super Admin" || PERMISSION?.delete === "Y" || PERMISSION?.fullAccess === "Y";

  const [serverColumnFilters, setServerColumnFilters] = useState({
    title: "",
    location: "",
    status: "",
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    dispatch(setShowRequest(tab === "A" || tab === "I" ? tab : ""));
  };

  const handleSortChange = (next) => {
    setSortState(next);
    dispatch(setCurrentPage(1));
  };

  const handleEdit = (item = {}) => {
    const state = item?.id ? item : { tour_type: activeTab === "F" ? "F" : "M" };
    navigate("/admin/cms/news/addeditdata", { state });
  };

  const loadListingBanner = async () => {
    const response = await getNewsListingBanner(activeTab === "F" ? "F" : "M");
    if (response?.status) {
      setListingBanner(response.result || null);
    }
  };

  const openListingBannerEditor = () => {
    navigate("/admin/cms/news/listing-banner", { state: listingBanner || { tour_type: activeTab === "F" ? "F" : "M" } });
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
      title: "Edit news listing banner?",
      icon: <ExclamationCircleOutlined />,
      content: "This will open the news listing banner editor. Do you want to continue?",
      okText: "Yes, Edit",
      cancelText: "Cancel",
      onOk: () => {
        setBannerPreviewOpen(false);
        openListingBannerEditor();
      },
    });
  };

  const columns = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input type="checkbox" checked={table.getIsAllRowsSelected()} onChange={table.getToggleAllRowsSelectedHandler()} style={{ cursor: "pointer" }} />
        ),
        cell: ({ row }) => (
          <input type="checkbox" checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} style={{ cursor: "pointer" }} />
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
        size: 70,
        enableSorting: true,
        enableGlobalFilter: false,
        enableHiding: true,
      },
      {
        accessorKey: "image",
        header: "Image",
        cell: ({ getValue, row }) => {
          const image = getValue();
          return image ? (
            <img src={image} alt={row.original?.title} style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 8 }} />
          ) : (
            <span className="text-muted">No Image</span>
          );
        },
        size: 90,
        enableSorting: false,
        enableGlobalFilter: false,
        enableHiding: true,
        enableColumnFilter: false,
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ getValue }) => <div className="font-weight-600">{getValue() || "N/A"}</div>,
        size: 240,
        enableSorting: true,
        enableColumnFilter: true,
        enableHiding: true,
      },
      {
        accessorKey: "location",
        header: "Location",
        cell: ({ getValue }) => (
          <span style={{ fontSize: 12, background: "#f1f5f9", color: "#334155", padding: "2px 8px", borderRadius: 6 }}>
            {getValue() || "—"}
          </span>
        ),
        size: 150,
        enableSorting: true,
        enableColumnFilter: true,
        enableHiding: true,
      },
      {
        accessorKey: "news_date",
        header: "Date",
        cell: ({ getValue }) => (
          <span className="text-muted" style={{ fontSize: 13 }}>
            {getValue() ? moment(getValue()).format("DD MMM, YYYY") : "—"}
          </span>
        ),
        size: 130,
        enableSorting: true,
        enableColumnFilter: false,
        enableHiding: true,
      },
      {
        accessorKey: "is_international",
        header: "Type",
        cell: ({ getValue }) => {
          const isInt = getValue() === 1 || getValue() === true || getValue() === "1";
          return isInt ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, background: "#eff6ff", color: "#1d4ed8", padding: "2px 8px", borderRadius: 6, fontWeight: 600 }}>
              <GlobalOutlined style={{ fontSize: 11 }} /> International
            </span>
          ) : (
            <span style={{ fontSize: 12, background: "#f0fdf4", color: "#16a34a", padding: "2px 8px", borderRadius: 6, fontWeight: 600 }}>
              National
            </span>
          );
        },
        size: 130,
        enableSorting: true,
        enableColumnFilter: false,
        enableHiding: true,
      },
      {
        accessorKey: "tour_type_label",
        header: "Tour Type",
        cell: ({ row }) => (
          <span style={{ fontSize: 12, background: row.original?.tour_type === "F" ? "#fef3c7" : "#e0f2fe", color: row.original?.tour_type === "F" ? "#b45309" : "#075985", padding: "2px 8px", borderRadius: 999, fontWeight: 700 }}>
            {row.original?.tour_type_label || getTourTypeLabel(row.original?.tour_type)}
          </span>
        ),
        size: 140,
        enableSorting: true,
        enableColumnFilter: false,
        enableHiding: true,
      },
      {
        accessorKey: "status",
        header: "Status",
        accessorFn: (row) => (row.status === "A" ? "Active" : "Inactive"),
        cell: ({ row }) => (
          <span className={`status-badge ${row.original.status === "A" ? "active" : "inactive"}`}>
            {row.original.status === "A" ? "Active" : "Inactive"}
          </span>
        ),
        size: 110,
        enableSorting: true,
        enableColumnFilter: false,
        enableHiding: true,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const item = row.original;
          return canEdit || canStatus || canDelete ? (
            <div className="action-dropdown">
              <Dropdown overlay={() => dropdownMenu(item)} placement="bottomRight" trigger={["click"]}>
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
        enableResizing: false,
        enableGlobalFilter: false,
      },
    ],
    [SKIP, canDelete, canEdit, canStatus]
  );

  const getList = () => {
    const options = {
      type: "",
      condition: {
        ...(serverColumnFilters.title ? { title: serverColumnFilters.title } : null),
        ...(serverColumnFilters.location ? { location: serverColumnFilters.location } : null),
        ...(showRequest ? { status: showRequest } : null),
        ...(activeTab === "F" ? { tour_type: "F" } : null),
      },
      ...(sortState.sort_by ? { sort_by: sortState.sort_by, order: sortState.order } : null),
      skip: SKIP || 0,
      limit: LIMIT || 10,
    };
    dispatch(fetchNewsList(options));
  };

  const handleChangeStatus = async (id = "", status = "") => {
    if (!id || !status) return;
    try {
      const result = await dispatch(changeNewsStatus({ editId: id, status })).unwrap();
      notification.open({ message: "Success", description: result.message || "Status changed successfully.", placement: "topRight", icon: <CheckCircleOutlined style={{ color: "green" }} />, duration: 2 });
      getList();
    } catch (error) {
      notification.open({ message: "Oops!", description: error || "Operation failed. Please try again.", placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
    }
  };

  const handleDelete = (item) => {
    Modal.confirm({
      title: "Are you sure you want to delete this news item?",
      icon: <ExclamationCircleOutlined />,
      content: `Title: ${item?.title?.substring(0, 60)}${item?.title?.length > 60 ? "..." : ""}`,
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const result = await dispatch(deleteNewsAction({ editId: item.id })).unwrap();
          notification.open({ message: "Success", description: result.message || "News deleted successfully.", placement: "topRight", icon: <CheckCircleOutlined style={{ color: "green" }} />, duration: 2 });
          getList();
        } catch (error) {
          notification.open({ message: "Oops!", description: error || "Failed to delete. Please try again.", placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
        }
      },
    });
  };

  const dropdownMenu = (items) => (
    <div className="action-dropdown-menu">
      {canEdit && (
        <button className="action-dropdown-item" onClick={() => handleEdit(items)}>
          <FontAwesomeIcon icon={faEdit} /><span>Edit</span>
        </button>
      )}
      {canStatus &&
        (items?.status === "A" ? (
          <button className="action-dropdown-item danger" onClick={() => handleChangeStatus(items.id, "I")}>
            <FontAwesomeIcon icon={faThumbsDown} /><span>Deactivate</span>
          </button>
        ) : (
          <button className="action-dropdown-item" onClick={() => handleChangeStatus(items.id, "A")}>
            <FontAwesomeIcon icon={faThumbsUp} /><span>Activate</span>
          </button>
        ))}
      {canDelete && (
        <button className="action-dropdown-item danger" onClick={() => handleDelete(items)}>
          <FontAwesomeIcon icon={faTrash} /><span>Delete</span>
        </button>
      )}
    </div>
  );

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

  useEffect(() => {
    getList();
    loadListingBanner();
    if (targetRef.current) targetRef.current.scrollIntoView({ behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = "PGTI || Admin || News List";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, showRequest, LIMIT, activeTab, sortState.sort_by, sortState.order]);

  return (
    <div className="admin-page-container" ref={targetRef}>
      <Top_navbar title="News" />

      <div className="content-card">
        <div className="tabs-header">
          <div className="tabs-container">
            <button className={`tab-item ${activeTab === "all" ? "active" : ""}`} onClick={() => handleTabChange("all")}>All</button>
            <button className={`tab-item ${activeTab === "A" ? "active" : ""}`} onClick={() => handleTabChange("A")}>Active</button>
            <button className={`tab-item ${activeTab === "I" ? "active" : ""}`} onClick={() => handleTabChange("I")}>Inactive</button>
            <button className={`tab-item ${activeTab === "F" ? "active" : ""}`} onClick={() => handleTabChange("F")}>NextGen</button>
          </div>
          <div className="tabs-actions">
            <button className="action-button secondary" onClick={() => getList()}>
              <FontAwesomeIcon icon={faRefresh} /> Refresh
            </button>
            {canEdit && (
              <button className="action-button secondary" onClick={handleListingBannerClick}>
                {listingBanner ? <EyeOutlined /> : <PictureOutlined />}
                {listingBanner ? "Preview Listing Banner" : "Add Listing Banner"}
              </button>
            )}
            {canEdit && (
              <button className="action-button primary" onClick={() => handleEdit()}>
                <FontAwesomeIcon icon={faPlus} /> Add News
              </button>
            )}
          </div>
        </div>

        <div className="content-card-body">
          <ListSortFilter
            value={sortState}
            onChange={handleSortChange}
            options={[
              { value: "title", label: "Title" },
              { value: "location", label: "Location" },
              { value: "news_date", label: "News Date" },
              { value: "season", label: "Season" },
              { value: "news_month", label: "Month" },
              { value: "sort_order", label: "Sort Order" },
              { value: "created_at", label: "Created Date" },
            ]}
          />
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
              if (targetRef.current) targetRef.current.scrollIntoView({ behavior: "smooth" });
            }}
            onLimitChange={(newLimit) => {
              dispatch(setLimit(Number(newLimit)));
              if (targetRef.current) targetRef.current.scrollIntoView({ behavior: "smooth" });
            }}
            serverColumnFilters={serverColumnFilters}
            onServerColumnFiltersChange={setServerColumnFilters}
            onRefresh={getList}
            permission={PERMISSION}
            emptyStateMessage="No news found"
            activeTab={activeTab}
            targetRef={targetRef}
          />
        </div>
      </div>

      <ListingBannerPreviewModal
        open={bannerPreviewOpen}
        onCancel={() => setBannerPreviewOpen(false)}
        banner={listingBanner}
        title="News Listing Banner Preview"
        description="Review the current banner that will be sent in the front News listing API."
        onEdit={confirmBannerEdit}
      />
    </div>
  );
}
