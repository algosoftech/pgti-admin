import React from "react";

const quickLinks = [
  { label: "Tournaments", icon: "T" },
  { label: "Scorecards", icon: "S" },
  { label: "Players", icon: "P" },
  { label: "Reports", icon: "R" },
];

const GolfLoginCard = ({ children }) => {
  return (
    <div className="pgti-login-card" data-login-card="true">
      <div className="pgti-lock-badge" aria-hidden="true">
        <span>LOCK</span>
      </div>

      {children}

      <div className="pgti-quick-access" aria-label="Quick access shortcuts">
        <div className="pgti-quick-access-title">
          <span />
          Quick Access
          <span />
        </div>
        <div className="pgti-quick-access-grid">
          {quickLinks.map((item) => (
            <button type="button" className="pgti-quick-access-item" key={item.label}>
              <span className="pgti-quick-access-icon" aria-hidden="true">
                {item.icon}
              </span>
              <small>{item.label}</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GolfLoginCard;
