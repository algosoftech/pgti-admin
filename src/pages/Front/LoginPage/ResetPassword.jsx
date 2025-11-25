import React, { useState, useEffect, useRef } from "react";
import "./LoginPage.css";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword, resetPassword } from '../../controllers/accounts/Account';

const LoginPage = () => {
  const navigate = useNavigate();
  const inputRef = {
    email: useRef(null),
    password: useRef(null)
  }
  const ADMINDATA = JSON.parse(sessionStorage.getItem("ADMIN-INFO"));
  const TOKEN = sessionStorage.getItem("TOKEN");

  const [formData, setFormData] = useState([]);
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [errors, setErrors] = useState('');
  const [success, setSuccess] = useState('');

  const [countdown, setCountdown] = useState(60);
  const [isCounting, setIsCounting] = useState(false);

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
    setErrors((...preError) => ({
      ...preError,
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
      if (!formData?.email) {
        setErrors((...preError) => ({
          ...preError,
          email: 'Email is required.'
        }));
      } else {
        const options = { email: formData?.email }
        const result = await forgotPassword(options)
        console.log('result', result)
        if (result.status) {
          setIsOTPSent(true);
          setSuccess((preSuccess) => ({
            ...preSuccess,
            formSuccess: result.message
          }));
          setCountdown(60);
          setIsCounting(true);
        } else {
          setIsOTPSent(false);
          setErrors((...preError) => ({
            ...preError,
            formError: result.message
          }));
        }
      }
    } catch (error) {
      console.log('error', error);
    }

  } //End of FUnction

  /*************************************************************
 * Function Name  : handleResetPassword
 * Purposs        : This function is used handle verify otp
 * Created Date   : 29-01-2024
 *************************************************************/
  const handleResetPassword = async () => {
    try {
      if (!formData?.email) {
        setErrors((...preError) => ({
          ...preError,
          email: 'Email is required.'
        }));
      } else if (!formData.otp) {
        setErrors((...preError) => ({
          ...preError,
          otp: 'One Time Password is required.'
        }));
      } else if (!formData.new_password) {
        setErrors((...preError) => ({
          ...preError,
          new_password: 'New Password is required.'
        }));
      } else if (!formData.confirm_password) {
        setErrors((...preError) => ({
          ...preError,
          confirm_password: 'Confirm Password is required.'
        }));
      } else {
        if (formData.new_password === formData.confirm_password) {
          const options = { email: formData?.email, otp: formData.otp, password: formData.new_password }
          const result = await resetPassword(options);
          if (result.status === true) {
            navigate('/');
          } else {
            setErrors((...preError) => ({
              ...preError,
              formError: "Somthing went wrong! Please try after some time."
            }));
          }
        } else {
          setErrors((...preError) => ({
            ...preError,
            formError: "New password and confirm password both should be same."
          }));
        }

      }
    } catch (error) {
      setErrors((...preError) => ({
        ...preError,
        formError: "error"
      }));
    }
  } //End of Function

  /*************************************************************
   * Function Name  : handleEmailChnage
   * Purposs        : This function is used for chnage email id
   * Created Date   : 08-01-2024
   *************************************************************/
  const handleEmailChnage = async () => {
    //Empty OTP Input Box
    setFormData((preVal) => ({
      ...preVal,
      password: "",
      otp: ""
    }))
    setIsOTPSent(false);
    setCountdown(0);
  } //End of Function

  /*************************************************************
  * Purposs        : This hooks is used for handle otp sent countdown
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
  // console.log('errors',errors?.formError)
  return (
    <section className="vh-100">
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-12 text-black" style={{background: "#eeeeee87"}}>
            <div className="d-flex align-items-center justify-content-center h-custom-2 px-5 ms-xl-4  pt-5 pt-xl-0 mt-xl-n5 frisbee_login_login">
              <form className="login_form_class" style={{ width: "23rem" }}>
              <div className="text-center">
                <img
                  src={`/logo.png`}
                  alt="Login image"
                  style={{ objectFit: "contain", objectPosition: "center", width:"35%" }}
                />
              </div>
                {!isOTPSent && (<>
                  <h3
                    className="fw-normal mb-3 pb-3 login_div"
                    style={{ letterSpacing: "1px", textAlign: "center" }}
                  >
                    Reset Password
                  </h3>
                  <div className="form-outline mb-4">
                    <label
                      className="form-label email_address_login"
                      htmlFor="email "
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-control form-control-lg input_login_page"
                      onKeyDown={handleEmailKeyPress}
                      onChange={handleChange}
                      value={formData?.email}
                    />
                    {errors?.email ? (<p style={{ color: "red" }}>{errors?.email}</p>) : ''}
                  </div>

                  <div className="pt-1 mb-4">
                    {errors?.formError ? (<p style={{ color: "red", textAlign: "center" }}>{errors?.formError}</p>) : ''}
                    <Link to={false} onClick={handleforgotPassword}>
                      <button
                        type="submit"
                        style={{
                          backgroundColor: "black",
                          color: "white",
                          borderRadius: "20px",
                        }}
                        className="btn btn-block mb-3 login_btn_btn"
                      >
                        Send OTP
                      </button>
                    </Link>
                  </div>
                </>)}

                {isOTPSent && (<>
                  <h3
                    className="fw-normal mb-0 pb-3 login_div"
                    style={{ letterSpacing: "1px", textAlign: "center" }}
                  >
                    Verify OTP
                  </h3>
                  {success?.formSuccess ? (<p style={{ color: "green", textAlign: "center" }}>{success?.formSuccess} <Link to={false} onClick={handleEmailChnage}>Change</Link></p>) : ''}

                  <div className="form-outline mb-2">
                    <label
                      className="form-label email_address_login"
                      htmlFor="otp"
                    >
                      OTP
                    </label>
                    <input
                      type="password"
                      id="otp"
                      name="otp"
                      className="form-control form-control-lg input_login_page"
                      onChange={handleChange}
                      onKeyDown={handleOtpKeyPress}
                      ref={inputRef.otp}
                    />
                    {errors?.otp ? (<p style={{ color: "red" }}>{errors?.otp}</p>) : ''}
                  </div>
                  <div className="form-outline mb-2">
                    <label
                      className="form-label email_address_login"
                      htmlFor="new_password"
                    >
                      New Password
                    </label>
                    <input
                      type="password"
                      id="new_password"
                      name="new_password"
                      className="form-control form-control-lg input_login_page"
                      onChange={handleChange}
                      onKeyDown={handleOtpKeyPress}
                      ref={inputRef.otp}
                    />
                    {errors?.new_password ? (<p style={{ color: "red" }}>{errors?.new_password}</p>) : ''}
                  </div>
                  <div className="form-outline mb-2">
                    <label
                      className="form-label email_address_login"
                      htmlFor="confirm_password"
                    >
                      New Password
                    </label>
                    <input
                      type="password"
                      id="confirm_password"
                      name="confirm_password"
                      className="form-control form-control-lg input_login_page"
                      onChange={handleChange}
                      onKeyDown={handleOtpKeyPress}
                      ref={inputRef.otp}
                    />
                    {errors?.confirm_password ? (<p style={{ color: "red" }}>{errors?.confirm_password}</p>) : ''}
                  </div>

                  <div class="row mb-2">
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
                            ) : (<></>)}
                          </label>
                        </div>
                      </div>
                      <div class="col" className="reset_login_page">
                        {isCounting ? (
                          <></>
                        ) : (<Link to={false} onClick={handleforgotPassword} className="reset_button"> Resend Password?</Link>)}
                      </div>
                    </div>
                  </div>
                  <div className="pt-1 mb-2">
                    {errors?.formError ? (<p style={{ color: "red" }}>{errors?.formError}</p>) : ''}
                    <Link to={false} onClick={handleResetPassword}>
                      <button
                        type="button"
                        style={{
                          backgroundColor: "black",
                          color: "white",
                          borderRadius: "20px",
                        }}
                        className="btn btn-block mb-3 login_btn_btn"
                      >
                        Save
                      </button>
                    </Link>
                  </div>
                </>)}

              </form>
            </div>
          </div>
          {/* <div className="col-sm-6 px-0 d-none d-sm-block">
            <img
              src={LoginPagePic}
              alt="Login image"
              className="w-100 vh-100"
              style={{ objectFit: "cover", objectPosition: "left" }}
            />
          </div> */}
        </div>
      </div>
    </section>
  );
}

export default LoginPage;
