const router = require('express').Router({
    caseSensitive   : true,
    strict          : true
});

const accountsController = require('./accountController');
const authCheck = require('../../../../util/authCheck')

router.post('/login', accountsController.login);
router.post('/verify-otp', accountsController.verifyOTP);
router.post('/forgot-password', accountsController.forgotPassword);
router.post('/reset-password', accountsController.resetPassword);

router.post('/sub-admin/list', authCheck, accountsController.getSubAdmin);
router.post('/sub-admin/permission', authCheck, accountsController.getPermission);
router.post('/sub-admin/addeditdata', authCheck, accountsController.addEditSubAdmin);
router.post('/sub-admin/changeStatus', authCheck, accountsController.changeSubAdminStatus);

exports.router = router;    