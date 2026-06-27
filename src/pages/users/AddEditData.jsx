import React, { useEffect, useMemo, useState } from "react";
import { Input, notification } from "antd";
import {
  InfoCircleOutlined, CheckCircleOutlined, ArrowLeftOutlined, SaveOutlined,
  UserOutlined, PhoneOutlined, IdcardOutlined, TrophyOutlined, LockOutlined,
  EyeInvisibleOutlined, EyeTwoTone,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import ImageUploadField from "components/ui/ImageUploadField";
import LoadingEffect from "components/ui/Loading/LoadingEffect";
import { addEditUsers, getUserDetail } from "services/users.service";
import { CharCounter, FieldHint, ImageHint } from "components/ui/FieldHint";
import { LIMITS, IMAGE_SPECS } from "utils/fieldValidation";
import { COUNTRY_DIAL_CODES } from "utils/countryDialCodes";
import "styles/admin-pages.css";

const NATIONALITIES = Array.from(new Set(COUNTRY_DIAL_CODES.map((item) => item.name))).sort((left, right) =>
  left.localeCompare(right)
);

const HOME_CLUBS = [
  "Delhi Golf Club", "Royal Calcutta Golf Club", "Bombay Presidency Golf Club",
  "Tollygunge Club", "Willingdon Sports Club", "Bangalore Golf Club",
  "Classic Golf & Country Club", "Eagleton Golf Resort", "Other",
];

const DEFAULT_COUNTRY_CODE = "+91";
const PASSWORD_RULE_TEXT = "Password must be 8-72 characters and include uppercase, lowercase, number, and special character.";

const normalizeDialCode = (value = "") => String(value).replace(/\s+/g, "").trim();

const resolveCountryCode = (player = {}) => {
  const directValue = normalizeDialCode(
    player.mobile_country_code || player.country_code || player.dial_code || ""
  );
  if (directValue && COUNTRY_DIAL_CODES.some((item) => normalizeDialCode(item.dialCode) === directValue)) {
    return directValue;
  }

  if (directValue) {
    const matchedByCountry = COUNTRY_DIAL_CODES.find(
      (item) =>
        item.code === directValue.toUpperCase() ||
        item.name.toLowerCase() === String(player.country || player.nationality || "").trim().toLowerCase()
    );
    if (matchedByCountry) return matchedByCountry.dialCode;

    const normalizedDirectValue = directValue.startsWith("+") ? directValue : `+${directValue}`;
    if (COUNTRY_DIAL_CODES.some((item) => normalizeDialCode(item.dialCode) === normalizedDirectValue)) {
      return normalizedDirectValue;
    }
  }

  const matchedByCountryName = COUNTRY_DIAL_CODES.find(
    (item) =>
      item.name.toLowerCase() === String(player.country || "").trim().toLowerCase() ||
      item.name.toLowerCase() === String(player.nationality || "").trim().toLowerCase()
  );
  return matchedByCountryName?.dialCode || DEFAULT_COUNTRY_CODE;
};

const resolveNationalityMeta = (nationality = "") => {
  const normalized = String(nationality || "").trim().toLowerCase();
  return COUNTRY_DIAL_CODES.find((item) => item.name.toLowerCase() === normalized) || null;
};

const resolveFlagUrl = (nationality = "") => {
  const meta = resolveNationalityMeta(nationality);
  return meta?.code ? `https://flagcdn.com/w80/${meta.code.toLowerCase()}.png` : "";
};

const validateStrongPassword = (value = "") => {
  const password = String(value || "").trim();
  if (!password) return "";
  if (password.length < 8 || password.length > 72) return PASSWORD_RULE_TEXT;
  if (/\s/.test(password)) return "Password cannot contain spaces.";
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    return PASSWORD_RULE_TEXT;
  }
  return "";
};

const displayOrEmpty = (value) => {
  if (value === undefined || value === null || value === "") return "";
  return String(value);
};

const stripHtml = (value = "") => String(value || "").replace(/<[^>]*>/g, "");

const normalizeEditorValue = (value = "") => {
  const normalized = String(value || "").trim();
  return normalized === "<p><br></p>" ? "" : normalized;
};

