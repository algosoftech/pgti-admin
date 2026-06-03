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
  faPlus,
  faRefresh,
  faThumbsDown,
  faThumbsUp,
  faTrash,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";

import Top_navbar from "components/layout/TopNavbar";
import EnhancedTable from "components/table/EnhancedTable/EnhancedTable";
import { usePermissions } from "contexts/PermissionContext";
import { changeTvTimingStatus, deleteTvTiming, listTvTimings } from "services/tvTimings.service";
import { getTourTypeLabel } from "utils/tourType";
import "styles/admin-pages.css";

export default function TvTimingsList() {
  const navigate = useNavigate();
  const targetRef = useRef(null);
  const PERMISSION = usePermissions("tv_timings");
  const user = JSON.parse(sessionStorage.getItem("ADMIN-INFO"));

  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [count, setCount] = useState(0);
  const [serverColumnFilters, setServerColumnFilters] = useState({
    event_title: "",
  });

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

  const getList = useCallback(async (page = currentPage, pageLimit = limit) => {
    setIsLoading(true);
    const response = await listTvTimings({
      skip: (page - 1) * pageLimit,
      limit: pageLimit,
      condition: {
        ...(serverColumnFilters.event_title ? { event_title: serverColumnFilters.event_title } : {}),
        ...(activeTab === "A" || activeTab === "I" ? { status: activeTab } : {}),
        ...(activeTab === "F" ? { tour_type: "F" } : {}),
      },
    });

    if (response?.status) {
      setRows(response.result || []);
      setCount(response.count || 0);
    } else {
      toast("Oops!", response?.message || "Failed to load TV timings.");
    }
    setIsLoading(false);
  }, [activeTab, currentPage, limit, serverColumnFilters.event_title]);

  const handleEdit = (item = {}) => {
    const state = item?.id ? item : { tour_type: activeTab === "F" ? "F" : "M" };
    navigate("/admin/cms/tv-timings/addeditdata", { state });
  };

  const handleChangeStatus = async (id, status) => {
    try {
      const result = await changeTvTimingStatus({ id, status });
      if (!result?.status) throw new Error(result?.message || "Failed to update status.");
      toast("Success", "TV timing status updated successfully.", true);
      getList();
    } catch (error) {
      toast("Oops!", error?.message || "Failed to update status.");
    }
  };

  const handleDelete = (item) => {
    Modal.confirm({
      title: "Delete this TV timing?",
      icon: <ExclamationCircleOutlined />,
      content: item?.event_title || "This TV timing item will be removed permanently.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const result = await deleteTvTiming({ id: item.id });
          if (!result?.status) throw new Error(result?.message || "Failed to delete TV timing.");
          toast("Success", "TV timing deleted successfully.", true);
          getList();
        } catch (error) {
          toast("Oops!", error?.message || "Failed to delete TV timing.");
        }
      },
    });
  };

  const dropdownMenu = useCallback((item) => (
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
  ), [canDelete, canEdit, canStatus]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "index",
        header: "#",
        cell: ({ row }) => row.index + (currentPage - 1) * limit + 1,
        size: 70,
        enableSorting: true,
        enableGlobalFilter: false,
      },
      {
        accessorKey: "tour_type_label",
        header: "Tour Type",
        cell: ({ row }) => getTourTypeLabel(row.original?.tour_type),
        size: 130,
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        accessorKey: "event_title",
        header: "Linked Tournament",
        cell: ({ getValue }) => getValue() || "N/A",
        size: 260,
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: "detail_preview",
        header: "Detail Preview",
        cell: ({ getValue }) => getValue() || "No detail",
        size: 420,
        enableSorting: false,
        enableColumnFilter: false,
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
  }, [currentPage, getList, limit]);

  useEffect(() => {
    document.title = "PGTI || Admin || TV Timings";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="admin-page-container" ref={targetRef}>
      <Top_navbar title="TV Timings" />

      <div className="content-card">
        <div className="tabs-header">
          <div className="tabs-container">
            <button className={`tab-item ${activeTab === "all" ? "active" : ""}`} onClick={() => { setActiveTab("all"); setCurrentPage(1); }}>
              All
            </button>
            <button className={`tab-item ${activeTab === "A" ? "active" : ""}`} onClick={() => { setActiveTab("A"); setCurrentPage(1); }}>
              Active
            </button>
            <button className={`tab-item ${activeTab === "I" ? "active" : ""}`} onClick={() => { setActiveTab("I"); setCurrentPage(1); }}>
              Inactive
            </button>
            <button className={`tab-item ${activeTab === "F" ? "active" : ""}`} onClick={() => { setActiveTab("F"); setCurrentPage(1); }}>
              NextGen
            </button>
          </div>
          <div className="tabs-actions">
            <button className="action-button secondary" onClick={() => getList()}>
              <FontAwesomeIcon icon={faRefresh} /> Refresh
            </button>
            {canEdit && (
              <button className="action-button primary" onClick={() => handleEdit()}>
                <FontAwesomeIcon icon={faPlus} /> Add TV Timings
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
                event_title: filters.event_title || "",
              });
              setCurrentPage(1);
            }}
            onRefresh={() => getList()}
            permission={PERMISSION}
            emptyStateMessage="No TV timing items found"
            activeTab={activeTab}
            targetRef={targetRef}
            exportFileName="tv-timings-items"
          />

          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8, color: "#64748b", fontSize: 13 }}>
            <FontAwesomeIcon icon={faVideo} />
            <span>
              These TV timing items are sent inside the tournament detail API for the tournament-specific TV Timings tab.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
