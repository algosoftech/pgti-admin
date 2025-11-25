import React, { useState, useEffect, useRef } from "react";
import Dialog from "@mui/material/Dialog";
import { Typography } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-regular-svg-icons";
import { Link } from "react-router-dom";
import { notification } from "antd";
import {
  faCheckCircle,
  faExclamationCircle,
  faUserLock,
} from "@fortawesome/free-solid-svg-icons";
import { sentReVerifyOtp, verifyOtp } from "../controllers/accounts/Account";

const OtpConfirmPopup = ({ popUpOpen, togglePopUp, setTwoFactorVerify }) => {
  const handleCancel = () => togglePopUp();
  const [countdown, setCountdown] = useState(60);
  const [isCounting, setIsCounting] = useState(false);
  const otpRef = useRef(null);
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission
    try {
      const formData = new FormData(e.target);
      const otp = formData.get('otp');
      const res = await verifyOtp({otp : otp});
      if(res.status === true){
        notification.open({
          message: "Success",
          description: `User verify successfully. Please continue you task.`,
          placement: "topRight",
          icon: (
            <FontAwesomeIcon
              icon={faCheckCircle}
              style={{ color: "green" }}
            />
          ),
          duration: 2,
        });
        setTwoFactorVerify(true);
        togglePopUp();

      } else{
        // console.log('Wrong otp.')
        notification.open({
          message: "Oops!",
          description: `Entered OTP is expired/wrong. Please try again.`,
          placement: "topRight",
          icon: (
            <FontAwesomeIcon
              icon={faExclamationCircle}
              style={{ color: "red" }}
            />
          ),
          duration: 2,
        });
      }
    } catch (error) {}
  };

  const handleResendOtp = async () => {
    try {
      const res = await sentReVerifyOtp();
      if(res.status === true){
        notification.open({
          message: "Success",
          description: `One Time Password (OTP) is sent successfully.`,
          placement: "topRight",
          icon: (
            <FontAwesomeIcon
              icon={faCheckCircle}
              style={{ color: "green" }}
            />
          ),
          duration: 2,
        });
        setCountdown(60);
        setIsCounting(true);
      } else{
        notification.open({
          message: "Oops!",
          description: `${res?.message}`,
          placement: "topRight",
          icon: (
            <FontAwesomeIcon
              icon={faExclamationCircle}
              style={{ color: "red" }}
            />
          ),
          duration: 2,
        });
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(()=>{
    if(popUpOpen === true && isCounting === false){
      sentReVerifyOtp();
      setCountdown(60);
      setIsCounting(true);
    }
  },[popUpOpen]);

/*************************************************************
 * Purpose        : This hooks is used for handle otp sent countdown
 * Created Date   : 01-05-2025
 *************************************************************/
  useEffect(() => {
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


  return (
    <Dialog
      open={popUpOpen}
      onClose={handleCancel}
      fullWidth={false}
      maxWidth={"sm"}
      PaperProps={{
        className: "myDialogPopUp",
      }}
    >
      <div className="myDrawer">
        <div className="inventory_popup_title">
          <Link
            to={false}
            style={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "#dd5151",
              fontSize: "2rem",
            }}
            onClick={handleCancel}
          >
            <FontAwesomeIcon icon={faTimesCircle} />
          </Link>
        </div>

        <Typography
          variant="body1"
          component="div"
          className="my_delete_popup_paragraph"
        >
          <div className="container-fluid">
            <div className="categories_open_popup_main_contnet">
              <form onSubmit={handleSubmit}>
                <div className="form-group row">
                  <div
                    className="col-lg-12 col-md-12 col-sm-12 col-xs-12"
                    style={{ textAlign: "center" }}
                  >
                    <label
                      for="select_name"
                      className="all_lable_for_vendor_dashbaord"
                    >
                      {" "}
                      <FontAwesomeIcon
                        icon={faUserLock}
                        style={{ color: "gray", fontSize: "5rem" }}
                      />
                    </label>
                    <h4
                      for="select_name"
                      className="all_lable_for_vendor_dashbaord"
                    >
                      {" "}
                      For your security, please verify your identity by entering
                      the OTP sent to your registered email.{" "}
                    </h4>
                  </div>

                  <div
                    className="col-lg-12 col-md-12 col-sm-12 col-xs-12"
                    style={{ textAlign: "center" }}
                  >
                    <input
                      type="number"
                      name="otp"
                      id="otp"
                      ref={otpRef}
                      className="form-control store_input_field"
                      placeholder="Enter your One Time Password (OTP)"
                    />
                  </div>

                  <div
                    className="col-lg-12 col-md-12 col-sm-12 col-xs-12"
                    style={{ textAlign: "center" }}
                  >
                    <label
                      for="select_name"
                      className="all_lable_for_vendor_dashbaord"
                    >
                      {" "}
                      Didn't receive the code? {isCounting ? (<Link>[ Resend OTP in {countdown ? countdown : 0} ]</Link>):(<Link to={`#`} onClick={handleResendOtp}>[ Resend OTP ]</Link>)}
                    </label>
                  </div>

                  <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                    <div
                      className="inventory_open_popup_action_btn"
                      style={{ justifyContent: "center" }}
                    >
                      <button type="submit" className="btn btn-danger">
                        Submit
                      </button>
                      <button
                        type="button"
                        className="btn btn-light categories_cancel_button"
                        onClick={handleCancel}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </Typography>
      </div>
    </Dialog>
  );
};

export default OtpConfirmPopup;
