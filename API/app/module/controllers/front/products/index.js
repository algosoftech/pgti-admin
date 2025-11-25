const router = require('express').Router({
    caseSensitive   : true,
    strict          : true
});

const productController = require('./productControllers.js');
const authCheck = require("../../../../util/authCheck.js");
const {frontVerifyAPIKey} = require("../../../../util/authToken.js")

router.post('/list', frontVerifyAPIKey, productController.list);
router.post('/details',frontVerifyAPIKey, productController.details);


exports.router = router;    