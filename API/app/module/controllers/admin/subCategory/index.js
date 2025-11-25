const router = require('express').Router({
    caseSensitive   : true,
    strict          : true
});

const categoryController = require('./categoryController');
const authCheck = require('../../../../util/authCheck')

router.post('/list', authCheck, categoryController.list);
router.post('/addeditdata', authCheck, categoryController.addEditData);
router.post('/change-status', authCheck, categoryController.changeStatus);

exports.router = router;    