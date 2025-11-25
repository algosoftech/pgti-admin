import React, { useState, useEffect, useRef } from "react";
import "./LoginPage.css";
import { Link, useNavigate } from "react-router-dom";
import { login, verifyLoginOtp } from "../../../controllers/front/usersController";
import { notification } from "antd";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { InfoCircleOutlined } from "@ant-design/icons";
import { faEyeSlash, faEye} from '@fortawesome/free-solid-svg-icons';

const LoginPage = () => {
  const navigate = useNavigate();
  const inputRef = {
    email: useRef(null),
    password: useRef(null),
  };
  const ADMINDATA = JSON.parse(sessionStorage.getItem("USER-INFO"));
  const TOKEN = sessionStorage.getItem("USER-TOKEN");
  const [formData, setFormData] = useState({
    email: sessionStorage.getItem("LOGIN_EMAIL")
      ? atob(sessionStorage.getItem("LOGIN_EMAIL"))
      : "",
    password: sessionStorage.getItem("LOGIN_PASSWORD")
      ? atob(sessionStorage.getItem("LOGIN_PASSWORD"))
      : "",
  });
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [errors, setErrors] = useState("");
  const [success, setSuccess] = useState("");

  const [isLoading, setLoading] = useState(false);

  const [countdown, setCountdown] = useState(60);
  const [isCounting, setIsCounting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  /*************************************************************
   * Function Name  : handleChange
   * Purpose        : This function is used for store input value in states
   * Created Date   : 08-01-2024
   *************************************************************/
  const handleChange = (e) => {
    setFormData((preVal) => ({
      ...preVal,
      [e.target.name]: e.target.value,
    }));
    setErrors((...preError) => ({
      ...preError,
      [e.target.name]: "",
    }));
  }; //End of FUnction

  /*************************************************************
   * Function Name  : handleLogin
   * Purpose        : This function is used generate login OTP
   * Created Date   : 08-01-2024
   *************************************************************/
  const handleLogin = async () => {
    try {
      setLoading(true);
      if (!formData?.email) {
        setErrors((prevError) => ({
          ...prevError,
          email: "Email is required.",
        }));
        return;
      } else if (!formData.password) {
        setErrors((prevError) => ({
          ...prevError,
          password: "Password is required.",
        }));
        return;
      }

      const options = { email: formData?.email, password: formData.password };
      const result = await login(options);
      if (result.status === true) {
        setIsOTPSent(true);

        setSuccess((prevSuccess) => ({
          ...prevSuccess,
          formSuccess: result.message,
        }));
        setCountdown(60);
        setIsCounting(true);

      } else {
        setIsOTPSent(false);
        setErrors((prevError) => ({
          ...prevError,
          formError: result.message,
        }));
      }
    } catch (error) {
      setLoading(false);
      console.error("Error during login process:", error);
    } finally{
      setLoading(false);
    }
  };
  /*************************************************************
   * Function Name  : handleVerifyOTP
   * Purpose        : This function is used handle verify otp
   * Created Date   : 08-01-2024
   *************************************************************/
  const handleVerifyOTP = async () => {
    try {
      setLoading(true);
      if (!formData?.email) {
        setErrors((...preError) => ({
          ...preError,
          email: "Email is required.",
        }));
      } else if (!formData.otp) {
        setErrors((...preError) => ({
          ...preError,
          otp: "One Time Password is required.",
        }));
      } else {
        const options = {
          email: formData?.email,
          otp: formData.otp
        };
        const result = await verifyLoginOtp(options);
        if (result.status === true) {
          navigate("/profile");
        } else {
          notification.open({
            message: "Opps!",
            description: `${result?.message}`,
            placement: "topRight",
            icon: <InfoCircleOutlined style={{ color: "red" }} />,
            duration: 2,
          });
        }
      }
    } catch (error) {
      setLoading(false);
      setErrors((...preError) => ({
        ...preError,
        formError: "error",
      }));
    } finally{
      setLoading(false);
    }
  }; //End of Function

  /*************************************************************
   * Function Name  : handleEmailChange
   * Purpose        : This function is used for change email id
   * Created Date   : 08-01-2024
   *************************************************************/
  const handleEmailChange = async () => {
    //Empty OTP Input Box
    setFormData((preVal) => ({
      ...preVal,
      password: "",
      otp: "",
    }));
    setIsOTPSent(false);
    setCountdown(0);
  }; //End of Function

  /*************************************************************
   * Purpose        : This hooks is used for handle otp sent countdown
   * Created Date   : 08-01-2024
   *************************************************************/
  useEffect(() => {
    if (ADMINDATA || TOKEN) {
      navigate("/dashboard");
    }
    let countdownInterval;
    if (isCounting) {
      countdownInterval = setInterval(() => {
        if (countdown > 0) {
          setCountdown((prevCountdown) => prevCountdown - 1);
        } else {
          clearInterval(countdownInterval);
          setIsCounting(false);
        }
      }, 1000);
    } else {
      clearInterval(countdownInterval);
    }
    return () => {
      clearInterval(countdownInterval);
    };
  }, [countdown, isCounting]);

  /*************************************************************
   * Purpose        : This hooks is used for handle key press on email input
   * Created Date   : 20-01-2024
   *************************************************************/
  // For Email
  const handleEmailKeyPress = (event) => {
    if (event.key === "Enter") {
      if (inputRef.password.current) {
        inputRef.password.current.focus();
      }
    }
  };
  //End of Function
  return (
    <section className="vh-100">
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-12 text-black" style={{background: "#eeeeee87"}}>
            <div className="d-flex align-items-center justify-content-center h-custom-2 px-5 ms-xl-4  pt-5 pt-xl-0 mt-xl-n5 frisbee_login_login">
              <form className="login_form_class" style={{ width: "23rem" }}>
              <div className="text-center">
                {/* <img
                  src={`/logo.png`}
                  alt="Login image"
                  style={{ objectFit: "contain", objectPosition: "center", width:"35%" }}
                /> */}
              </div>
                {!isOTPSent && (
                  <>
                    <h3
                      className="fw-normal mb-3 pb-3 login_div"
                      style={{ letterSpacing: "1px", textAlign: "center" }}
                    >
                      <span className="login_div">USER LOGIN</span>
                    </h3>

                    <div className="form-outline mb-3">
                      <label
                        className="form-label email_address_login"
                        htmlFor="email "
                      >
                        {/* <span style={{ color: "red" }}>*</span>Email Address */}
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="form-control form-control-lg input_login_page"
                        onKeyDown={handleEmailKeyPress}
                        onChange={handleChange}
                        value={formData?.email}
                        placeholder="Email address"
                      />
                      {errors?.email ? (
                        <p style={{ color: "red" }}>{errors?.email}</p>
                      ) : (
                        ""
                      )}
                    </div>

                    <div className="form-outline mb-3">
                      <label
                        className="form-label email_address_login"
                        htmlFor="password"
                      >
                        {/* <span style={{ color: "red" }}>*</span>Password */}
                      </label>
                      <div className="input-group">
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          name="password"
                          className="form-control form-control-lg input_login_page"
                          onChange={handleChange}
                          ref={inputRef.password}
                          placeholder="Password"
                        />
                        <span
                          className="input-group-text my_eye_icon"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? (
                          <FontAwesomeIcon icon={faEyeSlash} />

                          ) : (
                            <FontAwesomeIcon icon={faEye} />
                          )}
                        </span>
                      </div>
                      {errors?.password ? (
                        <p style={{ color: "red" }}>{errors?.password}</p>
                      ) : (
                        ""
                      )}
                    </div>

                    <div class="row mb-4">
                      <div className="login_page_reset_password">
                        <div class="col">
                          {/* <div class="form-check">
                            <input
                              class="form-check-input"
                              type="checkbox"
                              value=""
                              name="remember_me"
                              id="form2Example31"
                              
                            />
                            <label
                              class="form-check-label remember_login_page"
                              for="form2Example31"
                            >
                              {" "}
                              Remember me{" "}
                            </label>
                          </div> */}
                        </div>
                        <div class="col" className="reset_login_page">
                          <Link to="/reset-password" className="reset_button">
                            Reset Password?
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div className="pt-1 mb-4">
                      {errors?.formError ? (
                        <p style={{ color: "red", textAlign: "center" }}>
                          {errors?.formError}
                        </p>
                      ) : (
                        ""
                      )}
                      <Link to={false} onClick={handleLogin}>
                        <button
                          type="submit"
                          style={{
                            borderRadius: "20px",
                          }}
                          className="btn btn-primary mb-3 login_btn_btn"
                          disabled={isLoading}
                        >
                          Login
                        </button>
                      </Link>
                    </div>
                  </>
                )}

                {isOTPSent && (
                  <>
                    <h3
                      className="fw-normal mb-3 pb-3 login_div"
                      style={{ letterSpacing: "1px", textAlign: "center" }}
                    >
                      Verify OTP
                    </h3>
                    {success?.formSuccess ? (
                      <p style={{ color: "green", textAlign: "center" }}>
                        {success?.formSuccess}{" "}
                        <Link to={false} onClick={handleEmailChange}>
                          Change
                        </Link>
                      </p>
                    ) : (
                      ""
                    )}
                    <div className="form-outline mb-4">
                      <label
                        className="form-label email_address_login"
                        htmlFor="otp"
                      >
                        <span style={{ color: "red" }}>*</span>OTP
                      </label>
                      <input
                        type="password"
                        id="otp"
                        name="otp"
                        className="form-control form-control-lg input_login_page"
                        onChange={handleChange}
                        // onKeyDown={handleOtpKeyPress}
                        ref={inputRef.otp}
                      />
                      {errors?.password ? (
                        <p style={{ color: "red" }}>{errors?.password}</p>
                      ) : (
                        ""
                      )}
                    </div>

                    <div class="row mb-4">
                      <div className="login_page_reset_password">
                        <div class="col">
                          <div class="form-check">
                            <label
                              class="form-check-label remember_login_page"
                              for="form2Example31"
                              style={{ color: "red" }}
                            >
                              {" "}
                              {isCounting ? (
                                `Resend OTP in ${countdown ? countdown : 0}`
                              ) : (
                                <></>
                              )}
                            </label>
                          </div>
                        </div>
                        <div class="col" className="reset_login_page">
                          {isCounting ? (
                            <></>
                          ) : (
                            <Link
                              to={false}
                              onClick={handleLogin}
                              className="reset_button"
                            >
                              {" "}
                              Resend Password?
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="pt-1 mb-4">
                      <Link to={false} onClick={handleVerifyOTP}>
                        <button
                          type="submit"
                          style={{
                            backgroundColor: "black",
                            color: "white",
                            borderRadius: "20px",
                          }}
                          className="btn btn-block mb-3 login_btn_btn"
                          disabled={isLoading}
                        >
                          Login
                        </button>
                      </Link>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
