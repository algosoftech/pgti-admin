const router = require('express').Router({
    caseSensitive   : true,
    strict          : true
});

const eventsController = require('./eventsController');
const authCheck = require('../../../../util/authCheck')

router.post('/list', authCheck, eventsController.list);
router.post('/addeditdata', authCheck, eventsController.addEditData);
router.post('/change-status', authCheck, eventsController.changeStatus);
router.post('/delete', authCheck, eventsController.delete);

exports.router = router;    