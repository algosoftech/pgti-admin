const router = require('express').Router({
    caseSensitive   : true,
    strict          : true
});

const articlesController = require('./articlesController');
const ingredientsController = require('./ingredientsController');
const {frontVerifyAPIKey} = require("../../../../util/authToken.js")

router.post('/list', frontVerifyAPIKey, articlesController.list);
router.post('/details', frontVerifyAPIKey, articlesController.details);

router.post('/ingredients/list', frontVerifyAPIKey, ingredientsController.list);

exports.router = router;

