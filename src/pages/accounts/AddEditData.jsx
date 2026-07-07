import React, { useEffect, useMemo, useRef, useState } from "react";
import { notification, Modal } from "antd";
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  UserOutlined,
  SafetyOutlined,
  LockOutlined,
  DownOutlined,
  UpOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  faArrowsRotate,
  faBell,
  faBookOpen,
  faCalendar,
  faChartSimple,
  faCircleExclamation,
  faCircleInfo,
  faEnvelope,
  faFileImage,
  faFileLines,
  faFileText,
  faFlag,
  faGolfBallTee,
  faGavel,
  faHandshake,
  faHouse,
  faImages,
  faLock,
  faMedal,
  faNewspaper,
  faPhone,
  faQuestionCircle,
  faRectangleList,
  faShieldHalved,
  faUserShield,
  faUsers,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { addeditdata, getPermission } from "services/accounts.service";
import LoadingEffect from "components/ui/Loading/LoadingEffect";
import "styles/admin-pages.css";

const PERM_LABELS = {
  list: { label: "View / List", desc: "Browse and search records" },
  add_edit: { label: "Add / Edit", desc: "Create and modify records" },
  change_status: { label: "Change Status", desc: "Activate or deactivate records" },
  delete: { label: "Delete", desc: "Permanently remove records" },
  export: { label: "Export Data", desc: "Export records to file" },
  approve: { label: "Approve", desc: "Approve pending requests" },
};

