import React, { useEffect, useRef, useMemo, useState } from "react";
import { Dropdown, notification, Modal } from "antd";
import {
  faEdit, faEye, faThumbsUp, faThumbsDown,
  faPlus, faRefresh, faTrash, faEllipsis, faKey,
  faUsers, faUserCheck, faUserXmark, faUserGraduate, faBan,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Top_navbar from "components/layout/TopNavbar";
import EnhancedTable from "components/table/EnhancedTable/EnhancedTable";
import { useNavigate } from "react-router-dom";
import {
  InfoCircleOutlined, CheckCircleOutlined,
  ExclamationCircleOutlined, UserOutlined, PictureOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { usePermissions } from "contexts/PermissionContext";
import "styles/admin-pages.css";
import { useAppDispatch, useAppSelector } from "store/hooks";
import ListingBannerPreviewModal from "components/cms/ListingBannerPreviewModal";
import {
  fetchUsersList, changeUserStatus, changeUserRestriction, deletePlayerAction,
  setCurrentPage, setLimit, setShowRequest,
} from "store/slices/users.slice";
import { getPlayersListingBanner, resetPlayerPassword } from "services/users.service";

const IMAGE_BASE = (() => {
  const b = process.env.REACT_APP_IMAGE_BASE_URL || '';
  return b.endsWith('/') ? b.slice(0, -1) : b;
})();

const PLAYER_PRIZE_WS_URL = (() => {
  const apiBase = (process.env.REACT_APP_API_BASE_URL || "").trim();
  if (!apiBase) return "";

  try {
    const parsed = new URL(apiBase, window.location.origin);
    const protocol = parsed.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${parsed.host}/ws/player-prize`;
  } catch {
    return "";
  }
})();

const resolveImg = (v) => {
  if (!v) return '';
  if (/^https?:\/\//i.test(v)) return v;
  return `${IMAGE_BASE}/${v.replace(/^\//, '')}`;
};

const PLAYER_TYPE_STYLE = {
  Professional: { bg: "#eff6ff", color: "#1d4ed8" },
  Amateur:      { bg: "#f0fdf4", color: "#16a34a" },
};

const resolveMemberCode = (item = {}) =>
  item.pgti_membership_id || item.legacy_member_code || item.mem_code || item.prize_member_code || "";

const resolveImportedMemberCode = (item = {}) =>
  item.legacy_member_code || item.mem_code || item.prize_member_code || "";

const resolveMemberShortCode = (item = {}) =>
  item.legacy_member_short_code || item.mem_scode || item.prize_member_short_code || "";

const StatCard = ({ icon, label, value, color }) => (
  <div style={{
    flex: "1 1 160px", background: "white", borderRadius: 12,
    border: "1px solid #e2e8f0", padding: "16px 20px",
    display: "flex", alignItems: "center", gap: 14,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 10, flexShrink: 0,
      background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <FontAwesomeIcon icon={icon} style={{ color, fontSize: 18 }} />
    </div>
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, color: "#1e3a5f", lineHeight: 1 }}>{value ?? "—"}</div>
      <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>{label}</div>
    </div>
  </div>
);

export default function UsersList() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const targetRef = useRef(null);
  const prizeSocketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const user = JSON.parse(sessionStorage.getItem("ADMIN-INFO"));

  const {
    listData: ALLLISTDATA, isLoading, currentPage,
    totalPages: TOTALPAGES, limit: LIMIT, skip: SKIP,
    showRequest, count, stats,
  } = useAppSelector((state) => state.users);

  const PERMISSION = usePermissions("users");
  const [activeTab, setActiveTab] = useState("all");
  const [listingBanner, setListingBanner] = useState(null);
  const [bannerPreviewOpen, setBannerPreviewOpen] = useState(false);

  const [serverColumnFilters, setServerColumnFilters] = useState({
    full_name: "", email: "", mobile: "", member_code: "",
  });

  const canEdit = user?.admin_type === "Super Admin" || PERMISSION?.add_edit === "Y" || PERMISSION?.fullAccess === "Y";
  const canStatus = user?.admin_type === "Super Admin" || PERMISSION?.change_status === "Y" || PERMISSION?.fullAccess === "Y";
  const canDelete = user?.admin_type === "Super Admin" || PERMISSION?.delete === "Y" || PERMISSION?.fullAccess === "Y";

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    dispatch(setShowRequest(tab === "all" ? "" : tab));
  };

  const handleEdit = (item = {}) => navigate("/admin/users/addeditdata", { state: item });
  const handleView = (item = {}) => navigate("/admin/users/viewdata", { state: item });
  const openListingBannerEditor = () => navigate("/admin/users/listing-banner", { state: listingBanner || {} });

  const loadListingBanner = async () => {
    const response = await getPlayersListingBanner();
    if (response?.status) {
      setListingBanner(response.result || null);
    }
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
      title: "Edit players listing banner?",
      icon: <ExclamationCircleOutlined />,
      content: "This will open the players listing banner editor. Do you want to continue?",
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
      await dispatch(changeUserStatus({ id, status })).unwrap();
      notification.open({
        message: "Success",
        description: `Player ${status === "A" ? "activated" : "deactivated"} successfully.`,
        placement: "topRight", icon: <CheckCircleOutlined style={{ color: "green" }} />, duration: 2,
      });
    } catch (err) {
      notification.open({ message: "Oops!", description: err || "Operation failed.", placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
    }
  };

  const handleChangeRestriction = (item) => {
    const nextRestricted = !item?.is_restricted;
    Modal.confirm({
      title: nextRestricted ? "Restrict this player?" : "Remove player restriction?",
      icon: <ExclamationCircleOutlined />,
      content: nextRestricted
        ? `Player: ${item?.full_name || item?.name || "Unknown"} will not be able to login or access player portal functionality.`
        : `Player: ${item?.full_name || item?.name || "Unknown"} will be allowed to login again if the account is active.`,
      okText: nextRestricted ? "Yes, Restrict" : "Yes, Remove Restriction",
      okType: nextRestricted ? "danger" : "primary",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await dispatch(changeUserRestriction({ id: item.id, is_restricted: nextRestricted })).unwrap();
          notification.open({
            message: "Success",
            description: nextRestricted ? "Player restricted successfully." : "Player restriction removed successfully.",
            placement: "topRight",
            icon: <CheckCircleOutlined style={{ color: "green" }} />,
            duration: 2,
          });
          getList();
        } catch (err) {
          notification.open({
            message: "Oops!",
            description: err || "Failed to update restriction.",
            placement: "topRight",
            icon: <InfoCircleOutlined style={{ color: "red" }} />,
            duration: 2,
          });
        }
      },
    });
  };

  const handleDelete = (item) => {
    Modal.confirm({
      title: "Delete this player account?",
      icon: <ExclamationCircleOutlined />,
      content: `Player: ${item?.full_name || item?.name || "Unknown"} — this cannot be undone.`,
      okText: "Yes, Delete", okType: "danger", cancelText: "Cancel",
      onOk: async () => {
        try {
          await dispatch(deletePlayerAction({ id: item.id })).unwrap();
          notification.open({ message: "Deleted", description: "Player deleted successfully.", placement: "topRight", icon: <CheckCircleOutlined style={{ color: "green" }} />, duration: 2 });
        } catch (err) {
          notification.open({ message: "Oops!", description: err || "Failed to delete.", placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
        }
      },
    });
  };

  const handleResetPassword = (item) => {
    Modal.confirm({
      title: "Reset player password?",
      icon: <ExclamationCircleOutlined />,
      content: `A temporary password will be sent to ${item?.email || item?.mobile || "the player"}.`,
      okText: "Yes, Reset", cancelText: "Cancel",
      onOk: async () => {
        const res = await resetPlayerPassword({ id: item.id });
        notification.open({
          message: res.status ? "Done" : "Oops!",
          description: res.message || (res.status ? "Password reset." : "Failed."),
          placement: "topRight",
          icon: res.status ? <CheckCircleOutlined style={{ color: "green" }} /> : <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 3,
        });
      },
    });
  };

  const dropdownMenu = (item) => (
    <div className="action-dropdown-menu">
      <button className="action-dropdown-item" onClick={() => handleView(item)}>
        <FontAwesomeIcon icon={faEye} /><span>View Profile</span>
      </button>
      {canEdit && (
        <button className="action-dropdown-item" onClick={() => handleEdit(item)}>
          <FontAwesomeIcon icon={faEdit} /><span>Edit</span>
        </button>
      )}
      {canEdit && (
        <button className="action-dropdown-item" onClick={() => handleResetPassword(item)}>
          <FontAwesomeIcon icon={faKey} /><span>Reset Password</span>
        </button>
      )}
      {canStatus && (
        item?.status === "A" ? (
          <button className="action-dropdown-item danger" onClick={() => handleChangeStatus(item.id, "I")}>
            <FontAwesomeIcon icon={faThumbsDown} /><span>Deactivate</span>
          </button>
        ) : (
          <button className="action-dropdown-item" onClick={() => handleChangeStatus(item.id, "A")}>
            <FontAwesomeIcon icon={faThumbsUp} /><span>Activate</span>
          </button>
        )
      )}
      {canStatus && (
        <button
          className={`action-dropdown-item ${item?.is_restricted ? "" : "danger"}`}
          onClick={() => handleChangeRestriction(item)}
        >
          <FontAwesomeIcon icon={item?.is_restricted ? faThumbsUp : faBan} />
          <span>{item?.is_restricted ? "Remove Restriction" : "Restrict Player"}</span>
        </button>
      )}
      {canDelete && (
        <button className="action-dropdown-item danger" onClick={() => handleDelete(item)}>
          <FontAwesomeIcon icon={faTrash} /><span>Delete</span>
        </button>
      )}
    </div>
  );

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
      size: 60, enableSorting: false, enableGlobalFilter: false,
    },
    {
      accessorKey: "full_name",
      header: "Player",
      cell: ({ row }) => {
        const item = row.original;
        const name = item.full_name || item.name || "—";
        const img = resolveImg(item.profile_image || item.image);
        const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {img ? (
              <img src={img} alt={name} style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", border: "2px solid #e2e8f0", flexShrink: 0 }} onError={(e) => { e.target.style.display = "none"; }} />
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
      size: 140, enableSorting: false, enableColumnFilter: true,
    },
    {
      accessorKey: "pgti_membership_id",
      header: "Member Codes",
      cell: ({ row }) => {
        const item = row.original || {};
        const primaryCode = resolveMemberCode(item);
        const importedCode = resolveImportedMemberCode(item);
        const shortCode = resolveMemberShortCode(item);

        if (!primaryCode && !shortCode) {
          return <span style={{ color: "#cbd5e1", fontSize: 12 }}>--</span>;
        }

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {primaryCode && (
              <span style={{ fontSize: 12, fontFamily: "monospace", background: "#eff6ff", color: "#1d4ed8", padding: "2px 8px", borderRadius: 6, border: "1px solid #bfdbfe", width: "fit-content" }}>
                {primaryCode}
              </span>
            )}
            {shortCode && (
              <span style={{ fontSize: 11, color: "#64748b" }}>
                Short: <span style={{ fontFamily: "monospace" }}>{shortCode}</span>
              </span>
            )}
            {importedCode && importedCode !== item.pgti_membership_id && (
              <span style={{ fontSize: 10, color: "#16a34a" }}>Web import</span>
            )}
          </div>
        );
      },
      size: 170, enableSorting: true, enableColumnFilter: true,
    },
    {
      accessorKey: "player_type",
      header: "Type",
      cell: ({ getValue }) => {
        const v = getValue();
        const s = PLAYER_TYPE_STYLE[v];
        return s
          ? <span style={{ fontSize: 12, fontWeight: 600, background: s.bg, color: s.color, padding: "2px 10px", borderRadius: 20 }}>{v}</span>
          : <span style={{ color: "#94a3b8", fontSize: 12 }}>—</span>;
      },
      size: 130, enableSorting: true, enableColumnFilter: false,
    },
    {
      accessorKey: "experience_years",
      header: "Exp.",
      cell: ({ getValue }) => getValue()
        ? <span style={{ fontSize: 13, color: "#334155" }}>{getValue()} yr{getValue() !== 1 ? "s" : ""}</span>
        : <span style={{ color: "#cbd5e1", fontSize: 12 }}>—</span>,
      size: 80, enableSorting: true,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original.status;
        const map = { A: ["active", "Active"], I: ["inactive", "Inactive"] };
        if (row.original.is_restricted) {
          return (
            <span
              className="status-badge"
              style={{ background: "#fff1f2", color: "#be123c", borderColor: "#fecdd3" }}
            >
              Restricted
            </span>
          );
        }
        if (row.original.is_alumni) {
          return (
            <span
              className="status-badge"
              style={{ background: "#f3e8ff", color: "#7c3aed", borderColor: "#d8b4fe" }}
            >
              Alumni
            </span>
          );
        }
        const [cls, label] = row.original.is_alumni
          ? ["pending", "Alumni"]
          : (map[s] || ["inactive", s || "—"]);
        return <span className={`status-badge ${cls}`}>{label}</span>;
      },
      size: 110, enableSorting: true,
    },
    {
      accessorKey: "created_at",
      header: "Joined",
      cell: ({ getValue }) => <span style={{ fontSize: 12, color: "#64748b" }}>{getValue() ? moment(getValue()).format("DD MMM YYYY") : "—"}</span>,
      size: 120, enableSorting: true,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        canEdit || canStatus || canDelete ? (
          <div className="action-dropdown">
            <Dropdown overlay={() => dropdownMenu(row.original)} placement="bottomRight" trigger={["click"]}>
              <button className="action-dropdown-trigger"><FontAwesomeIcon icon={faEllipsis} /></button>
            </Dropdown>
          </div>
        ) : (
          <span className="text-muted">--</span>
        )
      ),
      size: 90, enableSorting: false, enableResizing: false, enableGlobalFilter: false,
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [SKIP, canDelete, canEdit, canStatus]);

  const getList = () => {
    dispatch(fetchUsersList({
      condition: {
        ...(serverColumnFilters.full_name ? { full_name: serverColumnFilters.full_name } : {}),
        ...(serverColumnFilters.email     ? { email: serverColumnFilters.email }         : {}),
        ...(serverColumnFilters.mobile    ? { mobile: serverColumnFilters.mobile }       : {}),
        ...(serverColumnFilters.member_code ? { member_code: serverColumnFilters.member_code } : {}),
        ...(showRequest                   ? { status: showRequest }                      : {}),
      },
      skip: SKIP || 0,
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
    loadListingBanner();
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = "PGTI || Player Management";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, showRequest, LIMIT]);

  useEffect(() => {
    if (!PLAYER_PRIZE_WS_URL) return undefined;

    let disposed = false;

    const connect = () => {
      if (disposed) return;

      try {
        const socket = new WebSocket(PLAYER_PRIZE_WS_URL);
        prizeSocketRef.current = socket;

        socket.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data || "{}");
            if (payload?.type !== "player_prize_sync_updated") return;

            getList();
            notification.open({
              key: "player-prize-sync-updated",
              message: "Player rankings updated",
              description: `Latest prize sync completed${payload?.synced_at ? ` at ${payload.synced_at}` : "."}`,
              placement: "topRight",
              icon: <CheckCircleOutlined style={{ color: "green" }} />,
              duration: 3,
            });
          } catch {
            // ignore malformed messages
          }
        };

        socket.onclose = () => {
          prizeSocketRef.current = null;
          if (!disposed) {
            reconnectTimerRef.current = setTimeout(connect, 5000);
          }
        };

        socket.onerror = () => {
          try { socket.close(); } catch {}
        };
      } catch {
        reconnectTimerRef.current = setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      disposed = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
      if (prizeSocketRef.current && prizeSocketRef.current.readyState < 2) {
        prizeSocketRef.current.close();
      }
      prizeSocketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="admin-page-container" ref={targetRef}>
      <Top_navbar title="Player Management" />

      {/* Stats */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        <StatCard icon={faUsers}        label="Total Players"    value={stats?.total ?? count} color="#1d4ed8" />
        <StatCard icon={faUserCheck}    label="Active Players"   value={stats?.active ?? 0}    color="#16a34a" />
        <StatCard icon={faUserXmark}    label="Inactive Players" value={stats?.inactive ?? 0}  color="#dc2626" />
        <StatCard icon={faBan}          label="Restricted Players" value={stats?.restricted ?? 0} color="#be123c" />
        <StatCard icon={faUserGraduate} label="Alumni Players"   value={stats?.alumni ?? 0}    color="#7c3aed" />
      </div>

      <div className="content-card">
        <div className="tabs-header">
          <div className="tabs-container">
            {[
              { key: "all", label: "All Players" },
              { key: "A",   label: "Active" },
              { key: "I",   label: "Inactive" },
              { key: "restricted", label: "Restricted Players" },
              { key: "alumni", label: "Alumni" },
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
            {canEdit && (
              <button className="action-button secondary" onClick={handleListingBannerClick}>
                <PictureOutlined /> {listingBanner ? "Preview Listing Banner" : "Add Listing Banner"}
              </button>
            )}
            {canEdit && (
              <button className="action-button primary" onClick={() => handleEdit()}>
                <FontAwesomeIcon icon={faPlus} /> Add Player
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
            onPageChange={(page) => { dispatch(setCurrentPage(page)); targetRef.current?.scrollIntoView({ behavior: "smooth" }); }}
            onLimitChange={(n) => { dispatch(setLimit(Number(n))); targetRef.current?.scrollIntoView({ behavior: "smooth" }); }}
            serverColumnFilters={serverColumnFilters}
            onServerColumnFiltersChange={setServerColumnFilters}
            onRefresh={getList}
            permission={PERMISSION}
            emptyStateMessage="No players found"
            activeTab={activeTab}
            targetRef={targetRef}
          />
        </div>
      </div>

      <ListingBannerPreviewModal
        open={bannerPreviewOpen}
        onCancel={() => setBannerPreviewOpen(false)}
        banner={listingBanner}
        title="Players Listing Banner"
        description="Review the current desktop and mobile hero banner shown on the front players listing page."
        onEdit={confirmBannerEdit}
      />
    </div>
  );
}
