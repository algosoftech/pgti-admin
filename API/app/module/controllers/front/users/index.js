const router = require('express').Router({
    caseSensitive   : true,
    strict          : true
});

const accountsController = require('./usersControllers.js');
const addressController = require("./addressControllers.js")
const familyController = require("./familyControllers.js")
const authCheck = require("../../../../util/authCheck.js");

router.post('/login', accountsController.login);
router.post('/verify-otp', accountsController.verifyOtp);
router.post('/get-profile', authCheck, accountsController.getProfileData);
router.post('/update-profile', authCheck, accountsController.updateProfileData);
router.post('/logout', authCheck, accountsController.logout);

// User's Address
router.post('/address/list', authCheck, addressController.list);
router.post('/address/addeditdata', authCheck, addressController.addEditData);
router.post('/address/change-status', authCheck, addressController.changeStatus);
router.post('/address/mark-as-default', authCheck, addressController.markDefaultAddress);

//Family Member
router.post('/family/list', authCheck, familyController.list);
router.post('/family/send-request', authCheck, familyController.sendRequest);
router.post('/family/accept-request', authCheck, familyController.acceptRequest);
router.post('/family/reject-request', authCheck, familyController.rejectRequest);


exports.router = router;    