import React, { useEffect, useState } from "react";
import { notification, Modal } from "antd";
import {
  InfoCircleOutlined, CheckCircleOutlined, ArrowLeftOutlined, SaveOutlined,
  UserOutlined, SafetyOutlined, LockOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  faUsers, faFileImage, faQuestionCircle, faInfoCircle, faVideo,
  faHandshake, faShieldHalved, faFlag, faNewspaper, faGolfBallTee,
  faFileLines, faLock, faCircleExclamation, faAddressCard, faRectangleList,
  faEnvelope, faMedal, faFileText, faCalendar, faTag, faCreditCard,
  faFolder, faLayerGroup, faUserShield, faGear, faChevronDown, faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { addeditdata, getPermission } from "services/accounts.service";
import LoadingEffect from "components/ui/Loading/LoadingEffect";
import "styles/admin-pages.css";

/* ─── Permission label map ─────────────────────────────────────────── */
const PERM_LABELS = {
  list:          { label: "View / List",    desc: "Browse and search records" },
  add_edit:      { label: "Add / Edit",     desc: "Create and modify records" },
  change_status: { label: "Change Status",  desc: "Activate or deactivate records" },
  delete:        { label: "Delete",         desc: "Permanently remove records" },
  export:        { label: "Export Data",    desc: "Export records to file" },
  approve:       { label: "Approve",        desc: "Approve pending requests" },
};

/* ─── Module config — single source of truth ──────────────────────── */
const CMS_CHILDREN = [
  { key: "banners",          label: "Banners",            icon: faFileImage,       perms: ["list","add_edit","change_status","delete"] },
  { key: "faqs",             label: "FAQs",               icon: faQuestionCircle,  perms: ["list","add_edit","change_status","delete"] },
  { key: "about_us",         label: "About Us",           icon: faInfoCircle,      perms: ["list","add_edit"] },
  { key: "highlight_videos", label: "Highlights & Videos",icon: faVideo,           perms: ["list","add_edit","change_status","delete"] },
  { key: "tour_partners",    label: "Tour Partners",      icon: faHandshake,       perms: ["list","add_edit","change_status","delete"] },
  { key: "anti_doping",      label: "Anti-Doping",        icon: faShieldHalved,    perms: ["list","add_edit"] },
  { key: "indian_golf",      label: "Indian Golf",        icon: faFlag,            perms: ["list","add_edit"] },
  { key: "news",             label: "News",               icon: faNewspaper,       perms: ["list","add_edit","change_status","delete"] },
  { key: "press_release",    label: "Press Release",      icon: faNewspaper,       perms: ["list","add_edit","change_status","delete"] },
  { key: "golf_facts",       label: "Golf Facts",         icon: faGolfBallTee,     perms: ["list","add_edit"] },
  { key: "terms_conditions", label: "Terms & Conditions", icon: faFileLines,       perms: ["list","add_edit"] },
  { key: "privacy_policy",   label: "Privacy Policy",     icon: faLock,            perms: ["list","add_edit"] },
  { key: "cookie_policy",    label: "Cookie Policy",      icon: faLock,            perms: ["list","add_edit"] },
  { key: "disclaimer",       label: "Disclaimer",         icon: faCircleExclamation,perms: ["list","add_edit"] },
  { key: "contact_us",       label: "Contact Us",         icon: faAddressCard,     perms: ["list","add_edit"] },
  { key: "footer",           label: "Footer",             icon: faRectangleList,   perms: ["list","add_edit"] },
];

const MODULE_CONFIG = [
  {
    key: "users", label: "Users / Player Management", icon: faUsers,
    perms: ["list","add_edit","change_status","delete","export","approve"],
  },
  {
    key: "cms", label: "CMS Management", icon: faLayerGroup,
    isCmsGroup: true, children: CMS_CHILDREN,
  },
  {
    key: "email_templates", label: "Templates – Email Templates", icon: faEnvelope,
    perms: ["list","add_edit","change_status","delete"],
  },
  {
    key: "tournament_results", label: "Tournament Results", icon: faMedal,
    perms: ["list","add_edit","delete"],
  },
  {
    key: "articles", label: "Articles Management", icon: faFileText,
    perms: ["list","add_edit","change_status","delete"],
  },
  {
    key: "events", label: "Events Management", icon: faCalendar,
    perms: ["list","add_edit","change_status","delete"],
  },
  {
    key: "orders", label: "Orders Management", icon: faCreditCard,
    perms: ["list","add_edit","change_status"],
  },
  {
    key: "promocodes", label: "Promocodes Management", icon: faTag,
    perms: ["list","add_edit","change_status","delete"],
  },
  {
    key: "categories", label: "Categories Management", icon: faFolder,
    perms: ["list","add_edit","change_status"],
  },
  {
    key: "subCategories", label: "Sub-Categories Management", icon: faLayerGroup,
    perms: ["list","add_edit","change_status"],
  },
];

/* ─── Build initial permissions from config ───────────────────────── */
const buildInitialPermissions = () => {
  const perms = {};
  MODULE_CONFIG.forEach(mod => {
    if (mod.isCmsGroup) {
      mod.children.forEach(child => {
        perms[child.key] = {};
        child.perms.forEach(p => { perms[child.key][p] = "N"; });
      });
    } else {
      perms[mod.key] = {};
      mod.perms.forEach(p => { perms[mod.key][p] = "N"; });
    }
  });
  return perms;
};

/* ─── Helper: all CMS module keys ─────────────────────────────────── */
const CMS_KEYS = CMS_CHILDREN.map(c => c.key);

/* ─── PermissionItem component ────────────────────────────────────── */
const PermissionItem = ({ moduleKey, permKey, checked, onChange }) => {
  const info = PERM_LABELS[permKey] || { label: permKey, desc: "" };
  return (
    <div
      className="permission-item"
      style={{ cursor: "pointer" }}
      onClick={() => onChange(moduleKey, permKey)}
    >
      <div className="permission-checkbox">
        <input type="checkbox" checked={checked} readOnly />
      </div>
      <div className="permission-content">
        <label className="permission-label" style={{ cursor: "pointer" }}>{info.label}</label>
        <p className="permission-description">{info.desc}</p>
      </div>
    </div>
  );
};

/* ─── PermissionModule component ──────────────────────────────────── */
const PermissionModule = ({ mod, permissions, onToggle, onCheckAll, onUncheckAll }) => {
  const allChecked = mod.perms?.every(p => permissions[mod.key]?.[p] === "Y");
  return (
    <div className="permission-module" style={{ marginBottom: 16 }}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h4 className="permission-module-title" style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FontAwesomeIcon icon={mod.icon} style={{ color: "#475569", fontSize: 12 }} />
          </div>
          {mod.label}
        </h4>
        <div className="d-flex gap-2">
          <button type="button" className="action-button secondary" style={{ fontSize: 11, padding: "3px 10px" }} onClick={() => onCheckAll(mod.key)}>
            <CheckCircleOutlined /> Check All
          </button>
          <button type="button" className="action-button secondary" style={{ fontSize: 11, padding: "3px 10px" }} onClick={() => onUncheckAll(mod.key)}>
            <InfoCircleOutlined /> Uncheck
          </button>
        </div>
      </div>
      <div className="row">
        {mod.perms?.map(p => (
          <div key={p} className="col-lg-4 col-md-6 col-12 mb-2">
            <PermissionItem moduleKey={mod.key} permKey={p} checked={permissions[mod.key]?.[p] === "Y"} onChange={onToggle} />
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── CmsGroupSection — parent toggle + children ─────────────────── */
const CmsGroupSection = ({ permissions, onToggle, onCheckAll, onUncheckAll, onCheckGroup, onUncheckGroup }) => {
  const [expanded, setExpanded] = useState(true);
  const allCmsChecked = CMS_KEYS.every(k =>
    Object.keys(permissions[k] || {}).every(p => permissions[k][p] === "Y")
  );
  const someCmsChecked = CMS_KEYS.some(k =>
    Object.keys(permissions[k] || {}).some(p => permissions[k][p] === "Y")
  );

  return (
    <div style={{
      border: "1px solid #e2e8f0", borderRadius: 12, marginBottom: 16,
      overflow: "hidden",
    }}>
      {/* CMS parent header */}
      <div style={{
        background: "linear-gradient(135deg,#1e3a5f,#0369a1)",
        padding: "14px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FontAwesomeIcon icon={faLayerGroup} style={{ color: "white", fontSize: 14 }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "white" }}>CMS Management</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>
              {CMS_KEYS.length} CMS sub-modules
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            type="button"
            style={{
              background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
              color: "white", borderRadius: 6, padding: "4px 14px", fontSize: 12, cursor: "pointer",
              fontWeight: 600,
            }}
            onClick={onCheckGroup}
          >
            ✓ Allow All CMS
          </button>
          <button
            type="button"
            style={{
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.8)", borderRadius: 6, padding: "4px 14px", fontSize: 12, cursor: "pointer",
            }}
            onClick={onUncheckGroup}
          >
            ✕ Revoke All
          </button>
          <button
            type="button"
            style={{ background: "transparent", border: "none", color: "white", cursor: "pointer", padding: "4px 8px" }}
            onClick={() => setExpanded(e => !e)}
          >
            <FontAwesomeIcon icon={expanded ? faChevronUp : faChevronDown} />
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: "16px 20px", background: "#fafbff" }}>
          {/* CMS status summary */}
          <div style={{
            display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16,
            padding: "10px 16px", background: "#f0f9ff", borderRadius: 8, border: "1px solid #e0f2fe",
          }}>
            <span style={{ fontSize: 12, color: "#0369a1" }}>
              <strong>{CMS_KEYS.filter(k => Object.values(permissions[k] || {}).some(v => v === "Y")).length}</strong> of {CMS_KEYS.length} sub-modules have permissions assigned
            </span>
          </div>

          {CMS_CHILDREN.map(child => (
            <div key={child.key} style={{
              background: "white", border: "1px solid #e2e8f0", borderRadius: 10,
              padding: "14px 16px", marginBottom: 10,
            }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 6, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FontAwesomeIcon icon={child.icon} style={{ color: "#1d4ed8", fontSize: 11 }} />
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 13, color: "#1e3a5f" }}>CMS – {child.label}</span>
                </div>
                <div className="d-flex gap-2">
                  <button type="button" className="action-button secondary" style={{ fontSize: 10, padding: "2px 8px" }} onClick={() => onCheckAll(child.key)}>
                    Check All
                  </button>
                  <button type="button" className="action-button secondary" style={{ fontSize: 10, padding: "2px 8px" }} onClick={() => onUncheckAll(child.key)}>
                    Uncheck
                  </button>
                </div>
              </div>
              <div className="row">
                {child.perms.map(p => (
                  <div key={p} className="col-lg-3 col-md-6 col-12 mb-2">
                    <PermissionItem moduleKey={child.key} permKey={p} checked={permissions[child.key]?.[p] === "Y"} onChange={onToggle} />
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

/* ─── Main component ───────────────────────────────────────────────── */
export default function AddEditSubAdmin() {
  const loginUser = JSON.parse(sessionStorage.getItem("ADMIN-INFO") || "{}");
  const location  = useLocation();
  const navigate  = useNavigate();
  const state     = location?.state || {};
  const isEdit    = !!state?.id;

  const [ADDEDITDATA, setAddEditData] = useState({
    name:  state?.name  || "",
    email: state?.email || "",
    phone: state?.phone || "",
    password: "",
  });
  const [permissions, setPermissions] = useState(buildInitialPermissions());
  const [errors,      setErrors]      = useState({});
  const [isLoading,   setIsLoading]   = useState(false);

  /* ── Load permissions for edit ── */
  useEffect(() => {
    document.title = `PGTI || ${isEdit ? "Edit" : "Add"} Sub Admin`;
    if (isEdit && state?.id) {
      setIsLoading(true);
      getPermission({ admin_id: state.id }).then(res => {
        if (res.status && res.result?.length > 0) {
          setPermissions(prev => {
            const updated = { ...prev };
            res.result.forEach(item => {
              const parsed = JSON.parse(item.permissions_json || "{}");
              if (updated[item.module]) {
                updated[item.module] = { ...updated[item.module], ...parsed };
              }
            });
            return updated;
          });
        }
        setIsLoading(false);
      }).catch(() => setIsLoading(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddEditData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  /* ── Permission helpers ── */
  const togglePermission = (moduleKey, permKey) => {
    setPermissions(prev => ({
      ...prev,
      [moduleKey]: {
        ...prev[moduleKey],
        [permKey]: prev[moduleKey]?.[permKey] === "Y" ? "N" : "Y",
      },
    }));
  };

  const checkAllModule = (moduleKey) => {
    setPermissions(prev => ({
      ...prev,
      [moduleKey]: Object.keys(prev[moduleKey] || {}).reduce((acc, k) => { acc[k] = "Y"; return acc; }, {}),
    }));
  };

  const uncheckAllModule = (moduleKey) => {
    setPermissions(prev => ({
      ...prev,
      [moduleKey]: Object.keys(prev[moduleKey] || {}).reduce((acc, k) => { acc[k] = "N"; return acc; }, {}),
    }));
  };

  const checkAllCms = () => {
    setPermissions(prev => {
      const updated = { ...prev };
      CMS_KEYS.forEach(k => {
        updated[k] = Object.keys(updated[k] || {}).reduce((acc, p) => { acc[p] = "Y"; return acc; }, {});
      });
      return updated;
    });
  };

  const uncheckAllCms = () => {
    setPermissions(prev => {
      const updated = { ...prev };
      CMS_KEYS.forEach(k => {
        updated[k] = Object.keys(updated[k] || {}).reduce((acc, p) => { acc[p] = "N"; return acc; }, {});
      });
      return updated;
    });
  };

  const checkAllPermissions = () => {
    setPermissions(prev => {
      const updated = {};
      Object.keys(prev).forEach(mod => {
        updated[mod] = Object.keys(prev[mod] || {}).reduce((acc, p) => { acc[p] = "Y"; return acc; }, {});
      });
      return updated;
    });
  };

  const resetAllPermissions = () => {
    Modal.confirm({
      title: "Reset All Permissions",
      content: "This will uncheck all permission checkboxes for every module.",
      okText: "Yes, Reset All", okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: () => {
        setPermissions(buildInitialPermissions());
      },
    });
  };

  /* ── Validate ── */
  const validate = () => {
    const newErrors = {};
    if (!ADDEDITDATA.name?.trim())  newErrors.name  = "Name is required";
    if (!ADDEDITDATA.email?.trim()) newErrors.email = "Email is required";
    if (ADDEDITDATA.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ADDEDITDATA.email))
      newErrors.email = "Please enter a valid email address";
    if (!isEdit && !ADDEDITDATA.password?.trim())
      newErrors.password = "Password is required for new administrators";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      const firstError = Object.values({
        name: errors.name || (!ADDEDITDATA.name?.trim() ? "Name is required" : ""),
        email: errors.email || (!ADDEDITDATA.email?.trim() ? "Email is required" : ""),
        password: errors.password || (!isEdit && !ADDEDITDATA.password?.trim() ? "Password is required for new administrators" : ""),
      }).find(Boolean);
      notification.open({ message: "Oops!", description: firstError || "Please review the highlighted fields.", placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
      return;
    }
    try {
      setIsLoading(true);

      // Build flat permissions array for backend
      const permissionsArray = Object.keys(permissions).map(module => ({
        module,
        permissions_json: JSON.stringify(permissions[module]),
      }));

      const res = await addeditdata({
        ...(isEdit ? { editId: state.id } : {}),
        name:        ADDEDITDATA.name.trim(),
        email:       ADDEDITDATA.email.trim(),
        phone:       ADDEDITDATA.phone?.trim() || "",
        permissions: permissionsArray,
        ...(ADDEDITDATA.password?.trim() ? { password: ADDEDITDATA.password.trim() } : {}),
      });
      if (res.status === true) {
        notification.open({
          message: "Success",
          description: isEdit ? "Administrator updated successfully." : "Administrator created successfully.",
          placement: "topRight",
          icon: <CheckCircleOutlined style={{ color: "green" }} />,
          duration: 2,
        });
        navigate("/admin/accounts/list");
      } else {
        notification.open({ message: "Oops!", description: res?.message || "Operation failed.", placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
      }
    } catch {
      notification.open({ message: "Oops!", description: "An error occurred. Please try again.", placement: "topRight", icon: <InfoCircleOutlined style={{ color: "red" }} />, duration: 2 });
    } finally {
      setIsLoading(false);
    }
  };

  const isSuperAdmin = loginUser?.admin_type === "Super Admin";

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">
              {isSuperAdmin && !isEdit ? "Add Administrator"
                : isSuperAdmin && isEdit ? "Edit Administrator"
                : "Profile Settings"}
            </h1>
            <p className="page-subtitle">
              {isSuperAdmin && !isEdit
                ? "Create a new sub-administrator account with appropriate permissions"
                : isSuperAdmin && isEdit
                ? "Update administrator information and module permissions"
                : "Manage your profile information and account settings"}
            </p>
          </div>
          <Link to={isSuperAdmin ? "/admin/accounts/list" : "/admin/dashboard"}>
            <button className="action-button secondary"><ArrowLeftOutlined /> Back</button>
          </Link>
        </div>
      </div>

      <div className="page-body">
        <form onSubmit={handleSubmit} className="modern-form">

          {/* ── Account Info ─────────────────────────────── */}
          <div className="content-card" style={{ marginBottom: 20 }}>
            <div className="content-card-body">
              <div className="form-section">
                <h3 className="form-section-title"><UserOutlined />&nbsp;Administrator Information</h3>
                <div className="row">
                  <div className="col-md-4 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label required">Full Name</label>
                      <input type="text" name="name" className="form-input" placeholder="Enter full name" value={ADDEDITDATA.name} onChange={handleChange} />
                      {errors.name && <div className="form-error">{errors.name}</div>}
                    </div>
                  </div>
                  <div className="col-md-4 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label required">Email Address</label>
                      <input type="email" name="email" className="form-input" placeholder="Enter email address" value={ADDEDITDATA.email} onChange={handleChange} readOnly={isEdit} />
                      {errors.email && <div className="form-error">{errors.email}</div>}
                      {isEdit && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>Email cannot be changed after creation.</div>}
                    </div>
                  </div>
                  <div className="col-md-4 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input type="tel" name="phone" className="form-input" placeholder="Enter phone number" value={ADDEDITDATA.phone} onChange={handleChange} />
                    </div>
                  </div>
                  {!isEdit && (
                    <div className="col-md-4 col-12 mb-3">
                      <div className="form-group">
                        <label className="form-label required">Initial Password</label>
                        <input type="password" name="password" className="form-input" placeholder="Set a temporary password" value={ADDEDITDATA.password} onChange={handleChange} />
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
                          <span>To reset this administrator's password, ask them to use the <strong>Forgot Password</strong> flow on the login page.</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Permission Settings ───────────────────────── */}
          <div className="content-card" style={{ marginBottom: 20 }}>
            <div className="content-card-body">
              <div className="form-section-center">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3 className="form-section-title" style={{ margin: 0 }}>
                    <SafetyOutlined />&nbsp;Permission Settings
                  </h3>
                  <div className="d-flex gap-2">
                    <button type="button" className="action-button secondary" style={{ fontSize: 13, padding: "6px 16px" }} onClick={checkAllPermissions}>
                      <CheckCircleOutlined /> Check All
                    </button>
                    <button type="button" className="action-button secondary" style={{ fontSize: 13, padding: "6px 16px" }} onClick={resetAllPermissions}>
                      <InfoCircleOutlined /> Reset All
                    </button>
                  </div>
                </div>

                {/* Render modules */}
                {MODULE_CONFIG.map(mod => {
                  if (mod.isCmsGroup) {
                    return (
                      <CmsGroupSection
                        key="cms-group"
                        permissions={permissions}
                        onToggle={togglePermission}
                        onCheckAll={checkAllModule}
                        onUncheckAll={uncheckAllModule}
                        onCheckGroup={checkAllCms}
                        onUncheckGroup={uncheckAllCms}
                      />
                    );
                  }
                  return (
                    <PermissionModule
                      key={mod.key}
                      mod={mod}
                      permissions={permissions}
                      onToggle={togglePermission}
                      onCheckAll={checkAllModule}
                      onUncheckAll={uncheckAllModule}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Form Actions ──────────────────────────────── */}
          <div className="form-actions">
            <button
              type="button"
              className="action-button secondary"
              onClick={() => navigate(isSuperAdmin ? "/admin/accounts/list" : "/admin/dashboard")}
            >
              Cancel
            </button>
            <button type="submit" className="action-button primary" disabled={isLoading}>
              {isLoading
                ? <><div className="loading-spinner small"></div>{isEdit ? "Updating…" : "Creating…"}</>
                : <><SaveOutlined /> {isEdit ? "Update Administrator" : "Create Administrator"}</>}
            </button>
          </div>

        </form>
      </div>

      <LoadingEffect isLoading={isLoading} text="Saving administrator…" />
    </div>
  );
}
