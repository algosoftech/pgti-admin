const response = require('../../../../util/response');
const commonServices = require("../../../services/commonServices");
const { getIpAddress, createSlug } = require("../../../../util/utility"); 
const moment = require('moment');
/*********************************************************************************
 * Function Name    :   list
 * Purpose          :   This function is used for data list
 * Created Data     :   17-11-2025
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
            const result = await commonServices.select(where, 'events');
            if(result && result?.length > 0){
                const option = {
                    type : "count",
                    condition : {
                        ...condition,
                    }
                }
                const count = await commonServices.select(option, 'events');
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
 * Created Data     :   17-11-2025
 ********************************************************************************/
exports.addEditData = async function (req, res) {
    try {
        const userId = req.user.userId;
        const {editId, article_id, terms_condition, event_start, event_end, capacity, is_paid, event_fee } = req.body;
        if(!article_id){
            return response.sendResponse(res, response.build("ARTICLE_ID_EMPTY", { }));
        } else if(!terms_condition){
            return response.sendResponse(res, response.build("TERMS_CONDITION_EMPTY", { }));
        } else if(!event_start){
            return response.sendResponse(res, response.build("START_DATE_EMPTY", { }));
        } else if(!event_end){
            return response.sendResponse(res, response.build("END_DATE_EMPTY", { }));
        } else if(!capacity){
            return response.sendResponse(res, response.build("CAPACITY_EMPTY", { }));
        } else if(is_paid === "" && (!event_fee || parseInt(event_fee) === 0)){
            return response.sendResponse(res, response.build("EVENT_FEE_EMPTY", { }));
        } else{
            const ipAddress = await getIpAddress(req);
            const params = {
                article_id              : parseInt(article_id),
                terms_condition         : terms_condition,
                event_start             : moment(event_start).format("YYYY-MM-DD HH:mm:ss"),
                event_end               : moment(event_end).format("YYYY-MM-DD HH:mm:ss"),
                capacity                : parseInt(capacity),
                is_paid                 : is_paid || "N",
                ...(is_paid === "Y"     &&  { event_fee      : event_fee })
            }
            if(!editId) {
                const where = {
                    type : "count",
                    condition : { article_id : article_id }
                }
                const dataCount = await commonServices.select(where, 'events');
                if(dataCount > 0){
                    return response.sendResponse(res, response.build("ERROR_ALREADY_EXIST", {  }));
                } else {
                    const insertParam = {
                        ...params,
                        status : "A",
                        created_at : moment().format('YYYY-MM-DD HH:mm:ss'),
                        created_ip : ipAddress,
                        created_by : userId
                    }
                    const result = await commonServices.insert(insertParam, 'events');
                    return response.sendResponse(res, response.build("SUCCESS", { result }));
                }
            } else {
                const where = {
                    type : "count",
                    condition : {
                        id : parseInt(editId)
                    }
                }
                const dataCount = await commonServices.select(where, 'events');
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
                    const result = await commonServices.update(updateParam, 'events');
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
 * Created Data     :   17-11-2025
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
            const result = await commonServices.update(updateParam, 'events');
            return response.sendResponse(res, response.build("SUCCESS", { result : result[0] }));
        } 
    } catch (error) {
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
        const {id} = req.body;
        if(!userId){
            return response.sendResponse(res, response.build("PERMISSION_ERROR", { }));
        } else if(!id){
            return response.sendResponse(res, response.build("ID_EMPTY", { }));
        } else{
            const where = {
                type : "count",
                condition : {
                    id : parseInt(id)
                }
            }
            const dataCount = await commonServices.select(where, 'events');
            if(dataCount > 0){
                const result = await commonServices.delete({ id : parseInt(id) }, 'events');
                return response.sendResponse(res, response.build("SUCCESS", { result : { message: "Event deleted successfully" } }));
            } else{
                return response.sendResponse(res, response.build("ERROR_DATA_NOT_FOUND", {  }));
            }
        }
    } catch (error) {
        console.log('error',error)
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
    }
}//End of Function
