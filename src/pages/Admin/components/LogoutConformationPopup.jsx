import React, { useState } from "react";
import { useNavigate } from "react-router-dom/dist";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";

import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";



import { logout } from "../../../controllers/accounts/Account"


const LogoutConformationPopup = ({ popUpOpen, togglePopUp }) => {
  const navigate = useNavigate();
  const handleCancel = () => {
    togglePopUp();
  };

  const handleConfirm = async () => {
    const res = await logout();
    if(res.status === true){
      navigate('/');
    } else{
      sessionStorage.clear();
      sessionStorage.clear();
      navigate('/');
    }
    
  };

  return (
    <Dialog
      open={popUpOpen}
      onClose={togglePopUp}
      maxWidth="md"
      PaperProps={{
        className: "myDialogPopUp",
      }}
    >
      <div className="myDrawer">
        <div className="myMainDrawerClass">
          <div>
            <h4 style={{textAlign : 'center'}}>Confirm</h4>
          </div>
        </div>
        <Typography
          variant="body1"
          component="div"
          className="my_delete_popup_paragraph"
          style={{textAlign : 'center'}}
        >
          <h5>Do you want to logout?</h5>
        </Typography>
        <DialogActions>
          <Button onClick={handleCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirm} style={{ color: "red" }}>
            Confirm
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  );
};

export default LogoutConformationPopup;
