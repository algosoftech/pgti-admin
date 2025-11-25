const router = require('express').Router({
    caseSensitive   : true,
    strict          : true
});

const cartController = require('./cartControllers.js');
const optionalAuth = require("../../../../util/optionalAuth.js");
const {frontVerifyAPIKey} =require("../../../../util/authToken.js");

// Cart Routes - Support both authenticated and guest users
router.post('/add', frontVerifyAPIKey, optionalAuth, cartController.addToCart);
router.post('/list', frontVerifyAPIKey, optionalAuth, cartController.getCart);
router.post('/update', frontVerifyAPIKey, optionalAuth, cartController.updateCartItem);
router.post('/remove', frontVerifyAPIKey, optionalAuth, cartController.removeFromCart);
router.post('/clear', frontVerifyAPIKey, optionalAuth, cartController.clearCart);

// Migrate guest cart to user cart (requires authentication)
const authCheck = require("../../../../util/authCheck.js");
router.post('/migrate-guest-cart', frontVerifyAPIKey, authCheck, cartController.migrateGuestCart);

exports.router = router;

