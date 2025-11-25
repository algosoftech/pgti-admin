const _ = require("lodash");
const authToken = require("./authToken");
const response = require("./response");

const adminUser = require('../module/services/adminService');
const commonServices = require('../module/services/commonServices');

/**
 * Optional authentication middleware - allows both authenticated and guest users
 * If token is provided and valid, sets req.user
 * If no token or invalid token, allows request to proceed without req.user
 * @param {Request} req request
 * @param {Response} res response
 * @param {Function} next next middleware
 */
module.exports = async function optionalAuth(req, res, next) {
  try {
    const token = req.get("authToken") || req.query["authToken"];
    
    // If no token, allow as guest user
    if (_.isNil(token) || token.length < 1) {
      return next();
    }

    try {
      const decodedToken = await authToken.verifyAuthToken(token);
      const user = decodedToken.data;
      
      if (!user) {
        // Invalid token, but allow as guest
        return next();
      }

      if(user.userType === 'Super Admin'){
        const userData = await adminUser.getUserById(user.userId);
        if(userData && userData?.token === token){
          user.email      = userData.email;
          user.userType   = userData.admin_type;
          user.phone      = userData.phone;
          user.data       = userData;
          _.set(req, "user", user);
        }
      } else if(user.userType === 'Users'){
        const userData = await commonServices.getUsersById(user.userId);
        if(userData && userData?.token === token){
          user.email      = userData.email;
          user.userType   = 'Users';
          user.phone      = userData.phone;
          user.data       = userData;
          _.set(req, "user", user);
        }
      }
    } catch (tokenError) {
      // Token verification failed, but allow as guest
      console.log('Optional auth token error:', tokenError.message);
    }
    
    next();
  } catch (error) {
    // Any error, allow as guest
    console.log('Optional auth error:', error);
    next();
  }
};

