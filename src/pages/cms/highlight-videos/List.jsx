import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dropdown, notification } from "antd";
import {
  faEdit,
  faThumbsUp,
  faThumbsDown,
  faPlus,
  faRefresh,
  faEllipsis,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Top_navbar from "components/layout/TopNavbar";
import EnhancedTable from "components/table/EnhancedTable/EnhancedTable";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { usePermissions } from "contexts/PermissionContext";
import { getTourTypeLabel } from "utils/tourType";
import "styles/admin-pages.css";
import { useAppDispatch, useAppSelector } from "store/hooks";
import {
  fetchHighlightVideosList,
  changeHighlightVideoStatus,
  setCurrentPage,
  setLimit,
  setShowRequest,
} from "store/slices/highlightVideos.slice";

function getYoutubeVideoId(url) {
  if (!url || typeof url !== "string") return null;
  const value = url.trim();
  const watchMatch = value.match(/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];
  const shortMatch = value.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  const embedMatch = value.match(/(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];
  return null;
}

function getYoutubeThumbnail(url) {
  const id = getYoutubeVideoId(url);
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}

export default function HighlightVideoList() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const targetRef = useRef(null);

  const {
    listData: ALLLISTDATA,
    isLoading,
    currentPage,
    totalPages: TOTALPAGES,
    limit: LIMIT,
    skip: SKIP,
    showRequest,
    count,
  } = useAppSelector((state) => state.highlightVideos);

  const [activeTab, setActiveTab] = useState("all");
  const PERMISSION = usePermissions("highlight_videos");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    dispatch(setShowRequest(tab === "A" || tab === "I" ? tab : ""));
  };

  const handleEdit = useCallback((item = {}) => {
    const state = item?.id ? item : { tour_type: activeTab === "F" ? "F" : "M" };
    navigate("/admin/cms/highlight-videos/addeditdata", { state });
  }, [activeTab, navigate]);

  const getList = useCallback(() => {
    const condition = {};
    if (showRequest) condition.status = showRequest;
    if (activeTab === "F") condition.tour_type = "F";
    const calculatedSkip = (currentPage - 1) * LIMIT;
    dispatch(
      fetchHighlightVideosList({
        type: "",
        condition,
        skip: Math.max(0, calculatedSkip),
        limit: Math.min(100, Math.max(1, LIMIT || 10)),
      })
    );
  }, [LIMIT, activeTab, currentPage, dispatch, showRequest]);

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
    targetRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLimitChange = (limit) => {
    dispatch(setLimit(Number(limit)));
  };

  const handleChangeStatus = useCallback(async (id, status) => {
    try {
      const res = await dispatch(changeHighlightVideoStatus({ editId: id, status })).unwrap();
      notification.success({ message: res?.message || "Status updated", placement: "topRight" });
      getList();
    } catch (err) {
      notification.error({
        message: err || "Failed to update status",
        placement: "topRight",
      });
    }
  }, [dispatch, getList]);

  const getDropdownMenuItems = useCallback((item) => {
    const items = [];

    if (PERMISSION?.add_edit === "Y" || PERMISSION?.fullAccess === "Y") {
      items.push({
        key: "edit",
        label: "Edit",
        icon: <FontAwesomeIcon icon={faEdit} />,
        onClick: () => handleEdit(item),
      });
    }

    if (PERMISSION?.change_status === "Y" || PERMISSION?.fullAccess === "Y") {
      if (item?.status !== "A") {
        items.push({
          key: "active",
          label: "Set Active",
          icon: <FontAwesomeIcon icon={faThumbsUp} />,
          onClick: () => handleChangeStatus(item.id, "A"),
        });
      }
      if (item?.status !== "I") {
        items.push({
          key: "inactive",
          label: "Set Inactive",
          icon: <FontAwesomeIcon icon={faThumbsDown} />,
          onClick: () => handleChangeStatus(item.id, "I"),
        });
      }
    }

    return items;
  }, [PERMISSION, handleChangeStatus, handleEdit]);

  const columns = useMemo(
    () => [
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
        accessorKey: "link",
        header: "Preview",
        cell: ({ row }) => {
          const item = row.original;
          const thumbUrl = getYoutubeThumbnail(item?.link);
          const videoId = getYoutubeVideoId(item?.link);

          return (
            <div className="highlight-video-preview-cell" style={{ padding: 0 }}>
              {videoId ? (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="highlight-video-preview-link"
                  title="Open video"
                >
                  {thumbUrl ? (
                    <img
                      src={thumbUrl}
                      alt={item.title || "Video"}
                      className="highlight-video-thumb"
                    />
                  ) : (
                    <div className="highlight-video-placeholder">
                      <span>YouTube</span>
                    </div>
                  )}
                </a>
              ) : (
                <div className="highlight-video-placeholder highlight-video-placeholder-invalid">
                  <span>No link</span>
                </div>
              )}
            </div>
          );
        },
        size: 170,
        enableSorting: false,
        enableGlobalFilter: false,
        enableColumnFilter: false,
        enableHiding: true,
      },
      {
        accessorKey: "tour_type_label",
        header: "Tour Type",
        cell: ({ row }) => getTourTypeLabel(row.original?.tour_type),
        size: 140,
        enableSorting: true,
        enableColumnFilter: false,
        enableHiding: true,
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ getValue }) => <div className="font-weight-600">{getValue() || "—"}</div>,
        size: 260,
        enableSorting: true,
        enableColumnFilter: true,
        enableHiding: true,
      },
      {
        accessorKey: "link",
        header: "Link",
        cell: ({ getValue }) => {
          const value = getValue();
          return value ? (
            <a href={value} target="_blank" rel="noopener noreferrer" className="highlight-video-link">
              {value.length > 52 ? `${value.slice(0, 52)}…` : value}
            </a>
          ) : (
            <span className="text-muted">—</span>
          );
        },
        size: 320,
        enableSorting: false,
        enableColumnFilter: false,
        enableHiding: true,
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ getValue }) => (
          <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
            <div className="font-weight-600">{getValue() ? moment(getValue()).format("MMM DD, YYYY") : "—"}</div>
            <div className="text-muted">{getValue() ? moment(getValue()).format("HH:mm") : ""}</div>
          </div>
        ),
        size: 160,
        enableSorting: true,
        enableColumnFilter: false,
        enableHiding: true,
      },
      {
        accessorKey: "status",
        header: "Status",
        accessorFn: (row) => (row.status === "A" ? "Active" : "Inactive"),
        cell: ({ row }) => (
          <span className={`status-badge ${row.original?.status === "A" ? "active" : "inactive"}`}>
            {row.original?.status === "A" ? "Active" : "Inactive"}
          </span>
        ),
        size: 120,
        enableSorting: true,
        enableColumnFilter: false,
        enableHiding: true,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="action-dropdown">
              <Dropdown menu={{ items: getDropdownMenuItems(item) }} placement="bottomRight" trigger={["click"]}>
                <button className="action-dropdown-trigger">
                  <FontAwesomeIcon icon={faEllipsis} />
                </button>
              </Dropdown>
            </div>
          );
        },
        size: 100,
        enableSorting: false,
        enableResizing: false,
        enableGlobalFilter: false,
      },
    ],
    [SKIP, getDropdownMenuItems]
  );

  useEffect(() => {
    getList();
    document.title = "PGTI || Admin || Highlights & Videos";
  }, [getList]);

  return (
    <div className="admin-page-container" ref={targetRef}>
      <Top_navbar title="Highlights & Videos" />

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
            <button
              className={`tab-item ${activeTab === "F" ? "active" : ""}`}
              onClick={() => handleTabChange("F")}
            >
              NextGen
            </button>
          </div>
          <div className="tabs-actions">
            <button className="action-button secondary" onClick={() => getList()}>
              <FontAwesomeIcon icon={faRefresh} />
              Refresh
            </button>
            {(PERMISSION?.add_edit === "Y" || PERMISSION?.fullAccess === "Y") && (
              <button className="action-button primary" onClick={() => handleEdit()}>
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
            onRefresh={getList}
            permission={PERMISSION}
            emptyStateMessage="No highlights or videos found"
            activeTab={activeTab}
            targetRef={targetRef}
            rowHeightEstimate={96}
            exportFileName="highlights-videos"
          />
        </div>
      </div>
    </div>
  );
}
