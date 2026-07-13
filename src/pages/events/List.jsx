import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dropdown, Modal, notification } from "antd";
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
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
  faCalendarDays,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import { useNavigate } from "react-router-dom";

import Top_navbar from "components/layout/TopNavbar";
import ListingBannerPreviewModal from "components/cms/ListingBannerPreviewModal";
import EnhancedTable from "components/table/EnhancedTable/EnhancedTable";
import { usePermissions } from "contexts/PermissionContext";
import { deleteEvent, eventChangeStatus, getEventListingBanner, list as listEvents } from "services/events.service";
import { getTourTypeLabel } from "utils/tourType";
import "styles/admin-pages.css";

const getEventState = (item = {}) => {
  const start = item?.event_start || item?.event_date;
  const end = item?.event_end || item?.event_date;
  const now = moment();

  if (end && moment(end).isBefore(now, "day")) return "Previous";
  if (start && moment(start).isSameOrBefore(now, "day") && (!end || moment(end).isSameOrAfter(now, "day"))) {
    return "Current";
  }
  return "Upcoming";
};

const stateBadgeStyle = {
  Previous: { background: "#f1f5f9", color: "#475569" },
  Current: { background: "#ecfccb", color: "#65a30d" },
  Upcoming: { background: "#eff6ff", color: "#2563eb" },
};

const EventImageCell = ({ src, alt }) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return <span className="enhanced-table-image-empty">No image</span>;
  }

  return (
    <img
      className="enhanced-table-thumbnail"
      src={src}
      alt={alt || "Tournament"}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
};

