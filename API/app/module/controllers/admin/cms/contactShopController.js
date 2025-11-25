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
            const result = await commonServices.select(where, 'contact_shops');
            if(result && result?.length > 0){
                const option = {
                    type : "count",
                    condition : {
                        ...condition,
                    }
                }
                const count = await commonServices.select(option, 'contact_shops');
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
        const {editId, name, address, phone, email} = req.body;
        if(!name){
            return response.sendResponse(res, response.build("NAME_EMPTY", { }));
        } else if(!address){
            return response.sendResponse(res, response.build("ADDRESS_EMPTY", { }));
        } else if(!phone){
            return response.sendResponse(res, response.build("PHONE_EMPTY", { }));
        } else if(!email){
            return response.sendResponse(res, response.build("EMAIL_EMPTY", { }));
        } else{
            const ipAddress = await getIpAddress(req);
            const params = {
                name : name,
                address : address,
                phone : phone,
                email : email
            }
            if(!editId) {
                const insertParam = {
                    ...params,
                    status : "A",
                    created_at : moment().format('YYYY-MM-DD HH:mm:ss'),
                    created_ip : ipAddress,
                    created_by : userId
                }
                const result = await commonServices.insert(insertParam, 'contact_shops');
                return response.sendResponse(res, response.build("SUCCESS", { result }));
            } else {
                const where = {
                    type : "count",
                    condition : {
                        id : parseInt(editId)
                    }
                }
                const dataCount = await commonServices.select(where, 'contact_shops');
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
                    const result = await commonServices.update(updateParam, 'contact_shops');
                    return response.sendResponse(res, response.build("SUCCESS", { result }));
                } else{
                    return response.sendResponse(res, response.build("ERROR_DATA_NOT_FOUND", {  }));
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
        } else if(!editId){
            return response.sendResponse(res, response.build("ID_EMPTY", { }));
        } else if(!status){
            return response.sendResponse(res, response.build("STATUS_EMPTY", { }));
        } else{
            const ipAddress = await getIpAddress(req);
            const updateParam = {
                condition : { id : parseInt(editId) },
                data : { 
                    status : status,
                    updated_at : moment().format('YYYY-MM-DD HH:mm:ss'),
                    updated_ip : ipAddress,
                    updated_by : userId
                }
            }
            const result = await commonServices.update(updateParam, 'contact_shops');
            return response.sendResponse(res, response.build("SUCCESS", { result }));
        } 
    } catch (error) {
        console.log('error',error)
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
    }
}//End of Function

/*********************************************************************************
 * Function Name    :   delete
 * Purpose          :   This function is used for delete contact shop
 * Created Data     :   11-03-2025
 ********************************************************************************/
exports.delete = async function (req, res) {
    try {
        const userId = req.user.userId;
        const {editId} = req.body;
        if(!userId){
            return response.sendResponse(res, response.build("PERMISSION_ERROR", { }));
        } else if(!editId){
            return response.sendResponse(res, response.build("ID_EMPTY", { }));
        } else{
            const where = {
                type : "count",
                condition : {
                    id : parseInt(editId)
                }
            }
            const dataCount = await commonServices.select(where, 'contact_shops');
            if(dataCount > 0){
                const result = await commonServices.delete({ id : parseInt(editId) }, 'contact_shops');
                return response.sendResponse(res, response.build("SUCCESS", { result : { message: "Contact shop deleted successfully" } }));
            } else{
                return response.sendResponse(res, response.build("ERROR_DATA_NOT_FOUND", {  }));
            }
        }
    } catch (error) {
        console.log('error',error)
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
    }
}//End of Function

