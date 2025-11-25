const _ = require("lodash");
const NodeException = require("node-exceptions");
const config = require('../util/responseMessageConfiguration');
const path = require('path');
//Services Exception
class ApplicationException extends NodeException.LogicalException {
    constructor(errorKey = "ERROR_SERVER_ERROR", messageVariables = {}) {
        super();

        const error   = config.get(`APP_MESSAGES:${errorKey}`);
        this.message  = _.template(error.message)(messageVariables);
        this.status   = error.statusCode;
        this.code     = error.errorCode;
        this.response = this.response || {};
    }
}

class ValidationErrorException extends ApplicationException {
    constructor(response = {}) {
        super("ERROR_VALIDATION");
        this.response = response;
    }
}

class UnsupportedServiceActionException extends ApplicationException {
    constructor() {
        super('ERROR_UNSUPPORTED_SERVICE');
    }
}

/*
 * Error Handler 
 */
const errorHandler = function (err, req, res, next) {
    let errResponse = {
        status       : false,
        statusMessage: err.message,
        statusCode   : err.code,
        response     : err.response
    };

    // writeLogError(['errorHandler', 'emitted', errResponse]);
    // return res.status(err.status || 500).json(errResponse);
    res.sendFile(path.join(__dirname, "..", "page/404.html"));
};

/*
 * Error Handler 
 */
const unknownRouteHandler = function (req, res, next) {
    return next(new UnsupportedServiceActionException);
};

module.exports = {
    ValidationErrorException: ValidationErrorException,
    errorHandler: errorHandler,
    unknownRouteHandler: unknownRouteHandler,
};