export default function EventList() {
  const navigate = useNavigate();
  const targetRef = useRef(null);
  const PERMISSION = usePermissions("events");
  const user = JSON.parse(sessionStorage.getItem("ADMIN-INFO"));

  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [count, setCount] = useState(0);
  const [serverColumnFilters, setServerColumnFilters] = useState({
    title: "",
    location: "",
  });
  const [listingBanner, setListingBanner] = useState(null);
  const [bannerPreviewOpen, setBannerPreviewOpen] = useState(false);

  const canEdit = user?.admin_type === "Super Admin" || PERMISSION?.add_edit === "Y" || PERMISSION?.fullAccess === "Y";
  const canStatus = user?.admin_type === "Super Admin" || PERMISSION?.change_status === "Y" || PERMISSION?.fullAccess === "Y";
  const canDelete = user?.admin_type === "Super Admin" || PERMISSION?.delete === "Y" || PERMISSION?.fullAccess === "Y";

  const IMAGE_BASE_URL = "https://algodev.in:3301/";

  const toast = (message, description, success = false) =>
    notification.open({
      message,
      description,
      placement: "topRight",
      icon: success ? <CheckCircleOutlined style={{ color: "green" }} /> : <InfoCircleOutlined style={{ color: "red" }} />,
      duration: 3,
    });

  const getList = async (page = currentPage, pageLimit = limit) => {
    setIsLoading(true);
    const response = await listEvents({
      skip: (page - 1) * pageLimit,
      limit: pageLimit,
      condition: {
        ...(serverColumnFilters.title ? { title: serverColumnFilters.title } : {}),
        ...(serverColumnFilters.location ? { location: serverColumnFilters.location } : {}),
        ...(activeTab === "F" ? { tour_type: "F" } : {}),
        ...(activeTab !== "all" && activeTab !== "F" ? { status: activeTab } : {}),
      },
    });

    if (response?.status) {
      setRows(response.result || []);
      setCount(response.count || 0);
    } else {
      toast("Oops!", response?.message || "Failed to load events / tournaments.");
    }
    setIsLoading(false);
  };

  const handleEdit = (item = {}) => {
    const state = item?.id ? item : { tour_type: activeTab === "F" ? "F" : "M" };
    navigate("/admin/cms/events/addeditdata", { state });
  };

  const loadListingBanner = async () => {
    const response = await getEventListingBanner(activeTab === "F" ? "F" : "M");
    if (response?.status) {
      setListingBanner(response.result || null);
    }
  };

  const openListingBannerEditor = () => {
    navigate("/admin/cms/events/listing-banner", { state: listingBanner || { tour_type: activeTab === "F" ? "F" : "M" } });
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
      title: "Edit events listing banner?",
      icon: <ExclamationCircleOutlined />,
      content: "This will open the events listing banner editor. Do you want to continue?",
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
      const result = await eventChangeStatus({ editId: id, status });
      if (!result?.status) throw new Error(result?.message || "Failed to update status.");
      toast("Success", "Status changed successfully.", true);
      getList();
    } catch (error) {
      toast("Oops!", error?.message || "Operation failed. Please try again.");
    }
  };

  const handleDelete = (item) => {
    Modal.confirm({
      title: "Delete this tournament?",
      icon: <ExclamationCircleOutlined />,
      content: item?.title || "This tournament will be removed permanently.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const result = await deleteEvent({ id: item.id });
          if (!result?.status) throw new Error(result?.message || "Failed to delete tournament.");
          toast("Success", "Tournament deleted successfully.", true);
          getList();
        } catch (error) {
          toast("Oops!", error?.message || "Failed to delete tournament.");
        }
      },
    });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
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
        header: "Tournament",
        cell: ({ row }) => {
          const item = row.original;
          const state = getEventState(item);
          return (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                <div className="font-weight-600">{item.title || "Untitled Tournament"}</div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 999,
                    ...stateBadgeStyle[state],
                  }}
                >
                  {state}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                Pro-Am: {item.pro_am_details || "N/A"} | Prac-Rd: {item.practice_round_details || "N/A"}
              </div>
            </div>
          );
        },
        size: 290,
        enableSorting: true,
        enableColumnFilter: true,
        enableHiding: true,
      },
    {
        accessorKey: "event_start",
        header: "Schedule",
        cell: ({ row }) => {
          const item = row.original;

          // Tracking the updated 6-hour rollback
          if (item.event_start || item.event_end) {
        
            
            // Subtracting a clean 6 hours total to fix the remaining 30-minute gap
            const subtractedStart = item.event_start ? moment.utc(item.event_start).subtract(6, 'hours') : null;
            const subtractedEnd = item.event_end ? moment.utc(item.event_end).subtract(6, 'hours') : null;
            

          }

          return (
            <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.6 }}>
              {/* Subtracting 6 hours shifts the clock cleanly back to 23:59:59 of the previous day */}
              <div>
                {item.event_start 
                  ? moment.utc(item.event_start).subtract(6, 'hours').format("DD MMM YYYY") 
                  : "N/A"}
              </div>
              <div>
                {item.event_end 
                  ? `to ${moment.utc(item.event_end).subtract(6, 'hours').format("DD MMM YYYY")}` 
                  : "N/A"}
              </div>
            </div>
          );
        },
        size: 150,
        enableSorting: true,
        enableColumnFilter: false,
        enableHiding: true,
      },
      {
        accessorKey: "location",
        header: "Venue",
        cell: ({ getValue }) => (
          <span style={{ fontSize: 12, background: "#f8fafc", color: "#334155", padding: "3px 8px", borderRadius: 6 }}>
            {getValue() || "N/A"}
          </span>
        ),
        size: 200,
        enableSorting: true,
        enableColumnFilter: true,
        enableHiding: true,
      },
      {
        accessorKey: "course_name_display",
        header: "Course",
        cell: ({ row }) => (
          <span
            title={row.original?.course_name_display || row.original?.legacy_course_name || ""}
            style={{ fontSize: 12, background: "#f8fafc", color: "#334155", padding: "3px 8px", borderRadius: 6 }}
          >
            {row.original?.course_name_display || row.original?.legacy_course_name || "N/A"}
          </span>
        ),
        size: 220,
        enableSorting: true,
        enableColumnFilter: false,
        enableHiding: true,
      },
      {
        accessorKey: "season",
        header: "Season",
        cell: ({ row }) => row.original?.season_display || row.original?.season_year || row.original?.season || "N/A",
        size: 100,
        enableSorting: true,
        enableColumnFilter: false,
        enableHiding: true,
      },
      {
        accessorKey: "month_label",
        header: "Month",
        cell: ({ getValue }) => getValue() || "N/A",
        size: 100,
        enableSorting: true,
        enableColumnFilter: false,
        enableHiding: true,
      },
      {
        accessorKey: "tour_type_label",
        header: "Tour Type",
        cell: ({ row }) => (
          <span style={{ fontSize: 12, background: row.original?.tour_type === "F" ? "#fef3c7" : "#e0f2fe", color: row.original?.tour_type === "F" ? "#b45309" : "#075985", padding: "3px 8px", borderRadius: 999, fontWeight: 700 }}>
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
  }, [currentPage, limit, activeTab, serverColumnFilters]);

  useEffect(() => {
    loadListingBanner();
    document.title = "PGTI || Admin || Events / Tournaments";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  return (
    <div className="admin-page-container" ref={targetRef}>
      <Top_navbar title="Events / Tournaments" />

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
              <button className="action-button secondary" onClick={() => navigate("/admin/events/ace-import")}>
                <FileTextOutlined /> Tournament Data Import
              </button>
            )}
            {canEdit && (
              <button className="action-button secondary" onClick={handleListingBannerClick}>
                {listingBanner ? <EyeOutlined /> : <PictureOutlined />}
                {listingBanner ? "Preview Listing Banner" : "Add Listing Banner"}
              </button>
            )}
            {canEdit && (
              <button className="action-button primary" onClick={() => handleEdit()}>
                <FontAwesomeIcon icon={faPlus} /> Add Tournament
              </button>
            )}
          </div>
        </div>

        <div className="content-card-body">
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
                location: filters.location || "",
              });
              setCurrentPage(1);
            }}
            onRefresh={() => getList()}
            permission={PERMISSION}
            emptyStateMessage="No tournaments found"
            activeTab={activeTab}
            targetRef={targetRef}
            exportFileName="events-tournaments"
          />

          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8, color: "#64748b", fontSize: 13 }}>
            <FontAwesomeIcon icon={faCalendarDays} />
            <span>
              These tournament cards drive the front tournament filters, gallery event picker, and schedule listing.
            </span>
          </div>
        </div>
      </div>

      <ListingBannerPreviewModal
        open={bannerPreviewOpen}
        onCancel={() => setBannerPreviewOpen(false)}
        banner={listingBanner}
        title="Events Listing Banner Preview"
        description="Review the current banner that will be sent in the front Tournaments listing API."
        onEdit={confirmBannerEdit}
      />
    </div>
  );
}
