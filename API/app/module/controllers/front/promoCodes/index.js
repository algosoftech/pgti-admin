const router = require('express').Router({
    caseSensitive   : true,
    strict          : true
});

const promocodesControllers = require('./promocodesControllers.js');
const authCheck = require("../../../../util/authCheck.js");
const {frontVerifyAPIKey} = require("../../../../util/authToken.js")

router.post('/list', frontVerifyAPIKey, promocodesControllers.list);
router.post('/validate', authCheck, promocodesControllers.validatePromoCode);


exports.router = router;    