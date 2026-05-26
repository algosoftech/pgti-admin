import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
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
  faMagnifyingGlass,
  faNewspaper,
  faPhone,
  faShieldHalved,
  faTrophy,
  faUserGear,
  faUsers,
  faVideo,
  faBookOpen,
  faXmark,
  faArrowsRotate,
} from "@fortawesome/free-solid-svg-icons";
import { PermissionContext, usePermissions } from "contexts/PermissionContext";
import { listArticlePages } from "services/articlePages.service";
import "./Sidebar.css";

const { Panel } = Collapse;

const readAdminInfo = () => {
  try {
    return JSON.parse(sessionStorage.getItem("ADMIN-INFO") || "null");
  } catch {
    return null;
  }
};

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
  const [user, setUser] = useState(readAdminInfo);

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
  const [articlePages, setArticlePages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef(null);

  useEffect(() => {
    const syncAdminInfo = () => setUser(readAdminInfo());
    window.addEventListener("admin-profile-updated", syncAdminInfo);
    return () => window.removeEventListener("admin-profile-updated", syncAdminInfo);
  }, []);

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
  const canAccessImports = hasAccess("imports") || hasAccess("events");
  const canAccessLiveSync = isSuperAdmin || hasAccess("live_sync") || hasAccess("events") || hasAccess("users");
  const canAccessArticlePages = hasAccess("articles");

  useEffect(() => {
    if (!isOpen) {
      setOpenPanel(null);
      return;
    }

    if (location.pathname.startsWith("/admin/article-pages") || location.pathname.startsWith("/admin/cms/article-pages")) {
      setOpenPanel("article-pages");
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

    if (location.pathname.startsWith("/admin/inquiries")) {
      setOpenPanel("inquiries");
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

  useEffect(() => {
    const loadArticlePages = async () => {
      if (!canAccessArticlePages || !isOpen) return;
      const result = await listArticlePages({ skip: 0, limit: 100, summary_only: true });
      if (result?.status) {
        setArticlePages(result.result || []);
      }
    };

    loadArticlePages();
  }, [canAccessArticlePages, isOpen, location.pathname]);

  const highlightMatch = useCallback((text, query) => {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="sidebar-search-highlight">{text.slice(idx, idx + query.length)}</mark>
        {text.slice(idx + query.length)}
      </>
    );
  }, []);

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
    { check: hasAccess("press_release"), to: "/admin/cms/press-release/list", icon: faNewspaper, name: "Press Release" },
    { check: hasAccess("golf_facts"), to: "/admin/cms/golf-facts/list", icon: faFlag, name: "Golf Facts" },
    { check: hasAccess("highlight_videos"), to: "/admin/cms/highlight-videos/list", icon: faVideo, name: "Highlights & Videos" },
    { check: hasAccess("indian_golf"), to: "/admin/cms/indian-golf/list", icon: faFlag, name: "Indian Golf" },
    { check: hasAccess("growth_of_golf"), to: "/admin/cms/growth-of-golf/list", icon: faFlag, name: "Growth of Golf" },
    { check: hasAccess("news"), to: "/admin/cms/news/list", icon: faNewspaper, name: "News" },
    { check: hasAccess("privacy_policy"), to: "/admin/cms/privacy-policy/list", icon: faLock, name: "Privacy Policy" },
    { check: hasAccess("cookie_policy"), to: "/admin/cms/cookie-policy/list", icon: faLock, name: "Cookie Policy" },
    { check: hasAccess("terms_conditions"), to: "/admin/cms/terms-conditions/list", icon: faGavel, name: "Terms & Conditions" },
    { check: hasAccess("tour_partners"), to: "/admin/cms/tour-partners/list", icon: faUsers, name: "Tour Partners" },
  ].filter((item) => item.check);

  const accountItems = [
    { check: isSuperAdmin || hasAccess("accounts"), to: "/admin/accounts/list", icon: faUserGear, name: "Sub Admin" },
  ].filter((item) => item.check);

  const articlePageItems = canAccessArticlePages
    ? [
        {
          to: "/admin/cms/article-pages/list",
          icon: faBookOpen,
          name: "All Article Pages",
        },
        ...articlePages.map((articlePage) => ({
          to: `/admin/cms/article-pages/list?editId=${articlePage.id}`,
          icon: faFileLines,
          name: articlePage.title,
        })),
      ]
    : [];

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
    (hasAccess("inquiries") || hasAccess("contact_us"))
      ? {
          key: "inquiries",
          header: "Inquiries",
          icon: faEnvelope,
          items: [
            {
              to: "/admin/inquiries/contact-us/list",
              icon: faEnvelope,
              name: "Contact Us",
            },
          ],
        }
      : null,
    articlePageItems.length
      ? {
          key: "article-pages",
          header: "Articles",
          icon: faFileLines,
          items: articlePageItems,
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
                    to: "/admin/users/login-activity",
                    icon: faUsers,
                    name: "Login Activity",
                  },
                  {
                    to: "/admin/users/handbook",
                    icon: faBookOpen,
                    name: "Handbook",
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

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const results = [];

    results.push({
      to: "/admin/dashboard",
      name: "Dashboard",
      icon: faHouse,
      section: null,
    });

    if (canAccessLiveSync) {
      results.push({
        to: "/admin/live-sync",
        name: "Live Sync",
        icon: faArrowsRotate,
        section: null,
      });
    }

    collapseItems.forEach((section) => {
      section.items.forEach((item) => {
        results.push({
          to: item.to,
          name: item.name,
          icon: item.icon,
          section: section.header,
        });
      });
    });

    if (canAccessImports) {
      results.push({
        to: "/admin/events/ace-import",
        name: "Imports",
        icon: faFileLines,
        section: null,
      });
    }

    return results.filter((r) => r.name.toLowerCase().includes(q));
  }, [searchQuery, collapseItems, canAccessImports, canAccessLiveSync]);

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
            style={{ width: isOpen ? "var(--sidebar-open-width)" : isMobile ? "0" : "var(--sidebar-collapsed-width)" }}
          >
          <div className="top_section">
            <div className="sidebar-brand">
              <div className="brand-logo-shell">
                <img
                  src="/pgti_dpworld_logo_new.png"
                  alt="PGTI DP World"
                  className="brand-logo-image"
                />
              </div>
              {isOpen && (
                <div className="brand-text">
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
            {isOpen && (
              <div className="sidebar-search-wrap">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="sidebar-search-icon" />
                <input
                  ref={searchRef}
                  type="text"
                  className="sidebar-search-input"
                  placeholder="Search menu…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Escape" && setSearchQuery("")}
                  autoComplete="off"
                  spellCheck={false}
                />
                {searchQuery && (
                  <button
                    className="sidebar-search-clear"
                    onClick={() => { setSearchQuery(""); searchRef.current?.focus(); }}
                    type="button"
                    aria-label="Clear search"
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                )}
              </div>
            )}

            {isOpen && searchQuery ? (
              <div className="sidebar-search-results">
                {searchResults.length === 0 ? (
                  <div className="sidebar-search-empty">
                    <FontAwesomeIcon icon={faMagnifyingGlass} style={{ opacity: 0.3, fontSize: 20, display: "block", marginBottom: 8 }} />
                    No results for <strong>"{searchQuery}"</strong>
                  </div>
                ) : (
                  searchResults.map((item) => (
                    <button
                      key={item.to}
                      type="button"
                      className={`sidebar-search-result-item${location.pathname === item.to.split("?")[0] ? " active" : ""}`}
                      onClick={() => { navigate(item.to); setSearchQuery(""); }}
                    >
                      <span className="sidebar-search-result-icon">
                        <FontAwesomeIcon icon={item.icon} />
                      </span>
                      <span className="sidebar-search-result-text">
                        <span className="sidebar-search-result-name">
                          {highlightMatch(item.name, searchQuery)}
                        </span>
                        {item.section && (
                          <span className="sidebar-search-result-section">{item.section}</span>
                        )}
                      </span>
                    </button>
                  ))
                )}
              </div>
            ) : (
              <>
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
                    isOpen ? (
                      <>
                        <FontAwesomeIcon icon={section.icon} className="sidebar_collapse_iohomeoutline" />
                        <span className="sidebar_collapse_iohomeoutline_categoires">
                          {section.header}
                        </span>
                      </>
                    ) : (
                      <div
                        className={`sidebar-collapsed-cluster ${
                          section.items.length === 1
                            ? "sidebar-collapsed-cluster--single"
                            : "sidebar-collapsed-cluster--grid"
                        }`}
                        title={section.header}
                        aria-label={section.header}
                      >
                        {section.items.slice(0, 4).map((item) => (
                          <span key={item.to} className="sidebar-collapsed-cluster__item">
                            <FontAwesomeIcon icon={item.icon} />
                          </span>
                        ))}
                      </div>
                    )
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

            {canAccessImports && (
              <SidebarItem
                to="/admin/events/ace-import"
                icon={<FontAwesomeIcon icon={faFileLines} />}
                name="Imports"
                isOpen={isOpen}
                className="sidebar_top_tab"
              />
            )}

            {canAccessLiveSync && (
              <SidebarItem
                to="/admin/live-sync"
                icon={<FontAwesomeIcon icon={faArrowsRotate} />}
                name="Live Sync"
                isOpen={isOpen}
                className="sidebar_top_tab"
              />
            )}
              </>
            )}

            <SidebarItem
              to="/admin/profile"
              icon={<FontAwesomeIcon icon={faCircleUser} className="sidebar__user__icon" />}
              name={
                <div
                  className="sidebar_profile_main_content_section"
                  onClick={(event) => {
                    event.preventDefault();
                    navigate("/admin/profile");
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
