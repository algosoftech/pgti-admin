const response = require('../../../../util/response');
const commonServices = require("../../../services/commonServices");
const { getIpAddress } = require("../../../../util/utility"); 
const moment = require('moment');
/*********************************************************************************
 * Function Name    :   list
 * Purpose          :   This function is used for data list
 * Created Data     :   11-03-2025
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
            const result = await commonServices.select(where, 'categories');
            if(result && result?.length > 0){
                const option = {
                    type : "count",
                    condition : {
                        ...condition,
                    }
                }
                const count = await commonServices.select(option, 'categories');
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
 * Created Data     :   11-03-2025
 ********************************************************************************/
exports.addEditData = async function (req, res) {
    try {
        const userId = req.user.userId;
        const {editId, name, seq_order, image} = req.body;
        if(!name){
            return response.sendResponse(res, response.build("NAME_EMPTY", { }));
        } else if(!image && !editId){
            return response.sendResponse(res, response.build("IMAGE_EMPTY", { }));
        } else{
            const ipAddress = await getIpAddress(req);
            const params = {
                name : name,
                seq_order : seq_order || 0,
                ...(image && {image : image})
            }
            if(!editId) {
                const where = {
                    type : "count",
                    condition : {
                        name : name,
                        ...params
                    }
                }
                const dataCount = await commonServices.select(where, 'categories');
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
                    const result = await commonServices.insert(insertParam, 'categories');
                    return response.sendResponse(res, response.build("SUCCESS", { result }));

                }
            } else {
                const where = {
                    type : "count",
                    condition : {
                        id : parseInt(editId)
                    }
                }
                const dataCount = await commonServices.select(where, 'categories');
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
                    const result = await commonServices.update(updateParam, 'categories');
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
 * Created Data     :   11-03-2025
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
            const result = await commonServices.update(updateParam, 'categories');
            return response.sendResponse(res, response.build("SUCCESS", { result }));
        } 
    } catch (error) {
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
    }
}//End of Function
