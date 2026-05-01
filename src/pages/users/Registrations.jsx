import React, { useEffect, useRef, useMemo, useState, useCallback } from "react";
import { Modal, notification, Dropdown } from "antd";
import {
  faCheckCircle, faTimesCircle, faEye, faEllipsis,
  faRefresh, faUserClock, faHourglassHalf,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Top_navbar from "components/layout/TopNavbar";
import EnhancedTable from "components/table/EnhancedTable/EnhancedTable";
import { useNavigate } from "react-router-dom";
import {
  CheckCircleOutlined, InfoCircleOutlined,
  ExclamationCircleOutlined, UserOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { usePermissions } from "contexts/PermissionContext";
import { useAppDispatch, useAppSelector } from "store/hooks";
import {
  fetchUsersList, setCurrentPage, setLimit, setShowRequest,
} from "store/slices/users.slice";
import { approveRegistration, rejectRegistration } from "services/users.service";
import "styles/admin-pages.css";

const IMAGE_BASE = (() => {
  const b = process.env.REACT_APP_IMAGE_BASE_URL || '';
  return b.endsWith('/') ? b.slice(0, -1) : b;
})();
const resolveImg = (v) => {
  if (!v) return '';
  if (/^https?:\/\//i.test(v)) return v;
  return `${IMAGE_BASE}/${v.replace(/^\//, '')}`;
};

export default function Registrations() {
  const dispatch   = useAppDispatch();
  const navigate   = useNavigate();
  const targetRef  = useRef(null);
  const PERMISSION = usePermissions("users");

  const {
    listData: ALLLISTDATA, isLoading, currentPage,
    totalPages: TOTALPAGES, limit: LIMIT, skip: SKIP, count,
  } = useAppSelector((s) => s.users);

  const [serverColumnFilters, setServerColumnFilters] = useState({ full_name: "", mobile: "" });
  const [rejectModal, setRejectModal] = useState({ open: false, player: null, reason: "" });
  const [actionLoading, setActionLoading] = useState(false);

  /* ── always filter to Pending ── */
  const getList = useCallback(() => {
    dispatch(fetchUsersList({
      condition: {
        status: "P",
        ...(serverColumnFilters.full_name ? { full_name: serverColumnFilters.full_name } : {}),
        ...(serverColumnFilters.mobile    ? { mobile:    serverColumnFilters.mobile    } : {}),
      },
      skip: SKIP || 0,
      limit: LIMIT || 10,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SKIP, LIMIT, serverColumnFilters]);

  useEffect(() => {
    dispatch(setShowRequest("P"));
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
    document.title = "PGTI || Registration Approvals";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, LIMIT]);

  /* ── Approve ── */
  const handleApprove = (player) => {
    Modal.confirm({
      title: "Approve this registration?",
      icon: <ExclamationCircleOutlined style={{ color: "#16a34a" }} />,
      content: (
        <div>
          <p style={{ margin: "8px 0 4px" }}>
            Player: <strong>{player.full_name || player.name}</strong>
          </p>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
            {player.email} · {player.mobile}
          </p>
          <p style={{ margin: "12px 0 0", fontSize: 13, color: "#16a34a" }}>
            Account will be activated and a welcome notification will be sent.
          </p>
        </div>
      ),
      okText: "Approve", okButtonProps: { style: { background: "#16a34a", borderColor: "#16a34a" } },
      cancelText: "Cancel",
      onOk: async () => {
        setActionLoading(true);
        const res = await approveRegistration({ id: player.id });
        setActionLoading(false);
        notification.open({
          message: res.status ? "Approved" : "Oops!",
          description: res.message || (res.status ? "Player approved successfully." : "Failed to approve."),
          placement: "topRight",
          icon: res.status
            ? <CheckCircleOutlined style={{ color: "green" }} />
            : <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 3,
        });
        if (res.status) getList();
      },
    });
  };

  /* ── Reject modal ── */
  const openRejectModal = (player) => setRejectModal({ open: true, player, reason: "" });

  const handleReject = async () => {
    if (!rejectModal.player) return;
    setActionLoading(true);
    const res = await rejectRegistration({ id: rejectModal.player.id, reason: rejectModal.reason.trim() });
    setActionLoading(false);
    setRejectModal({ open: false, player: null, reason: "" });
    notification.open({
      message: res.status ? "Rejected" : "Oops!",
      description: res.message || (res.status ? "Registration rejected." : "Failed to reject."),
      placement: "topRight",
      icon: res.status
        ? <CheckCircleOutlined style={{ color: "orange" }} />
        : <InfoCircleOutlined style={{ color: "red" }} />,
      duration: 3,
    });
    if (res.status) getList();
  };

  /* ── columns ── */
  const columns = useMemo(() => [
    {
      id: "select",
      header: ({ table }) => <input type="checkbox" checked={table.getIsAllRowsSelected()} onChange={table.getToggleAllRowsSelectedHandler()} style={{ cursor: "pointer" }} />,
      cell: ({ row }) => <input type="checkbox" checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} style={{ cursor: "pointer" }} />,
      size: 50, enableSorting: false, enableResizing: false, enableGlobalFilter: false,
    },
    {
      accessorKey: "index",
      header: "#",
      cell: ({ row }) => <span style={{ color: "#94a3b8", fontSize: 13 }}>{row.index + SKIP + 1}</span>,
      size: 60, enableSorting: false,
    },
    {
      accessorKey: "full_name",
      header: "Player",
      cell: ({ row }) => {
        const item = row.original;
        const name = item.full_name || item.name || "—";
        const img  = resolveImg(item.profile_image || item.image);
        const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {img ? (
              <img src={img} alt={name} style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", border: "2px solid #e2e8f0", flexShrink: 0 }} onError={e => { e.target.style.display = "none"; }} />
            ) : (
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#1e3a5f,#0369a1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13, fontWeight: 700, color: "white" }}>
                {initials || <UserOutlined />}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#1e3a5f", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 160 }}>{name}</div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>{item.email || "No email"}</div>
            </div>
          </div>
        );
      },
      size: 220, enableSorting: true, enableColumnFilter: true,
    },
    {
      accessorKey: "mobile",
      header: "Mobile",
      cell: ({ getValue }) => <span style={{ fontSize: 13, color: "#334155" }}>{getValue() || "—"}</span>,
      size: 140, enableColumnFilter: true,
    },
    {
      accessorKey: "player_type",
      header: "Type",
      cell: ({ getValue }) => {
        const v = getValue();
        if (!v) return <span style={{ color: "#cbd5e1", fontSize: 12 }}>—</span>;
        const isPro = v === "Professional";
        return <span style={{ fontSize: 12, fontWeight: 600, background: isPro ? "#eff6ff" : "#f0fdf4", color: isPro ? "#1d4ed8" : "#16a34a", padding: "2px 10px", borderRadius: 20 }}>{v}</span>;
      },
      size: 130,
    },
    {
      accessorKey: "pgti_membership_id",
      header: "PGTI ID",
      cell: ({ getValue }) => getValue()
        ? <span style={{ fontSize: 12, fontFamily: "monospace", background: "#eff6ff", color: "#1d4ed8", padding: "2px 8px", borderRadius: 6, border: "1px solid #bfdbfe" }}>{getValue()}</span>
        : <span style={{ color: "#cbd5e1", fontSize: 12 }}>—</span>,
      size: 130,
    },
    {
      accessorKey: "experience_years",
      header: "Exp.",
      cell: ({ getValue }) => getValue() ? <span style={{ fontSize: 13 }}>{getValue()} yrs</span> : <span style={{ color: "#cbd5e1", fontSize: 12 }}>—</span>,
      size: 80,
    },
    {
      accessorKey: "created_at",
      header: "Submitted",
      cell: ({ getValue }) => (
        <div>
          <div style={{ fontSize: 12, color: "#334155" }}>{getValue() ? moment(getValue()).format("DD MMM YYYY") : "—"}</div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>{getValue() ? moment(getValue()).fromNow() : ""}</div>
        </div>
      ),
      size: 130,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button
              className="action-button primary"
              style={{ fontSize: 11, padding: "4px 12px", background: "#16a34a", borderColor: "#16a34a" }}
              onClick={() => handleApprove(item)}
              disabled={actionLoading}
            >
              <FontAwesomeIcon icon={faCheckCircle} /> Approve
            </button>
            <button
              className="action-button danger"
              style={{ fontSize: 11, padding: "4px 12px" }}
              onClick={() => openRejectModal(item)}
              disabled={actionLoading}
            >
              <FontAwesomeIcon icon={faTimesCircle} /> Reject
            </button>
            <Dropdown
              overlay={
                <div className="action-dropdown-menu">
                  <button className="action-dropdown-item" onClick={() => navigate("/admin/users/viewdata", { state: item })}>
                    <FontAwesomeIcon icon={faEye} /><span>View Profile</span>
                  </button>
                </div>
              }
              placement="bottomRight"
              trigger={["click"]}
            >
              <button className="action-dropdown-trigger"><FontAwesomeIcon icon={faEllipsis} /></button>
            </Dropdown>
          </div>
        );
      },
      size: 220, enableSorting: false, enableResizing: false,
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [SKIP, actionLoading]);

  return (
    <div className="admin-page-container" ref={targetRef}>
      <Top_navbar title="Registration Approvals" />

      {/* Banner */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        background: "linear-gradient(135deg,#fffbeb,#fef9c3)",
        border: "1px solid #fde68a", borderRadius: 12,
        padding: "16px 24px", marginBottom: 20,
      }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <FontAwesomeIcon icon={faHourglassHalf} style={{ color: "#d97706", fontSize: 20 }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#92400e" }}>
            {count} Registration{count !== 1 ? "s" : ""} Awaiting Approval
          </div>
          <div style={{ fontSize: 13, color: "#b45309", marginTop: 2 }}>
            Review each submission before granting portal access. Approve to activate, Reject to decline.
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fbbf24", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: "white" }}>{count}</span>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="tabs-header">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FontAwesomeIcon icon={faUserClock} style={{ color: "#d97706" }} />
            <span style={{ fontWeight: 600, color: "#1e3a5f", fontSize: 14 }}>Pending Registrations</span>
          </div>
          <div className="tabs-actions">
            <button className="action-button secondary" onClick={getList}>
              <FontAwesomeIcon icon={faRefresh} /> Refresh
            </button>
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
            onPageChange={(page) => { dispatch(setCurrentPage(page)); targetRef.current?.scrollIntoView({ behavior: "smooth" }); }}
            onLimitChange={(n) => { dispatch(setLimit(Number(n))); }}
            serverColumnFilters={serverColumnFilters}
            onServerColumnFiltersChange={setServerColumnFilters}
            onRefresh={getList}
            permission={PERMISSION}
            emptyStateMessage="No pending registrations"
            targetRef={targetRef}
          />
        </div>
      </div>

      {/* Reject reason modal */}
      <Modal
        open={rejectModal.open}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FontAwesomeIcon icon={faTimesCircle} style={{ color: "#dc2626" }} />
            <span>Reject Registration</span>
          </div>
        }
        onCancel={() => setRejectModal({ open: false, player: null, reason: "" })}
        onOk={handleReject}
        okText="Reject Registration"
        okButtonProps={{ danger: true, loading: actionLoading }}
        cancelText="Cancel"
      >
        {rejectModal.player && (
          <div>
            <div style={{ padding: "12px 16px", background: "#fef2f2", borderRadius: 8, border: "1px solid #fca5a5", marginBottom: 16 }}>
              <div style={{ fontWeight: 600, color: "#991b1b" }}>{rejectModal.player.full_name || rejectModal.player.name}</div>
              <div style={{ fontSize: 13, color: "#b91c1c", marginTop: 2 }}>
                {rejectModal.player.email} · {rejectModal.player.mobile}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Rejection Reason <span style={{ fontSize: 12, color: "#94a3b8" }}>(optional — sent to player)</span></label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="e.g. Incomplete information submitted. Please re-register with valid PGTI ID."
                value={rejectModal.reason}
                onChange={(e) => setRejectModal((p) => ({ ...p, reason: e.target.value }))}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