const MODULE_GROUPS = [
  {
    key: "notifications_group",
    title: "Notifications",
    icon: faBell,
    children: [{ key: "push_notifications", label: "Push Notifications", icon: faBell, perms: ["list", "add_edit", "change_status"] }],
  },
  {
    key: "imports_group",
    title: "Imports",
    icon: faFileLines,
    children: [{ key: "imports", label: "Tournament Data Import", icon: faFileLines, perms: ["list", "add_edit"] }],
  },
  {
    key: "accounts_group",
    title: "Accounts",
    icon: faUserShield,
    children: [{ key: "accounts", label: "Sub Admin", icon: faUserShield, perms: ["list", "add_edit", "change_status", "delete"] }],
  },
  {
    key: "cms_group",
    title: "CMS",
    icon: faBookOpen,
    children: [
      { key: "homepage_settings", label: "Homepage Settings", icon: faHouse, perms: ["list", "add_edit"] },
      { key: "about_us", label: "About Us", icon: faCircleInfo, perms: ["list", "add_edit"] },
      { key: "anti_doping", label: "Anti-Doping", icon: faShieldHalved, perms: ["list", "add_edit"] },
      { key: "contact_us", label: "Contact Us", icon: faPhone, perms: ["list", "add_edit"] },
      { key: "disclaimer", label: "Disclaimer", icon: faCircleExclamation, perms: ["list", "add_edit"] },
      { key: "events", label: "Events / Tournaments", icon: faCalendar, perms: ["list", "add_edit", "change_status", "delete"] },
      { key: "faqs", label: "FAQs", icon: faQuestionCircle, perms: ["list", "add_edit", "change_status", "delete"] },
      { key: "footer", label: "Footer", icon: faRectangleList, perms: ["list", "add_edit"] },
      { key: "gallery", label: "Gallery", icon: faImages, perms: ["list", "add_edit", "change_status", "delete"] },
      { key: "press_release", label: "Press Release", icon: faNewspaper, perms: ["list", "add_edit", "change_status", "delete"] },
      { key: "tv_timings", label: "TV Timings", icon: faVideo, perms: ["list", "add_edit", "change_status", "delete"] },
      { key: "golf_facts", label: "Golf Facts", icon: faGolfBallTee, perms: ["list", "add_edit"] },
      { key: "golf_courses", label: "Golf Course Info", icon: faGolfBallTee, perms: ["list", "add_edit", "change_status", "delete"] },
      { key: "highlight_videos", label: "Highlights & Videos", icon: faVideo, perms: ["list", "add_edit", "change_status", "delete"] },
      { key: "indian_golf", label: "Indian Golf", icon: faFlag, perms: ["list", "add_edit"] },
      { key: "growth_of_golf", label: "Growth of Golf", icon: faFlag, perms: ["list", "add_edit"] },
      { key: "news", label: "News", icon: faNewspaper, perms: ["list", "add_edit", "change_status", "delete"] },
      { key: "privacy_policy", label: "Privacy Policy", icon: faLock, perms: ["list", "add_edit"] },
      { key: "cookie_policy", label: "Cookie Policy", icon: faLock, perms: ["list", "add_edit"] },
      { key: "terms_conditions", label: "Terms & Conditions", icon: faGavel, perms: ["list", "add_edit"] },
      { key: "tour_partners", label: "Tour Partners", icon: faHandshake, perms: ["list", "add_edit", "change_status", "delete"] },
      { key: "banners", label: "Banners", icon: faFileImage, perms: ["list", "add_edit", "change_status", "delete"] },
    ],
  },
  {
    key: "inquiries_group",
    title: "Inquiries",
    icon: faEnvelope,
    children: [{ key: "inquiries", label: "Contact Us Inquiries", icon: faEnvelope, perms: ["list"] }],
  },
  {
    key: "articles_group",
    title: "Articles",
    icon: faFileText,
    children: [{ key: "articles", label: "Article Pages & Articles", icon: faFileText, perms: ["list", "add_edit", "change_status", "delete"] }],
  },
  {
    key: "templates_group",
    title: "Templates",
    icon: faEnvelope,
    children: [{ key: "email_templates", label: "Email Templates", icon: faEnvelope, perms: ["list", "add_edit", "change_status", "delete"] }],
  },
  {
    key: "users_group",
    title: "Users",
    icon: faUsers,
    children: [
      { key: "users", label: "Users / Players", icon: faUsers, perms: ["list", "add_edit", "change_status", "delete", "export", "approve"] },
      { key: "tournament_results", label: "Tournament Results", icon: faMedal, perms: ["list", "add_edit", "delete"] },
    ],
  },
  {
      key: "booking_group",
      title: "Booking",
      icon: faGolfBallTee,
      children: [
        { key: "tee_time_booking", label: "Tee Time Booking", icon: faGolfBallTee, perms: ["list", "add_edit", "change_status", "export"] },
        { key: "qualifier_booking", label: "Qualifier Booking Settings", icon: faGolfBallTee, perms: ["list", "add_edit"] },
        { key: "qualifier_booking_applications", label: "Qualifier Booking Applications", icon: faGolfBallTee, perms: ["list", "add_edit", "export"] },
        { key: "physio_create_slots", label: "Physio Create Slots", icon: faGolfBallTee, perms: ["list", "add_edit", "change_status"] },
        { key: "physio_view_slots", label: "Physio View Slots", icon: faGolfBallTee, perms: ["list"] },
        { key: "physio_bookings", label: "Physio Bookings", icon: faGolfBallTee, perms: ["list"] },
      ],
    },
    {
      key: "stats_page_group",
      title: "Stats Page",
      icon: faChartSimple,
      children: [
        { key: "stats_page_settings", label: "Stats Page Settings", icon: faChartSimple, perms: ["list", "add_edit"] },
        { key: "pgti_career_earning", label: "PGTI Career Earning", icon: faFileLines, perms: ["list", "add_edit"] },
      ],
    },
    {
      key: "live_sync_group",
    title: "Live Sync",
    icon: faArrowsRotate,
    children: [{ key: "live_sync", label: "Live Sync Monitoring", icon: faArrowsRotate, perms: ["list", "add_edit"] }],
  },
];

const buildInitialPermissions = () => {
  const perms = {};
  MODULE_GROUPS.forEach((group) => {
    group.children.forEach((child) => {
      perms[child.key] = {};
      child.perms.forEach((perm) => {
        perms[child.key][perm] = "N";
      });
    });
  });
  return perms;
};

const buildFullAccessPermissions = () => {
  const permissions = buildInitialPermissions();
  Object.keys(permissions).forEach((moduleKey) => {
    Object.keys(permissions[moduleKey] || {}).forEach((permKey) => {
      permissions[moduleKey][permKey] = "Y";
    });
  });
  return permissions;
};

const buildViewOnlyPermissions = () => {
  const permissions = buildInitialPermissions();
  Object.keys(permissions).forEach((moduleKey) => {
    Object.keys(permissions[moduleKey] || {}).forEach((permKey) => {
      permissions[moduleKey][permKey] = permKey === "list" ? "Y" : "N";
    });
  });
  return permissions;
};

const countSelectedPermissions = (permissionMap = {}) =>
  Object.values(permissionMap).reduce(
    (count, modulePermissions) =>
      count + Object.values(modulePermissions || {}).filter((value) => value === "Y").length,
    0
  );

