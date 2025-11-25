import "./main_dashboard.css";
// import { Dropdown } from "react-bootstrap";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoutConformationPopup from "./LogoutConformationPopup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBarsStaggered } from "@fortawesome/free-solid-svg-icons";

const Top_navbar = ({ title = "Dashboard" }) => {
  const [isSticky, setSticky] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setSticky(true);
      } else {
        setSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  //open my dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const navigate = useNavigate();

  const user = JSON.parse(sessionStorage.getItem("USER-INFO"));
  const [popUpOpen, setPopUpOpen] = useState(false);
  const togglePopUp = () => {
    setPopUpOpen(!popUpOpen);
  };

  return (
    <>
      <div className={isSticky ? "sticky" : ""}>
        <div className="container_fluid">
          <div className="row">
            <div className="col-md-6">
              <h1 className="main_heading">{title}</h1>
            </div>
            <div className="col-md-4"></div>
            <div className="col-md-1 main_dashboard_tooltip"></div>
            <div className="col-md-1 main_dashboard_tooltip">
              <div className="col">
                {/* Bootstrap Dropdown */}
                <div className="dropdown">
                  <button
                    className="btn btn-icon dropdown-toggle"
                    type="button"
                    id="dropdownMenuButton"
                    data-bs-toggle="dropdown"
                    aria-expanded={isDropdownOpen}
                    onClick={toggleDropdown}
                  >
                    <FontAwesomeIcon icon={faBarsStaggered} />
                  </button>

                  <ul
                    className={`dropdown-menu dropdown-menu-right ${
                      isDropdownOpen ? "show" : ""
                    }`}
                    aria-labelledby="dropdownMenuButton"
                    style={{ left: "0 !important" }}
                  >
                    {/* <li>
              <Link
                className="dropdown-item admin_dashboard_dropdwon top_nav_profile"
                to="javaScript:void(0)"
                onClick={()=>navigate("/sub-admin/addeditdata", { state: user })}
              >
                <i className="fas fa-user fa-sm fa-fw mr-2 text-gray-400"></i>
                 Profile
              </Link>
            </li> */}

                    {/* <li>
              <hr className="dropdown-divider" />
            </li> */}
                    <li>
                      <a
                        className="dropdown-item admin_dashboard_dropdwon"
                        href="#"
                        onClick={togglePopUp}
                        data-toggle="modal"
                        data-target="#logoutModal"
                      >
                        <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
                        Logout
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <LogoutConformationPopup
        popUpOpen={popUpOpen}
        togglePopUp={togglePopUp}
      />
    </>
  );
};
export default Top_navbar;
