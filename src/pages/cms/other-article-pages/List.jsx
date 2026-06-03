import React, { useEffect, useState } from "react";
import { Dropdown, Modal, notification } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faEllipsis,
  faPlus,
  faRefresh,
  faThumbsDown,
  faThumbsUp,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";
import moment from "moment";
import { useNavigate } from "react-router-dom";

import Top_navbar from "components/layout/TopNavbar";
import EnhancedTable from "components/table/EnhancedTable/EnhancedTable";
import { usePermissions } from "contexts/PermissionContext";
import {
  changeOtherArticlePageStatus,
  deleteOtherArticlePage,
  listOtherArticlePages,
} from "services/otherArticlePages.service";
import { getTourTypeLabel } from "utils/tourType";
import "styles/admin-pages.css";

export default function OtherArticlePagesList() {
  const navigate = useNavigate();
  const permission = usePermissions("articles");
  const user = JSON.parse(sessionStorage.getItem("ADMIN-INFO") || "null");

  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [count, setCount] = useState(0);
  const [activeTab, setActiveTab] = useState("all");
  const [serverColumnFilters, setServerColumnFilters] = useState({ link_name: "", slug: "" });

  const canEdit = user?.admin_type === "Super Admin" || permission?.add_edit === "Y" || permission?.fullAccess === "Y";
  const canStatus = user?.admin_type === "Super Admin" || permission?.change_status === "Y" || permission?.fullAccess === "Y";
  const canDelete = user?.admin_type === "Super Admin" || permission?.delete === "Y" || permission?.fullAccess === "Y";

  const notify = (description, success = false) => {
    notification.open({
      message: success ? "Success" : "Oops!",
      description,
      placement: "topRight",
      icon: success ? <CheckCircleOutlined style={{ color: "green" }} /> : <InfoCircleOutlined style={{ color: "red" }} />,
      duration: 3,
    });
  };

  const getList = async (page = currentPage, pageLimit = limit) => {
    setIsLoading(true);
    const res = await listOtherArticlePages({
      skip: (page - 1) * pageLimit,
      limit: pageLimit,
      status: activeTab === "all" ? undefined : activeTab,
      ...(activeTab === "F" ? { tour_type: "F", status: undefined } : {}),
      search: serverColumnFilters.link_name || undefined,
    });

    if (res?.status) {
      let data = res.result || [];
      if (serverColumnFilters.slug) {
        data = data.filter((item) => item.slug?.toLowerCase().includes(serverColumnFilters.slug.toLowerCase()));
      }
      setRows(data);
      setCount(res.count || 0);
    } else {
      notify(res?.message || "Failed to load other article pages.");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    document.title = "PGTI || Other Article Pages";
  }, []);

  useEffect(() => {
    getList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, limit, activeTab, serverColumnFilters]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleEdit = (item) => {
    navigate("/admin/cms/other-article-pages/addeditdata", { state: item });
  };

  const handleChangeStatus = async (id, status) => {
    const res = await changeOtherArticlePageStatus({ id, status });
    if (res?.status) {
      notify("Page status updated successfully.", true);
      getList();
      return;
    }
    notify(res?.message || "Failed to update page status.");
  };

  const handleDelete = (item) => {
    Modal.confirm({
      title: "Delete this page?",
      icon: <ExclamationCircleOutlined />,
      content: item?.link_name || "This page will be removed permanently.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        const res = await deleteOtherArticlePage({ id: item.id });
        if (res?.status) {
          notify("Other article page deleted successfully.", true);
          getList();
        } else {
          notify(res?.message || "Failed to delete page.");
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

  const columns = [
    {
      accessorKey: "index",
      header: "#",
      cell: ({ row }) => row.index + (currentPage - 1) * limit + 1,
      size: 70,
      enableSorting: true,
    },
    {
      accessorKey: "link_name",
      header: "Link Name",
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => canEdit && handleEdit(row.original)}
          style={{ border: "none", background: "transparent", padding: 0, textAlign: "left", cursor: canEdit ? "pointer" : "default" }}
        >
          <div className="font-weight-600" style={{ color: canEdit ? "#1d4ed8" : undefined }}>
            {row.original.link_name || "Untitled"}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>{row.original.hero_title || "No hero title"}</div>
        </button>
      ),
      size: 280,
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ getValue }) => getValue() || "-",
      size: 220,
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: "excerpt",
      header: "Content Preview",
      cell: ({ getValue }) => (
        <span style={{ color: "#64748b", fontSize: 13 }}>
          {getValue() || "-"}
        </span>
      ),
      size: 320,
      enableSorting: false,
      enableColumnFilter: false,
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
    },
    {
      accessorKey: "status",
      header: "Status",
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
      accessorKey: "updated_at",
      header: "Updated",
      cell: ({ getValue }) => (
        <span style={{ color: "#64748b", fontSize: 13 }}>
          {getValue() ? moment(getValue()).format("DD MMM, YYYY hh:mm A") : "-"}
        </span>
      ),
      size: 180,
      enableSorting: true,
      enableColumnFilter: false,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) =>
        canEdit || canDelete || canStatus ? (
          <div className="action-dropdown">
            <Dropdown overlay={() => dropdownMenu(row.original)} placement="bottomRight" trigger={["click"]}>
              <button className="action-dropdown-trigger">
                <FontAwesomeIcon icon={faEllipsis} />
              </button>
            </Dropdown>
          </div>
        ) : (
          <span className="text-muted">-</span>
        ),
      size: 100,
      enableSorting: false,
      enableResizing: false,
      enableGlobalFilter: false,
    },
  ];

  return (
    <div>
      <Top_navbar title="Other Article Pages" />
      <div className="admin-page-container">
        <div className="page-header">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="page-title">Other Article Pages</h1>
              <p className="page-subtitle">Manage Indian Open Champions, International Wins, and Indians at Majors pages.</p>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="action-button secondary" onClick={() => getList()}>
                <FontAwesomeIcon icon={faRefresh} />
                Refresh
              </button>
              {canEdit && (
                <button className="action-button primary" onClick={() => navigate("/admin/cms/other-article-pages/addeditdata", { state: { tour_type: activeTab === "F" ? "F" : "M" } })}>
                  <FontAwesomeIcon icon={faPlus} />
                  Add Other Page
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="page-body">
          <div className="content-card">
            <div className="tabs-header">
              <div className="tabs-container">
                <button className={`tab-item ${activeTab === "all" ? "active" : ""}`} onClick={() => handleTabChange("all")}>All</button>
                <button className={`tab-item ${activeTab === "A" ? "active" : ""}`} onClick={() => handleTabChange("A")}>Active</button>
                <button className={`tab-item ${activeTab === "I" ? "active" : ""}`} onClick={() => handleTabChange("I")}>Inactive</button>
                <button className={`tab-item ${activeTab === "F" ? "active" : ""}`} onClick={() => handleTabChange("F")}>NextGen</button>
              </div>
            </div>
            <div className="content-card-body">
              <EnhancedTable
                data={rows}
                columns={columns}
                isLoading={isLoading}
                currentPage={currentPage}
                totalPages={Math.ceil((count || 0) / limit) || 1}
                limit={limit}
                skip={(currentPage - 1) * limit}
                count={count}
                onPageChange={setCurrentPage}
                onLimitChange={(value) => {
                  setLimit(value);
                  setCurrentPage(1);
                }}
                serverColumnFilters={serverColumnFilters}
                onServerColumnFiltersChange={setServerColumnFilters}
                onRefresh={() => getList()}
                permission={permission}
                emptyStateMessage="No other article pages found"
                activeTab={activeTab}
                exportFileName="other-article-pages"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
