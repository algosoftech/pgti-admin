import "components/layout/dashboard.css";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoutConformationPopup from 'components/layout/LogoutPopup';
import PreferencesModal from 'components/layout/PreferencesModal';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBarsStaggered,
  faSearch,
  faUser,
  faCog,
  faSignOutAlt,
  faChevronDown,
  faSun,
  faMoon
} from "@fortawesome/free-solid-svg-icons";

const readAdminInfo = () => {
  try {
    return JSON.parse(sessionStorage.getItem("ADMIN-INFO") || "null");
  } catch {
    return null;
  }
};

const Top_navbar = ({ title = "Dashboard" }) => {
  // const [isSticky, setSticky] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  // useEffect(() => {
  //   const handleScroll = () => {
  //     if (window.scrollY > 100) {
  //       setSticky(true);
  //     } else {
  //       setSticky(false);
  //     }
  //   };

  //   window.addEventListener("scroll", handleScroll);
  //   return () => {
  //     window.removeEventListener("scroll", handleScroll);
  //   };
  // }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const navigate = useNavigate();
  const [user, setUser] = useState(readAdminInfo);
  const [popUpOpen, setPopUpOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);

  useEffect(() => {
    const syncAdminInfo = () => setUser(readAdminInfo());
    window.addEventListener("admin-profile-updated", syncAdminInfo);
    return () => window.removeEventListener("admin-profile-updated", syncAdminInfo);
  }, []);

  const togglePopUp = () => setPopUpOpen(!popUpOpen);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Add dark mode logic here
  };

  return (
    <>
      {/* <nav className={`top-navbar ${isSticky ? "sticky" : ""}`}> */}
      <nav className={`top-navbar`}>
        <div className="navbar-container">
          <div className="navbar-left">
            <div className="page-title">
              <h1 className="page-heading">{title}</h1>
              <p className="page-subtitle">PGTI Admin</p>
            </div>
          </div>

          {/* <div className="navbar-center">
            <div className="search-container">
              <div className="search-input-wrapper">
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search players, tournaments, articles..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
              </div>
            </div>
          </div> */}

          <div className="navbar-right">
            <div className="navbar-actions">
              {/* <button 
                className="action-btn theme-toggle"
                onClick={toggleDarkMode}
                title="Toggle theme"
              >
                <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
              </button> */}

              <div className="user-dropdown">
                <button 
                  className="user-profile-btn"
                  onClick={toggleDropdown}
                  aria-expanded={isDropdownOpen}
                >
                  <div className="user-avatar">
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                  <div className="user-info">
                    <span className="user-name">{user?.name || "Admin"}</span>
                    <span className="user-role">{user?.admin_type || "Administrator"}</span>
                  </div>
                  <FontAwesomeIcon 
                    icon={faChevronDown} 
                    className={`dropdown-arrow ${isDropdownOpen ? 'rotated' : ''}`}
                  />
                </button>

                <div className={`user-menu ${isDropdownOpen ? 'show' : ''}`}>
                  <div className="user-menu-header">
                    <div className="user-avatar-large">
                      <FontAwesomeIcon icon={faUser} />
                    </div>
                    <div className="user-details">
                      <h4>{user?.name || "Admin"}</h4>
                      <p>{user?.admin_type || "Administrator"}</p>
                    </div>
                  </div>
                  
                  <div className="user-menu-items">
                    <Link
                      className="menu-item"
                      to="javascript:void(0)"
                      onClick={() => {
                        navigate("/admin/profile");
                        setIsDropdownOpen(false);
                      }}
                    >
                      <FontAwesomeIcon icon={faUser} />
                      <span>Profile Settings</span>
                    </Link>

                    <Link
                      className="menu-item"
                      to="javascript:void(0)"
                      onClick={() => {
                        setPrefsOpen(true);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <FontAwesomeIcon icon={faCog} />
                      <span>Preferences</span>
                    </Link>
                    
                    <div className="menu-divider"></div>
                    
                    <button
                      className="menu-item logout-item"
                      onClick={() => {
                        togglePopUp();
                        setIsDropdownOpen(false);
                      }}
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <LogoutConformationPopup
        popUpOpen={popUpOpen}
        togglePopUp={togglePopUp}
      />
      <PreferencesModal open={prefsOpen} onClose={() => setPrefsOpen(false)} />
    </>
  );
};
export default Top_navbar;
