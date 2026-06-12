import React, { useCallback, useEffect, useMemo, useState } from "react";
import { notification } from "antd";
import {
  CheckCircleOutlined,
  EditOutlined,
  InfoCircleOutlined,
  LockOutlined,
  SafetyOutlined,
  UserOutlined,
} from "@ant-design/icons";

import Top_navbar from "components/layout/TopNavbar";
import LoadingEffect from "components/ui/Loading/LoadingEffect";
import {
  getProfile,
  requestFieldUpdate,
  sendPasswordChangeOtp,
  updateOwnPassword,
  verifyFieldUpdate,
  verifyPasswordChangeOtp,
} from "services/profile.service";
import "styles/admin-pages.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{10}$/;
const OTP_REGEX = /^\d{6}$/;
const normalizeAdminType = (value = "") => String(value || "").trim().toLowerCase();
const isSuperAdminType = (value) => normalizeAdminType(value) === "super admin";

const ACCESS_MODE_LABELS = {
  view_only: "View Only",
  standard: "View + Edit",
};

const MODULE_META = {
  imports: {
    label: "Tournament Data Import",
    description: "Import tournament data packages and review historical upload batches.",
  },
  accounts: {
    label: "Sub Admin",
    description: "Manage sub-administrator accounts and account status.",
  },
  homepage_settings: {
    label: "Homepage Settings",
    description: "Update homepage sections, banners, rankings, and highlighted content.",
  },
  about_us: {
    label: "About Us",
    description: "Edit About Us page sections, values, milestones, and vision content.",
  },
  anti_doping: {
    label: "Anti-Doping",
    description: "Manage anti-doping page content and informational sections.",
  },
  contact_us: {
    label: "Contact Us",
    description: "Manage contact page copy and public contact section setup.",
  },
  push_notifications: {
    label: "Push Notifications",
    description: "Send custom push notifications, manage presets, and resend campaigns.",
  },
  disclaimer: {
    label: "Disclaimer",
    description: "Maintain disclaimer page content.",
  },
  events: {
    label: "Events / Tournaments",
    description: "Create tournaments, update listings, manage event details, and publish tournament information.",
  },
  faqs: {
    label: "FAQs",
    description: "Manage frequently asked questions shown on the website.",
  },
  footer: {
    label: "Footer",
    description: "Update footer links, sections, app-download blocks, and bottom-area content.",
  },
  gallery: {
    label: "Gallery",
    description: "Manage gallery items, listing banners, and associated media.",
  },
  press_release: {
    label: "Press Release",
    description: "Manage press release content and listing pages.",
  },
  golf_facts: {
    label: "Golf Facts",
    description: "Update golf facts page sections and educational content.",
  },
  highlight_videos: {
    label: "Highlights & Videos",
    description: "Manage highlight video listings and media blocks.",
  },
  indian_golf: {
    label: "Indian Golf",
    description: "Maintain Indian Golf historical content and related sections.",
  },
  news: {
    label: "News",
    description: "Create and manage news articles, listings, and banners.",
  },
  privacy_policy: {
    label: "Privacy Policy",
    description: "Update privacy policy page content.",
  },
  cookie_policy: {
    label: "Cookie Policy",
    description: "Update cookie policy page content.",
  },
  terms_conditions: {
    label: "Terms & Conditions",
    description: "Update terms and conditions page content.",
  },
  tour_partners: {
    label: "Tour Partners",
    description: "Manage partner page content and partner sections.",
  },
  banners: {
    label: "Banners",
    description: "Manage general website banners and related content blocks.",
  },
  inquiries: {
    label: "Contact Us Inquiries",
    description: "Review incoming contact-us inquiry submissions.",
  },
  articles: {
    label: "Article Pages & Articles",
    description: "Manage structured article pages and editorial article content.",
  },
  email_templates: {
    label: "Email Templates",
    description: "Manage system email templates used by the platform.",
  },
  users: {
    label: "Users / Players",
    description: "Manage player profiles, handbook, login activity, and listing banners.",
  },
  tournament_results: {
    label: "Tournament Results",
    description: "Create and update tournament result entries used in player rankings and stats.",
  },
  live_sync: {
    label: "Live Sync Monitoring",
    description: "Monitor and manually trigger live prize and tournament feed sync jobs.",
  },
};

