const router = require('express').Router({
    caseSensitive   : true,
    strict          : true
});

const authCheck = require('../../../../util/authCheck')

//Banners Routes
const bannerController = require('./bannerController');
router.post('/banner/list', authCheck, bannerController.list);
router.post('/banner/addeditdata', authCheck, bannerController.addEditData);
router.post('/banner/change-status', authCheck, bannerController.changeStatus);
//End Banner Routes

//FAQ Routes
const faqController = require('./faqController');
router.post('/faq/list', authCheck, faqController.list);
router.post('/faq/addeditdata', authCheck, faqController.addEditData);
router.post('/faq/change-status', authCheck, faqController.changeStatus);
router.post('/faq/delete', authCheck, faqController.delete);
//End FAQ Routes

//Contact Shop Routes
const contactShopController = require('./contactShopController');
router.post('/contact-shop/list', authCheck, contactShopController.list);
router.post('/contact-shop/addeditdata', authCheck, contactShopController.addEditData);
router.post('/contact-shop/change-status', authCheck, contactShopController.changeStatus);
router.post('/contact-shop/delete', authCheck, contactShopController.delete);
//End Contact Shop Routes

exports.router = router;    