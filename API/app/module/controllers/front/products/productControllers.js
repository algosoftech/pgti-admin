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
            },
            select : select || '*',
            skip : skip || 0,
            limit : limit || 10
        }
        const result = await commonServices.select(where, 'products_with_variants');
        if(result && result?.length > 0){
            const option = {
                type : "count",
                condition : {
                    ...condition,
                }
            }
            const count = await commonServices.select(option, 'products_with_variants');
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
exports.details = async function (req, res) {
    try {
        const { product_id } = req.body;
        if(!product_id){
            return response.sendResponse(res, response.build("PERMISSION_ERROR", { }, false));
        } else{
            const where = {
                type : "single",
                condition : {
                    id : parseInt(product_id),
                    status : "A"
                },
                // select : '*'
            }
            const products = await commonServices.select(where, 'products');
            if(products){
                const option = {
                    condition : { product : parseInt(product_id), status : "A" }
                }
                const variants = await commonServices.select(option, 'products_variants');
                return response.sendResponse(res, response.build("SUCCESS", {products, variants }, false));
            } else{
                return response.sendResponse(res, response.build("SUCCESS", { products }, false));
            }
        }
    } catch (error) {
        console.log('error',error)
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }, false));
    }
}; //End of Function
