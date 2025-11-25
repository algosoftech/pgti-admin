const router = require('express').Router({
    caseSensitive   : true,
    strict          : true
});

const usersController = require('./usersController');
const authCheck = require('../../../../util/authCheck')

router.post('/list', authCheck, usersController.list);
router.post('/addeditdata', authCheck, usersController.addEditData);
router.post('/change-status', authCheck, usersController.changeStatus);


exports.router = router;    