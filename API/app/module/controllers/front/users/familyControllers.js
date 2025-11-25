const response = require('../../../../util/response');
const commonServices = require("../../../services/commonServices");
const moment = require('moment');
const { getIpAddress } = require("../../../../util/utility");

/*********************************************************************************
 * Function Name    :   list
 * Purpose          :   This function is used for data list
 * Created Data     :   04-11-2025
 ********************************************************************************/
exports.list = async function (req, res) {
    try {
        const userId = req.user.userId;
        const userPhone = req.user.phone;
        const {type = "", condition, select, skip, limit } = req.body;
        if(!userId){
            return response.sendResponse(res, response.build("PERMISSION_ERROR", { }, false));
        } else{
            const where = {
                type : type,
                condition : {
                    ...condition,
                    bind_with : parseInt(userId)
                },
                select : select || '*',
                skip : skip || 0,
                limit : limit || 10
            }
            const result = await commonServices.select(where, 'users');

            const requestWhere = {
                condition : { phone : userPhone, status : "P" }
            }
            const request = await commonServices.select(requestWhere, 'family_request');

            if(result && result?.length > 0){
                const option = {
                    type : "count",
                    condition : {
                        ...condition,
                        bind_with : parseInt(userId)
                    }
                }
                const count = await commonServices.select(option, 'users');
                return response.sendResponse(res, response.build("SUCCESS", { result , ...{count : count || 0}, request }, false));
            } else{
                return response.sendResponse(res, response.build("SUCCESS", { result, request }, false));
            }
        }
    } catch (error) {
        console.log('error',error)
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }, false));
    }
}; //End of Function

/*********************************************************************************
 * Function Name    :   sendRequest
 * Purpose          :   This function is used for send family request
 * Created Data     :   10-11-2025
 ********************************************************************************/
exports.sendRequest = async function (req, res) {
    try {
        const userId = req.user.userId;
        const {name, phone, email, relation} = req.body;
        if(!name){
            return response.sendResponse(res, response.build("NAME_EMPTY", { }, false));
        } else if(!phone){
            return response.sendResponse(res, response.build("PHONE_EMPTY", { }, false));
        } else if(!relation){
            return response.sendResponse(res, response.build("RELATION_EMPTY", { }, false));
        } else{
            let bind_with_user_id = null;
            //findUser by phone
            const user = await commonServices.select({
                type : "single",
                condition : { phone : phone },
                select : ['id']
            }, 'users');
            bind_with_user_id = user?.id;
            
            const ipAddress = await getIpAddress(req);
            const params = {
                user_id : bind_with_user_id ? parseInt(bind_with_user_id) : null,
                name : name,
                phone : phone,
                email : email || "",
                relation : relation,
                status : "P",
                created_at : moment().format('YYYY-MM-DD HH:mm:ss'),
                created_ip : ipAddress,
                created_by : userId
            }
            const result = await commonServices.insert(params, 'family_request');
            return response.sendResponse(res, response.build("SUCCESS", { result }, false));
        }
    } catch (error) {
        console.log('error',error)
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }, false));
    }
};

/*********************************************************************************
 * Function Name    :   acceptRequest
 * Purpose          :   This function is used for accept family request
 * Created Data     :   10-11-2025
 ********************************************************************************/
exports.acceptRequest = async function (req, res) {
    try {
        const userId = req.user.userId;
        const {request_id} = req.body;
        if(!request_id){
            return response.sendResponse(res, response.build("REQUEST_ID_EMPTY", { }, false));
        } else{
            const ipAddress = await getIpAddress(req);
            const params = {
                condition : { id : parseInt(request_id) },
                data : {
                    user_id : userId,
                    status : "A",
                    updated_at : moment().format('YYYY-MM-DD HH:mm:ss'),
                    updated_ip : ipAddress,
                    updated_by : userId
                }
            }
            const result = await commonServices.update(params, 'family_request');
            if(result && result?.length > 0){
                //update bind_id in users table
                const updateParam = {
                    condition : { id : parseInt(userId) },
                    data : {
                        bind_with : parseInt(result[0]?.created_by),
                        relation : result[0]?.relation,
                    }
                }
                const result2 = await commonServices.update(updateParam, 'users');
                if(result2 && result2?.length > 0){
                    return response.sendResponse(res, response.build("SUCCESS", { result : result[0] }, false));
                }
            }
            return response.sendResponse(res, response.build("SUCCESS", { }, false));
        }
    } catch (error) {
        console.log('error',error)
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }, false));
    }
};
/*********************************************************************************
 * Function Name    :   rejectRequest
 * Purpose          :   This function is used for reject family request
 * Created Data     :   10-11-2025
 ********************************************************************************/
exports.rejectRequest = async function (req, res) {
    try {
        const userId = req.user.userId;
        const {request_id, remarks} = req.body;
        if(!request_id){
            return response.sendResponse(res, response.build("REQUEST_ID_EMPTY", { }, false));
        } else{
            const ipAddress = await getIpAddress(req);
            const params = {
                condition : { id : parseInt(request_id) },
                data : {
                    user_id : userId,
                    status : "R",
                    ...(remarks && {remarks : remarks}),
                    updated_at : moment().format('YYYY-MM-DD HH:mm:ss'),
                    updated_ip : ipAddress,
                    updated_by : userId
                }
            }
            const result = await commonServices.update(params, 'family_request');
            return response.sendResponse(res, response.build("SUCCESS", {result : result[0] }, false));
        }
    } catch (error) {
        console.log('error',error)
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }, false));
    }
};