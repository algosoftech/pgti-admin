import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Collapse } from "antd";
import "./SideBar.css";
import {
  faBarsStaggered,
  faCogs,
  faGreaterThan,
  faLessThan,
  faUser,
  faUsers,
  faUserSecret,
  faFolder,
  faTag,
  faQuestionCircle,
  faStore,
  faFileText,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";
import { faCircle, faCircleUser } from "@fortawesome/free-regular-svg-icons";
import { faCreditCard } from "@fortawesome/free-regular-svg-icons";
import { faHouse } from "@fortawesome/free-solid-svg-icons";
import {
  usePermissions,
  PermissionContext,
} from "../../../../controllers/PermissionContext";

const { Panel } = Collapse;

const SidebarItem = ({ to, icon, name, isOpen, className }) => (
  <NavLink
    to={to}
    className={`link ${className && className}`}
    activeClassName="active"
    >
    <div className="icon">{icon}</div>
    <div style={{ display: isOpen ? "block" : "none" }} className="link_text">
      {name}
    </div>
  </NavLink>
);

const Sidebar = ({ children }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsOpen(false); // Close sidebar on mobile by default
      } else {
        setIsOpen(true); // Open sidebar on desktop by default
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && isOpen) {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        if (sidebar && overlay && !sidebar.contains(event.target) && !event.target.closest('.mobile-menu-button')) {
          setIsOpen(false);
        }
      }
    };

    if (isMobile && isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent body scroll when sidebar is open
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isMobile, isOpen]);

  // Handle keyboard navigation (ESC to close)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isMobile && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, isOpen]);

  const handleCollapseToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleOverlayClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const PERMISSION = usePermissions("FULL");
  const { refetchPermissions } = React.useContext(PermissionContext);
  const user = JSON.parse(sessionStorage.getItem("ADMIN-INFO"));
  const [PERMISSIONDATA, setPermissionData] = useState("");

  const getFullPermission = async () => {
    try {
      if (
        PERMISSION?.permissions &&
        Object.keys(PERMISSION?.permissions).length > 0
      ) {
        setPermissionData(PERMISSION?.permissions);
      } else if (PERMISSION?.fullAccess === "Y") {
        setPermissionData({}); // For Super Admin
      } else if (typeof refetchPermissions === "function") {
        await refetchPermissions();
      }
    } catch (error) {
      console.error("Error in getFullPermission:", error);
    }
  };

  useEffect(() => {
    getFullPermission();
  }, [refetchPermissions]);

  // Check if permissions are loaded
  const hasPermissions =
    user?.admin_type === "Super Admin" ||
    (PERMISSIONDATA &&
      typeof PERMISSIONDATA === "object" &&
      Object.keys(PERMISSIONDATA).length > 0);

  if (!hasPermissions) {
    return (
      <>
        {/* Mobile Menu Button */}
        {isMobile && (
          <button
            className="mobile-menu-button"
            onClick={handleCollapseToggle}
            aria-label="Toggle sidebar"
            aria-expanded={isOpen}
          >
            <FontAwesomeIcon icon={faBarsStaggered} />
          </button>
        )}

        {/* Mobile Overlay */}
        {isMobile && isOpen && (
          <div
            className="sidebar-overlay"
            onClick={handleOverlayClick}
            aria-hidden="true"
          />
        )}

        <div
          className={`container-fluid side_bar_main_div ${
            isOpen ? "sidebar-open" : "sidebar-closed"
          } ${isMobile ? "mobile-sidebar" : ""}`}
        >
          <div
            style={{
              width: isOpen ? "300px" : isMobile ? "0" : "70px",
              position: "relative",
            }}
            className={`sidebar ${isMobile && isOpen ? "sidebar-mobile-open" : ""}`}
          >
            <div className="top_section">
              <div className="sidebar-brand">
                <div className="brand-icon">🌱</div>
                {isOpen && (
                  <div className="brand-text">
                    <h3 className="brand-title">Farmers Store</h3>
                    <p className="brand-subtitle">Admin Portal</p>
                  </div>
                )}
              </div>
              <button
                onClick={handleCollapseToggle}
                className="sidebar-toggle"
                aria-label="Toggle sidebar"
              >
                {isOpen ? (
                  <FontAwesomeIcon icon={faLessThan} />
                ) : (
                  <FontAwesomeIcon icon={faGreaterThan} />
                )}
              </button>
            </div>
            <div className="my_sidebar_all_section">
              <SidebarItem
                to="/admin/dashboard"
                icon={<FontAwesomeIcon icon={faHouse} />}
                name="Dashboard"
                isOpen={isOpen}
              />
            </div>
          </div>
          <main className={isMobile && isOpen ? "main-content-mobile" : ""}>{children}</main>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          className="mobile-menu-button"
          onClick={handleCollapseToggle}
          aria-label="Toggle sidebar"
          aria-expanded={isOpen}
        >
          <FontAwesomeIcon icon={faBarsStaggered} />
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="sidebar-overlay"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      <div
        className={`container-fluid side_bar_main_div ${
          isOpen ? "sidebar-open" : "sidebar-closed"
        } ${isMobile ? "mobile-sidebar" : ""}`}
      >
        <div
          style={{
            width: isOpen ? "300px" : isMobile ? "0" : "70px",
          }}
          className={`sidebar ${isMobile && isOpen ? "sidebar-mobile-open" : ""}`}
        >
        <div className="top_section">
          <div className="sidebar-brand">
            <div className="brand-icon">🌱</div>
            {isOpen && (
              <div className="brand-text">
                <h3 className="brand-title">Farmers Store</h3>
                <p className="brand-subtitle">Admin Portal</p>
              </div>
            )}
          </div>
          <button
            onClick={handleCollapseToggle}
            className="sidebar-toggle"
            aria-label="Toggle sidebar"
          >
            {isOpen ? (
              <FontAwesomeIcon icon={faLessThan} />
            ) : (
              <FontAwesomeIcon icon={faGreaterThan} />
            )}
          </button>
        </div>
        <div className="my_sidebar_all_section">
          <SidebarItem
            to="/admin/dashboard"
            icon={<FontAwesomeIcon icon={faHouse} />}
            name="Dashboard"
            isOpen={isOpen}
            className={"sidebar_top_tab"}
          />

          {user?.admin_type === "Super Admin" && (
            <Collapse accordion className="my_collapse_icon">
              <Panel
                header={
                  <React.Fragment>
                    <FontAwesomeIcon
                      icon={faCircleUser}
                      className="sidebar_collapse_iohomeoutline"
                    />
                    <span
                      className={`sidebar_collapse_iohomeoutline_categoires ${
                        isOpen ? "visible" : "hidden"
                      }`}
                    >
                      {" "}
                      Accounts{" "}
                    </span>
                  </React.Fragment>
                }
                key="categories"
                className={`side_bar_categories ${
                  isOpen ? "arrow-visible" : "arrow-hidden"
                }`}
              >
                <SidebarItem
                  to="/sub-admin/list"
                  icon={<FontAwesomeIcon icon={faCircle} />}
                  name="Sub Admin"
                  isOpen={isOpen}
                  className="sub_link"
                />
              </Panel>
            </Collapse>
          )}

          {(PERMISSIONDATA?.users?.list === "Y" || user?.admin_type === "Super Admin") && (
            <Collapse accordion className="my_collapse_icon">
              <Panel
                header={
                  <React.Fragment>
                    <FontAwesomeIcon
                      icon={faUsers}
                      className="sidebar_collapse_iohomeoutline"
                    />
                    <span
                      className={`sidebar_collapse_iohomeoutline_categoires ${
                        isOpen ? "visible" : "hidden"
                      }`}
                    >
                      {" "}
                      Customers{" "}
                    </span>
                  </React.Fragment>
                }
                key="categories"
                className={`side_bar_categories ${
                  isOpen ? "arrow-visible" : "arrow-hidden"
                }`}
              >
                <SidebarItem
                  to="/admin/users/list"
                  icon={<FontAwesomeIcon icon={faCircle} />}
                  name="Customer List"
                  isOpen={isOpen}
                  className="sub_link"
                />
              </Panel>
            </Collapse>
          )}

          {(PERMISSIONDATA?.categories?.list === "Y" || user?.admin_type === "Super Admin") && (
            <Collapse accordion className="my_collapse_icon">
              <Panel
                header={
                  <React.Fragment>
                    <FontAwesomeIcon
                      icon={faFolder}
                      className="sidebar_collapse_iohomeoutline"
                    />
                    <span
                      className={`sidebar_collapse_iohomeoutline_categoires ${
                        isOpen ? "visible" : "hidden"
                      }`}
                    >
                      {" "}
                      Categories{" "}
                    </span>
                  </React.Fragment>
                }
                key="category-menu"
                className={`side_bar_categories ${
                  isOpen ? "arrow-visible" : "arrow-hidden"
                }`}
              >
                <SidebarItem
                  to="/admin/categories/list"
                  icon={<FontAwesomeIcon icon={faCircle} />}
                  name="Category List"
                  isOpen={isOpen}
                  className="sub_link"
                />
                {(PERMISSIONDATA?.subCategories?.list === "Y" || user?.admin_type === "Super Admin") && (
                  <SidebarItem
                    to="/admin/sub-categories/list"
                    icon={<FontAwesomeIcon icon={faCircle} />}
                    name="Sub-Category List"
                    isOpen={isOpen}
                    className="sub_link"
                  />
                )}
              </Panel>
            </Collapse>
          )}

          {(PERMISSIONDATA?.products?.list === "Y" || user?.admin_type === "Super Admin") && (
            <Collapse accordion className="my_collapse_icon">
              <Panel
                header={
                  <React.Fragment>
                    <FontAwesomeIcon
                      icon={faUserSecret}
                      className="sidebar_collapse_iohomeoutline"
                    />
                    <span
                      className={`sidebar_collapse_iohomeoutline_categoires ${
                        isOpen ? "visible" : "hidden"
                      }`}
                    >
                      {" "}
                      Products{" "}
                    </span>
                  </React.Fragment>
                }
                key="products-menu"
                className={`side_bar_categories ${
                  isOpen ? "arrow-visible" : "arrow-hidden"
                }`}
              >
                <SidebarItem
                  to="/admin/products/list"
                  icon={<FontAwesomeIcon icon={faCircle} />}
                  name="Product List"
                  isOpen={isOpen}
                  className="sub_link"
                />
                {(PERMISSIONDATA?.productVariants?.list === "Y" || user?.admin_type === "Super Admin") && (
                  <SidebarItem
                    to="/admin/product-variants/list"
                    icon={<FontAwesomeIcon icon={faCircle} />}
                    name="Product Variants"
                    isOpen={isOpen}
                    className="sub_link"
                  />
                )}
              </Panel>
            </Collapse>
          )}

          {/* {(PERMISSIONDATA?.industry?.list === "Y" || user?.admin_type === "Super Admin") && ( */}
            <Collapse accordion className="my_collapse_icon">
              <Panel
                header={
                  <React.Fragment>
                    <FontAwesomeIcon
                      icon={faCreditCard}
                      className="sidebar_collapse_iohomeoutline"
                    />
                    <span
                      className={`sidebar_collapse_iohomeoutline_categoires ${
                        isOpen ? "visible" : "hidden"
                      }`}
                    >
                      {" "}
                      CMS{" "}
                    </span>
                  </React.Fragment>
                }
                key="cms"
                className={`side_bar_categories ${
                  isOpen ? "arrow-visible" : "arrow-hidden"
                }`}
              >
                {(PERMISSIONDATA?.banners?.list === "Y" || user?.admin_type === "Super Admin") && (
                  <SidebarItem
                    to="/admin/cms/banners/list"
                    icon={<FontAwesomeIcon icon={faCircle} />}
                    name="Banners"
                    isOpen={isOpen}
                    className="sub_link"
                  />
                )}
                {(PERMISSIONDATA?.faqs?.list === "Y" || user?.admin_type === "Super Admin") && (
                  <SidebarItem
                    to="/admin/cms/faqs/list"
                    icon={<FontAwesomeIcon icon={faQuestionCircle} />}
                    name="FAQs"
                    isOpen={isOpen}
                    className="sub_link"
                  />
                )}
                {(PERMISSIONDATA?.contact_shops?.list === "Y" || user?.admin_type === "Super Admin") && (
                  <SidebarItem
                    to="/admin/cms/contact-shops/list"
                    icon={<FontAwesomeIcon icon={faStore} />}
                    name="Contact Shops"
                    isOpen={isOpen}
                    className="sub_link"
                  />
                )}
              </Panel>
            </Collapse>
          {/* )} */}

          {(PERMISSIONDATA?.articles?.list === "Y" || user?.admin_type === "Super Admin") && (
            <Collapse accordion className="my_collapse_icon">
              <Panel
                header={
                  <React.Fragment>
                    <FontAwesomeIcon
                      icon={faFileText}
                      className="sidebar_collapse_iohomeoutline"
                    />
                    <span
                      className={`sidebar_collapse_iohomeoutline_categoires ${
                        isOpen ? "visible" : "hidden"
                      }`}
                    >
                      Articles
                    </span>
                  </React.Fragment>
                }
                key="articles-menu"
                className={`side_bar_categories ${
                  isOpen ? "arrow-visible" : "arrow-hidden"
                }`}
              >
                <SidebarItem
                  to="/admin/articles/list"
                  icon={<FontAwesomeIcon icon={faCircle} />}
                  name="Article List"
                  isOpen={isOpen}
                  className="sub_link"
                />
                {(PERMISSIONDATA?.ingredients?.list === "Y" || user?.admin_type === "Super Admin") && (
                  <SidebarItem
                    to="/admin/articles/ingredients/list"
                    icon={<FontAwesomeIcon icon={faCircle} />}
                    name="Ingredients"
                    isOpen={isOpen}
                    className="sub_link"
                  />
                )}
              </Panel>
            </Collapse>
          )}

          {(PERMISSIONDATA?.events?.list === "Y" || user?.admin_type === "Super Admin") && (
            <Collapse accordion className="my_collapse_icon">
              <Panel
                header={
                  <React.Fragment>
                    <FontAwesomeIcon
                      icon={faCalendar}
                      className="sidebar_collapse_iohomeoutline"
                    />
                    <span
                      className={`sidebar_collapse_iohomeoutline_categoires ${
                        isOpen ? "visible" : "hidden"
                      }`}
                    >
                      Events
                    </span>
                  </React.Fragment>
                }
                key="events-menu"
                className={`side_bar_categories ${
                  isOpen ? "arrow-visible" : "arrow-hidden"
                }`}
              >
                <SidebarItem
                  to="/admin/events/list"
                  icon={<FontAwesomeIcon icon={faCircle} />}
                  name="Event List"
                  isOpen={isOpen}
                  className="sub_link"
                />
              </Panel>
            </Collapse>
          )}

          {(PERMISSIONDATA?.orders?.list === "Y" || PERMISSIONDATA?.transaction?.list === "Y" || user?.admin_type === "Super Admin") && (
            <Collapse accordion className="my_collapse_icon">
              <Panel
                header={
                  <React.Fragment>
                    <FontAwesomeIcon
                      icon={faCreditCard}
                      className="sidebar_collapse_iohomeoutline"
                    />
                    <span
                      className={`sidebar_collapse_iohomeoutline_categoires ${
                        isOpen ? "visible" : "hidden"
                      }`}
                    >
                      Orders
                    </span>
                  </React.Fragment>
                }
                key="orders"
                className={`side_bar_categories ${
                  isOpen ? "arrow-visible" : "arrow-hidden"
                }`}
              >
                <SidebarItem
                  to="/admin/orders/list"
                  icon={<FontAwesomeIcon icon={faCircle} />}
                  name="Order List"
                  isOpen={isOpen}
                  className="sub_link"
                />
              </Panel>
            </Collapse>
          )}

          {(PERMISSIONDATA?.promocodes?.list === "Y" || user?.admin_type === "Super Admin") && (
            <Collapse accordion className="my_collapse_icon">
              <Panel
                header={
                  <React.Fragment>
                    <FontAwesomeIcon
                      icon={faTag}
                      className="sidebar_collapse_iohomeoutline"
                    />
                    <span
                      className={`sidebar_collapse_iohomeoutline_categoires ${
                        isOpen ? "visible" : "hidden"
                      }`}
                    >
                      Promocodes
                    </span>
                  </React.Fragment>
                }
                key="promocodes-menu"
                className={`side_bar_categories ${
                  isOpen ? "arrow-visible" : "arrow-hidden"
                }`}
              >
                <SidebarItem
                  to="/admin/promocodes/list"
                  icon={<FontAwesomeIcon icon={faCircle} />}
                  name="Promocode List"
                  isOpen={isOpen}
                  className="sub_link"
                />
              </Panel>
            </Collapse>
          )}

          <SidebarItem
            icon={
              <img
                src={`/logo.png`}
                alt=""
                className="user_profile_pic_sidebar"
                onClick={handleCollapseToggle}
                // width="100px"
              />
            }
            to="javaScript:void(0)"
            name={
              <div
                className="sidebar_profile_main_content_section"
                onClick={() =>
                  navigate("/sub-admin/addeditdata", { state: user })
                }
              >
                <React.Fragment>
                  <div className="sidebar_profile_main_content">
                    <div className="user_profile_pic_Admin_name">
                      <span className="user_profile_pic_Admin_panel">
                        {`${user?.name}`}
                      </span>
                      <br />
                      <span className="user_profile_pic_Admin_panel_">
                        {user?.admin_type}
                      </span>
                    </div>
                  </div>
                </React.Fragment>
                <React.Fragment>
                  <FontAwesomeIcon
                    icon={faGreaterThan}
                    className="side_bar_fagreaterthan"
                    onClick={handleCollapseToggle}
                  />
                </React.Fragment>
              </div>
            }
            isOpen={isOpen}
            className={`custom_profile_class_productList ${
              !isOpen && "custom_profile_class_productList_close"
            }`}
          />
        </div>
      </div>
      <main className={isMobile && isOpen ? "main-content-mobile" : ""}>{children}</main>
    </div>
    </>
  );
};

export default Sidebar;
