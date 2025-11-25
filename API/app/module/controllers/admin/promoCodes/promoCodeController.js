const response = require('../../../../util/response');
const commonServices = require("../../../services/commonServices");
const { getIpAddress, createSlug } = require("../../../../util/utility"); 
const moment = require('moment');
/*********************************************************************************
 * Function Name    :   list
 * Purpose          :   This function is used for data list
 * Created Data     :   08-11-2025
 ********************************************************************************/
exports.list = async function (req, res) {
    try {
        const userId = req.user.userId;
        const {type = "", condition, select, skip, limit } = req.body;
        if(!userId){
            return response.sendResponse(res, response.build("PERMISSION_ERROR", { }));
        } else{
            const where = {
                type : type,
                condition : {
                    ...condition,
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
                    }
                }
                const count = await commonServices.select(option, 'promo_codes');
                return response.sendResponse(res, response.build("SUCCESS", { result , ...{count : count || 0} }));
            } else{
                return response.sendResponse(res, response.build("SUCCESS", { result }));
            }
        }
    } catch (error) {
        console.log('error',error)
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
    }
}; //End of Function

/*********************************************************************************
 * Function Name    :   addEditData
 * Purpose          :   This function is used for add/edit data
 * Created Data     :   08-11-2025
 ********************************************************************************/
exports.addEditData = async function (req, res) {
    try {
        const userId = req.user.userId;
        const {editId, code, title, description, discount, discount_type, max_cap, min_cap, eligible_amount, start_date, end_date} = req.body;
        if(!code){
            return response.sendResponse(res, response.build("CODE_EMPTY", { }));
        } else if(!title){
            return response.sendResponse(res, response.build("TITLE_EMPTY", { }));
        } else if(!description){
            return response.sendResponse(res, response.build("DESCRIPTION_EMPTY", { }));
        } else if(!discount){
            return response.sendResponse(res, response.build("DISCOUNT_EMPTY", { }));
        } else if(!discount_type){
            return response.sendResponse(res, response.build("DISCOUNT_TYPE_EMPTY", { }));
        } else if(!max_cap){
            return response.sendResponse(res, response.build("MAX_CAP_EMPTY", { }));
        } else if(!min_cap){
            return response.sendResponse(res, response.build("MIN_CAP_EMPTY", { }));
        } else if(!eligible_amount){
            return response.sendResponse(res, response.build("ELIGIBLE_AMOUNT_EMPTY", { }));
        } else if(!start_date){
            return response.sendResponse(res, response.build("START_DATE_EMPTY", { }));
        } else if(!end_date){
            return response.sendResponse(res, response.build("END_DATE_EMPTY", { }));
        } else{
            const ipAddress = await getIpAddress(req);
            const promoCode = code.toUpperCase();
            const params = {
                code            : promoCode, 
                ...(title       && { title          : title}), 
                ...(description && { description    : description}), 
                discount        : discount, 
                discount_type   : discount_type, 
                max_cap         : max_cap, 
                min_cap         : min_cap, 
                eligible_amount : eligible_amount, 
                start_date      : moment(start_date).format("YYYY-MM-DD HH:mm:ss"),
                end_date        : moment(end_date).format("YYYY-MM-DD HH:mm:ss")
            }
            if(!editId) {
                const where = {
                    type : "count",
                    condition : { code : promoCode }
                }
                const dataCount = await commonServices.select(where, 'promo_codes');
                if(dataCount > 0){
                    return response.sendResponse(res, response.build("ERROR_ALREADY_EXIST", {  }));
                } else{
                    const insertParam = {
                        ...params,
                        status : "A",
                        created_at : moment().format('YYYY-MM-DD HH:mm:ss'),
                        created_ip : ipAddress,
                        created_by : userId
                    }
                    const result = await commonServices.insert(insertParam, 'promo_codes');
                    return response.sendResponse(res, response.build("SUCCESS", { result }));
                }
            } else {
                const where = {
                    type : "count",
                    condition : {
                        id : parseInt(editId)
                    }
                }
                const dataCount = await commonServices.select(where, 'promo_codes');
                if(dataCount > 0){
                    const updateParam = {
                        condition : { id  : parseInt(editId)},
                        data : {
                            ...params,
                            updated_at : moment().format('YYYY-MM-DD HH:mm:ss'),
                            updated_ip : ipAddress,
                            updated_by : userId
                        }
                    }
                    const result = await commonServices.update(updateParam, 'promo_codes');
                    return response.sendResponse(res, response.build("SUCCESS", { result }));
                } else{
                    return response.sendResponse(res, response.build("ERROR_ALREADY_EXIST", {  }));
                }
            }
        }
    } catch (error) {
        console.log('error',error)
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
    }
}; //End of Function  
/*********************************************************************************
 * Function Name    :   changeStatus
 * Purpose          :   This function is used for change status
 * Created Data     :   08-11-2025
 ********************************************************************************/
exports.changeStatus = async function (req, res) {
    try {
        const userId = req.user.userId;
        const {editId, status } = req.body;
        if(!userId){
            return response.sendResponse(res, response.build("PERMISSION_ERROR", { }));
        } else{
            const ipAddress = await getIpAddress(req);
            const updateParam = {
                condition : { id : parseInt(editId) },
                data : { 
                    status : status,
                    updated_ip : ipAddress,
                    updated_by : userId
                }
            }
            const result = await commonServices.update(updateParam, 'promo_codes');
            return response.sendResponse(res, response.build("SUCCESS", { result : result[0] }));
        } 
    } catch (error) {
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
    }
}//End of Function
