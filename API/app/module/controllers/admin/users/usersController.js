const response = require('../../../../util/response');
const commonServices = require("../../../services/commonServices");
const { getIpAddress } = require("../../../../util/utility"); 
const moment = require('moment');
/*********************************************************************************
 * Function Name    :   list
 * Purpose          :   This function is used for reset password
 * Created Data     :   04-11-2025
 ********************************************************************************/
exports.list = async function (req, res) {
    try {
        const userId = req.user.userId;
        const {type = "", condition, select, skip, limit } = req.body;
        const { name, email, phone, status} = condition;
        if(!userId){
            return response.sendResponse(res, response.build("PERMISSION_ERROR", { }));
        } else{
            const where = {
                type : type,
                condition : {
                    ...(name && {name : name}), 
                    ...(email && {email : email}), 
                    ...(phone && {phone : phone}), 
                    ...(status && {status : status})
                },
                select : select || '*',
                skip : skip || 0,
                limit : limit || 10
            }
            const result = await commonServices.select(where, 'users');
            if(result && result?.length > 0){
                const option = {
                    type : "count",
                    condition : where?.condition
                }
                const count = await commonServices.select(option, 'users');
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
 * Function Name    :   verifyOTP
 * Purpose          :   This function is used for reset password
 * Created Data     :   04-11-2025
 ********************************************************************************/
exports.addEditData = async function (req, res) {
    try {
        const userId = req.user.userId
        const {editId, image, name, email, gender, date_of_birth } = req.body;
        if(!editId){
            return response.sendResponse(res, response.build("ID_ERROR", { }));
        } else{
            const where = {
                type : "count",
                condition : {id : parseInt(editId)}
            }
            const userCount = await commonServices.select(where, 'users');
            if(userCount && userCount === 1){
                const ipAddress = await getIpAddress(req);
                const params = {
                    condition : { id : parseInt(editId) },
                    data : {
                        ...(name && {name : name}),
                        ...(email && {email : email}),
                        ...(gender && {gender : gender}),
                        ...(date_of_birth && {date_of_birth : date_of_birth}),
                        ...(image && {image : image}),
                        updated_at : moment().format("YYYY-MM-DD HH:mm:ss"),
                        updated_ip : ipAddress,
                        updated_by : parseInt(userId) || ""
                    }
                }
                const result = await commonServices.update(params, 'users');
                return response.sendResponse(res, response.build("SUCCESS", { result : result[0] }));
            } else{
                return response.sendResponse(res, response.build("ERROR_DATA_NOT_FOUND", { }));
            }   
        }
    } catch (error) {
        console.log('error',error)
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
    }
}; //End of Function  
/*********************************************************************************
 * Function Name    :   changeStatus
 * Purpose          :   This function is used for reset password
 * Created Data     :   04-11-2025
 ********************************************************************************/
exports.changeStatus = async function (req, res) {
    try {
        const userId = req.user.userId;
        const {user_id, status } = req.body;
        if(!userId){
            return response.sendResponse(res, response.build("PERMISSION_ERROR", { }));
        } else{
            const ipAddress = await getIpAddress(req);
            const updateParam = {
                condition : { id : user_id },
                data : { 
                    status : status,
                    token : "",
                    updated_ip : ipAddress
                }
            }
            const result = await commonServices.update(updateParam, 'users');
            return response.sendResponse(res, response.build("SUCCESS", { result }));
        } 
    } catch (error) {
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
    }
}//End of Function
