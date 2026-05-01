import React, { useContext, useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Collapse } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faCircleInfo,
  faCircleQuestion,
  faCircleUser,
  faEnvelope,
  faFileLines,
  faFlag,
  faGavel,
  faHouse,
  faImages,
  faLock,
  faNewspaper,
  faPhone,
  faShieldHalved,
  faTrophy,
  faUserGear,
  faUsers,
  faVideo,
  faBookOpen,
} from "@fortawesome/free-solid-svg-icons";
import { PermissionContext, usePermissions } from "contexts/PermissionContext";
import "./Sidebar.css";

const { Panel } = Collapse;

const SidebarItem = ({ to, icon, name, isOpen, end = false, className = "" }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `link ${className} ${isActive ? "active" : ""}`.trim()
    }
  >
    <span className="icon">{icon}</span>
    {isOpen && <span className="link_text">{name}</span>}
  </NavLink>
);

const Sidebar = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("ADMIN-INFO") || "null");
    } catch {
      return null;
    }
  }, []);

  const permissionSnapshot = usePermissions("FULL");
  const { refetchPermissions } = useContext(PermissionContext);

  const [isOpen, setIsOpen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth > 768 : true
  );
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );
  const [permissionData, setPermissionData] = useState({});
  const [openPanel, setOpenPanel] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setIsOpen(!mobile);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const syncPermissions = async () => {
      try {
        if (permissionSnapshot?.permissions) {
          setPermissionData(permissionSnapshot.permissions);
        } else if (typeof refetchPermissions === "function") {
          await refetchPermissions();
        }
      } catch {
        setPermissionData({});
      }
    };

    syncPermissions();
  }, [permissionSnapshot, refetchPermissions]);

  useEffect(() => {
    if (!(isMobile && isOpen)) return undefined;

    const handleClickOutside = (event) => {
      const sidebar = document.querySelector(".sidebar");
      if (sidebar && !sidebar.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isMobile, isOpen]);

  const isSuperAdmin = user?.admin_type === "Super Admin" || permissionSnapshot?.fullAccess === "Y";
  const hasAccess = (moduleName, action = "list") =>
    isSuperAdmin || permissionData?.[moduleName]?.[action] === "Y";

  useEffect(() => {
    if (!isOpen) {
      setOpenPanel(null);
      return;
    }

    if (location.pathname.startsWith("/admin/accounts")) {
      setOpenPanel("accounts");
      return;
    }

    if (location.pathname.startsWith("/admin/cms")) {
      setOpenPanel("cms");
      return;
    }

    if (location.pathname.startsWith("/admin/templates")) {
      setOpenPanel("templates");
      return;
    }

    if (
      location.pathname.startsWith("/admin/users") ||
      location.pathname.startsWith("/admin/tournament-results")
    ) {
      setOpenPanel("users");
      return;
    }

    setOpenPanel(null);
  }, [isOpen, location.pathname]);

  const cmsItems = [
    { check: hasAccess("homepage_settings") || hasAccess("FULL"), to: "/admin/cms/homepage/list", icon: faHouse, name: "Homepage Settings" },
    { check: hasAccess("about_us"), to: "/admin/cms/about-us/list", icon: faBookOpen, name: "About Us" },
    { check: hasAccess("anti_doping"), to: "/admin/cms/anti-doping/list", icon: faShieldHalved, name: "Anti-Doping" },
    { check: hasAccess("contact_us"), to: "/admin/cms/contact-us/list", icon: faPhone, name: "Contact Us" },
    { check: hasAccess("disclaimer"), to: "/admin/cms/disclaimer/list", icon: faCircleInfo, name: "Disclaimer" },
    { check: hasAccess("events"), to: "/admin/cms/events/list", icon: faTrophy, name: "Events / Tournaments" },
    { check: hasAccess("faqs"), to: "/admin/cms/faqs/list", icon: faCircleQuestion, name: "FAQs" },
    { check: hasAccess("footer"), to: "/admin/cms/footer/list", icon: faFileLines, name: "Footer" },
    { check: hasAccess("gallery"), to: "/admin/cms/gallery/list", icon: faImages, name: "Gallery" },
    { check: hasAccess("golf_facts"), to: "/admin/cms/golf-facts/list", icon: faFlag, name: "Golf Facts" },
    { check: hasAccess("highlight_videos"), to: "/admin/cms/highlight-videos/list", icon: faVideo, name: "Highlights & Videos" },
    { check: hasAccess("indian_golf"), to: "/admin/cms/indian-golf/list", icon: faFlag, name: "Indian Golf" },
    { check: hasAccess("news"), to: "/admin/cms/news/list", icon: faNewspaper, name: "News" },
    { check: hasAccess("privacy_policy"), to: "/admin/cms/privacy-policy/list", icon: faLock, name: "Privacy Policy" },
    { check: hasAccess("terms_conditions"), to: "/admin/cms/terms-conditions/list", icon: faGavel, name: "Terms & Conditions" },
    { check: hasAccess("tour_partners"), to: "/admin/cms/tour-partners/list", icon: faUsers, name: "Tour Partners" },
  ].filter((item) => item.check);

  const accountItems = [
    { check: isSuperAdmin || hasAccess("accounts"), to: "/admin/accounts/list", icon: faUserGear, name: "Sub Admin" },
  ].filter((item) => item.check);

  const collapseItems = [
    accountItems.length
      ? {
          key: "accounts",
          header: "Accounts",
          icon: faCircleUser,
          items: accountItems,
        }
      : null,
    cmsItems.length
      ? {
          key: "cms",
          header: "CMS",
          icon: faBookOpen,
          items: cmsItems,
        }
      : null,
    hasAccess("email_templates")
      ? {
          key: "templates",
          header: "Templates",
          icon: faEnvelope,
          items: [
            {
              to: "/admin/templates/email-templates/list",
              icon: faEnvelope,
              name: "Email Templates",
            },
          ],
        }
      : null,
    hasAccess("users") || hasAccess("tournament_results")
      ? {
          key: "users",
          header: "Users",
          icon: faUsers,
          items: [
            ...(hasAccess("users")
              ? [
                  {
                    to: "/admin/users/list",
                    icon: faUsers,
                    name: "Users / Players",
                  },
                  {
                    to: "/admin/users/registrations",
                    icon: faUsers,
                    name: "Registrations",
                  },
                  {
                    to: "/admin/users/login-activity",
                    icon: faUsers,
                    name: "Login Activity",
                  },
                ]
              : []),
            ...(hasAccess("tournament_results")
              ? [
                  {
                    to: "/admin/tournament-results/list",
                    icon: faTrophy,
                    name: "Tournament Results",
                  },
                ]
              : []),
          ],
        }
      : null,
  ].filter(Boolean);

  return (
    <>
      {isMobile && (
        <button
          className="mobile-menu-button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle sidebar"
          aria-expanded={isOpen}
        >
          <FontAwesomeIcon icon={isOpen ? faChevronLeft : faChevronRight} />
        </button>
      )}

      {isMobile && isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}

      <div
        className={`container-fluid side_bar_main_div ${
          isOpen ? "sidebar-open" : "sidebar-closed"
        } ${isMobile ? "mobile-sidebar" : ""}`}
      >
        <aside
          className={`sidebar ${isMobile && isOpen ? "sidebar-mobile-open" : ""}`}
          style={{ width: isOpen ? "300px" : isMobile ? "0" : "84px" }}
        >
          <div className="top_section">
            <div className="sidebar-brand">
              <div className="brand-icon">PGTI</div>
              {isOpen && (
                <div className="brand-text">
                  <h3 className="brand-title">PGTI</h3>
                  <p className="brand-subtitle">Admin Portal</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="sidebar-toggle"
              aria-label="Toggle sidebar"
            >
              <FontAwesomeIcon icon={isOpen ? faChevronLeft : faChevronRight} />
            </button>
          </div>

          <div className="my_sidebar_all_section">
            <SidebarItem
              to="/admin/dashboard"
              icon={<FontAwesomeIcon icon={faHouse} />}
              name="Dashboard"
              isOpen={isOpen}
              end
              className="sidebar_top_tab"
            />

            {collapseItems.map((section) => (
              <Collapse
                key={section.key}
                ghost
                accordion
                activeKey={isOpen ? openPanel : undefined}
                onChange={(key) => {
                  if (isOpen) setOpenPanel(key || null);
                }}
                className="my_collapse_icon"
              >
                <Panel
                  key={section.key}
                  className={`side_bar_categories ${isOpen ? "arrow-visible" : "arrow-hidden"}`}
                  header={
                    <>
                      <FontAwesomeIcon icon={section.icon} className="sidebar_collapse_iohomeoutline" />
                      {isOpen && (
                        <span className="sidebar_collapse_iohomeoutline_categoires">
                          {section.header}
                        </span>
                      )}
                    </>
                  }
                >
                  {section.items.map((item) => (
                    <SidebarItem
                      key={item.to}
                      to={item.to}
                      icon={<FontAwesomeIcon icon={item.icon} />}
                      name={item.name}
                      isOpen={isOpen}
                      className="sub_link"
                    />
                  ))}
                </Panel>
              </Collapse>
            ))}

            <SidebarItem
              to="/admin/accounts/addeditdata"
              icon={<FontAwesomeIcon icon={faCircleUser} className="sidebar__user__icon" />}
              name={
                <div
                  className="sidebar_profile_main_content_section"
                  onClick={(event) => {
                    event.preventDefault();
                    navigate("/admin/accounts/addeditdata", { state: user });
                  }}
                >
                  <div className="sidebar_profile_main_content">
                    <div className="user_profile_pic_Admin_name">
                      <span className="user_profile_pic_Admin_panel">{user?.name || "Site Admin"}</span>
                      <br />
                      <span className="user_profile_pic_Admin_panel_">{user?.admin_type || "Super Admin"}</span>
                    </div>
                  </div>
                  <FontAwesomeIcon icon={faChevronRight} className="side_bar_fagreaterthan" />
                </div>
              }
              isOpen={isOpen}
              className={`custom_profile_class_productList ${
                !isOpen ? "custom_profile_class_productList_close" : ""
              }`}
            />
          </div>
        </aside>

        <main className={isMobile && isOpen ? "main-content-mobile" : ""}>{children}</main>
      </div>
    </>
  );
};

export default Sidebar;