const ACTION_LABELS = {
  list: "view pages and records",
  add_edit: "add and edit content",
  change_status: "change status",
  delete: "delete records",
  export: "export data",
  approve: "approve requests",
};

const FIELD_META = {
  name: {
    label: "Full Name",
    placeholder: "Enter full name",
    type: "text",
    description: "Update the display name shown across the admin panel.",
  },
  email: {
    label: "Email Address",
    placeholder: "Enter email address",
    type: "email",
    description: "This becomes the latest active login email after verification.",
  },
  phone: {
    label: "Phone Number",
    placeholder: "Enter 10-digit mobile number",
    type: "tel",
    description: "This updates your latest registered phone number and keeps the old number in history.",
  },
};

const notify = (message, description, isSuccess = false) => {
  notification.open({
    message,
    description,
    placement: "topRight",
    icon: isSuccess ? (
      <CheckCircleOutlined style={{ color: "green" }} />
    ) : (
      <InfoCircleOutlined style={{ color: "red" }} />
    ),
    duration: isSuccess ? 2 : 3,
  });
};

const validateFieldInput = (field, value) => {
  const trimmed = String(value || "").trim();
  if (field === "name") {
    if (!trimmed) return "Name is required.";
    if (trimmed.length < 2 || trimmed.length > 200) return "Name must be between 2 and 200 characters.";
    return null;
  }
  if (field === "email") {
    if (!trimmed) return "Email is required.";
    if (!EMAIL_REGEX.test(trimmed)) return "Please enter a valid email address.";
    return null;
  }
  if (field === "phone") {
    if (!trimmed) return "Phone number is required.";
    if (!PHONE_REGEX.test(trimmed)) return "Phone number must be exactly 10 digits.";
    return null;
  }
  return null;
};

const buildPermissionSummary = (profile) => {
  if (!profile) return [];
  if (isSuperAdminType(profile.admin_type)) {
    return Object.keys(MODULE_META).map((moduleKey) => ({
      module: moduleKey,
      label: MODULE_META[moduleKey].label,
      description: MODULE_META[moduleKey].description,
      actions: Object.keys(ACTION_LABELS),
    }));
  }

  return (profile.permissions || [])
    .map((item) => {
      let parsed = {};
      try {
        parsed = JSON.parse(item.permissions_json || "{}");
      } catch {
        parsed = {};
      }

      const actions = Object.keys(parsed).filter((action) => parsed[action] === "Y");
      if (!actions.length) return null;

      return {
        module: item.module,
        label: MODULE_META[item.module]?.label || item.module,
        description:
          MODULE_META[item.module]?.description ||
          "Access to this module is enabled for your account.",
        actions,
      };
    })
    .filter(Boolean);
};