const SectionJump = ({ groups, onJump }) => (
  <div
    style={{
      position: "fixed",
      right: 18,
      top: 180,
      zIndex: 100,
      width: 160,
      background: "rgba(255,255,255,0.96)",
      backdropFilter: "blur(10px)",
      border: "1px solid #dbeafe",
      boxShadow: "0 12px 32px rgba(15,23,42,0.10)",
      borderRadius: 16,
      padding: 12,
    }}
  >
    <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".08em", color: "#1d4ed8", marginBottom: 8 }}>
      QUICK JUMP
    </div>
    <div style={{ display: "grid", gap: 8 }}>
      {groups.map((group) => (
        <button
          key={group.key}
          type="button"
          onClick={() => onJump(group.key)}
          style={{
            textAlign: "left",
            border: "1px solid #e2e8f0",
            background: "#f8fafc",
            color: "#1e3a5f",
            borderRadius: 10,
            padding: "9px 10px",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {group.title}
        </button>
      ))}
    </div>
  </div>
);

const PermissionTile = ({ moduleKey, permKey, checked, onToggle, disabled }) => {
  const meta = PERM_LABELS[permKey] || { label: permKey, desc: "" };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onToggle(moduleKey, permKey)}
      style={{
        width: "100%",
        border: checked ? "1px solid #93c5fd" : "1px solid #e2e8f0",
        background: checked ? "#eff6ff" : "#ffffff",
        borderRadius: 12,
        padding: "14px 16px",
        textAlign: "left",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.95 : 1,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <input type="checkbox" checked={checked} readOnly style={{ marginTop: 2 }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{meta.label}</div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{meta.desc}</div>
        </div>
      </div>
    </button>
  );
};

const PermissionSection = ({
  group,
  permissions,
  expanded,
  onExpandToggle,
  onTogglePermission,
  onCheckModule,
  onUncheckModule,
  onCheckGroup,
  onUncheckGroup,
  isViewOnlyMode,
  disabled,
  sectionRef,
}) => {
  const activeCount = group.children.filter((child) =>
    Object.values(permissions[child.key] || {}).some((value) => value === "Y")
  ).length;

  return (
    <div
      ref={sectionRef}
      style={{
        border: "1px solid #dbe7f2",
        borderRadius: 16,
        overflow: "hidden",
        background: "#fff",
        marginBottom: 18,
        scrollMarginTop: 100,
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          background: "#f8fbff",
          padding: "16px 18px",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={onExpandToggle}
          style={{
            flex: 1,
            minWidth: 220,
            display: "flex",
            alignItems: "center",
            gap: 12,
            border: "none",
            background: "transparent",
            padding: 0,
            textAlign: "left",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "#eff6ff",
              color: "#1d4ed8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FontAwesomeIcon icon={group.icon} />
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>{group.title}</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              {activeCount} of {group.children.length} module{group.children.length > 1 ? "s" : ""} selected
            </div>
          </div>
          <div style={{ color: "#1e3a5f", marginLeft: "auto" }}>
            {expanded ? <UpOutlined /> : <DownOutlined />}
          </div>
        </button>

        <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
          <button
            type="button"
            disabled={disabled}
            className="action-button secondary"
            style={{ fontSize: 11, padding: "4px 10px" }}
            onClick={(e) => {
              e.stopPropagation();
              onCheckGroup(group);
            }}
          >
            Check All
          </button>
          <button
            type="button"
            disabled={disabled}
            className="action-button secondary"
            style={{ fontSize: 11, padding: "4px 10px" }}
            onClick={(e) => {
              e.stopPropagation();
              onUncheckGroup(group);
            }}
          >
            Uncheck
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: 18 }}>
          {group.children.map((module) => (
            <div
              key={module.key}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 14,
                padding: 16,
                background: "#fff",
                marginBottom: 14,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: "#f1f5f9",
                      color: "#475569",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FontAwesomeIcon icon={module.icon} style={{ fontSize: 12 }} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{module.label}</div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    disabled={disabled}
                    className="action-button secondary"
                    style={{ fontSize: 11, padding: "4px 10px" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCheckModule(module.key);
                    }}
                  >
                    Check All
                  </button>
                  <button
                    type="button"
                    disabled={disabled}
                    className="action-button secondary"
                    style={{ fontSize: 11, padding: "4px 10px" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUncheckModule(module.key);
                    }}
                  >
                    Uncheck
                  </button>
                </div>
              </div>

              <div className="row">
                {module.perms.map((perm) => (
                  <div key={perm} className="col-lg-4 col-md-6 col-12 mb-2">
                    <PermissionTile
                      moduleKey={module.key}
                      permKey={perm}
                      checked={permissions[module.key]?.[perm] === "Y"}
                      onToggle={onTogglePermission}
                      disabled={disabled || (isViewOnlyMode && perm !== "list")}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function AddEditSubAdmin() {
  const loginUser = JSON.parse(sessionStorage.getItem("ADMIN-INFO") || "{}");
  const location = useLocation();
  const navigate = useNavigate();
  const state = location?.state || {};
  const isEdit = !!state?.id;
  const isSuperAdmin = loginUser?.admin_type === "Super Admin";
  const viewedAdminType = state?.admin_type || loginUser?.admin_type;
  const isEditingSuperAdmin = isEdit && viewedAdminType === "Super Admin";

  const [formData, setFormData] = useState({
    name: state?.name || "",
    email: state?.email || "",
    phone: state?.phone || "",
    password: "",
  });
  const [accessMode, setAccessMode] = useState(
    !isEdit ? "standard" : (state?.access_mode || loginUser?.access_mode || "standard")
  );
  const [permissions, setPermissions] = useState(buildInitialPermissions());
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState(() =>
    Object.fromEntries(MODULE_GROUPS.map((group) => [group.key, group.key === "cms_group"]))
  );

  const sectionRefs = useRef({});
  const filteredGroups = useMemo(() => MODULE_GROUPS, []);

  useEffect(() => {
    if (!isSuperAdmin) {
      navigate("/admin/profile", { replace: true });
    }
  }, [isSuperAdmin, navigate]);

  useEffect(() => {
    document.title = `PGTI || ${isEdit ? "Edit" : "Add"} Administrator`;

    if (isEditingSuperAdmin) {
      setPermissions(buildFullAccessPermissions());
      return;
    }

    setPermissions(buildInitialPermissions());
    setAccessMode(state?.access_mode || loginUser?.access_mode || "standard");
    if (!isEdit || !state?.id) return;

    setIsLoading(true);
    getPermission({ admin_id: state.id })
      .then((res) => {
        if (res.status && res.result?.length > 0) {
          setPermissions((prev) => {
            const updated = { ...prev };

            res.result.forEach((item) => {
              const parsed = JSON.parse(item.permissions_json || "{}");
              if (updated[item.module]) {
                updated[item.module] = { ...updated[item.module], ...parsed };
              }
            });

            if (updated.events?.list === "Y" || updated.events?.add_edit === "Y") {
              updated.imports = { ...updated.imports, list: "Y", add_edit: "Y" };
            }
            if (
              updated.users?.list === "Y" ||
              updated.users?.add_edit === "Y" ||
              updated.events?.list === "Y" ||
              updated.events?.add_edit === "Y"
            ) {
              updated.live_sync = { ...updated.live_sync, list: "Y", add_edit: "Y" };
            }
            if (updated.contact_us?.list === "Y") {
              updated.inquiries = { ...updated.inquiries, list: "Y" };
            }

            return updated;
          });
        }
      })
      .finally(() => setIsLoading(false));
  }, [isEdit, isEditingSuperAdmin, state?.id]);

  useEffect(() => {
    if (isEditingSuperAdmin) return;
    if (accessMode !== "view_only") return;

    setPermissions((prev) => {
      const updated = {};
      Object.keys(prev).forEach((moduleKey) => {
        updated[moduleKey] = {};
        const modulePermissions = prev[moduleKey] || {};
        const hasAnySelected = Object.values(modulePermissions).some((value) => value === "Y");
        Object.keys(modulePermissions).forEach((permKey) => {
          updated[moduleKey][permKey] = permKey === "list" ? (hasAnySelected || modulePermissions.list === "Y" ? "Y" : "N") : "N";
        });
      });
      return updated;
    });
  }, [accessMode, isEditingSuperAdmin]);

  const togglePermission = (moduleKey, permKey) => {
    if (isEditingSuperAdmin) return;
    if (accessMode === "view_only" && permKey !== "list") return;
    setPermissions((prev) => ({
      ...prev,
      [moduleKey]: {
        ...prev[moduleKey],
        [permKey]: prev[moduleKey]?.[permKey] === "Y" ? "N" : "Y",
      },
    }));
  };

  const checkModule = (moduleKey) => {
    if (isEditingSuperAdmin) return;
    setPermissions((prev) => ({
      ...prev,
      [moduleKey]: Object.keys(prev[moduleKey] || {}).reduce((acc, key) => {
        acc[key] = accessMode === "view_only" ? (key === "list" ? "Y" : "N") : "Y";
        return acc;
      }, {}),
    }));
  };

  const uncheckModule = (moduleKey) => {
    if (isEditingSuperAdmin) return;
    setPermissions((prev) => ({
      ...prev,
      [moduleKey]: Object.keys(prev[moduleKey] || {}).reduce((acc, key) => {
        acc[key] = "N";
        return acc;
      }, {}),
    }));
  };

  const checkGroup = (group) => {
    if (isEditingSuperAdmin) return;
    setPermissions((prev) => {
      const updated = { ...prev };
      group.children.forEach((child) => {
        updated[child.key] = Object.keys(updated[child.key] || {}).reduce((acc, key) => {
          acc[key] = accessMode === "view_only" ? (key === "list" ? "Y" : "N") : "Y";
          return acc;
        }, {});
      });
      return updated;
    });
  };

  const uncheckGroup = (group) => {
    if (isEditingSuperAdmin) return;
    setPermissions((prev) => {
      const updated = { ...prev };
      group.children.forEach((child) => {
        updated[child.key] = Object.keys(updated[child.key] || {}).reduce((acc, key) => {
          acc[key] = "N";
          return acc;
        }, {});
      });
      return updated;
    });
  };

  const checkAllPermissions = () => {
    if (isEditingSuperAdmin) return;
    setPermissions(accessMode === "view_only" ? buildViewOnlyPermissions() : buildFullAccessPermissions());
  };

  const resetAllPermissions = () => {
    if (isEditingSuperAdmin) return;
    Modal.confirm({
      title: "Reset All Permissions",
      content: "This will uncheck all permission checkboxes for every module and sub-section.",
      okText: "Yes, Reset All",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: () => setPermissions(buildInitialPermissions()),
    });
  };

  const applyViewOnlyPreset = () => {
    if (isEditingSuperAdmin) return;
    setPermissions(buildViewOnlyPermissions());
    notification.open({
      message: "View-only preset applied",
      description: "All modules now have list access only. Add, edit, status, delete, export, and approve permissions remain unchecked.",
      placement: "topRight",
      icon: <CheckCircleOutlined style={{ color: "green" }} />,
      duration: 2,
    });
  };

  const toggleSection = (groupKey) => {
    setExpandedSections((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const jumpToSection = (groupKey) => {
    setExpandedSections((prev) => ({ ...prev, [groupKey]: true }));
    sectionRefs.current[groupKey]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.name?.trim()) nextErrors.name = "Name is required";
    if (!formData.email?.trim()) nextErrors.email = "Email is required";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Please enter a valid email address";
    }
    if (!isEdit && !formData.password?.trim()) {
      nextErrors.password = "Password is required for new administrators";
    }
    setErrors(nextErrors);
    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validate();
    const selectedPermissionCount = countSelectedPermissions(permissions);

    if (Object.keys(nextErrors).length > 0) {
      const firstError = Object.values(nextErrors).find(Boolean) || "Please review the highlighted fields.";
      notification.open({
        message: "Oops!",
        description: firstError,
        placement: "topRight",
        icon: <InfoCircleOutlined style={{ color: "red" }} />,
        duration: 2,
      });
      return;
    }

    if (!isEditingSuperAdmin && selectedPermissionCount === 0) {
      notification.open({
        message: "Oops!",
        description: "Please select at least one permission before saving this administrator.",
        placement: "topRight",
        icon: <InfoCircleOutlined style={{ color: "red" }} />,
        duration: 2,
      });
      return;
    }

    try {
      setIsLoading(true);
      const permissionsArray = Object.keys(permissions).map((module) => ({
        module,
        permissions_json: JSON.stringify(permissions[module]),
      }));

      const response = await addeditdata({
        ...(isEdit ? { editId: state.id } : {}),
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || "",
        access_mode: accessMode,
        permissions: permissionsArray,
        ...(formData.password?.trim() ? { password: formData.password.trim() } : {}),
      });

      if (response.status) {
        notification.open({
          message: "Success",
          description: isEdit ? "Administrator updated successfully." : "Administrator created successfully.",
          placement: "topRight",
          icon: <CheckCircleOutlined style={{ color: "green" }} />,
          duration: 2,
        });
        navigate(isSuperAdmin ? "/admin/accounts/list" : "/admin/dashboard");
      } else {
        notification.open({
          message: "Oops!",
          description: response?.message || "Operation failed.",
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
      }
    } catch {
      notification.open({
        message: "Oops!",
        description: "An error occurred. Please try again.",
        placement: "topRight",
        icon: <InfoCircleOutlined style={{ color: "red" }} />,
        duration: 2,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSuperAdmin) return null;

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">
              {isSuperAdmin && !isEdit ? "Add Administrator" : isSuperAdmin && isEdit ? "Edit Administrator" : "Profile Settings"}
            </h1>
            <p className="page-subtitle">
              {isSuperAdmin && !isEdit
                ? "Create a new sub-administrator account with module permissions."
                : isSuperAdmin && isEdit
                ? "Update administrator information and module permissions."
                : "Manage your profile information and review your access."}
            </p>
          </div>
          <Link to={isSuperAdmin ? "/admin/accounts/list" : "/admin/dashboard"}>
            <button className="action-button secondary">
              <ArrowLeftOutlined /> Back
            </button>
          </Link>
        </div>
      </div>

      <div className="page-body" style={{ position: "relative"}}>
        <form onSubmit={handleSubmit} className="modern-form">
          <div className="content-card" style={{ marginBottom: 20 }}>
            <div className="content-card-body">
              <div className="form-section">
                <h3 className="form-section-title">
                  <UserOutlined />&nbsp;Administrator Information
                </h3>
                <div className="row">
                  <div className="col-md-4 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label required">Full Name</label>
                      <input type="text" name="name" className="form-input" placeholder="Enter full name" value={formData.name} onChange={handleChange} />
                      {errors.name && <div className="form-error">{errors.name}</div>}
                    </div>
                  </div>
                  <div className="col-md-4 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label required">Email Address</label>
                      <input type="email" name="email" className="form-input" placeholder="Enter email address" value={formData.email} onChange={handleChange} readOnly={isEdit} />
                      {errors.email && <div className="form-error">{errors.email}</div>}
                      {isEdit && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>Email cannot be changed after creation.</div>}
                    </div>
                  </div>
                  <div className="col-md-4 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input type="tel" name="phone" className="form-input" placeholder="Enter phone number" value={formData.phone} onChange={handleChange} />
                    </div>
                  </div>
                  {!isEdit && (
                    <div className="col-md-4 col-12 mb-3">
                      <div className="form-group">
                        <label className="form-label required">Initial Password</label>
                        <input type="password" name="password" className="form-input" placeholder="Set a temporary password" value={formData.password} onChange={handleChange} />
                        {errors.password && <div className="form-error">{errors.password}</div>}
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>The admin can change this after first login.</div>
                      </div>
                    </div>
                  )}
                  {isEdit && (
                    <div className="col-md-8 col-12 mb-3">
                      <div style={{ padding: "12px 16px", background: "#fffbeb", borderRadius: 10, border: "1px solid #fef08a", marginTop: 2 }}>
                        <div style={{ fontSize: 13, color: "#92400e", display: "flex", alignItems: "center", gap: 6 }}>
                          <LockOutlined />
                          <span>
                            To reset this administrator&apos;s password, ask them to use the <strong>Forgot Password</strong> flow on the login page.
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {!isEditingSuperAdmin && (
            <div className="content-card" style={{ marginBottom: 20 }}>
              <div className="content-card-body">
                <div className="form-section">
                  <h3 className="form-section-title">
                    <EyeOutlined />&nbsp;Access Mode
                  </h3>
                  <div style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>
                    Choose whether this administrator can only view selected modules or can both view and manage them.
                  </div>
                  <div className="row">
                    <div className="col-md-6 col-12 mb-3">
                      <button
                        type="button"
                        onClick={() => setAccessMode("view_only")}
                        style={{
                          width: "100%",
                          border: accessMode === "view_only" ? "1px solid #93c5fd" : "1px solid #e2e8f0",
                          background: accessMode === "view_only" ? "#eff6ff" : "#ffffff",
                          borderRadius: 16,
                          padding: 18,
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", marginBottom: 6 }}>View Only</div>
                        <div style={{ fontSize: 13, color: "#64748b" }}>
                          Can open selected pages and lists, but cannot add, edit, delete, approve, export, or change status.
                        </div>
                      </button>
                    </div>
                    <div className="col-md-6 col-12 mb-3">
                      <button
                        type="button"
                        onClick={() => setAccessMode("standard")}
                        style={{
                          width: "100%",
                          border: accessMode === "standard" ? "1px solid #93c5fd" : "1px solid #e2e8f0",
                          background: accessMode === "standard" ? "#eff6ff" : "#ffffff",
                          borderRadius: 16,
                          padding: 18,
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", marginBottom: 6 }}>View + Edit</div>
                        <div style={{ fontSize: 13, color: "#64748b" }}>
                          Can be granted view, add, edit, delete, approval, export, and status-change access module by module.
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="content-card" style={{ marginBottom: 20 }}>
            <div className="content-card-body">
              <div className="form-section-center">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h3 className="form-section-title" style={{ margin: 0 }}>
                      <SafetyOutlined />&nbsp;Permission Settings
                    </h3>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
                      Modules follow the same order as the sidebar menu. Expand each section to review sub-modules.
                    </div>
                  </div>
                  {isEditingSuperAdmin ? (
                    <div
                      style={{
                        fontSize: 12,
                        color: "#0f766e",
                        background: "#ecfeff",
                        border: "1px solid #a5f3fc",
                        borderRadius: 10,
                        padding: "10px 14px",
                        fontWeight: 700,
                      }}
                    >
                      Super Admin has full access to all modules and sub-sections.
                    </div>
                  ) : (
                    <div className="d-flex gap-2 flex-wrap justify-content-end">
                      <button type="button" className="action-button secondary" style={{ fontSize: 13, padding: "6px 16px" }} onClick={applyViewOnlyPreset}>
                        <EyeOutlined /> View Only Preset
                      </button>
                      <button type="button" className="action-button secondary" style={{ fontSize: 13, padding: "6px 16px" }} onClick={checkAllPermissions}>
                        <CheckCircleOutlined /> Check All
                      </button>
                      <button type="button" className="action-button secondary" style={{ fontSize: 13, padding: "6px 16px" }} onClick={resetAllPermissions}>
                        <InfoCircleOutlined /> Reset All
                      </button>
                    </div>
                  )}
                </div>

                {!isEditingSuperAdmin && (
                  <div
                    style={{
                      marginBottom: 18,
                      padding: "14px 16px",
                      borderRadius: 14,
                      border: "1px solid #dbeafe",
                      background: "#f8fbff",
                    }}
                  >
                    <div style={{ fontWeight: 800, color: "#1e3a5f", marginBottom: 6 }}>Permission summary</div>
                    <div style={{ fontSize: 13, color: "#64748b" }}>
                      {accessMode === "view_only"
                        ? "This account is in view-only mode. Only list access can remain enabled for the selected modules."
                        : "Use the View Only Preset to quickly switch all modules to list-only access, or assign detailed permissions module by module."}
                    </div>
                  </div>
                )}

                {filteredGroups.map((group) => (
                  <PermissionSection
                    key={group.key}
                    group={group}
                    permissions={permissions}
                    expanded={!!expandedSections[group.key]}
                    onExpandToggle={() => toggleSection(group.key)}
                    onTogglePermission={togglePermission}
                    onCheckModule={checkModule}
                    onUncheckModule={uncheckModule}
                    onCheckGroup={checkGroup}
                    onUncheckGroup={uncheckGroup}
                    isViewOnlyMode={accessMode === "view_only"}
                    disabled={isEditingSuperAdmin}
                    sectionRef={(node) => {
                      sectionRefs.current[group.key] = node;
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="action-button secondary" onClick={() => navigate(isSuperAdmin ? "/admin/accounts/list" : "/admin/dashboard")}>
              Cancel
            </button>
            <button type="submit" className="action-button primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="loading-spinner small"></div>
                  {isEdit ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <SaveOutlined /> {isEdit ? "Update Administrator" : "Create Administrator"}
                </>
              )}
            </button>
          </div>
        </form>

        {/* <SectionJump groups={filteredGroups} onJump={jumpToSection} /> */}
      </div>

      <LoadingEffect isLoading={isLoading} text="Saving administrator..." />
    </div>
  );
}
