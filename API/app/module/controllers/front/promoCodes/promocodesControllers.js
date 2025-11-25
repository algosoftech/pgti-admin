const response = require('../../../../util/response');
const commonServices = require("../../../services/commonServices");
const moment = require('moment');

/*********************************************************************************
* Function Name     :   list
 * Purpose          :   This function is used for data list
 * Created Data     :   04-11-2025
 ********************************************************************************/
exports.list = async function (req, res) {
    try {
        const {type = "", condition, select, skip, limit } = req.body;
        const where = {
            type : type,
            condition : {
                ...condition,
                status : "A"
            },
            select : select || '*',
            skip : skip || 0,
            limit : limit || 10
        }
        const result = await commonServices.select(where, 'promo_codes');
        if(result && result?.length > 0){
            const option = {
                type : "count",
                condition : {
                    ...condition,
                    status : "A"
                }
            }
            const count = await commonServices.select(option, 'promo_codes');
            return response.sendResponse(res, response.build("SUCCESS", { result , ...{count : count || 0} }, false));
        } else{
            return response.sendResponse(res, response.build("SUCCESS", { result }, false));
        }
    } catch (error) {
        console.log('error',error)
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }, false));
    }
}; //End of Function
/*********************************************************************************
* Function Name     :   details
 * Purpose          :   This function is used for details data 
 * Created Data     :   04-11-2025
 ********************************************************************************/
exports.validatePromoCode = async function (req, res) {
    try {
        const { promo_code } = req.body;
        if(!promo_code){
            return response.sendResponse(res, response.build("PROMO_CODE_EMPTY", { }, false));
        } else{
            const where = {
                type : "single",
                condition : { code : promo_code.toUpperCase(), status : "A" }
            }
            const result = await commonServices.select(where, 'promo_codes');
            return response.sendResponse(res, response.build("SUCCESS", {result : result }, false));
        }
    } catch (error) {
        console.log('error',error)
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }, false));
    }
}; //End of Function