const buildInitialPlayerState = (player = {}) => ({
  ...{
    full_name: "",
    email: "",
    mobile_country_code: DEFAULT_COUNTRY_CODE,
    mobile: "",
    dob: "",
    gender: "",
    nationality: "Indian",
    country: "India",
    address: "",
    passport_no: "",
    pgti_membership_id: "",
    legacy_member_code: "",
    legacy_member_short_code: "",
    mem_code: "",
    mem_scode: "",
    player_type: "Amateur",
    experience_years: "",
    home_club: "",
    home_course: "",
    professional_since: "",
    handicap_no: "",
    pan_no: "",
    bank_name: "",
    bank_branch: "",
    bank_account_no: "",
    bank_ifsc: "",
    social_facebook: "",
    social_twitter: "",
    social_instagram: "",
    profile_image: "",
    prize_member_code: "",
    prize_member_short_code: "",
    prize_member_name: "",
    prize_tour_rank: "",
    prize_total: "",
    prize_par: "",
    prize_pay: "",
    prize_net_pay: "",
    prize_last_synced_at: "",
    about_info: "",
    status: "A",
    is_alumni: false,
    password: "",
  },
  ...player,
  mobile_country_code: resolveCountryCode(player),
  nationality: player.nationality || "Indian",
  country: player.country || player.nationality || "Indian",
  is_alumni: Boolean(player.is_alumni),
});

const SectionCard = ({ icon, title, children }) => (
  <div className="content-card" style={{ marginBottom: 20 }}>
    <div className="content-card-body">
      <div className="form-section">
        <h3 className="form-section-title">{icon}&nbsp;{title}</h3>
        {children}
      </div>
    </div>
  </div>
);

