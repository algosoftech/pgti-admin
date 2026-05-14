import React, { useState } from "react";
import { useNavigate } from "react-router-dom/dist";
import Dialog from "@mui/material/Dialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket, faXmark } from "@fortawesome/free-solid-svg-icons";
import { logout } from 'services/auth.service';

const LogoutConformationPopup = ({ popUpOpen, togglePopUp }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = () => togglePopUp();

  const handleConfirm = async () => {
    setIsLoading(true);
    const res = await logout();
    setIsLoading(false);
    if (res.status === true) {
      navigate('/');
    } else {
      sessionStorage.clear();
      navigate('/');
    }
  };

  return (
    <Dialog
      open={popUpOpen}
      onClose={togglePopUp}
      maxWidth={false}
      PaperProps={{
        style: {
          borderRadius: 20,
          boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
          overflow: "visible",
          width: 420,
        },
      }}
    >
      <div style={{ position: "relative", padding: "40px 36px 32px" }}>

        {/* Close X */}
        <button
          onClick={handleCancel}
          style={{
            position: "absolute", top: 16, right: 16,
            background: "#f1f5f9", border: "none", borderRadius: "50%",
            width: 32, height: 32, display: "flex", alignItems: "center",
            justifyContent: "center", cursor: "pointer", color: "#64748b",
            fontSize: 14, transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#e2e8f0"; e.currentTarget.style.color = "#1e293b"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#64748b"; }}
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>

        {/* Icon */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
            border: "2px solid #fecaca",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <FontAwesomeIcon icon={faRightFromBracket} style={{ fontSize: 28, color: "#ef4444" }} />
          </div>
        </div>

        {/* Text */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 700, color: "#0f172a" }}>
            Sign Out
          </h3>
          <p style={{ margin: 0, fontSize: 15, color: "#64748b", lineHeight: 1.6 }}>
            Are you sure you want to sign out of the<br />
            <strong style={{ color: "#1e3a5f" }}>PGTI Admin Portal</strong>?
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "#f1f5f9", marginBottom: 24 }} />

        {/* Actions */}
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={handleCancel}
            style={{
              flex: 1, padding: "12px 0", borderRadius: 10,
              border: "1.5px solid #e2e8f0", background: "#fff",
              color: "#374151", fontSize: 15, fontWeight: 600,
              cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            style={{
              flex: 1, padding: "12px 0", borderRadius: 10,
              border: "none",
              background: isLoading
                ? "#fca5a5"
                : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              color: "#fff", fontSize: 15, fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              boxShadow: "0 4px 12px rgba(239,68,68,0.35)",
            }}
            onMouseEnter={e => { if (!isLoading) e.currentTarget.style.boxShadow = "0 6px 20px rgba(239,68,68,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(239,68,68,0.35)"; }}
          >
            {isLoading ? "Signing out…" : "Yes, Sign Out"}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default LogoutConformationPopup;
