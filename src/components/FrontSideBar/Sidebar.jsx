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
} from "@fortawesome/free-solid-svg-icons";
import { faCircle, faCircleUser } from "@fortawesome/free-regular-svg-icons";
import { faCreditCard } from "@fortawesome/free-regular-svg-icons";
import { faHouse } from "@fortawesome/free-solid-svg-icons";
import {
  usePermissions,
  PermissionContext,
} from "../../controllers/PermissionContext";

const { Panel } = Collapse;

const SidebarItem = ({ to, icon, name, isOpen, className }) => (
  <NavLink to={to} className={`link ${className}`} activeClassName="active">
    <div className="icon">{icon}</div>
    <div style={{ display: isOpen ? "block" : "none" }} className="link_text">
      {name}
    </div>
  </NavLink>
);

const Sidebar = ({ children }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const handleCollapseToggle = () => {
    setIsOpen(!isOpen);
  };
  const [user, setUserData] = useState({});

  useEffect(() => {
    const fetchUser = () => {
      const storedUser = JSON.parse(sessionStorage.getItem("USER-INFO"));
      if (storedUser) {
        setUserData(storedUser);
      }
    };
    fetchUser();
    const interval = setInterval(fetchUser, 5000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div
      className={`container-fluid side_bar_main_div ${
        isOpen ? "sidebar-open" : "sidebar-closed"
      }`}
    >
      <div
        style={{ width: isOpen ? "350px" : "70px", position: "relative" }}
        className="sidebar"
      >
        <div className="top_section">
          {/* <img src={`/logo.png`} className="sidebar_logo" alt="Logo" style={{
            display: isOpen ? "block" : "none",
            height: "50px",
            width: "auto",
          }} /> */}

          <div
            onClick={handleCollapseToggle}
            style={{
              marginLeft: isOpen ? "240px" : "0px",
            }}
            className="bars sidebar_closer"
          >
            {/* <FontAwesomeIcon
                        icon={faBarsStaggered}
                        onClick={handleCollapseToggle}
                      /> */}
            {isOpen ? (
              <FontAwesomeIcon icon={faLessThan} />
            ) : (
              <FontAwesomeIcon icon={faGreaterThan} />
            )}
          </div>
        </div>
        <div className="my_sidebar_all_section">
          <SidebarItem
            to="/profile"
            icon={<FontAwesomeIcon icon={faHouse} />}
            name="Dashboard"
            isOpen={isOpen}
          />

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
                    Influencer{" "}
                  </span>
                </React.Fragment>
              }
              key="categories"
              className={`side_bar_categories ${
                isOpen ? "arrow-visible" : "arrow-hidden"
              }`}
            >
              <SidebarItem
                to="/influencer"
                icon={<FontAwesomeIcon icon={faCircle} />}
                name="List"
                isOpen={isOpen}
              />
            </Panel>
          </Collapse>

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
                    Transaction{" "}
                  </span>
                </React.Fragment>
              }
              key="categories"
              className={`side_bar_categories ${
                isOpen ? "arrow-visible" : "arrow-hidden"
              }`}
            >
              <SidebarItem
                to="/transaction/history"
                icon={<FontAwesomeIcon icon={faCircle} />}
                name="History"
                isOpen={isOpen}
              />
            </Panel>
          </Collapse>

          <SidebarItem
            icon={
              <img
                src={`/logo.png`}
                alt=""
                className="user_profile_pic_sidebar"
                onClick={handleCollapseToggle}
              />
            }
            to="javaScript:void(0)"
            name={
              <div className="sidebar_profile_main_content_section">
                <React.Fragment>
                  <div className="sidebar_profile_main_content">
                    <div className="user_profile_pic_Admin_name">
                      <span className="user_profile_pic_Admin_panel">
                        {`${user?.name}`}
                      </span>
                      <br />
                      <span className="user_profile_pic_Admin_panel_">
                        Available Points{" "}
                        {user?.available_points?.toFixed(2) || 0}
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
            className="custom_profile_class_productList"
          />
        </div>
      </div>
      <main>{children}</main>
    </div>
  );
};

export default Sidebar;
