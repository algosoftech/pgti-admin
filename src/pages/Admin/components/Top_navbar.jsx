import "../main_dashboard.css";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoutConformationPopup from "./LogoutConformationPopup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faBarsStaggered, 
  faSearch, 
  faBell, 
  faUser, 
  faCog, 
  faSignOutAlt,
  faChevronDown,
  faSun,
  faMoon
} from "@fortawesome/free-solid-svg-icons";

const Top_navbar = ({ title = "Dashboard" }) => {
  // const [isSticky, setSticky] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New order received", time: "2 min ago", unread: true },
    { id: 2, message: "Stock update completed", time: "15 min ago", unread: true },
    { id: 3, message: "Customer registered", time: "1 hour ago", unread: false }
  ]);

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
  const user = JSON.parse(sessionStorage.getItem("ADMIN-INFO"));
  const [popUpOpen, setPopUpOpen] = useState(false);
  
  const togglePopUp = () => {
    setPopUpOpen(!popUpOpen);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Add dark mode logic here
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <>
      {/* <nav className={`top-navbar ${isSticky ? "sticky" : ""}`}> */}
      <nav className={`top-navbar`}>
        <div className="navbar-container">
          <div className="navbar-left">
            <div className="page-title">
              <h1 className="page-heading">{title}</h1>
              <p className="page-subtitle">The Farmers Store Admin</p>
            </div>
          </div>

          {/* <div className="navbar-center">
            <div className="search-container">
              <div className="search-input-wrapper">
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search customers, orders, products..."
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

              <div className="notification-dropdown">
                <button className="action-btn notification-btn" title="Notifications">
                  <FontAwesomeIcon icon={faBell} />
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </button>
                <div className="notification-menu">
                  <div className="notification-header">
                    <h3>Notifications</h3>
                    <span className="notification-count">{unreadCount} new</span>
                  </div>
                  <div className="notification-list">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`notification-item ${notification.unread ? 'unread' : ''}`}
                      >
                        <div className="notification-content">
                          <p className="notification-message">{notification.message}</p>
                          <span className="notification-time">{notification.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

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
                        navigate("/sub-admin/addeditdata", { state: user });
                        setIsDropdownOpen(false);
                      }}
                    >
                      <FontAwesomeIcon icon={faUser} />
                      <span>Profile Settings</span>
                    </Link>
                    
                    <Link
                      className="menu-item"
                      to="javascript:void(0)"
                      onClick={() => setIsDropdownOpen(false)}
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
    </>
  );
};
export default Top_navbar;