const FieldCard = ({
  field,
  profile,
  activeField,
  draftValues,
  otpValues,
  otpSent,
  onStartEdit,
  onCancelEdit,
  onDraftChange,
  onOtpChange,
  onSendOtp,
  onVerify,
  isReadOnly,
  isBusy,
}) => {
  const meta = FIELD_META[field];
  const isEditing = activeField === field;

  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 16,
        background: "#fff",
        padding: 18,
        height: "100%",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#1d4ed8", letterSpacing: ".06em", marginBottom: 8 }}>
            {meta.label.toUpperCase()}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", wordBreak: "break-word" }}>
            {profile?.[field] || "--"}
          </div>
          <div style={{ marginTop: 8, fontSize: 13, color: "#64748b" }}>{meta.description}</div>
        </div>

        <button
          type="button"
          className="action-button secondary"
          style={{ padding: "6px 12px", fontSize: 12 }}
          onClick={() => onStartEdit(field)}
          disabled={isBusy}
        >
          <EditOutlined /> Edit
        </button>
      </div>

      {isEditing && (
        <div
          style={{
            marginTop: 16,
            padding: 16,
            borderRadius: 14,
            background: "#f8fbff",
            border: "1px solid #dbeafe",
          }}
        >
          {isReadOnly ? (
            <div style={{ fontSize: 13, color: "#92400e" }}>
              This account cannot self-edit profile details. A notification has been sent to the Super Admin.
            </div>
          ) : (
            <>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label required">{meta.label}</label>
                <input
                  type={meta.type}
                  className="form-input"
                  value={draftValues[field]}
                  onChange={(event) => onDraftChange(field, event.target.value)}
                  placeholder={meta.placeholder}
                />
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: otpSent[field] ? 12 : 0 }}>
                <button
                  type="button"
                  className="action-button secondary"
                  onClick={() => onSendOtp(field)}
                  disabled={isBusy}
                >
                  Send OTP For Verification
                </button>
                <button
                  type="button"
                  className="action-button secondary"
                  onClick={onCancelEdit}
                  disabled={isBusy}
                >
                  Cancel
                </button>
              </div>

              {otpSent[field] && (
                <div className="row align-items-end">
                  <div className="col-md-6 col-12 mb-2">
                    <label className="form-label required">Enter 6-digit OTP</label>
                    <input
                      type="text"
                      className="form-input"
                      inputMode="numeric"
                      maxLength={6}
                      value={otpValues[field]}
                      onChange={(event) => onOtpChange(field, event.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="Enter OTP"
                    />
                  </div>
                  <div className="col-md-6 col-12 mb-2">
                    <button
                      type="button"
                      className="action-button primary"
                      onClick={() => onVerify(field)}
                      disabled={isBusy}
                    >
                      Verify & Update
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default function ProfileSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [profile, setProfile] = useState(null);
  const [activeField, setActiveField] = useState("");
  const [draftValues, setDraftValues] = useState({ name: "", email: "", phone: "" });
  const [otpValues, setOtpValues] = useState({ name: "", email: "", phone: "" });
  const [otpSent, setOtpSent] = useState({ name: false, email: false, phone: false });
  const [passwordPanelOpen, setPasswordPanelOpen] = useState(false);
  const [passwordOtpSent, setPasswordOtpSent] = useState(false);
  const [passwordOtp, setPasswordOtp] = useState("");
  const [passwordOtpVerified, setPasswordOtpVerified] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ password: "", confirmPassword: "" });

  const permissionSummary = useMemo(() => buildPermissionSummary(profile), [profile]);
  const isSelfEditable = profile?.can_self_edit === true;

  const hydrateProfile = useCallback((data) => {
    setProfile(data || null);
    setDraftValues({
      name: data?.name || "",
      email: data?.email || "",
      phone: data?.phone || "",
    });
  }, []);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    const res = await getProfile();
    if (res.status) {
      hydrateProfile(res.result);
    } else {
      notify("Oops!", res.message || "Failed to load profile.");
    }
    setIsLoading(false);
  }, [hydrateProfile]);

  useEffect(() => {
    document.title = "PGTI || Profile Settings";
    loadProfile();
  }, [loadProfile]);

  const resetFieldFlow = useCallback(() => {
    setActiveField("");
    setOtpValues({ name: "", email: "", phone: "" });
    setOtpSent({ name: false, email: false, phone: false });
    setDraftValues({
      name: profile?.name || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
    });
  }, [profile]);

  const refreshSessionProfile = (updatedProfile) => {
    const existing = JSON.parse(sessionStorage.getItem("ADMIN-INFO") || "{}");
    const merged = { ...existing, ...updatedProfile };
    sessionStorage.setItem("ADMIN-INFO", JSON.stringify(merged));
    window.dispatchEvent(new Event("admin-profile-updated"));
  };

  const handleStartEdit = async (field) => {
    if (!profile) return;

    setActiveField(field);
    setOtpValues((prev) => ({ ...prev, [field]: "" }));
    setOtpSent((prev) => ({ ...prev, [field]: false }));

    if (isSelfEditable) {
      return;
    }

    setIsBusy(true);
    const res = await requestFieldUpdate({ field, value: profile[field] || "" });
    setIsBusy(false);
    notify(res.status ? "Success" : "Oops!", res.message, res.status);
  };

  const handleSendOtp = async (field) => {
    const validationError = validateFieldInput(field, draftValues[field]);
    if (validationError) {
      notify("Oops!", validationError);
      return;
    }

    setIsBusy(true);
    const res = await requestFieldUpdate({ field, value: draftValues[field] });
    setIsBusy(false);

    if (!res.status) {
      notify("Oops!", res.message || "Failed to send OTP.");
      return;
    }

    setOtpSent((prev) => ({ ...prev, [field]: true }));
    notify("Success", `${res.message}${res.result?.otp ? ` Use OTP ${res.result.otp} for now.` : ""}`, true);
  };

  const handleVerifyField = async (field) => {
    if (!OTP_REGEX.test(otpValues[field] || "")) {
      notify("Oops!", "OTP must be exactly 6 digits.");
      return;
    }

    setIsBusy(true);
    const res = await verifyFieldUpdate({ field, otp: otpValues[field] });
    setIsBusy(false);

    if (!res.status) {
      notify("Oops!", res.message || "Failed to verify OTP.");
      return;
    }

    refreshSessionProfile(res.result || {});
    hydrateProfile(res.result);
    resetFieldFlow();
    notify("Success", res.message || "Profile field updated successfully.", true);
  };

  const handlePasswordAttempt = async () => {
    setPasswordPanelOpen(true);
    if (isSelfEditable) return;

    setIsBusy(true);
    const res = await sendPasswordChangeOtp();
    setIsBusy(false);
    notify(res.status ? "Success" : "Oops!", res.message, res.status);
  };

  const handleSendPasswordOtp = async () => {
    setIsBusy(true);
    const res = await sendPasswordChangeOtp();
    setIsBusy(false);
    if (!res.status) {
      notify("Oops!", res.message || "Failed to send OTP.");
      return;
    }
    setPasswordOtpSent(true);
    notify("Success", `${res.message}${res.result?.otp ? ` Use OTP ${res.result.otp} for now.` : ""}`, true);
  };

  const handleVerifyPasswordOtp = async () => {
    if (!OTP_REGEX.test(passwordOtp || "")) {
      notify("Oops!", "OTP must be exactly 6 digits.");
      return;
    }

    setIsBusy(true);
    const res = await verifyPasswordChangeOtp({ otp: passwordOtp });
    setIsBusy(false);
    if (!res.status) {
      notify("Oops!", res.message || "Failed to verify OTP.");
      return;
    }
    setPasswordOtpVerified(true);
    notify("Success", res.message || "OTP verified successfully.", true);
  };

  const handleUpdatePassword = async () => {
    if (!passwordForm.password.trim()) {
      notify("Oops!", "New password is required.");
      return;
    }
    if (passwordForm.password.trim().length < 8) {
      notify("Oops!", "Password must be at least 8 characters.");
      return;
    }
    if (passwordForm.password !== passwordForm.confirmPassword) {
      notify("Oops!", "Confirm password must match the new password.");
      return;
    }

    setIsBusy(true);
    const res = await updateOwnPassword({ password: passwordForm.password.trim() });
    setIsBusy(false);
    if (!res.status) {
      notify("Oops!", res.message || "Failed to update password.");
      return;
    }

    setPasswordPanelOpen(false);
    setPasswordOtpSent(false);
    setPasswordOtpVerified(false);
    setPasswordOtp("");
    setPasswordForm({ password: "", confirmPassword: "" });
    notify("Success", res.message || "Password updated successfully.", true);
  };

  return (
    <div className="admin-page-container">
      <Top_navbar title="Profile Settings" />

      <div className="page-body">
        <div className="content-card" style={{ marginBottom: 20 }}>
          <div className="content-card-body">
            <div className="form-section">
              <h3 className="form-section-title">
                <UserOutlined />&nbsp;Administrator Information
              </h3>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 18 }}>
                {isSelfEditable
                  ? "Edit your own name, email, phone number, and password using field-level OTP verification."
                  : "Your account is managed by the Super Admin. You can review your details and access, but profile changes require Super Admin assistance."}
              </div>

              <div className="row">
                <div className="col-lg-4 col-md-6 col-12 mb-3">
                  <div
                    style={{
                      border: "1px solid #dbeafe",
                      borderRadius: 16,
                      padding: 16,
                      background: "#f8fbff",
                      height: "100%",
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#1d4ed8", letterSpacing: ".06em", marginBottom: 8 }}>
                      ACCOUNT TYPE
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>
                      {profile?.admin_type || "--"}
                    </div>
                    <div style={{ marginTop: 10, fontSize: 13, color: "#64748b" }}>
                      Access mode: <strong>{ACCESS_MODE_LABELS[profile?.access_mode] || "View + Edit"}</strong>
                    </div>
                  </div>
                </div>
                <div className="col-lg-8 col-12 mb-3">
                  <div
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 16,
                      padding: 16,
                      background: isSelfEditable ? "#f8fbff" : "#fff7ed",
                      height: "100%",
                    }}
                  >
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>
                        {isSelfEditable ? "Profile management" : "Super Admin managed profile"}
                      </div>
                      <div style={{ fontSize: 13, color: "#64748b" }}>
                        {isSelfEditable
                          ? "Each field is verified independently before it is updated."
                          : "If you try to edit any profile field or password, the system will notify the Super Admin and prompt you to contact them for help."}
                      </div>
                  </div>
                </div>
              </div>

              <div className="row">
                {["name", "email", "phone"].map((field) => (
                  <div key={field} className="col-lg-4 col-md-6 col-12 mb-3">
                    <FieldCard
                      field={field}
                      profile={profile}
                      activeField={activeField}
                      draftValues={draftValues}
                      otpValues={otpValues}
                      otpSent={otpSent}
                      onStartEdit={handleStartEdit}
                      onCancelEdit={resetFieldFlow}
                      onDraftChange={(key, value) => setDraftValues((prev) => ({ ...prev, [key]: value }))}
                      onOtpChange={(key, value) => setOtpValues((prev) => ({ ...prev, [key]: value }))}
                      onSendOtp={handleSendOtp}
                      onVerify={handleVerifyField}
                      isReadOnly={!isSelfEditable}
                      isBusy={isBusy}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="content-card" style={{ marginBottom: 20 }}>
          <div className="content-card-body">
            <div className="form-section">
              <h3 className="form-section-title">
                <LockOutlined />&nbsp;Password Change
              </h3>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 18 }}>
                {isSelfEditable
                  ? "Password change happens in two steps: verify OTP first, then set a new password."
                  : "This password can only be changed by the Super Admin. If you try to change it, the Super Admin will be notified."}
              </div>

              {!passwordPanelOpen ? (
                <button
                  type="button"
                  className="action-button primary"
                  onClick={handlePasswordAttempt}
                  disabled={isBusy}
                >
                  <LockOutlined /> Change Password
                </button>
              ) : (
                <div
                  style={{
                    border: "1px solid #dbeafe",
                    borderRadius: 16,
                    background: "#f8fbff",
                    padding: 18,
                  }}
                >
                  {!isSelfEditable ? (
                    <div style={{ fontSize: 13, color: "#92400e" }}>
                      Please contact the Super Admin to change your password. A notification email has been sent to the Super Admin.
                    </div>
                  ) : !passwordOtpVerified ? (
                    <>
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                        <button
                          type="button"
                          className="action-button secondary"
                          onClick={handleSendPasswordOtp}
                          disabled={isBusy}
                        >
                          Send OTP For Verification
                        </button>
                        <button
                          type="button"
                          className="action-button secondary"
                          onClick={() => {
                            setPasswordPanelOpen(false);
                            setPasswordOtpSent(false);
                            setPasswordOtp("");
                          }}
                          disabled={isBusy}
                        >
                          Cancel
                        </button>
                      </div>
                      {passwordOtpSent && (
                        <div className="row align-items-end">
                          <div className="col-md-5 col-12 mb-2">
                            <label className="form-label required">Enter 6-digit OTP</label>
                            <input
                              type="text"
                              className="form-input"
                              inputMode="numeric"
                              maxLength={6}
                              value={passwordOtp}
                              onChange={(event) => setPasswordOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                              placeholder="Enter OTP"
                            />
                          </div>
                          <div className="col-md-7 col-12 mb-2">
                            <button
                              type="button"
                              className="action-button primary"
                              onClick={handleVerifyPasswordOtp}
                              disabled={isBusy}
                            >
                              Verify OTP
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="row">
                        <div className="col-md-6 col-12 mb-3">
                          <label className="form-label required">New Password</label>
                          <input
                            type="password"
                            className="form-input"
                            value={passwordForm.password}
                            onChange={(event) => setPasswordForm((prev) => ({ ...prev, password: event.target.value }))}
                            placeholder="Enter new password"
                          />
                        </div>
                        <div className="col-md-6 col-12 mb-3">
                          <label className="form-label required">Confirm Password</label>
                          <input
                            type="password"
                            className="form-input"
                            value={passwordForm.confirmPassword}
                            onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          className="action-button primary"
                          onClick={handleUpdatePassword}
                          disabled={isBusy}
                        >
                          Update Password
                        </button>
                        <button
                          type="button"
                          className="action-button secondary"
                          onClick={() => {
                            setPasswordPanelOpen(false);
                            setPasswordOtpSent(false);
                            setPasswordOtpVerified(false);
                            setPasswordOtp("");
                            setPasswordForm({ password: "", confirmPassword: "" });
                          }}
                          disabled={isBusy}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="content-card">
          <div className="content-card-body">
            <div className="form-section">
              <h3 className="form-section-title">
                <SafetyOutlined />&nbsp;What You Can Do
              </h3>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 18 }}>
                This is a read-only summary of your access. The list explains the modules available to your account and what actions are enabled in each one.
              </div>

              {isSuperAdminType(profile?.admin_type) && (
                <div
                  style={{
                    marginBottom: 18,
                    padding: "14px 16px",
                    borderRadius: 14,
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    color: "#1e3a5f",
                    fontSize: 13,
                  }}
                >
                  As a <strong>Super Admin</strong>, you have full access to every configured module and management action in the admin panel.
                </div>
              )}

              <div className="row">
                {permissionSummary.map((item) => (
                  <div key={item.module} className="col-xl-4 col-lg-6 col-12 mb-3">
                    <div
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 16,
                        background: "#fff",
                        padding: 18,
                        height: "100%",
                      }}
                    >
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
                        {item.description}
                      </div>
                      <ul style={{ paddingLeft: 18, margin: 0, color: "#1e3a5f", fontSize: 13 }}>
                        {item.actions.map((action) => (
                          <li key={action} style={{ marginBottom: 6 }}>
                            You can <strong>{ACTION_LABELS[action] || action}</strong> in this section.
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <LoadingEffect isLoading={isLoading} text="Loading profile..." />
    </div>
  );
}
