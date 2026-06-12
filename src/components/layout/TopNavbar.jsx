import "components/layout/dashboard.css";
import React, { useEffect, useRef, useState } from "react";
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
  faMoon,
  faBell
} from "@fortawesome/free-solid-svg-icons";
import {
  getAdminPushUnreadCount,
  listAdminUnreadPushNotifications,
  markAdminPushNotificationsRead,
} from "services/pushNotifications.service";

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
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationItems, setNotificationItems] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const notificationRef = useRef(null);
  const previousUnreadRef = useRef(0);
  const hasLoadedUnreadRef = useRef(false);

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

  const playNotificationSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(660, audioContext.currentTime + 0.18);
      gain.gain.setValueAtTime(0.001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, audioContext.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.28);

      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
      window.setTimeout(() => audioContext.close(), 450);
    } catch {
      // Browser autoplay policies can block sound until the admin interacts with the page.
    }
  };

  const loadUnreadNotifications = async () => {
    setNotificationLoading(true);
    const response = await listAdminUnreadPushNotifications(10);
    if (response?.status) {
      setNotificationItems(response.result || []);
    }
    setNotificationLoading(false);
  };

  useEffect(() => {
    let mounted = true;
    const loadUnreadCount = async () => {
      const response = await getAdminPushUnreadCount();
      if (mounted && response?.status) {
        const nextCount = Number(response?.result?.count || 0);
        if (hasLoadedUnreadRef.current && nextCount > previousUnreadRef.current) {
          playNotificationSound();
          if (isNotificationOpen) loadUnreadNotifications();
        }
        previousUnreadRef.current = nextCount;
        hasLoadedUnreadRef.current = true;
        setUnreadNotifications(nextCount);
      }
    };

    loadUnreadCount();
    const interval = window.setInterval(loadUnreadCount, 15000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [isNotificationOpen]);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const togglePopUp = () => setPopUpOpen(!popUpOpen);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Add dark mode logic here
  };

  const formatNotificationTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openNotifications = async () => {
    const nextOpen = !isNotificationOpen;
    setIsNotificationOpen(nextOpen);
    if (nextOpen) {
      await loadUnreadNotifications();
    }
  };

  const markAllNotificationsRead = async () => {
    await markAdminPushNotificationsRead();
    previousUnreadRef.current = 0;
    setUnreadNotifications(0);
    setNotificationItems([]);
  };

  const viewAllNotifications = () => {
    setIsNotificationOpen(false);
    navigate("/admin/push-notifications/list");
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

              <div className="notification-dropdown" ref={notificationRef}>
                <button
                  className="action-btn notification-btn"
                  onClick={openNotifications}
                  title="Notifications"
                  type="button"
                >
                  <FontAwesomeIcon icon={faBell} />
                  {unreadNotifications > 0 && (
                    <span className="notification-badge">
                      {unreadNotifications > 99 ? "99+" : unreadNotifications}
                    </span>
                  )}
                </button>

                <div className={`notification-menu ${isNotificationOpen ? "show" : ""}`}>
                  <div className="notification-header">
                    <div>
                      <h3>Notifications</h3>
                      <span className="notification-count">{unreadNotifications} unread</span>
                    </div>
                    <button
                      className="notification-clear-btn"
                      type="button"
                      onClick={markAllNotificationsRead}
                      disabled={!unreadNotifications}
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="notification-list">
                    {notificationLoading ? (
                      <div className="notification-empty">Loading notifications...</div>
                    ) : notificationItems.length ? (
                      notificationItems.map((item) => (
                        <div className="notification-item unread" key={item.id}>
                          <div className="notification-content">
                            <p className="notification-message">{item.title}</p>
                            {item.body && <p className="notification-body">{item.body}</p>}
                            <span className="notification-time">
                              {formatNotificationTime(item.created_at || item.sent_at)}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="notification-empty">No unread notifications.</div>
                    )}
                  </div>

                  <div className="notification-footer">
                    <button type="button" onClick={viewAllNotifications}>
                      View all notifications
                    </button>
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
