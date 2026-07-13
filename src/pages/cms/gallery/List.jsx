import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dropdown, Modal, notification } from "antd";
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import {
  faEdit,
  faThumbsUp,
  faThumbsDown,
  faPlus,
  faRefresh,
  faTrash,
  faEllipsis,
  faImages,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";

import Top_navbar from "components/layout/TopNavbar";
import ListingBannerPreviewModal from "components/cms/ListingBannerPreviewModal";
import EnhancedTable from "components/table/EnhancedTable/EnhancedTable";
import ListSortFilter from "components/common/ListSortFilter";
import { usePermissions } from "contexts/PermissionContext";
import { changeGalleryStatus, deleteGallery, getGalleryListingBanner, listGallery } from "services/gallery.service";
import { getTourTypeLabel } from "utils/tourType";
import "styles/admin-pages.css";

const monthLabel = (value) =>
  [
    "",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ][Number(value) || 0] || "N/A";

export default function GalleryList() {
  const navigate = useNavigate();
  const targetRef = useRef(null);
  const PERMISSION = usePermissions("gallery");
  const user = JSON.parse(sessionStorage.getItem("ADMIN-INFO"));

  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [count, setCount] = useState(0);
  const [serverColumnFilters, setServerColumnFilters] = useState({
    title: "",
    event_title: "",
  });
  const [sortState, setSortState] = useState({ sort_by: "", order: "asc" });
  const [listingBanner, setListingBanner] = useState(null);
  const [bannerPreviewOpen, setBannerPreviewOpen] = useState(false);
const IMAGE_BASE_URL = "https://algodev.in:3301/";
  const canEdit = user?.admin_type === "Super Admin" || PERMISSION?.add_edit === "Y" || PERMISSION?.fullAccess === "Y";
  const canStatus = user?.admin_type === "Super Admin" || PERMISSION?.change_status === "Y" || PERMISSION?.fullAccess === "Y";
  const canDelete = user?.admin_type === "Super Admin" || PERMISSION?.delete === "Y" || PERMISSION?.fullAccess === "Y";

  const toast = (message, description, success = false) =>
    notification.open({
      message,
      description,
      placement: "topRight",
      icon: success ? <CheckCircleOutlined style={{ color: "green" }} /> : <InfoCircleOutlined style={{ color: "red" }} />,
      duration: 3,
    });

  const loadListingBanner = useCallback(async () => {
    const response = await getGalleryListingBanner(activeTab === "F" ? "F" : "M");
    if (response?.status) {
      setListingBanner(response.result || null);
    }
  }, [activeTab]);

  const getList = async (page = currentPage, pageLimit = limit) => {
    setIsLoading(true);
    const response = await listGallery({
      skip: (page - 1) * pageLimit,
      limit: pageLimit,
      condition: {
        ...(serverColumnFilters.title ? { title: serverColumnFilters.title } : {}),
        ...(serverColumnFilters.event_title ? { event_title: serverColumnFilters.event_title } : {}),
        ...(activeTab === "A" || activeTab === "I" ? { status: activeTab } : {}),
        ...(activeTab === "F" ? { tour_type: "F" } : {}),
      },
      ...(sortState.sort_by ? { sort_by: sortState.sort_by, order: sortState.order } : {}),
    });

    if (response?.status) {
      setRows(response.result || []);
      setCount(response.count || 0);
    } else {
      toast("Oops!", response?.message || "Failed to load gallery items.");
    }
    setIsLoading(false);
  };

  const handleEdit = (item = {}) => {
    const state = item?.id ? item : { tour_type: activeTab === "F" ? "F" : "M" };
    navigate("/admin/cms/gallery/addeditdata", { state });
  };

  const openListingBannerEditor = () => {
    navigate("/admin/cms/gallery/listing-banner", { state: listingBanner || { tour_type: activeTab === "F" ? "F" : "M" } });
  };

  const handleListingBannerClick = async () => {
    if (!listingBanner) {
      openListingBannerEditor();
      return;
    }
    setBannerPreviewOpen(true);
  };

  const confirmBannerEdit = () => {
    Modal.confirm({
      title: "Edit gallery listing banner?",
      icon: <ExclamationCircleOutlined />,
      content: "This will open the gallery listing banner editor. Do you want to continue?",
      okText: "Yes, Edit",
      cancelText: "Cancel",
      onOk: () => {
        setBannerPreviewOpen(false);
        openListingBannerEditor();
      },
    });
  };

  const handleChangeStatus = async (id, status) => {
    try {
      const result = await changeGalleryStatus({ id, status });
      if (!result?.status) throw new Error(result?.message || "Failed to update status.");
      toast("Success", "Gallery status updated successfully.", true);
      getList();
    } catch (error) {
      toast("Oops!", error?.message || "Failed to update status.");
    }
  };

  const handleDelete = (item) => {
    Modal.confirm({
      title: "Delete this gallery item?",
      icon: <ExclamationCircleOutlined />,
      content: item?.title || "This gallery item will be removed permanently.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const result = await deleteGallery({ id: item.id });
          if (!result?.status) throw new Error(result?.message || "Failed to delete gallery item.");
          toast("Success", "Gallery item deleted successfully.", true);
          getList();
        } catch (error) {
          toast("Oops!", error?.message || "Failed to delete gallery item.");
        }
      },
    });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSortChange = (next) => {
    setSortState(next);
    setCurrentPage(1);
  };

  const dropdownMenu = (item) => (
    <div className="action-dropdown-menu">
      {canEdit && (
        <button className="action-dropdown-item" onClick={() => handleEdit(item)}>
          <FontAwesomeIcon icon={faEdit} />
          <span>Edit</span>
        </button>
      )}
      {canStatus &&
        (item?.status === "A" ? (
          <button className="action-dropdown-item danger" onClick={() => handleChangeStatus(item.id, "I")}>
            <FontAwesomeIcon icon={faThumbsDown} />
            <span>Deactivate</span>
          </button>
        ) : (
          <button className="action-dropdown-item" onClick={() => handleChangeStatus(item.id, "A")}>
            <FontAwesomeIcon icon={faThumbsUp} />
            <span>Activate</span>
          </button>
        ))}
      {canDelete && (
        <button className="action-dropdown-item danger" onClick={() => handleDelete(item)}>
          <FontAwesomeIcon icon={faTrash} />
          <span>Delete</span>
        </button>
      )}
    </div>
  );

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
        cell: ({ row }) => row.index + (currentPage - 1) * limit + 1,
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
// Fix: Check if it's already a full URL
    const imgSrc = image && image.startsWith("http") 
      ? image 
      : `${IMAGE_BASE_URL}${image}`;
    return image ? (
      <img
        src={imgSrc}
        alt={row.original?.title}
        style={{
          width: 72,
          height: 56,
          objectFit: "cover",
          borderRadius: 8,
        }}
        onError={(e) => {
          console.log("Failed to load:", e.target.src);
        }}
      />
    ) : (
      <span className="text-muted">No image</span>
    );
  },
        size: 110,
        enableSorting: false,
        enableGlobalFilter: false,
        enableHiding: true,
        enableColumnFilter: false,
      },
      {
        accessorKey: "title",
        header: "Gallery Card",
        cell: ({ row }) => (
          <div>
            <div className="font-weight-600">{row.original.title || "Untitled Gallery Item"}</div>
            <div style={{ fontSize: 12, color: "#64748b", maxWidth: 320 }}>
              {(row.original.description || "").length > 90
                ? `${row.original.description.slice(0, 90)}...`
                : row.original.description || "No description"}
            </div>
          </div>
        ),
        size: 300,
        enableSorting: true,
        enableColumnFilter: true,
        enableHiding: true,
      },
      {
        accessorKey: "tour_type_label",
        header: "Tour Type",
        cell: ({ row }) => (
          <span style={{ fontSize: 12, background: "#eff6ff", color: "#1d4ed8", padding: "4px 10px", borderRadius: 999 }}>
            {row.original?.tour_type_label || getTourTypeLabel(row.original?.tour_type)}
          </span>
        ),
        size: 140,
        enableSorting: false,
        enableGlobalFilter: false,
        enableColumnFilter: false,
        enableHiding: true,
      },
      {
        accessorKey: "event_title",
        header: "Linked Tournament",
        cell: ({ getValue }) => (
          <span style={{ fontSize: 12, background: "#f8fafc", color: "#334155", padding: "3px 8px", borderRadius: 6 }}>
            {getValue() || "N/A"}
          </span>
        ),
        size: 220,
        enableSorting: true,
        enableColumnFilter: true,
        enableHiding: true,
      },
      {
        accessorKey: "season",
        header: "Season",
        cell: ({ getValue }) => getValue() || "N/A",
        size: 100,
        enableSorting: true,
        enableColumnFilter: false,
        enableHiding: true,
      },
      {
        accessorKey: "gallery_month",
        header: "Month",
        cell: ({ getValue, row }) => row.original.month_label || monthLabel(getValue()),
        size: 100,
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
        cell: ({ row }) =>
          canEdit || canStatus || canDelete ? (
            <div className="action-dropdown">
              <Dropdown overlay={() => dropdownMenu(row.original)} placement="bottomRight" trigger={["click"]}>
                <button className="action-dropdown-trigger">
                  <FontAwesomeIcon icon={faEllipsis} />
                </button>
              </Dropdown>
            </div>
          ) : (
            <span className="text-muted">--</span>
          ),
        size: 100,
        enableSorting: false,
        enableResizing: false,
        enableGlobalFilter: false,
      },
    ],
    [canDelete, canEdit, canStatus, currentPage, limit]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      getList(currentPage, limit);
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, limit, activeTab, serverColumnFilters.title, serverColumnFilters.event_title, sortState.sort_by, sortState.order]);

  useEffect(() => {
    loadListingBanner();
  }, [loadListingBanner]);

  useEffect(() => {
    document.title = "PGTI || Admin || Gallery";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="admin-page-container" ref={targetRef}>
      <Top_navbar title="Gallery" />

      <div className="content-card">
        <div className="tabs-header">
          <div className="tabs-container">
            <button className={`tab-item ${activeTab === "all" ? "active" : ""}`} onClick={() => handleTabChange("all")}>
              All
            </button>
            <button className={`tab-item ${activeTab === "A" ? "active" : ""}`} onClick={() => handleTabChange("A")}>
              Active
            </button>
            <button className={`tab-item ${activeTab === "I" ? "active" : ""}`} onClick={() => handleTabChange("I")}>
              Inactive
            </button>
            <button className={`tab-item ${activeTab === "F" ? "active" : ""}`} onClick={() => handleTabChange("F")}>
              NextGen
            </button>
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
                <FontAwesomeIcon icon={faPlus} /> Add Gallery Item
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
              { value: "event_title", label: "Tournament" },
              { value: "season", label: "Season" },
              { value: "gallery_month", label: "Month" },
              { value: "sort_order", label: "Sort Order" },
              { value: "created_at", label: "Created Date" },
            ]}
          />
          <EnhancedTable
            data={rows}
            columns={columns}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={Math.max(1, Math.ceil((count || 0) / limit))}
            limit={limit}
            skip={(currentPage - 1) * limit}
            count={count}
            onPageChange={(page) => {
              setCurrentPage(page);
              targetRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
            onLimitChange={(newLimit) => {
              setLimit(Number(newLimit));
              setCurrentPage(1);
            }}
            serverColumnFilters={serverColumnFilters}
            onServerColumnFiltersChange={(filters) => {
              setServerColumnFilters({
                title: filters.title || "",
                event_title: filters.event_title || "",
              });
              setCurrentPage(1);
            }}
            onRefresh={() => getList()}
            permission={PERMISSION}
            emptyStateMessage="No gallery items found"
            activeTab={activeTab}
            targetRef={targetRef}
            exportFileName="gallery-items"
          />

          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8, color: "#64748b", fontSize: 13 }}>
            <FontAwesomeIcon icon={faImages} />
            <span>
              These gallery cards power the front Tour / Tournaments Photo Gallery page and its event filters.
            </span>
          </div>
        </div>
      </div>

      <ListingBannerPreviewModal
        open={bannerPreviewOpen}
        onCancel={() => setBannerPreviewOpen(false)}
        banner={listingBanner}
        title="Gallery Listing Banner Preview"
        description="Review the current banner that will be sent in the front Gallery listing API."
        onEdit={confirmBannerEdit}
      />
    </div>
  );
}
