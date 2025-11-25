const router = require('express').Router({
    caseSensitive   : true,
    strict          : true
});


const commonController = require("./commonControllers.js");

const authCheck = require("../../../../util/authCheck.js");
const { frontVerifyAPIKey } = require("../../../../util/authToken.js");

router.post('/get-home-content', frontVerifyAPIKey, commonController.getBanners);

router.post('/get-banners', frontVerifyAPIKey, commonController.getBanners);
router.post('/get-categories', frontVerifyAPIKey, commonController.getCategories);
router.post('/get-sub-categories', frontVerifyAPIKey, commonController.getSubCategories);

router.post('/contact-us', frontVerifyAPIKey, commonController.contactUs);
router.post('/contact-shop', frontVerifyAPIKey, commonController.contactShopList);
router.post('/faqs', frontVerifyAPIKey, commonController.getFaqs);

exports.router = router;    