import React, { useEffect, useRef, useMemo, useState } from "react";
import { Dropdown, Modal, notification } from "antd";
import {
  faEdit, faEllipsis, faPlus, faRefresh,
  faUserShield, faThumbsUp, faThumbsDown, faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Top_navbar from "components/layout/TopNavbar";
import EnhancedTable from "components/table/EnhancedTable/EnhancedTable";
import { useNavigate } from "react-router-dom";
import {
  CheckCircleOutlined, InfoCircleOutlined, ExclamationCircleOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useAppDispatch, useAppSelector } from "store/hooks";
import {
  fetchAccountsList, changeAccountStatus, deleteAccountAction,
  setCurrentPage, setLimit, setShowRequest,
} from "store/slices/accounts.slice";
import "styles/admin-pages.css";

const StatusBadge = ({ status }) => (
  <span style={{
    fontSize: 12, fontWeight: 600,
    background: status === "A" ? "#f0fdf4" : "#fef2f2",
    color:      status === "A" ? "#16a34a" : "#dc2626",
    border: `1px solid ${status === "A" ? "#86efac" : "#fca5a5"}`,
    padding: "3px 12px", borderRadius: 20,
  }}>
    {status === "A" ? "Active" : "Inactive"}
  </span>
);

export default function SubAdminList() {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const targetRef = useRef(null);

  const {
    listData: ALLLISTDATA, isLoading, currentPage,
    totalPages: TOTALPAGES, limit: LIMIT, skip: SKIP,
    showRequest, count,
  } = useAppSelector((s) => s.accounts);

  const [activeTab, setActiveTab] = useState("all");
  const [serverColumnFilters, setServerColumnFilters] = useState({ name: "", email: "" });

  const activeCount   = useMemo(() => ALLLISTDATA.filter(a => a.status === "A").length, [ALLLISTDATA]);
  const inactiveCount = useMemo(() => ALLLISTDATA.filter(a => a.status !== "A").length, [ALLLISTDATA]);

  const getList = () => {
    dispatch(fetchAccountsList({
      condition: {
        ...(serverColumnFilters.name  ? { name:  serverColumnFilters.name  } : {}),
        ...(serverColumnFilters.email ? { email: serverColumnFilters.email } : {}),
        ...(showRequest               ? { status: showRequest }              : {}),
      },
      skip:  SKIP  || 0,
      limit: LIMIT || 10,
    }));
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if (currentPage !== 1) dispatch(setCurrentPage(1));
      else getList();
    }, 400);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverColumnFilters]);

  useEffect(() => {
    getList();
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = "PGTI || Sub Administrators";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, showRequest, LIMIT]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    dispatch(setShowRequest(tab === "all" ? "" : tab));
  };

  const handleStatusChange = async (id, status) => {
    const res = await dispatch(changeAccountStatus({ id, status }));
    notification.open({
      message: changeAccountStatus.fulfilled.match(res) ? "Status Updated" : "Oops!",
      description: changeAccountStatus.fulfilled.match(res)
        ? `Administrator ${status === "A" ? "activated" : "deactivated"} successfully.`
        : (res.payload || "Failed to update status."),
      placement: "topRight",
      icon: changeAccountStatus.fulfilled.match(res)
        ? <CheckCircleOutlined style={{ color: "green" }} />
        : <InfoCircleOutlined style={{ color: "red" }} />,
      duration: 2,
    });
  };

  const handleDelete = (item) => {
    Modal.confirm({
      title: "Delete this administrator?",
      icon: <ExclamationCircleOutlined style={{ color: "#dc2626" }} />,
      content: (
        <div>
          <p style={{ margin: "8px 0 4px" }}>
            Administrator: <strong>{item.name}</strong>
          </p>
          <p style={{ margin: 0, fontSize: 13, color: "#dc2626" }}>
            This action cannot be undone. All permissions for this account will be removed.
          </p>
        </div>
      ),
      okText: "Delete", okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: async () => {
        const res = await dispatch(deleteAccountAction({ id: item.id }));
        notification.open({
          message: deleteAccountAction.fulfilled.match(res) ? "Deleted" : "Oops!",
          description: deleteAccountAction.fulfilled.match(res)
            ? "Administrator deleted successfully."
            : (res.payload || "Failed to delete."),
          placement: "topRight",
          icon: deleteAccountAction.fulfilled.match(res)
            ? <CheckCircleOutlined style={{ color: "green" }} />
            : <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
      },
    });
  };

  const columns = useMemo(() => [
    {
      id: "select",
      header: ({ table }) => (
        <input type="checkbox" checked={table.getIsAllRowsSelected()} onChange={table.getToggleAllRowsSelectedHandler()} style={{ cursor: "pointer" }} />
      ),
      cell: ({ row }) => (
        <input type="checkbox" checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} style={{ cursor: "pointer" }} />
      ),
      size: 50, enableSorting: false, enableResizing: false, enableGlobalFilter: false,
    },
    {
      accessorKey: "index",
      header: "#",
      cell: ({ row }) => <span style={{ color: "#94a3b8", fontSize: 13 }}>{row.index + SKIP + 1}</span>,
      size: 60, enableSorting: false,
    },
    {
      accessorKey: "name",
      header: "Administrator",
      cell: ({ row }) => {
        const item     = row.original;
        const name     = item.name || "—";
        const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "linear-gradient(135deg,#1e3a5f,#0369a1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, fontSize: 12, fontWeight: 700, color: "white",
            }}>
              {initials}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#1e3a5f" }}>{name}</div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>{item.email || "No email"}</div>
            </div>
          </div>
        );
      },
      size: 240, enableSorting: true, enableColumnFilter: true,
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ getValue }) => (
        <span style={{ fontSize: 13, color: "#334155" }}>{getValue() || "—"}</span>
      ),
      size: 150,
    },
    {
      accessorKey: "admin_type",
      header: "Role",
      cell: ({ getValue }) => {
        const v = getValue() || "Sub Admin";
        return (
          <span style={{ fontSize: 11, fontWeight: 600, background: "#eff6ff", color: "#1d4ed8", padding: "2px 10px", borderRadius: 20, border: "1px solid #bfdbfe" }}>
            {v}
          </span>
        );
      },
      size: 120,
    },
    {
      accessorKey: "login_at",
      header: "Last Login",
      cell: ({ getValue }) => {
        const v = getValue();
        return v ? (
          <div>
            <div style={{ fontSize: 12, color: "#334155" }}>{moment(v).format("DD MMM YYYY")}</div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>{moment(v).fromNow()}</div>
          </div>
        ) : <span style={{ fontSize: 12, color: "#cbd5e1" }}>Never</span>;
      },
      size: 150,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => <StatusBadge status={getValue()} />,
      size: 110,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <Dropdown
            overlay={
              <div className="action-dropdown-menu">
                <button className="action-dropdown-item" onClick={() => navigate("/admin/accounts/addeditdata", { state: item })}>
                  <FontAwesomeIcon icon={faEdit} /><span>Edit</span>
                </button>
                {item.status === "I" && (
                  <button className="action-dropdown-item" onClick={() => handleStatusChange(item.id, "A")}>
                    <FontAwesomeIcon icon={faThumbsUp} /><span>Activate</span>
                  </button>
                )}
                {item.status === "A" && (
                  <button className="action-dropdown-item" onClick={() => handleStatusChange(item.id, "I")}>
                    <FontAwesomeIcon icon={faThumbsDown} /><span>Deactivate</span>
                  </button>
                )}
                <button className="action-dropdown-item danger" onClick={() => handleDelete(item)}>
                  <FontAwesomeIcon icon={faTrash} /><span>Delete</span>
                </button>
              </div>
            }
            placement="bottomRight"
            trigger={["click"]}
          >
            <button className="action-dropdown-trigger"><FontAwesomeIcon icon={faEllipsis} /></button>
          </Dropdown>
        );
      },
      size: 80, enableSorting: false, enableResizing: false,
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [SKIP]);

  return (
    <div className="admin-page-container" ref={targetRef}>
      <Top_navbar title="Sub Administrators" />

      {/* Stats strip */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        {[
          { label: "Total Admins", value: count,        color: "#1d4ed8" },
          { label: "Active",       value: activeCount,  color: "#16a34a" },
          { label: "Inactive",     value: inactiveCount,color: "#dc2626" },
        ].map(s => (
          <div key={s.label} style={{ flex: "1 1 140px", background: "white", borderRadius: 10, border: "1px solid #e2e8f0", padding: "14px 18px" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value ?? "—"}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="content-card">
        <div className="tabs-header">
          <div className="tabs-container">
            {[
              { key: "all", label: "All" },
              { key: "A",   label: "Active" },
              { key: "I",   label: "Inactive" },
            ].map(t => (
              <button key={t.key} className={`tab-item ${activeTab === t.key ? "active" : ""}`} onClick={() => handleTabChange(t.key)}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="tabs-actions">
            <button className="action-button secondary" onClick={getList}>
              <FontAwesomeIcon icon={faRefresh} /> Refresh
            </button>
            <button className="action-button primary" onClick={() => navigate("/admin/accounts/addeditdata")}>
              <FontAwesomeIcon icon={faPlus} /> Create Admin
            </button>
          </div>
        </div>

        {/* Info bar */}
        <div style={{ padding: "10px 20px", background: "#f0f9ff", borderBottom: "1px solid #e0f2fe", display: "flex", alignItems: "center", gap: 8 }}>
          <FontAwesomeIcon icon={faUserShield} style={{ color: "#0369a1", fontSize: 13 }} />
          <span style={{ fontSize: 12, color: "#0369a1" }}>
            Sub-admins have limited access based on assigned module permissions. Only Super Admins can manage this section.
          </span>
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
            onPageChange={(page) => { dispatch(setCurrentPage(page)); targetRef.current?.scrollIntoView({ behavior: "smooth" }); }}
            onLimitChange={(n) => { dispatch(setLimit(Number(n))); }}
            serverColumnFilters={serverColumnFilters}
            onServerColumnFiltersChange={setServerColumnFilters}
            onRefresh={getList}
            permission={{ fullAccess: "Y" }}
            emptyStateMessage="No administrators found"
            targetRef={targetRef}
          />
        </div>
      </div>
    </div>
  );
}
