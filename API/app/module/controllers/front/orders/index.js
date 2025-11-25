const router = require('express').Router({
    caseSensitive   : true,
    strict          : true
});

const orderController = require('./orderControllers.js');
const authCheck = require("../../../../util/authCheck.js");
const {frontVerifyAPIKey} = require("../../../../util/authToken.js");

// Order Routes - Requires authentication
router.post('/create', frontVerifyAPIKey, authCheck, orderController.createOrder);
router.post('/change-status', frontVerifyAPIKey, authCheck, orderController.changeStatus);
router.post('/list', frontVerifyAPIKey, authCheck, orderController.list);
router.post('/details', frontVerifyAPIKey, authCheck, orderController.details);

exports.router = router;

