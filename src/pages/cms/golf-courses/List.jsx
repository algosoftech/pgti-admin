import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dropdown, Modal, notification } from "antd";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import {
  faEdit,
  faEllipsis,
  faImages,
  faPlus,
  faRefresh,
  faThumbsDown,
  faThumbsUp,
  faTrash,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";

import TopNavbar from "components/layout/TopNavbar";
import EnhancedTable from "components/table/EnhancedTable/EnhancedTable";
import ListSortFilter from "components/common/ListSortFilter";
import { usePermissions } from "contexts/PermissionContext";
import {
  changeGolfCourseStatus,
  deleteGolfCourse,
  listGolfCourses,
} from "services/golfCourses.service";
import { getTourTypeLabel } from "utils/tourType";
import "styles/admin-pages.css";

export default function GolfCoursesList() {
  const navigate = useNavigate();
  const targetRef = useRef(null);
  const permission = usePermissions("golf_courses");
  const user = JSON.parse(sessionStorage.getItem("ADMIN-INFO") || "null");
  const isSuperAdmin = user?.admin_type === "Super Admin";

  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [serverColumnFilters, setServerColumnFilters] = useState({
    name: "",
    detail_preview: "",
  });
  const [sortState, setSortState] = useState({ sort_by: "", order: "asc" });

  const canEdit = isSuperAdmin || permission?.add_edit === "Y" || permission?.fullAccess === "Y";
  const canStatus = isSuperAdmin || permission?.change_status === "Y" || permission?.fullAccess === "Y";
  const canDelete = isSuperAdmin || permission?.delete === "Y" || permission?.fullAccess === "Y";

  const toast = (message, description, success = false) =>
    notification.open({
      message,
      description,
      placement: "topRight",
      icon: success ? <CheckCircleOutlined style={{ color: "green" }} /> : <InfoCircleOutlined style={{ color: "red" }} />,
      duration: 3,
    });

  const getList = useCallback(
    async (page = currentPage, pageLimit = limit) => {
      setIsLoading(true);
      const response = await listGolfCourses({
        skip: (page - 1) * pageLimit,
        limit: pageLimit,
        condition: {
          ...(serverColumnFilters.name ? { name: serverColumnFilters.name } : {}),
          ...(serverColumnFilters.detail_preview ? { search: serverColumnFilters.detail_preview } : {}),
          ...(activeTab === "A" || activeTab === "I" ? { status: activeTab } : {}),
          ...(activeTab === "F" ? { tour_type: "F" } : {}),
        },
        ...(sortState.sort_by ? { sort_by: sortState.sort_by, order: sortState.order } : {}),
      });

      if (response?.status) {
        setRows(response.result || []);
        setCount(response.count || 0);
      } else {
        toast("Oops!", response?.message || "Failed to load golf courses.");
      }
      setIsLoading(false);
    },
    [activeTab, currentPage, limit, serverColumnFilters.detail_preview, serverColumnFilters.name, sortState.order, sortState.sort_by]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      getList(currentPage, limit);
    }, 350);
    return () => clearTimeout(timer);
  }, [getList, currentPage, limit]);

  useEffect(() => {
    document.title = "PGTI || Admin || Golf Courses";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSortChange = (next) => {
    setSortState(next);
    setCurrentPage(1);
  };

  const handleEdit = (item = {}) => {
    navigate("/admin/cms/golf-courses/addeditdata", {
      state: item?.id ? item : { tour_type: activeTab === "F" ? "F" : "M" },
    });
  };

  const openMedia = (item, mediaType) => {
    navigate("/admin/cms/golf-courses/media", {
      state: { course: item, media_type: mediaType },
    });
  };

  const handleChangeStatus = async (item, status) => {
    const response = await changeGolfCourseStatus({ id: item.id, status });
    if (response?.status) {
      toast("Success", "Golf course status updated successfully.", true);
      getList();
    } else {
      toast("Oops!", response?.message || "Failed to update status.");
    }
  };

  const handleDelete = (item) => {
    Modal.confirm({
      title: "Delete this golf course?",
      icon: <ExclamationCircleOutlined />,
      content: `${item?.name || "This course"} and its attached photos/videos will be hidden from admin and front APIs.`,
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        const response = await deleteGolfCourse({ id: item.id });
        if (response?.status) {
          toast("Success", "Golf course deleted successfully.", true);
          getList();
        } else {
          toast("Oops!", response?.message || "Failed to delete golf course.");
        }
      },
    });
  };

  const dropdownMenu = (item) => (
    <div className="action-dropdown-menu">
      {canEdit && (
        <button className="action-dropdown-item" onClick={() => handleEdit(item)}>
          <FontAwesomeIcon icon={faEdit} />
          <span>Edit</span>
        </button>
      )}
      {canEdit && (
        <button className="action-dropdown-item" onClick={() => openMedia(item, "photos")}>
          <FontAwesomeIcon icon={faImages} />
          <span>Photos</span>
        </button>
      )}
      {canEdit && (
        <button className="action-dropdown-item" onClick={() => openMedia(item, "videos")}>
          <FontAwesomeIcon icon={faVideo} />
          <span>Videos</span>
        </button>
      )}
      {canStatus &&
        (item.status === "A" ? (
          <button className="action-dropdown-item danger" onClick={() => handleChangeStatus(item, "I")}>
            <FontAwesomeIcon icon={faThumbsDown} />
            <span>Deactivate</span>
          </button>
        ) : (
          <button className="action-dropdown-item" onClick={() => handleChangeStatus(item, "A")}>
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
        accessorKey: "name",
        header: "Golf Course",
        cell: ({ row }) => (
          <div>
            <div className="font-weight-600">{row.original.name || "Untitled Golf Course"}</div>
            <div style={{ fontSize: 12, color: "#64748b", maxWidth: 420 }}>
              {row.original.detail_preview || "No course detail added yet."}
            </div>
          </div>
        ),
        size: 360,
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
        accessorKey: "photo_count",
        header: "Photos",
        cell: ({ row }) => (
          <button className="action-button secondary small" onClick={() => openMedia(row.original, "photos")}>
            <FontAwesomeIcon icon={faImages} />
            {row.original.photo_count || 0}
          </button>
        ),
        size: 120,
        enableSorting: true,
        enableGlobalFilter: false,
        enableColumnFilter: false,
        enableHiding: true,
      },
      {
        accessorKey: "video_count",
        header: "Videos",
        cell: ({ row }) => (
          <button className="action-button secondary small" onClick={() => openMedia(row.original, "videos")}>
            <FontAwesomeIcon icon={faVideo} />
            {row.original.video_count || 0}
          </button>
        ),
        size: 120,
        enableSorting: true,
        enableGlobalFilter: false,
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

  return (
    <div className="admin-page-container" ref={targetRef}>
      <TopNavbar title="Golf Course Info" />

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
              <button className="action-button primary" onClick={() => handleEdit()}>
                <FontAwesomeIcon icon={faPlus} /> Add Golf Course
              </button>
            )}
          </div>
        </div>

        <div className="content-card-body">
          <ListSortFilter
            value={sortState}
            onChange={handleSortChange}
            options={[
              { value: "name", label: "Golf Course" },
              { value: "sort_order", label: "Sort Order" },
              { value: "created_at", label: "Created Date" },
              { value: "updated_at", label: "Updated Date" },
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
            onPageChange={(nextPage) => {
              setCurrentPage(nextPage);
              targetRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
            onLimitChange={(newLimit) => {
              setLimit(Number(newLimit));
              setCurrentPage(1);
            }}
            serverColumnFilters={serverColumnFilters}
            onServerColumnFiltersChange={(filters) => {
              setServerColumnFilters({
                name: filters.name || "",
                detail_preview: filters.detail_preview || "",
              });
              setCurrentPage(1);
            }}
            onRefresh={() => getList()}
            permission={permission}
            emptyStateMessage="No golf courses found"
            activeTab={activeTab}
            targetRef={targetRef}
            exportFileName="golf-course-info"
            rowHeightEstimate={72}
          />

          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8, color: "#64748b", fontSize: 13 }}>
            <FontAwesomeIcon icon={faImages} />
            <span>
              Use the Photos and Videos columns or row actions to manage media for each golf course.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
