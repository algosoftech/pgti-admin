const jwt = require("jsonwebtoken");
const moment = require("moment");
const util = require("util");
const response = require("./response");
// const errors = require("./errors");
/**
 * Generate and save a new auth token for user.
 * @param {number} userId user id
 * @param {string} modelName model name
 * @param {string} issuer issuer
 * @param {date} expiresIn expiry time
 */
async function generateToken(userId, modelName, issuer, expiresIn) {
    const sign = util.promisify(jwt.sign);
    const options = {},
        authSecret = process.env.authTokenSecret;
    options["expiresIn"] = expiresIn;
    options["issuer"] = issuer;
    const createdAt = moment();
    return await sign(
        {
            data: {
                userId: userId,
                userType: modelName,
                createdAt: createdAt
            }
            // expiry must be set by options
        },
        authSecret,
        options
    );
}

/**
 * Refresh the auth token.
 * @param {*} oldAuthToken - old auth token
 * @param {String} issuer - issuer name
 * @param {string} expiresIn - expiresIn value and must be in jwt's expiresIn value format.
 * @returns resolve promise with new authtoken.
 */
async function refreshAuthToken(oldAuthToken, issuer, expiresIn) {
    const decodedToken = await verifyAuthToken(oldAuthToken, issuer);
    const data = decodedToken.data;
    const userId = data.userId;
    const modelName = data.userType;
    return await generateToken(userId, modelName, issuer, expiresIn);
}

/**
 * @param authToken - user's auth token
 * @param {String} issuer - issuer name
 * @returns decoded token promise
 * @throws INVALID_AUTH error
 */
async function verifyAuthToken(authToken, issuer) {
    const verify = util.promisify(jwt.verify),
        authSecret = process.env.authTokenSecret;
    try {
        return await verify(authToken, authSecret, { issuer: issuer });
    } catch (e) {
        const detail =
      e.name == "TokenExpiredError"
          ? "Token is expired."
          : "Auth token is invalid.";
          //throw new Error("UNAUTHORIZED");
       // throw errors.UNAUTHORIZED(detail);
       return false;
    }
}
/**
 *  @type {verifyAuthToken}
 */

/**
 * Middleware to verify Front-End API Key
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
async function frontVerifyAPIKey(req, res, next) {
  try {
    const accessKey = req.get("api-key") || req.query["api-key"];
    if (!accessKey || accessKey.trim().length === 0) {
      return response.sendResponse(
        res,
        response.build("UNAUTHORIZED", { error: "API-KEY is required" })
      );
    }
    const API_KEY = process.env.FRONT_API_KEY;

    if (API_KEY === accessKey) {
      return next();
    } else {
      return response.sendResponse(
        res,
        response.build("UNAUTHORIZED", { error: "Invalid or Expired API-KEY" })
      );
    }
  } catch (e) {
    console.error("API Key verification failed:", e);
    return response.sendResponse(
      res,
      response.build("UNAUTHORIZED", { error: "Invalid or Expired API-KEY" })
    );
  }
}

async function adminVerifyAPIKey(req, res, next) {
  try {
    const accessKey = req.get("api-key") || req.query["api-key"];
    if (!accessKey || accessKey.trim().length === 0) {
      return response.sendResponse(
        res,
        response.build("UNAUTHORIZED", { error: "API-KEY is required" }, false)
      );
    }
    const API_KEY = process.env.SITE_ADMIN_API_KEY;

    if (API_KEY === accessKey) {
      return next();
    } else {
      return response.sendResponse(
        res,
        response.build("UNAUTHORIZED", { error: "Invalid or Expired API-KEY" },false)
      );
    }
  } catch (e) {
    console.error("API Key verification failed:", e);
    return response.sendResponse(
      res,
      response.build("UNAUTHORIZED", { error: "Invalid or Expired API-KEY" }, false)
    );
  }
}


module.exports = {
    generateToken: generateToken,
    verifyAuthToken: verifyAuthToken,
    refreshAuthToken: refreshAuthToken,
    frontVerifyAPIKey : frontVerifyAPIKey,
    adminVerifyAPIKey : adminVerifyAPIKey
};
