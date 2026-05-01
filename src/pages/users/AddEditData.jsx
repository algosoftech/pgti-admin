import React, { useEffect, useState } from "react";
import { notification } from "antd";
import {
  InfoCircleOutlined, CheckCircleOutlined, ArrowLeftOutlined, SaveOutlined,
  UserOutlined, PhoneOutlined, IdcardOutlined, TrophyOutlined, LockOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ImageUploadField from "components/ui/ImageUploadField";
import LoadingEffect from "components/ui/Loading/LoadingEffect";
import { addEditUsers } from "services/users.service";
import { CharCounter, FieldHint, ImageHint } from "components/ui/FieldHint";
import { LIMITS, IMAGE_SPECS, validateLength } from "utils/fieldValidation";
import "styles/admin-pages.css";

const NATIONALITIES = [
  "Indian", "Australian", "American", "British", "South African",
  "Canadian", "New Zealander", "Scottish", "Irish", "Spanish",
  "German", "French", "Japanese", "Korean", "Thai", "Other",
];

const HOME_CLUBS = [
  "Delhi Golf Club", "Royal Calcutta Golf Club", "Bombay Presidency Golf Club",
  "Tollygunge Club", "Willingdon Sports Club", "Bangalore Golf Club",
  "Classic Golf & Country Club", "Eagleton Golf Resort", "Other",
];

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
  const state = location?.state || {};

  const isEdit = !!state?.id;

  const [ADDEDITDATA, setAddEditData] = useState({
    full_name: "",
    email: "",
    mobile: "",
    dob: "",
    gender: "",
    nationality: "Indian",
    address: "",
    pgti_membership_id: "",
    player_type: "Amateur",
    experience_years: "",
    home_club: "",
    profile_image: "",
    about_info: "",
    status: "A",
    password: "",
    ...state,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = `PGTI || ${isEdit ? "Edit" : "Add"} Player`;
  }, [isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddEditData((prev) => ({ ...prev, [name]: value }));
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
    if (!ADDEDITDATA.mobile?.trim()) return notify("error", "Mobile number is required.");
    if (!isEdit && !ADDEDITDATA.email?.trim()) return notify("error", "Email is required for new players.");
    if (!isEdit && !ADDEDITDATA.password?.trim()) return notify("error", "Password is required for new players.");

    try {
      setIsLoading(true);
      const param = {
        ...(isEdit && { editId: state.id }),
        full_name: ADDEDITDATA.full_name.trim(),
        email: ADDEDITDATA.email?.trim() || "",
        mobile: ADDEDITDATA.mobile.trim(),
        dob: ADDEDITDATA.dob || "",
        gender: ADDEDITDATA.gender || "",
        nationality: ADDEDITDATA.nationality || "Indian",
        address: ADDEDITDATA.address?.trim() || "",
        pgti_membership_id: ADDEDITDATA.pgti_membership_id?.trim() || "",
        player_type: ADDEDITDATA.player_type || "Amateur",
        experience_years: ADDEDITDATA.experience_years ? Number(ADDEDITDATA.experience_years) : null,
        home_club: ADDEDITDATA.home_club || "",
        profile_image: ADDEDITDATA.profile_image || "",
        about_info: ADDEDITDATA.about_info?.trim() || "",
        status: ADDEDITDATA.status || "A",
        ...(!isEdit && ADDEDITDATA.password && { password: ADDEDITDATA.password }),
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
              <div className="col-md-8 col-12 mb-3">
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
              <div className="col-md-4 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label required">Mobile Number</label>
                  <input type="tel" name="mobile" className="form-input" placeholder="+91 XXXXX XXXXX" value={ADDEDITDATA.mobile} onChange={handleChange} disabled={isEdit} />
                  {isEdit && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>Mobile cannot be changed after registration.</div>}
                </div>
              </div>
              <div className="col-md-4 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label required">Email Address</label>
                  <input type="email" name="email" className="form-input" placeholder="player@example.com" value={ADDEDITDATA.email} onChange={handleChange} />
                </div>
              </div>
              {!isEdit && (
                <div className="col-md-4 col-12 mb-3">
                  <div className="form-group">
                    <label className="form-label required">Initial Password</label>
                    <input type="password" name="password" className="form-input" placeholder="Set temporary password" value={ADDEDITDATA.password} onChange={handleChange} />
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>Player can change this after first login.</div>
                  </div>
                </div>
              )}
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
            </div>
          </SectionCard>

          {/* ── About Info / Career Highlights ───── */}
          <SectionCard icon={<IdcardOutlined />} title="About Info / Career Highlights">
            <div className="row">
              <div className="col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Player Biography</label>
                  <textarea
                    name="about_info"
                    className="form-input"
                    rows={6}
                    placeholder="Enter player career highlights, achievements, and biography…"
                    value={ADDEDITDATA.about_info}
                    onChange={handleChange}
                  />
                  <CharCounter value={ADDEDITDATA.about_info} min={LIMITS.about_info.min} max={LIMITS.about_info.max} />
                  <FieldHint text="Displayed on the player's public profile. Describe career highlights, tournament wins, playing style, and personal background." />
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
                    <option value="P">Pending Verification</option>
                  </select>
                </div>
              </div>
              {isEdit && (
                <div className="col-md-8 col-12 mb-3">
                  <div style={{ padding: "12px 16px", background: "#fffbeb", borderRadius: 10, border: "1px solid #fef08a", marginTop: 24 }}>
                    <div style={{ fontSize: 13, color: "#92400e", display: "flex", alignItems: "center", gap: 6 }}>
                      <LockOutlined />
                      <span>To reset the player's password, use the <strong>Reset Password</strong> option from the player list actions menu.</span>
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
