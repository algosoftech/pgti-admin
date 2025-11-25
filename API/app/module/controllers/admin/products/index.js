const router = require('express').Router({
    caseSensitive   : true,
    strict          : true
});

const productsController = require('./productsController');
const authCheck = require('../../../../util/authCheck')

router.post('/list', authCheck, productsController.list);
router.post('/addeditdata', authCheck, productsController.addEditData);
router.post('/change-status', authCheck, productsController.changeStatus);

exports.router = router;    