export default function AddEditUsers() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = useMemo(() => location?.state || {}, [location?.state]);

  const isEdit = !!state?.id;

  const [ADDEDITDATA, setAddEditData] = useState(() => buildInitialPlayerState(state));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = `PGTI || ${isEdit ? "Edit" : "Add"} Player`;
  }, [isEdit]);

  useEffect(() => {
    let isMounted = true;

    const loadPlayerDetail = async () => {
      setAddEditData(buildInitialPlayerState(state));

      if (!state?.id) return;

      const res = await getUserDetail({ id: state.id });
      if (isMounted && res.status && res.result) {
        setAddEditData(buildInitialPlayerState({ ...state, ...res.result }));
      }
    };

    loadPlayerDetail();

    return () => {
      isMounted = false;
    };
  }, [state]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddEditData((prev) => {
      const nextValue = type === "checkbox" ? checked : value;
      if (name === "nationality") {
        return { ...prev, nationality: nextValue, country: nextValue };
      }
      return { ...prev, [name]: nextValue };
    });
  };

  const notify = (type, desc) => notification.open({
    message: type === "error" ? "Oops!" : "Success",
    description: desc,
    placement: "topRight",
    icon: type === "error"
      ? <InfoCircleOutlined style={{ color: "red" }} />
      : <CheckCircleOutlined style={{ color: "green" }} />,
    duration: 2,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ADDEDITDATA.full_name?.trim()) return notify("error", "Full name is required.");
    const resolvedCountryCode = resolveCountryCode(ADDEDITDATA);

    if (!resolvedCountryCode?.trim()) return notify("error", "Country code is required.");
    if (!ADDEDITDATA.mobile?.trim()) return notify("error", "Mobile number is required.");
    if (!isEdit && !ADDEDITDATA.email?.trim()) return notify("error", "Email is required for new players.");
    if (!isEdit && !ADDEDITDATA.password?.trim()) return notify("error", "Password is required for new players.");
    if (ADDEDITDATA.password?.trim()) {
      const passwordError = validateStrongPassword(ADDEDITDATA.password);
      if (passwordError) return notify("error", passwordError);
    }

    try {
      setIsLoading(true);
      const param = {
        ...(isEdit && { editId: state.id }),
        full_name: ADDEDITDATA.full_name.trim(),
        email: ADDEDITDATA.email?.trim() || "",
        mobile_country_code: resolvedCountryCode,
        mobile: ADDEDITDATA.mobile.trim(),
        dob: ADDEDITDATA.dob || "",
        gender: ADDEDITDATA.gender || "",
        nationality: ADDEDITDATA.nationality || "Indian",
        country: ADDEDITDATA.country?.trim() || ADDEDITDATA.nationality || "Indian",
        address: ADDEDITDATA.address?.trim() || "",
        passport_no: ADDEDITDATA.passport_no?.trim() || "",
        pgti_membership_id: ADDEDITDATA.pgti_membership_id?.trim() || "",
        player_type: ADDEDITDATA.player_type || "Amateur",
        experience_years: ADDEDITDATA.experience_years ? Number(ADDEDITDATA.experience_years) : null,
        home_club: ADDEDITDATA.home_club || "",
        home_course: ADDEDITDATA.home_course?.trim() || "",
        professional_since: ADDEDITDATA.professional_since?.trim() || "",
        handicap_no: ADDEDITDATA.handicap_no?.trim() || "",
        pan_no: ADDEDITDATA.pan_no?.trim() || "",
        bank_name: ADDEDITDATA.bank_name?.trim() || "",
        bank_branch: ADDEDITDATA.bank_branch?.trim() || "",
        bank_account_no: ADDEDITDATA.bank_account_no?.trim() || "",
        bank_ifsc: ADDEDITDATA.bank_ifsc?.trim() || "",
        social_facebook: ADDEDITDATA.social_facebook?.trim() || "",
        social_twitter: ADDEDITDATA.social_twitter?.trim() || "",
        social_instagram: ADDEDITDATA.social_instagram?.trim() || "",
        profile_image: ADDEDITDATA.profile_image || "",
        about_info: normalizeEditorValue(ADDEDITDATA.about_info),
        status: ADDEDITDATA.status || "A",
        is_alumni: Boolean(ADDEDITDATA.is_alumni),
        ...(ADDEDITDATA.password?.trim() ? { password: ADDEDITDATA.password.trim() } : {}),
      };

      const res = await addEditUsers(param);
      if (res.status === true) {
        notify("success", isEdit ? "Player updated successfully." : "Player added successfully.");
        navigate("/admin/users/list");
      } else {
        notify("error", res?.message || "Failed to save player.");
      }
    } catch {
      notify("error", "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedFlagUrl = resolveFlagUrl(ADDEDITDATA.nationality);
  const importedMemberCode = ADDEDITDATA.legacy_member_code || ADDEDITDATA.mem_code || "";
  const importedShortCode = ADDEDITDATA.legacy_member_short_code || ADDEDITDATA.mem_scode || "";
  const hasImportedMemberData = isEdit && Boolean(
    importedMemberCode ||
    importedShortCode ||
    ADDEDITDATA.prize_member_code ||
    ADDEDITDATA.prize_member_name ||
    ADDEDITDATA.prize_pay ||
    ADDEDITDATA.prize_net_pay
  );

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">{isEdit ? "Edit Player" : "Add New Player"}</h1>
            <p className="page-subtitle">{isEdit ? "Update player profile and account details" : "Create a new player account for the portal"}</p>
          </div>
          <Link to="/admin/users/list">
            <button className="action-button secondary"><ArrowLeftOutlined /> Back to Players</button>
          </Link>
        </div>
      </div>

      <div className="page-body">
        <form onSubmit={handleSubmit} className="modern-form">

          {/* ── Profile Photo ──────────────────────── */}
          <SectionCard icon={<UserOutlined />} title="Profile Photo">
            <div className="row">
              <div className="col-md-8 col-12">
                <ImageUploadField
                  label="Profile Photo"
                  value={ADDEDITDATA.profile_image}
                  onChange={(url) => setAddEditData((p) => ({ ...p, profile_image: url }))}
                  folder="users"
                  previewH={180}
                  spec={IMAGE_SPECS.users}
                />
                <ImageHint
                  recommended={IMAGE_SPECS.users.recommended}
                  maxSize={`${IMAGE_SPECS.users.maxMB}MB`}
                  note={IMAGE_SPECS.users.note}
                />
              </div>
            </div>
          </SectionCard>

          {/* ── Personal Information ──────────────── */}
          <SectionCard icon={<UserOutlined />} title="Personal Information">
            <div className="row">
              <div className="col-md-6 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label required">Full Name</label>
                  <input type="text" name="full_name" className="form-input" placeholder="e.g. Honey Baisoya" value={ADDEDITDATA.full_name} onChange={handleChange} />
                </div>
              </div>
              <div className="col-md-3 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input type="date" name="dob" className="form-input" value={ADDEDITDATA.dob ? ADDEDITDATA.dob.substring(0, 10) : ""} onChange={handleChange} />
                </div>
              </div>
              <div className="col-md-3 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select name="gender" className="form-input" value={ADDEDITDATA.gender} onChange={handleChange}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="col-md-4 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Nationality</label>
                  <select name="nationality" className="form-input" value={ADDEDITDATA.nationality} onChange={handleChange}>
                    {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div className="col-md-4 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Nationality Flag</label>
                  <div
                    className="form-input"
                    style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 48, background: "#f8fafc" }}
                  >
                    {selectedFlagUrl ? (
                      <img
                        src={selectedFlagUrl}
                        alt={ADDEDITDATA.nationality}
                        style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", border: "1px solid #dbe4f0" }}
                      />
                    ) : (
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#e2e8f0" }} />
                    )}
                    <div style={{ fontSize: 13, color: "#334155" }}>
                      {ADDEDITDATA.nationality || "Select nationality"}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Passport Number</label>
                  <input type="text" name="passport_no" className="form-input" placeholder="Passport number" value={ADDEDITDATA.passport_no} onChange={handleChange} />
                </div>
              </div>
              <div className="col-md-12 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input type="text" name="address" className="form-input" placeholder="City, State" value={ADDEDITDATA.address} onChange={handleChange} />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ── Contact & Login ───────────────────── */}
          <SectionCard icon={<PhoneOutlined />} title="Contact &amp; Login Credentials">
            <div className="row">
              <div className="col-md-3 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label required">Country Code</label>
                  <select name="mobile_country_code" className="form-input" value={ADDEDITDATA.mobile_country_code} onChange={handleChange}>
                    {COUNTRY_DIAL_CODES.map((item) => (
                      <option key={`${item.code}-${item.dialCode}`} value={item.dialCode}>
                        {item.name} ({item.dialCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-md-3 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label required">Mobile Number</label>
                  <input type="tel" name="mobile" className="form-input" placeholder="Phone number" value={ADDEDITDATA.mobile} onChange={handleChange} />
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>Admin can update the registered number and country code if needed.</div>
                </div>
              </div>
              <div className="col-md-4 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label required">Email Address</label>
                  <input type="email" name="email" className="form-input" placeholder="player@example.com" value={ADDEDITDATA.email} onChange={handleChange} />
                </div>
              </div>
              <div className="col-md-4 col-12 mb-3">
                <div className="form-group">
                  <label className={`form-label ${!isEdit ? "required" : ""}`}>{isEdit ? "New Password" : "Initial Password"}</label>
                  <Input.Password
                    name="password"
                    className="form-input"
                    placeholder={isEdit ? "Leave blank to keep current password" : "Set temporary password"}
                    value={ADDEDITDATA.password}
                    onChange={handleChange}
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  />
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                    {isEdit
                      ? "Leave this blank if you do not want to change the password."
                      : "Player can change this after first login."} {PASSWORD_RULE_TEXT}
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ── Professional Details ──────────────── */}
          <SectionCard icon={<TrophyOutlined />} title="Professional Details">
            <div className="row">
              <div className="col-md-3 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">PGTI Membership ID</label>
                  <input type="text" name="pgti_membership_id" className="form-input" placeholder="e.g. PGTI-2024-001" value={ADDEDITDATA.pgti_membership_id} onChange={handleChange} style={{ fontFamily: "monospace" }} />
                </div>
              </div>
              <div className="col-md-3 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Player Type</label>
                  <select name="player_type" className="form-input" value={ADDEDITDATA.player_type} onChange={handleChange}>
                    <option value="Amateur">Amateur</option>
                    <option value="Professional">Professional</option>
                  </select>
                </div>
              </div>
              <div className="col-md-3 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Experience (Years)</label>
                  <input type="number" name="experience_years" className="form-input" placeholder="e.g. 12" min="0" max="60" value={ADDEDITDATA.experience_years} onChange={handleChange} />
                </div>
              </div>
              <div className="col-md-3 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Home Club</label>
                  <select name="home_club" className="form-input" value={ADDEDITDATA.home_club} onChange={handleChange}>
                    <option value="">Select Club</option>
                    {HOME_CLUBS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="col-md-3 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Home Course</label>
                  <input type="text" name="home_course" className="form-input" placeholder="e.g. DLF Golf & Country Club" value={ADDEDITDATA.home_course} onChange={handleChange} />
                </div>
              </div>
              <div className="col-md-3 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Professional Since</label>
                  <input type="text" name="professional_since" className="form-input" placeholder="e.g. 2013" value={ADDEDITDATA.professional_since} onChange={handleChange} />
                </div>
              </div>
              <div className="col-md-3 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Handicap Number</label>
                  <input type="text" name="handicap_no" className="form-input" placeholder="Handicap number" value={ADDEDITDATA.handicap_no} onChange={handleChange} />
                </div>
              </div>
            </div>
          </SectionCard>

          {hasImportedMemberData && (
            <SectionCard icon={<IdcardOutlined />} title="Web Import / Legacy Details">
              <div className="row">
                <div className="col-md-3 col-12 mb-3">
                  <div className="form-group">
                    <label className="form-label">Member Code</label>
                    <input type="text" className="form-input" value={displayOrEmpty(importedMemberCode)} readOnly style={{ fontFamily: "monospace", background: "#f8fafc" }} />
                  </div>
                </div>
                <div className="col-md-3 col-12 mb-3">
                  <div className="form-group">
                    <label className="form-label">Member Short Code</label>
                    <input type="text" className="form-input" value={displayOrEmpty(importedShortCode)} readOnly style={{ fontFamily: "monospace", background: "#f8fafc" }} />
                  </div>
                </div>
                <div className="col-md-3 col-12 mb-3">
                  <div className="form-group">
                    <label className="form-label">Prize Member Code</label>
                    <input type="text" className="form-input" value={displayOrEmpty(ADDEDITDATA.prize_member_code)} readOnly style={{ fontFamily: "monospace", background: "#f8fafc" }} />
                  </div>
                </div>
                <div className="col-md-3 col-12 mb-3">
                  <div className="form-group">
                    <label className="form-label">Prize Short Code</label>
                    <input type="text" className="form-input" value={displayOrEmpty(ADDEDITDATA.prize_member_short_code)} readOnly style={{ fontFamily: "monospace", background: "#f8fafc" }} />
                  </div>
                </div>
                <div className="col-md-3 col-12 mb-3">
                  <div className="form-group">
                    <label className="form-label">Prize Name</label>
                    <input type="text" className="form-input" value={displayOrEmpty(ADDEDITDATA.prize_member_name)} readOnly style={{ background: "#f8fafc" }} />
                  </div>
                </div>
                <div className="col-md-3 col-12 mb-3">
                  <div className="form-group">
                    <label className="form-label">Prize Rank</label>
                    <input type="text" className="form-input" value={displayOrEmpty(ADDEDITDATA.prize_tour_rank)} readOnly style={{ background: "#f8fafc" }} />
                  </div>
                </div>
                <div className="col-md-3 col-12 mb-3">
                  <div className="form-group">
                    <label className="form-label">Prize Pay</label>
                    <input type="text" className="form-input" value={displayOrEmpty(ADDEDITDATA.prize_pay)} readOnly style={{ background: "#f8fafc" }} />
                  </div>
                </div>
                <div className="col-md-3 col-12 mb-3">
                  <div className="form-group">
                    <label className="form-label">Net Pay</label>
                    <input type="text" className="form-input" value={displayOrEmpty(ADDEDITDATA.prize_net_pay)} readOnly style={{ background: "#f8fafc" }} />
                  </div>
                </div>
                <div className="col-12">
                  <FieldHint text="These read-only values are synced from .web/live prize imports and are used to map tournament, score, and prize records back to this player." />
                </div>
              </div>
            </SectionCard>
          )}

          <SectionCard icon={<IdcardOutlined />} title="Identity & Banking Details">
            <div className="row">
              <div className="col-md-4 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">PAN Number</label>
                  <input type="text" name="pan_no" className="form-input" placeholder="PAN number" value={ADDEDITDATA.pan_no} onChange={handleChange} />
                </div>
              </div>
              <div className="col-md-4 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Bank Name</label>
                  <input type="text" name="bank_name" className="form-input" placeholder="Bank name" value={ADDEDITDATA.bank_name} onChange={handleChange} />
                </div>
              </div>
              <div className="col-md-4 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Branch</label>
                  <input type="text" name="bank_branch" className="form-input" placeholder="Branch" value={ADDEDITDATA.bank_branch} onChange={handleChange} />
                </div>
              </div>
              <div className="col-md-6 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Bank Account Number</label>
                  <input type="text" name="bank_account_no" className="form-input" placeholder="Account number" value={ADDEDITDATA.bank_account_no} onChange={handleChange} />
                </div>
              </div>
              <div className="col-md-6 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Bank IFSC</label>
                  <input type="text" name="bank_ifsc" className="form-input" placeholder="IFSC code" value={ADDEDITDATA.bank_ifsc} onChange={handleChange} />
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={<PhoneOutlined />} title="Social Media">
            <div className="row">
              <div className="col-md-4 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Facebook</label>
                  <input type="text" name="social_facebook" className="form-input" placeholder="https://facebook.com/..." value={ADDEDITDATA.social_facebook} onChange={handleChange} />
                </div>
              </div>
              <div className="col-md-4 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Twitter / X</label>
                  <input type="text" name="social_twitter" className="form-input" placeholder="https://x.com/..." value={ADDEDITDATA.social_twitter} onChange={handleChange} />
                </div>
              </div>
              <div className="col-md-4 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Instagram</label>
                  <input type="text" name="social_instagram" className="form-input" placeholder="https://instagram.com/..." value={ADDEDITDATA.social_instagram} onChange={handleChange} />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ── About Info / Career Highlights ───── */}
          <SectionCard icon={<IdcardOutlined />} title="About Info / Career Highlights">
            <div className="row">
              <div className="col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Player Biography</label>
                  <ReactQuill
                    theme="snow"
                    value={ADDEDITDATA.about_info || ""}
                    onChange={(value) => setAddEditData((prev) => ({ ...prev, about_info: value }))}
                    placeholder="Enter player career highlights, achievements, and biography..."
                    style={{
                      backgroundColor: "white",
                      borderRadius: "8px",
                      marginBottom: "8px",
                    }}
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, 3, false] }],
                        ["bold", "italic", "underline", "strike"],
                        [{ list: "ordered" }, { list: "bullet" }],
                        [{ color: [] }, { background: [] }],
                        [{ align: [] }],
                        ["link"],
                        ["clean"],
                      ],
                    }}
                  />
                  <input type="hidden" name="about_info" value={ADDEDITDATA.about_info || ""} />
                  <CharCounter value={stripHtml(ADDEDITDATA.about_info)} min={LIMITS.about_info.min} max={LIMITS.about_info.max} />
                  <FieldHint text="Displayed on the player's public profile. Rich formatting is supported for career highlights, tournament wins, playing style, and personal background." />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ── Account Settings ──────────────────── */}
          <SectionCard icon={<IdcardOutlined />} title="Account Settings">
            <div className="row">
              <div className="col-md-4 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Account Status</label>
                  <select name="status" className="form-input" value={ADDEDITDATA.status} onChange={handleChange}>
                    <option value="A">Active</option>
                    <option value="I">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="col-md-4 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Alumni Section</label>
                  <select
                    className="form-input"
                    value={ADDEDITDATA.is_alumni ? "true" : "false"}
                    onChange={(e) => setAddEditData((prev) => ({ ...prev, is_alumni: e.target.value === "true" }))}
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
              </div>
              {isEdit && (
                <div className="col-md-4 col-12 mb-3">
                  <div style={{ padding: "12px 16px", background: "#fffbeb", borderRadius: 10, border: "1px solid #fef08a", marginTop: 24 }}>
                    <div style={{ fontSize: 13, color: "#92400e", display: "flex", alignItems: "center", gap: 6 }}>
                      <LockOutlined />
                      <span>You can either set a new password here or use the <strong>Reset Password</strong> option from the player list actions menu.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          <div className="form-actions">
            <button type="button" className="action-button secondary" onClick={() => navigate("/admin/users/list")}>Cancel</button>
            <button type="submit" className="action-button primary" disabled={isLoading}>
              {isLoading
                ? <><div className="loading-spinner small"></div>{isEdit ? "Updating..." : "Creating..."}</>
                : <><SaveOutlined /> {isEdit ? "Update Player" : "Create Player"}</>}
            </button>
          </div>

        </form>
      </div>

      <LoadingEffect isLoading={isLoading} text="Saving player..." />
    </div>
  );
}
