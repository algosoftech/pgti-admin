const _ = require("lodash");
const authToken = require("./authToken");
const response = require("./response");

const adminUser = require('../module/services/adminService');
const commonServices = require('../module/services/commonServices');
/**
 * Perform auth toke check, adds user to request on success
 * @param {Request} req request
 * @param {Response} res response
 */
module.exports = async function authorize(req, res, next) {
  try {
    const token = req.get("authToken") || req.query["authToken"];
    if (_.isNil(token) || token.length < 1) {
      return response.sendResponse(res,response.build("UNAUTHORIZED", { error: "Auth Token is required" }, false));
    }

    const decodedToken = await authToken.verifyAuthToken(token);
    // let userToken = await userCache.getToken([decodedToken.data.userId]);
    const user = decodedToken.data;
    if (!user) {
      return response.sendResponse(res,response.build("UNAUTHORIZED", { error: "Invalid or Expired Token" }, false));
    }
    if(user.userType === 'Super Admin'){
      const userData = await adminUser.getUserById(user.userId);
      if(userData && userData?.token === token){
        user.email      = userData.email;
        user.userType   = userData.admin_type;
        user.phone      = userData.phone;
        user.data       = userData;
      } else{
        return response.sendResponse(res,response.build("UNAUTHORIZED", { error: "Invalid or Expired Token" }, false));  
      }
    } else if(user.userType === 'Users'){
      const userData = await commonServices.getUsersById(user.userId);
      if(userData && userData?.token === token){
        user.email      = userData.email;
        user.userType   = 'Users';
        user.phone      = userData.phone;
        user.data       = userData;
      } else{
        return response.sendResponse(res,response.build("UNAUTHORIZED", { error: "Invalid or Expired Token" }, false));  
      }
    } else {
      return response.sendResponse(res,response.build("UNAUTHORIZED", { error: "Invalid or Expired Token" }, false));
    }
    _.set(req, "user", user);
    next();
  } catch (error) {
    console.log(error)
    return response.sendResponse(
      res,
      response.build("UNAUTHORIZED", { error: "Invalid or Expired Token" }, false)
    );
  }
};
