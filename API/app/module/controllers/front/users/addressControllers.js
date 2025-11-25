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
        const {type = "", condition, select, skip, limit } = req.body;
        if(!userId){
            return response.sendResponse(res, response.build("PERMISSION_ERROR", { }, false));
        } else{
            const where = {
                type : type,
                condition : {
                    ...condition,
                    users_id : parseInt(userId)
                },
                select : select || '*',
                skip : skip || 0,
                limit : limit || 10
            }
            const result = await commonServices.select(where, 'users_address');
            if(result && result?.length > 0){
                const option = {
                    type : "count",
                    condition : {
                        ...condition,
                        users_id : parseInt(userId)
                    }
                }
                const count = await commonServices.select(option, 'users_address');
                return response.sendResponse(res, response.build("SUCCESS", { result , ...{count : count || 0} }, false));
            } else{
                return response.sendResponse(res, response.build("SUCCESS", { result }, false));
            }
        }
    } catch (error) {
        console.log('error',error)
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }, false));
    }
}; //End of Function

/*********************************************************************************
 * Function Name    :   addEditData
 * Purpose          :   This function is used for add/edit data
 * Created Data     :   04-11-2025
 ********************************************************************************/
exports.addEditData = async function (req, res) {
    try {
        const userId = req.user.userId;
        const {editId, house, floor, locality, area, map_address, latitude, longitude, link, default_address, type } = req.body;
        console.log("in");
        if(!house){
            return response.sendResponse(res, response.build("HOUSE_EMPTY", { }, false));
        } else if(!locality){
            return response.sendResponse(res, response.build("LOCALITY_EMPTY", { }, false));
        } else if(!type){
            return response.sendResponse(res, response.build("ADDRESS_TYPE_EMPTY", { }, false));
        } else{
            const ipAddress = await getIpAddress(req);
            const params = {
                users_id : parseInt(userId),
                house : house,
                locality : locality,
                type : type || "Other",
                ...(floor && {floor : floor}),
                ...(area && {area : area}),
                ...(map_address && {map_address : map_address}),
                ...(latitude && {latitude : latitude}),
                ...(longitude && {longitude : longitude}),
                ...(link && {link : link}),
                default_address : default_address || "N"
            }
            if(!editId) {
                const insertParam = {
                    ...params,
                    status : "A",
                    created_at : moment().format('YYYY-MM-DD HH:mm:ss'),
                    created_ip : ipAddress,
                    created_by : userId
                }
                const result = await commonServices.insert(insertParam, 'users_address');
                return response.sendResponse(res, response.build("SUCCESS", { result }, false));
            } else {
                const where = {
                    type : "count",
                    condition : {
                        id : parseInt(editId)
                    }
                }
                const dataCount = await commonServices.select(where, 'users_address');
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
                    const result = await commonServices.update(updateParam, 'users_address');
                    console.log("out : ", result);
                    return response.sendResponse(res, response.build("SUCCESS", { result : result[0] }, false));
                } else{
                    return response.sendResponse(res, response.build("ERROR_DATA_NOT_FOUND", {  }, false));
                }
            }
        }
    } catch (error) {
        console.log('error',error)
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }, false));
    }
}; //End of Function  
/*********************************************************************************
 * Function Name    :   markDefaultAddress
 * Purpose          :   This function is used for change status
 * Created Data     :   04-11-2025
 ********************************************************************************/
exports.changeStatus = async function (req, res) {
    try {
        const userId = req.user.userId;
        const { editId, status } = req.body;
        if(!userId){
            return response.sendResponse(res, response.build("PERMISSION_ERROR", { }, false));
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
            const result = await commonServices.update(updateParam, 'users_address');
            return response.sendResponse(res, response.build("SUCCESS", { result : result[0] }, false));
        } 
    } catch (error) {
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }, false));
    }
}//End of Function
/*********************************************************************************
 * Function Name    :   changeStatus
 * Purpose          :   This function is used for mark as default
 * Created Data     :   04-11-2025
 ********************************************************************************/
exports.markDefaultAddress = async function (req, res) {
    try {
        const userId = req.user.userId;
        const { id } = req.body;
        if(!userId){
            return response.sendResponse(res, response.build("PERMISSION_ERROR", { }, false));
        } else{
            const ipAddress = await getIpAddress(req);
            const param = {
                condition : { id : parseInt(id) },
                data : { 
                    default_address : "N",
                    updated_ip : ipAddress,
                    updated_by : userId
                }
            }
            await commonServices.update(param, 'users_address');

            const updateParam = {
                condition : { id : parseInt(id) },
                data : { 
                    default_address : "Y",
                    updated_ip : ipAddress,
                    updated_by : userId
                }
            }
            const result = await commonServices.update(updateParam, 'users_address');
            return response.sendResponse(res, response.build("SUCCESS", { result }, false));
        } 
    } catch (error) {
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }, false));
    }
}//End of Function