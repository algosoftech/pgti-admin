import React, { useState, useEffect, useRef } from "react";
import "pages/auth/LoginPage/LoginPage.css";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword, resetPassword } from 'services/auth.service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEyeSlash, faEye} from '@fortawesome/free-solid-svg-icons';

const LoginPage = () => {
  const navigate = useNavigate();
  const inputRef = {
    email: useRef(null),
    password: useRef(null),
    otp: useRef(null),
    new_password: useRef(null),
    confirm_password: useRef(null)
  }
  const ADMINDATA = JSON.parse(sessionStorage.getItem("ADMIN-INFO"));
  const TOKEN = sessionStorage.getItem("TOKEN");

  const [formData, setFormData] = useState({});
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState({});

  const [isLoading, setLoading] = useState(false);

  const [countdown, setCountdown] = useState(60);
  const [isCounting, setIsCounting] = useState(false);
  const [showPassword, setShowPassword] = useState({
    new_password: false,
    confirm_password: false
  });

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  /*************************************************************
 * Function Name  : handleChange
 * Purposs        : This function is used for store input value in states
 * Created Date   : 08-01-2024
 *************************************************************/
  const handleChange = (e) => {
    setFormData((preVal) => ({
      ...preVal,
      [e.target.name]: e.target.value
    }));
    setErrors((prevError) => ({
      ...prevError,
      [e.target.name]: ''
    }));
  } //End of FUnction

  /*************************************************************
   * Function Name  : handleforgotPassword
   * Purposs        : This function is used generate login OTP
   * Created Date   : 08-01-2024
   *************************************************************/
  const handleforgotPassword = async () => {
    try {
      setLoading(true);
      if (!formData?.email) {
        setErrors((prevError) => ({
          ...prevError,
          email: 'Email is required.'
        }));
        return;
      } else {
        const options = { email: formData?.email }
        const result = await forgotPassword(options)
        console.log('result', result)
        if (result.status) {
          setIsOTPSent(true);
          setSuccess((prevSuccess) => ({
            ...prevSuccess,
            formSuccess: result.message
          }));
          setCountdown(60);
          setIsCounting(true);
        } else {
          setIsOTPSent(false);
          setErrors((prevError) => ({
            ...prevError,
            formError: result.message
          }));
        }
      }
    } catch (error) {
      console.log('error', error);
    } finally {
      setLoading(false);
    }

  } //End of FUnction

  /*************************************************************
 * Function Name  : handleResetPassword
 * Purposs        : This function is used handle verify otp
 * Created Date   : 29-01-2024
 *************************************************************/
  const handleResetPassword = async () => {
    try {
      setLoading(true);
      if (!formData?.email) {
        setErrors((prevError) => ({
          ...prevError,
          email: 'Email is required.'
        }));
        return;
      } else if (!formData.otp) {
        setErrors((prevError) => ({
          ...prevError,
          otp: 'One Time Password is required.'
        }));
        return;
      } else if (!formData.new_password) {
        setErrors((prevError) => ({
          ...prevError,
          new_password: 'New Password is required.'
        }));
        return;
      } else if (!formData.confirm_password) {
        setErrors((prevError) => ({
          ...prevError,
          confirm_password: 'Confirm Password is required.'
        }));
        return;
      } else {
        if (formData.new_password === formData.confirm_password) {
          const options = { email: formData?.email, otp: formData.otp, password: formData.new_password }
          const result = await resetPassword(options);
          if (result.status === true) {
            navigate('/');
          } else {
            setErrors((prevError) => ({
              ...prevError,
              formError: "Something went wrong! Please try after some time."
            }));
          }
        } else {
          setErrors((prevError) => ({
            ...prevError,
            formError: "New password and confirm password both should be same."
          }));
        }

      }
    } catch (error) {
      setErrors((prevError) => ({
        ...prevError,
        formError: "error"
      }));
    } finally {
      setLoading(false);
    }
  } //End of Function

  /*************************************************************
   * Function Name  : handleEmailChange
   * Purposs        : This function is used for change email id
   * Created Date   : 08-01-2024
   *************************************************************/
  const handleEmailChange = async () => {
    //Empty OTP Input Box
    setFormData((preVal) => ({
      ...preVal,
      password: "",
      otp: "",
      new_password: "",
      confirm_password: ""
    }))
    setIsOTPSent(false);
    setCountdown(0);
    setIsCounting(false);
  } //End of Function

  /*************************************************************
  * Purposs        : This hooks is used for handle otp sent countdown
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
   * Purposs        : This hooks is used for handle key press on email input
   * Created Date   : 20-01-2024
   *************************************************************/
  // For Email
  const handleEmailKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleforgotPassword();
    }
  };
  //For Password
  const handlePasswordKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleforgotPassword();
    }
  };
  //For One Time Password
  const handleOtpKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleResetPassword();
    }
  };
  //End of Function

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-content">
          <div className="login-card">
            <div className="login-header">
              <div className="logo-section">
                <div className="logo-icon">🌱</div>
                <h1 className="logo-text">PGTI</h1>
                <p className="logo-subtitle">Admin Portal</p>
              </div>
            </div>
            <div className="login-form">
                {!isOTPSent && (<>
                  <div className="form-section">
                    <h2 className="form-title">Reset Password</h2>
                    <p className="form-subtitle">Enter your email to receive a verification code</p>
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
                      value={formData?.email || ''}
                      placeholder="Enter your email address"
                    />
                    {errors?.email && (
                      <span className="error-message">{errors?.email}</span>
                    )}
                  </div>

                  {errors?.formError && (
                    <div className="error-alert">
                      {errors?.formError}
                    </div>
                  )}

                  <button
                    type="button"
                    className="login-button"
                    onClick={handleforgotPassword}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="loading-spinner"></div>
                    ) : (
                      'Send OTP'
                    )}
                  </button>
                </>)}

                {isOTPSent && (<>
                  <div className="form-section">
                    <h2 className="form-title">Verify OTP</h2>
                    <p className="form-subtitle">Enter the verification code and set your new password</p>
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
                      onKeyDown={handleOtpKeyPress}
                      ref={inputRef.otp}
                      placeholder="Enter 6-digit code"
                      maxLength="6"
                    />
                    {errors?.otp && (
                      <span className="error-message">{errors?.otp}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="new_password">
                      New Password
                    </label>
                    <div className="password-input">
                      <input
                        type={showPassword.new_password ? "text" : "password"}
                        id="new_password"
                        name="new_password"
                        className={`form-input ${errors?.new_password ? 'error' : ''}`}
                        onChange={handleChange}
                        onKeyDown={handleOtpKeyPress}
                        ref={inputRef.new_password}
                        placeholder="Enter your new password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility('new_password')}
                      >
                        {showPassword.new_password ? (
                          <FontAwesomeIcon icon={faEyeSlash} />
                        ) : (
                          <FontAwesomeIcon icon={faEye} />
                        )}
                      </button>
                    </div>
                    {errors?.new_password && (
                      <span className="error-message">{errors?.new_password}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="confirm_password">
                      Confirm Password
                    </label>
                    <div className="password-input">
                      <input
                        type={showPassword.confirm_password ? "text" : "password"}
                        id="confirm_password"
                        name="confirm_password"
                        className={`form-input ${errors?.confirm_password ? 'error' : ''}`}
                        onChange={handleChange}
                        onKeyDown={handleOtpKeyPress}
                        ref={inputRef.confirm_password}
                        placeholder="Confirm your new password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility('confirm_password')}
                      >
                        {showPassword.confirm_password ? (
                          <FontAwesomeIcon icon={faEyeSlash} />
                        ) : (
                          <FontAwesomeIcon icon={faEye} />
                        )}
                      </button>
                    </div>
                    {errors?.confirm_password && (
                      <span className="error-message">{errors?.confirm_password}</span>
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
                          onClick={handleforgotPassword}
                        >
                          Resend Code
                        </button>
                      )}
                    </div>
                  </div>

                  {errors?.formError && (
                    <div className="error-alert">
                      {errors?.formError}
                    </div>
                  )}

                  <button
                    type="button"
                    className="login-button"
                    onClick={handleResetPassword}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="loading-spinner"></div>
                    ) : (
                      'Save Password'
                    )}
                  </button>
                </>)}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
