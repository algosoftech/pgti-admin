import React from "react";
import Dialog from "@mui/material/Dialog";
import { Typography } from "antd";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-regular-svg-icons';  
import { Link } from "react-router-dom";
import {faExclamationCircle } from "@fortawesome/free-solid-svg-icons";


const ConfirmPopup = ({ popUpOpen, togglePopUp, process, text="" }) => {
  const handleCancel = () => togglePopUp();
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission
    try {
      process();
      togglePopUp();
    } catch (error) {
      
    }
  };

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
         
          <Link to={false} style={{ position: "absolute", right: 8, top: 8, color: "#dd5151", fontSize : '2rem' }} onClick={handleCancel}>
            <FontAwesomeIcon icon={faTimesCircle} />
          </Link>
        </div>

        <Typography variant="body1" component="div" className="my_delete_popup_paragraph">
          <div className="container-fluid">
            <div className="categories_open_popup_main_contnet">
              <form onSubmit={handleSubmit}>
                <div className="form-group row">
                  <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12" style={{textAlign : "center"}}>
                      <label for="select_name" className="all_lable_for_vendor_dashbaord" > <FontAwesomeIcon icon={faExclamationCircle} style={{color : "gray", fontSize : "5rem"}} /></label>
                      <h1 for="select_name" className="all_lable_for_vendor_dashbaord" > {text || "Aye you sure?"} </h1>
                  </div>
  

                  <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                    <div className="inventory_open_popup_action_btn" style={{justifyContent : "center"}}>
                      <button type="submit" className="btn btn-danger">Yes</button>
                      <button type="button" className="btn btn-light categories_cancel_button" onClick={handleCancel}>No</button>
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

export default ConfirmPopup;
