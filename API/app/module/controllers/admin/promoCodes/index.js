const router = require('express').Router({
    caseSensitive   : true,
    strict          : true
});

const promoCodeController = require('./promoCodeController');
const authCheck = require('../../../../util/authCheck')

router.post('/list', authCheck, promoCodeController.list);
router.post('/addeditdata', authCheck, promoCodeController.addEditData);
router.post('/change-status', authCheck, promoCodeController.changeStatus);

exports.router = router;    