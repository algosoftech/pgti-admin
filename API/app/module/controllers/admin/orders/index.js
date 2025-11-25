const router = require('express').Router({
    caseSensitive   : true,
    strict          : true
});

const orderControllers = require('./orderControllers');
const authCheck = require('../../../../util/authCheck')

router.post('/list', authCheck, orderControllers.list);

exports.router = router;    