import React, { useState, useEffect, useRef } from "react";
import "./LoginPage.css";
import { Link, useNavigate } from "react-router-dom";
import { login, verifyLoginOtp } from "../../../controllers/accounts/Account";
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
  const ADMINDATA = JSON.parse(sessionStorage.getItem("ADMIN-INFO"));
  const TOKEN = sessionStorage.getItem("TOKEN");
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
      if (result?.status === true) {
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
          navigate("/admin/dashboard");
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
      navigate("/admin/dashboard");
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

  const handleSubmitByEnterKey = (event) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };
  const handleEnterKey = (event) => {
    if (event.key === "Enter") {
      handleVerifyOTP();
    }
  };
  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-content">
          <div className="login-card">
            <div className="login-header">
              <div className="logo-section">
                <div className="logo-icon">🌱</div>
                <h1 className="logo-text">The Farmers Store</h1>
                <p className="logo-subtitle">Admin Portal</p>
              </div>
            </div>
            <div className="login-form">
              {!isOTPSent && (
                <>
                  <div className="form-section">
                    <h2 className="form-title">Welcome Back</h2>
                    <p className="form-subtitle">Sign in to your admin account</p>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="email">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={`form-input ${errors?.email ? 'error' : ''}`}
                      onKeyDown={handleEmailKeyPress}
                      onChange={handleChange}
                      value={formData?.email}
                      placeholder="Enter your email address"
                    />
                    {errors?.email && (
                      <span className="error-message">{errors?.email}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="password">
                      Password
                    </label>
                    <div className="password-input">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        className={`form-input ${errors?.password ? 'error' : ''}`}
                        onChange={handleChange}
                        onKeyDown={handleSubmitByEnterKey}
                        ref={inputRef.password}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? (
                          <FontAwesomeIcon icon={faEyeSlash} />
                        ) : (
                          <FontAwesomeIcon icon={faEye} />
                        )}
                      </button>
                    </div>
                    {errors?.password && (
                      <span className="error-message">{errors?.password}</span>
                    )}
                  </div>

                  <div className="">
                    <Link to="/reset-password" className="forgot-password">
                      Forgot Password?
                    </Link>
                  </div>
                  <br/>

                  {errors?.formError && (
                    <div className="error-alert">
                      {errors?.formError}
                    </div>
                  )}

                  <button
                    type="button"
                    className="login-button"
                    onClick={handleLogin}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="loading-spinner"></div>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </>
              )}

              {isOTPSent && (
                <>
                  <div className="form-section">
                    <h2 className="form-title">Verify OTP</h2>
                    <p className="form-subtitle">Enter the verification code sent to your email</p>
                  </div>

                  {success?.formSuccess && (
                    <div className="success-alert">
                      <span>{success?.formSuccess}</span>
                      <button 
                        type="button" 
                        className="change-email-btn"
                        onClick={handleEmailChange}
                      >
                        Change Email
                      </button>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label" htmlFor="otp">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      id="otp"
                      name="otp"
                      className={`form-input otp-input ${errors?.otp ? 'error' : ''}`}
                      onChange={handleChange}
                      onKeyDown={handleEnterKey}
                      ref={inputRef.otp}
                      placeholder="Enter 6-digit code"
                      maxLength="6"
                    />
                    {errors?.otp && (
                      <span className="error-message">{errors?.otp}</span>
                    )}
                  </div>

                  <div className="otp-actions">
                    <div className="countdown-section">
                      {isCounting ? (
                        <span className="countdown-text">
                          Resend code in {countdown}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="resend-btn"
                          onClick={handleLogin}
                        >
                          Resend Code
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="login-button"
                    onClick={handleVerifyOTP}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="loading-spinner"></div>
                    ) : (
                      'Verify & Continue'
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
