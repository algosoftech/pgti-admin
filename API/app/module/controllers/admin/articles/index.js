const router = require('express').Router({
    caseSensitive   : true,
    strict          : true
});

const articlesController = require('./articlesController');
const authCheck = require('../../../../util/authCheck')

router.post('/list', authCheck, articlesController.list);
router.post('/addeditdata', authCheck, articlesController.addEditData);
router.post('/change-status', authCheck, articlesController.changeStatus);
router.post('/delete', authCheck, articlesController.delete);

const ingredientsController = require('./ingredientsController');
router.post('/ingredients/list', authCheck, ingredientsController.list);
router.post('/ingredients/addeditdata', authCheck, ingredientsController.addEditData);
router.post('/ingredients/change-status', authCheck, ingredientsController.changeStatus);
router.post('/ingredients/delete', authCheck, ingredientsController.delete);

exports.router = router;    