import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dropdown, Input, Modal, notification, Select } from "antd";
import {
  CheckCircleOutlined,
  InfoCircleOutlined,
  SendOutlined,
} from "@ant-design/icons";
import {
  faBell,
  faEllipsis,
  faPaperPlane,
  faRefresh,
  faRotateRight,
  faThumbsDown,
  faThumbsUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Top_navbar from "components/layout/TopNavbar";
import EnhancedTable from "components/table/EnhancedTable/EnhancedTable";
import { usePermissions } from "contexts/PermissionContext";
import {
  changePushTemplateStatus,
  listPushCampaigns,
  listPushTemplates,
  resendPushCampaign,
  sendCustomPushNotification,
  sendPresetPushNotification,
} from "services/pushNotifications.service";
import "styles/admin-pages.css";

const { TextArea } = Input;

const AUDIENCE_OPTIONS = [
  { value: "all_users", label: "All users (players + website visitors)" },
  { value: "all_players", label: "All active players" },
  { value: "logged_in_players", label: "Logged-in players only" },
  { value: "main_tour_players", label: "Main Tour players" },
  { value: "nextgen_players", label: "NextGen players" },
  { value: "tour_type", label: "Tour type based audience" },
  { value: "event_players", label: "Specific tournament players" },
  { value: "selected_players", label: "Selected player IDs" },
];

const PLATFORM_OPTIONS = [
  { value: "all", label: "Web + Android" },
  { value: "web", label: "Web only" },
  { value: "android", label: "Android only" },
  { value: "admin", label: "Admin only" },
];

const MODULE_LABELS = {
  admin: "Admin",
  general: "General",
  tournaments: "Tournament",
  live: "Live Scores",
  tee_time: "Tee Time",
  qualifier_booking: "Qualifier Booking",
  physio_booking: "Physio Booking",
  news: "News",
  gallery: "Gallery",
  press_release: "Press Release",
  tv_timings: "TV Timings",
  players: "Players",
};

const STATUS_STYLES = {
  sent: { label: "Sent", className: "active" },
  partial: { label: "Partial", className: "pending" },
  failed: { label: "Failed", className: "inactive" },
  no_targets: { label: "No Targets", className: "pending" },
  queued: { label: "Queued", className: "pending" },
  sending: { label: "Sending", className: "pending" },
};

const toast = (message, description, success = false) =>
  notification.open({
    message,
    description,
    placement: "topRight",
    icon: success ? <CheckCircleOutlined style={{ color: "green" }} /> : <InfoCircleOutlined style={{ color: "red" }} />,
    duration: success ? 2.5 : 4,
  });

const prettyDate = (value) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function PushNotificationsList() {
  const targetRef = useRef(null);
  const PERMISSION = usePermissions("push_notifications");
  const user = JSON.parse(sessionStorage.getItem("ADMIN-INFO") || "{}");
  const canEdit = user?.admin_type === "Super Admin" || PERMISSION?.add_edit === "Y" || PERMISSION?.fullAccess === "Y";

  const [activeTab, setActiveTab] = useState("templates");
  const [templates, setTemplates] = useState([]);
  const [templateCount, setTemplateCount] = useState(0);
  const [templatePage, setTemplatePage] = useState(1);
  const [templateLimit, setTemplateLimit] = useState(20);
  const [templateLoading, setTemplateLoading] = useState(false);

  const [campaigns, setCampaigns] = useState([]);
  const [campaignCount, setCampaignCount] = useState(0);
  const [campaignPage, setCampaignPage] = useState(1);
  const [campaignLimit, setCampaignLimit] = useState(20);
  const [campaignLoading, setCampaignLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    body: "",
    audience_type: "all_users",
    platform_scope: "all",
    tour_type: "M",
    event_id: "",
    selected_player_ids: "",
    link_url: "",
    image_url: "",
  });

  const loadTemplates = useCallback(async (page = templatePage, limit = templateLimit) => {
    setTemplateLoading(true);
    const response = await listPushTemplates({ skip: (page - 1) * limit, limit });
    if (response?.status) {
      setTemplates(response.result || []);
      setTemplateCount(response.count || 0);
    } else {
      toast("Oops!", response?.message || "Failed to load templates.");
    }
    setTemplateLoading(false);
  }, [templateLimit, templatePage]);

  const loadCampaigns = useCallback(async (page = campaignPage, limit = campaignLimit) => {
    setCampaignLoading(true);
    const response = await listPushCampaigns({ skip: (page - 1) * limit, limit });
    if (response?.status) {
      setCampaigns(response.result || []);
      setCampaignCount(response.count || 0);
    } else {
      toast("Oops!", response?.message || "Failed to load history.");
    }
    setCampaignLoading(false);
  }, [campaignLimit, campaignPage]);

  const refreshAll = useCallback(() => {
    loadTemplates(templatePage, templateLimit);
    loadCampaigns(campaignPage, campaignLimit);
  }, [campaignLimit, campaignPage, loadCampaigns, loadTemplates, templateLimit, templatePage]);

  useEffect(() => {
    document.title = "PGTI || Admin || Push Notifications";
    refreshAll();
  }, [refreshAll]);

  const parseSelectedPlayerIds = () =>
    String(form.selected_player_ids || "")
      .split(",")
      .map((item) => Number(item.trim()))
      .filter(Boolean);

  const buildAudiencePayload = () => ({
    audience_type: form.audience_type,
    platform_scope: form.platform_scope,
    tour_type: form.audience_type === "tour_type" ? form.tour_type : undefined,
    event_id: form.audience_type === "event_players" ? Number(form.event_id || 0) || undefined : undefined,
    selected_player_ids: form.audience_type === "selected_players" ? parseSelectedPlayerIds() : undefined,
  });

  const sendCustom = async () => {
    if (!form.title.trim()) {
      toast("Oops!", "Notification title is required.");
      return;
    }

    Modal.confirm({
      title: "Send this push notification?",
      content: "This will send to all active device tokens matching the selected audience.",
      okText: "Yes, Send",
      cancelText: "Cancel",
      onOk: async () => {
        const response = await sendCustomPushNotification({
          ...buildAudiencePayload(),
          title: form.title.trim(),
          body: form.body,
          link_url: form.link_url,
          image_url: form.image_url,
          data_payload: { source: "admin_custom" },
        });
        if (response?.status) {
          const result = response.result || {};
          toast("Notification queued", `Targets: ${result.target_count || 0}, Sent: ${result.success_count || 0}, Failed: ${result.failure_count || 0}`, true);
          setForm((prev) => ({ ...prev, title: "", body: "", link_url: "", image_url: "" }));
          loadCampaigns(1, campaignLimit);
          setCampaignPage(1);
        } else {
          toast("Oops!", response?.message || "Failed to send notification.");
        }
      },
    });
  };

  const handleTemplateStatus = async (item, status) => {
    const response = await changePushTemplateStatus({ id: item.id, status });
    if (response?.status) {
      toast("Success", `Preset ${status === "A" ? "enabled" : "disabled"} successfully.`, true);
      loadTemplates();
    } else {
      toast("Oops!", response?.message || "Failed to update preset status.");
    }
  };

  const sendTemplate = async (item) => {
    Modal.confirm({
      title: `Send preset: ${item.title}?`,
      content: "Variables like {{tournament_name}} can be filled later by automated triggers; this manual send uses the saved template text.",
      okText: "Send Preset",
      cancelText: "Cancel",
      onOk: async () => {
        const response = await sendPresetPushNotification({
          template_id: item.id,
          audience_type: item.default_audience,
          tour_type: item.tour_type,
          platform_scope: item.platform_scope || "all",
        });
        if (response?.status) {
          const result = response.result || {};
          toast("Preset sent", `Targets: ${result.target_count || 0}, Sent: ${result.success_count || 0}, Failed: ${result.failure_count || 0}`, true);
          loadCampaigns(1, campaignLimit);
          setCampaignPage(1);
        } else {
          toast("Oops!", response?.message || "Failed to send preset.");
        }
      },
    });
  };

  const resendCampaign = async (item) => {
    Modal.confirm({
      title: "Resend this notification?",
      content: item.title,
      okText: "Yes, Resend",
      cancelText: "Cancel",
      onOk: async () => {
        const response = await resendPushCampaign({ id: item.id });
        if (response?.status) {
          const result = response.result || {};
          toast("Notification resent", `Targets: ${result.target_count || 0}, Sent: ${result.success_count || 0}, Failed: ${result.failure_count || 0}`, true);
          loadCampaigns(1, campaignLimit);
          setCampaignPage(1);
        } else {
          toast("Oops!", response?.message || "Failed to resend notification.");
        }
      },
    });
  };

  const templateMenu = (item) => (
    <div className="action-dropdown-menu">
      {canEdit && item.status === "A" && (
        <button className="action-dropdown-item" onClick={() => sendTemplate(item)}>
          <FontAwesomeIcon icon={faPaperPlane} />
          <span>Send Preset</span>
        </button>
      )}
      {canEdit && (
        item.status === "A" ? (
          <button className="action-dropdown-item danger" onClick={() => handleTemplateStatus(item, "I")}>
            <FontAwesomeIcon icon={faThumbsDown} />
            <span>Disable</span>
          </button>
        ) : (
          <button className="action-dropdown-item" onClick={() => handleTemplateStatus(item, "A")}>
            <FontAwesomeIcon icon={faThumbsUp} />
            <span>Enable</span>
          </button>
        )
      )}
    </div>
  );

  const campaignMenu = (item) => (
    <div className="action-dropdown-menu">
      {canEdit && (
        <button className="action-dropdown-item" onClick={() => resendCampaign(item)}>
          <FontAwesomeIcon icon={faRotateRight} />
          <span>Resend</span>
        </button>
      )}
    </div>
  );

  const templateColumns = useMemo(() => [
    {
      accessorKey: "index",
      header: "#",
      cell: ({ row }) => row.index + (templatePage - 1) * templateLimit + 1,
      size: 70,
    },
    {
      accessorKey: "title",
      header: "Preset Notification",
      cell: ({ row }) => (
        <div>
          <div className="font-weight-600">{row.original.title}</div>
          <div style={{ fontSize: 12, color: "#64748b", fontFamily: "monospace" }}>{row.original.template_key}</div>
        </div>
      ),
      size: 260,
    },
    {
      accessorKey: "module_key",
      header: "Module",
      cell: ({ getValue }) => MODULE_LABELS[getValue()] || getValue(),
      size: 160,
    },
    {
      accessorKey: "platform_scope",
      header: "Type",
      cell: ({ getValue }) => PLATFORM_OPTIONS.find((item) => item.value === (getValue() || "all"))?.label || "Web + Android",
      size: 150,
    },
    {
      accessorKey: "body",
      header: "Message",
      cell: ({ getValue }) => (
        <div style={{ maxWidth: 420, color: "#475569", whiteSpace: "normal" }}>{getValue() || "--"}</div>
      ),
      size: 440,
    },
    {
      accessorKey: "default_audience",
      header: "Default Audience",
      cell: ({ getValue }) => AUDIENCE_OPTIONS.find((item) => item.value === getValue())?.label || getValue(),
      size: 210,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className={`status-badge ${row.original.status === "A" ? "active" : "inactive"}`}>
          {row.original.status === "A" ? "Enabled" : "Disabled"}
        </span>
      ),
      size: 120,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => canEdit ? (
        <div className="action-dropdown">
          <Dropdown overlay={() => templateMenu(row.original)} placement="bottomRight" trigger={["click"]}>
            <button className="action-dropdown-trigger">
              <FontAwesomeIcon icon={faEllipsis} />
            </button>
          </Dropdown>
        </div>
      ) : "--",
      size: 100,
      enableSorting: false,
    },
  ], [canEdit, templateLimit, templatePage]);

  const campaignColumns = useMemo(() => [
    {
      accessorKey: "index",
      header: "#",
      cell: ({ row }) => row.index + (campaignPage - 1) * campaignLimit + 1,
      size: 70,
    },
    {
      accessorKey: "title",
      header: "Notification",
      cell: ({ row }) => (
        <div>
          <div className="font-weight-600">{row.original.title}</div>
          <div style={{ fontSize: 12, color: "#64748b", maxWidth: 360 }}>{row.original.body || "--"}</div>
        </div>
      ),
      size: 360,
    },
    {
      accessorKey: "audience_type",
      header: "Audience",
      cell: ({ getValue }) => AUDIENCE_OPTIONS.find((item) => item.value === getValue())?.label || getValue(),
      size: 210,
    },
    {
      accessorKey: "platform_scope",
      header: "Platform",
      cell: ({ getValue }) => PLATFORM_OPTIONS.find((item) => item.value === getValue())?.label || getValue(),
      size: 150,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const style = STATUS_STYLES[getValue()] || { label: getValue(), className: "pending" };
        return <span className={`status-badge ${style.className}`}>{style.label}</span>;
      },
      size: 130,
    },
    {
      accessorKey: "target_count",
      header: "Targets",
      cell: ({ row }) => `${row.original.success_count || 0}/${row.original.target_count || 0}`,
      size: 110,
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ getValue }) => prettyDate(getValue()),
      size: 180,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => canEdit ? (
        <div className="action-dropdown">
          <Dropdown overlay={() => campaignMenu(row.original)} placement="bottomRight" trigger={["click"]}>
            <button className="action-dropdown-trigger">
              <FontAwesomeIcon icon={faEllipsis} />
            </button>
          </Dropdown>
        </div>
      ) : "--",
      size: 100,
      enableSorting: false,
    },
  ], [campaignLimit, campaignPage, canEdit]);

  return (
    <div className="admin-page-container" ref={targetRef}>
      <Top_navbar title="Push Notifications" />

      <div className="content-card" style={{ marginBottom: 20 }}>
        <div className="content-card-body">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: 18 }}>
            <div>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 12px",
                borderRadius: 999,
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                color: "#1d4ed8",
                fontSize: 12,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: 0.4,
                marginBottom: 12,
              }}>
                <FontAwesomeIcon icon={faBell} />
                Push Notifications
              </div>
              <h2 style={{ margin: 0, color: "#102a43", fontSize: 28, fontWeight: 800 }}>Send push notifications</h2>
              <p style={{ margin: "8px 0 0", color: "#64748b", maxWidth: 860, lineHeight: 1.7 }}>
                Send custom announcements, manage preset notifications, create admin-only alerts, and resend previous campaigns.
              </p>
            </div>
            <button className="action-button secondary" onClick={refreshAll}>
              <FontAwesomeIcon icon={faRefresh} />
              Refresh
            </button>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
            padding: 18,
            borderRadius: 18,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}>
            <div className="form-group">
              <label>Title *</label>
              <Input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Notification title" maxLength={150} />
            </div>
            <div className="form-group">
              <label>Audience</label>
              <Select value={form.audience_type} onChange={(value) => setForm((prev) => ({ ...prev, audience_type: value }))} options={AUDIENCE_OPTIONS} style={{ width: "100%" }} />
            </div>
            <div className="form-group">
              <label>Platform</label>
              <Select value={form.platform_scope} onChange={(value) => setForm((prev) => ({ ...prev, platform_scope: value }))} options={PLATFORM_OPTIONS} style={{ width: "100%" }} />
            </div>
            {form.audience_type === "tour_type" && (
              <div className="form-group">
                <label>Tour Type</label>
                <Select
                  value={form.tour_type}
                  onChange={(value) => setForm((prev) => ({ ...prev, tour_type: value }))}
                  options={[{ value: "M", label: "PGTI Main Tour" }, { value: "F", label: "PGTI NextGen" }]}
                  style={{ width: "100%" }}
                />
              </div>
            )}
            {form.audience_type === "event_players" && (
              <div className="form-group">
                <label>Tournament/Event ID</label>
                <Input value={form.event_id} onChange={(e) => setForm((prev) => ({ ...prev, event_id: e.target.value }))} placeholder="Enter event id" />
              </div>
            )}
            {form.audience_type === "selected_players" && (
              <div className="form-group">
                <label>Player IDs</label>
                <Input value={form.selected_player_ids} onChange={(e) => setForm((prev) => ({ ...prev, selected_player_ids: e.target.value }))} placeholder="Example: 12, 27, 42" />
              </div>
            )}
            <div className="form-group">
              <label>Link URL</label>
              <Input value={form.link_url} onChange={(e) => setForm((prev) => ({ ...prev, link_url: e.target.value }))} placeholder="Optional click URL" />
            </div>
            <div className="form-group">
              <label>Image URL</label>
              <Input value={form.image_url} onChange={(e) => setForm((prev) => ({ ...prev, image_url: e.target.value }))} placeholder="Optional notification image" />
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Message</label>
              <TextArea rows={3} value={form.body} onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))} placeholder="Write the notification body..." />
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
              <button className="action-button primary" onClick={sendCustom} disabled={!canEdit}>
                <SendOutlined />
                Send Custom Notification
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="tabs-header">
          <div className="tabs-container">
            <button className={`tab-item ${activeTab === "templates" ? "active" : ""}`} onClick={() => setActiveTab("templates")}>Preset Notifications</button>
            <button className={`tab-item ${activeTab === "history" ? "active" : ""}`} onClick={() => setActiveTab("history")}>Send History</button>
          </div>
          <div className="tabs-actions">
            <button className="action-button secondary" onClick={refreshAll}>
              <FontAwesomeIcon icon={faRefresh} />
              Refresh
            </button>
          </div>
        </div>
        <div className="content-card-body">
          {activeTab === "templates" ? (
            <EnhancedTable
              data={templates}
              columns={templateColumns}
              isLoading={templateLoading}
              currentPage={templatePage}
              totalPages={Math.max(1, Math.ceil((templateCount || 0) / templateLimit))}
              limit={templateLimit}
              skip={(templatePage - 1) * templateLimit}
              count={templateCount}
              onPageChange={(page) => {
                setTemplatePage(page);
                loadTemplates(page, templateLimit);
              }}
              onLimitChange={(newLimit) => {
                setTemplateLimit(Number(newLimit));
                setTemplatePage(1);
                loadTemplates(1, Number(newLimit));
              }}
              onRefresh={() => loadTemplates()}
              permission={PERMISSION}
              emptyStateMessage="No push notification presets found."
              activeTab={activeTab}
              targetRef={targetRef}
              exportFileName="push-notification-presets"
            />
          ) : (
            <EnhancedTable
              data={campaigns}
              columns={campaignColumns}
              isLoading={campaignLoading}
              currentPage={campaignPage}
              totalPages={Math.max(1, Math.ceil((campaignCount || 0) / campaignLimit))}
              limit={campaignLimit}
              skip={(campaignPage - 1) * campaignLimit}
              count={campaignCount}
              onPageChange={(page) => {
                setCampaignPage(page);
                loadCampaigns(page, campaignLimit);
              }}
              onLimitChange={(newLimit) => {
                setCampaignLimit(Number(newLimit));
                setCampaignPage(1);
                loadCampaigns(1, Number(newLimit));
              }}
              onRefresh={() => loadCampaigns()}
              permission={PERMISSION}
              emptyStateMessage="No notification campaigns sent yet."
              activeTab={activeTab}
              targetRef={targetRef}
              exportFileName="push-notification-history"
            />
          )}
        </div>
      </div>
    </div>
  );
}
