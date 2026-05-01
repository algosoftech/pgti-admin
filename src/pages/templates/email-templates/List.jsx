import React, { useEffect, useRef, useMemo, useState } from "react";
import { Dropdown, notification, Modal } from "antd";
import {
  faEdit, faThumbsUp, faThumbsDown, faPlus,
  faRefresh, faTrash, faEllipsis, faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Top_navbar from "components/layout/TopNavbar";
import EnhancedTable from "components/table/EnhancedTable/EnhancedTable";
import { useNavigate } from "react-router-dom";
import { InfoCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import moment from "moment";
import { usePermissions } from "contexts/PermissionContext";
import "styles/admin-pages.css";
import { useAppDispatch, useAppSelector } from "store/hooks";
import {
  fetchEmailTemplatesList,
  changeEmailTemplateStatus,
  deleteEmailTemplateAction,
  setCurrentPage,
  setLimit,
  setShowRequest,
} from "store/slices/emailTemplates.slice";

/* ── Category badge colours ─────────────────────────────── */
const CATEGORY_STYLES = {
  welcome:      { bg: "#f0fdf4", color: "#16a34a", label: "Welcome" },
  password:     { bg: "#fff7ed", color: "#c2410c", label: "Password Reset" },
  order:        { bg: "#eff6ff", color: "#1d4ed8", label: "Order" },
  event:        { bg: "#fdf4ff", color: "#7e22ce", label: "Event" },
  newsletter:   { bg: "#f0f9ff", color: "#0369a1", label: "Newsletter" },
  promotional:  { bg: "#fef9c3", color: "#a16207", label: "Promotional" },
  notification: { bg: "#f1f5f9", color: "#334155", label: "Notification" },
  general:      { bg: "#f8fafc", color: "#64748b", label: "General" },
};

export default function EmailTemplatesList() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const targetRef = useRef(null);

  const {
    listData: ALLLISTDATA, isLoading, currentPage,
    totalPages: TOTALPAGES, limit: LIMIT, skip: SKIP, showRequest, count,
  } = useAppSelector((state) => state.emailTemplates);

  const PERMISSION = usePermissions("email_templates");
  const [activeTab, setActiveTab] = useState("all");
  const [serverColumnFilters, setServerColumnFilters] = useState({ name: "", category: "", status: "" });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    dispatch(setShowRequest(tab === "all" ? "" : tab.toUpperCase()));
  };

  const handleEdit = (item = {}) => navigate("/admin/templates/email-templates/addeditdata", { state: item });

  const columns = useMemo(() => [
    {
      id: "select",
      header: ({ table }) => <input type="checkbox" checked={table.getIsAllRowsSelected()} onChange={table.getToggleAllRowsSelectedHandler()} style={{ cursor: "pointer" }} />,
      cell: ({ row }) => <input type="checkbox" checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} style={{ cursor: "pointer" }} />,
      size: 60, enableSorting: false, enableResizing: false, enableGlobalFilter: false,
    },
    {
      accessorKey: "index",
      header: "#",
      cell: ({ row }) => row.index + SKIP + 1,
      size: 70, enableSorting: true, enableGlobalFilter: false, enableHiding: true,
    },
    {
      accessorKey: "name",
      header: "Template Name",
      cell: ({ getValue, row }) => (
        <div>
          <div className="font-weight-600" style={{ marginBottom: 2 }}>{getValue() || "—"}</div>
          <div style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>{row.original.slug || ""}</div>
        </div>
      ),
      size: 220, enableSorting: true, enableColumnFilter: true, enableHiding: true,
    },
    {
      accessorKey: "subject",
      header: "Subject Line",
      cell: ({ getValue }) => (
        <div style={{ fontSize: 13, color: "#334155", maxWidth: 280 }}>
          {getValue()?.length > 60 ? getValue().substring(0, 60) + "…" : getValue() || "—"}
        </div>
      ),
      size: 280, enableSorting: true, enableColumnFilter: false, enableHiding: true,
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ getValue }) => {
        const cat = getValue() || "general";
        const style = CATEGORY_STYLES[cat] || CATEGORY_STYLES.general;
        return (
          <span style={{ fontSize: 12, background: style.bg, color: style.color, padding: "3px 10px", borderRadius: 6, fontWeight: 600 }}>
            {style.label}
          </span>
        );
      },
      size: 140, enableSorting: true, enableColumnFilter: true, enableHiding: true,
    },
    {
      accessorKey: "variables",
      header: "Variables",
      cell: ({ getValue }) => {
        const vars = (() => { try { return JSON.parse(getValue() || "[]"); } catch { return []; } })();
        if (!vars.length) return <span className="text-muted" style={{ fontSize: 12 }}>None</span>;
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            {vars.slice(0, 3).map((v, i) => (
              <span key={i} style={{ fontSize: 10, background: "#f1f5f9", color: "#475569", padding: "1px 6px", borderRadius: 4, fontFamily: "monospace" }}>
                {`{{${v}}}`}
              </span>
            ))}
            {vars.length > 3 && <span style={{ fontSize: 10, color: "#94a3b8" }}>+{vars.length - 3}</span>}
          </div>
        );
      },
      size: 180, enableSorting: false, enableColumnFilter: false, enableHiding: true,
    },
    {
      accessorKey: "updated_at",
      header: "Last Updated",
      cell: ({ getValue }) => (
        <span className="text-muted" style={{ fontSize: 12 }}>
          {getValue() ? moment(getValue()).format("DD MMM YYYY") : "—"}
        </span>
      ),
      size: 130, enableSorting: true, enableColumnFilter: false, enableHiding: true,
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
      size: 110, enableSorting: true, enableColumnFilter: false, enableHiding: true,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const item = row.original;
        return (PERMISSION?.add_edit === "Y" || PERMISSION?.change_status === "Y" || PERMISSION?.delete === "Y" || PERMISSION?.fullAccess === "Y") ? (
          <div className="action-dropdown">
            <Dropdown overlay={() => dropdownMenu(item)} placement="bottomRight" trigger={["click"]}>
              <button className="action-dropdown-trigger"><FontAwesomeIcon icon={faEllipsis} /></button>
            </Dropdown>
          </div>
        ) : <span className="text-muted">--</span>;
      },
      size: 100, enableSorting: false, enableResizing: false, enableGlobalFilter: false,
    },
  ], [SKIP, PERMISSION]);

  const getList = () => {
    dispatch(fetchEmailTemplatesList({
      type: "",
      condition: {
        ...(serverColumnFilters.name ? { name: serverColumnFilters.name } : null),
        ...(serverColumnFilters.category ? { category: serverColumnFilters.category } : null),
        ...(showRequest ? { status: showRequest } : null),
      },
      skip: SKIP || 0,
      limit: LIMIT || 10,
    }));
  };

  const handleChangeStatus = async (id, status) => {
    try {
      const result = await dispatch(changeEmailTemplateStatus({ editId: id, status })).unwrap();
      notification.open({ message: "Success", description: result.message || "Status changed.", placement: "topRight", icon: <CheckCircleOutlined style={{ color: "green" }} />, duration: 2 });
      getList();
    } catch (err) {
      notification.open({ message: "Oops!", description: err || "Failed.", placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
    }
  };

  const handleDelete = (item) => {
    Modal.confirm({
      title: "Delete this email template?",
      icon: <ExclamationCircleOutlined />,
      content: `"${item?.name}" — this action cannot be undone.`,
      okText: "Yes, Delete", okType: "danger", cancelText: "Cancel",
      onOk: async () => {
        try {
          const result = await dispatch(deleteEmailTemplateAction({ editId: item.id })).unwrap();
          notification.open({ message: "Success", description: result.message, placement: "topRight", icon: <CheckCircleOutlined style={{ color: "green" }} />, duration: 2 });
          getList();
        } catch (err) {
          notification.open({ message: "Oops!", description: err || "Failed.", placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
        }
      },
    });
  };

  const dropdownMenu = (items) => (
    <div className="action-dropdown-menu">
      {(PERMISSION?.add_edit === "Y" || PERMISSION?.fullAccess === "Y") && (
        <button className="action-dropdown-item" onClick={() => handleEdit(items)}>
          <FontAwesomeIcon icon={faEdit} /><span>Edit</span>
        </button>
      )}
      {(PERMISSION?.change_status === "Y" || PERMISSION?.fullAccess === "Y") && (
        items?.status === "A"
          ? <button className="action-dropdown-item danger" onClick={() => handleChangeStatus(items.id, "I")}><FontAwesomeIcon icon={faThumbsDown} /><span>Deactivate</span></button>
          : <button className="action-dropdown-item" onClick={() => handleChangeStatus(items.id, "A")}><FontAwesomeIcon icon={faThumbsUp} /><span>Activate</span></button>
      )}
      {(PERMISSION?.delete === "Y" || PERMISSION?.fullAccess === "Y") && (
        <button className="action-dropdown-item danger" onClick={() => handleDelete(items)}>
          <FontAwesomeIcon icon={faTrash} /><span>Delete</span>
        </button>
      )}
    </div>
  );

  useEffect(() => {
    const t = setTimeout(() => { if (currentPage !== 1) dispatch(setCurrentPage(1)); else getList(); }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverColumnFilters]);

  useEffect(() => {
    getList();
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = "PGTI || Admin || Email Templates";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, showRequest, LIMIT]);

  return (
    <div className="admin-page-container" ref={targetRef}>
      <Top_navbar title="Email Templates" />
      <div className="content-card">
        <div className="tabs-header">
          <div className="tabs-container">
            <button className={`tab-item ${activeTab === "all" ? "active" : ""}`} onClick={() => handleTabChange("all")}>All</button>
            <button className={`tab-item ${activeTab === "A" ? "active" : ""}`} onClick={() => handleTabChange("A")}>Active</button>
            <button className={`tab-item ${activeTab === "I" ? "active" : ""}`} onClick={() => handleTabChange("I")}>Inactive</button>
          </div>
          <div className="tabs-actions">
            <button className="action-button secondary" onClick={() => getList()}><FontAwesomeIcon icon={faRefresh} /> Refresh</button>
            {(PERMISSION?.add_edit === "Y" || PERMISSION?.fullAccess === "Y") && (
              <button className="action-button primary" onClick={() => handleEdit()}>
                <FontAwesomeIcon icon={faPlus} /> New Template
              </button>
            )}
          </div>
        </div>
        <div className="content-card-body">
          <EnhancedTable
            data={ALLLISTDATA} columns={columns} isLoading={isLoading}
            currentPage={currentPage} totalPages={TOTALPAGES} limit={LIMIT} skip={SKIP} count={count}
            onPageChange={(page) => { dispatch(setCurrentPage(page)); targetRef.current?.scrollIntoView({ behavior: "smooth" }); }}
            onLimitChange={(newLimit) => { dispatch(setLimit(Number(newLimit))); }}
            serverColumnFilters={serverColumnFilters}
            onServerColumnFiltersChange={setServerColumnFilters}
            onRefresh={getList} permission={PERMISSION}
            emptyStateMessage="No email templates found. Click 'New Template' to create one."
            activeTab={activeTab} targetRef={targetRef}
          />
        </div>
      </div>
    </div>
  );
}
