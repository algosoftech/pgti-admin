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
        const {type = "", condition={}, skip, limit } = req.body;
        const {title, category_name, tags, status } = condition;
        if(!userId){
            return response.sendResponse(res, response.build("PERMISSION_ERROR", { }));
        } else{
            const where = {
                type : type,
                condition : {
                    ...(status && {"articles.status" : status}),
                },
                like : {
                    ...(title && {"articles.title" : `%${title}%`}),
                    ...(category_name && {"articles.category_name" : `%${category_name}%`}),
                    ...(tags && {"articles.tags" : `%${tags}%`}),
                },
                join : [
                    {
                        table: 'categories',
                        type: 'inner',
                        on: ['articles.category', '=', 'categories.id']
                    }
                ],
                select : [
                    "articles.id",
                    "articles.title",
                    "articles.sort_description",
                    "articles.description",
                    "articles.image",
                    "articles.category",
                    "articles.tags",
                    "articles.status",
                    "articles.created_at",

                    "categories.name as category_name",
                ],
                skip : skip || 0,
                limit : limit || 10
            }
            const result = await commonServices.select(where, 'articles');
            if(result && result?.length > 0){
                const option = {
                    type : "count",
                    condition : where.condition,
                    like : where.like
                }
                const count = await commonServices.select(option, 'articles');
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
        const {editId, title, sort_description, description, image, video_url, tags, category } = req.body;
        if(!title){
            return response.sendResponse(res, response.build("TITLE_EMPTY", { }));
        } else if(!sort_description){
            return response.sendResponse(res, response.build("SORT_DESCRIPTION_EMPTY", { }));
        } else if(!description){
            return response.sendResponse(res, response.build("DESCRIPTION_EMPTY", { }));
        } else if(!category){
            return response.sendResponse(res, response.build("CATEGORY_EMPTY", { }));
        } else if(!image && !editId){
            return response.sendResponse(res, response.build("IMAGE_EMPTY", { }));
        } else{
            const ipAddress = await getIpAddress(req);
            const slug = await createSlug(title?.toString());
            const params = {
                title                   : title,
                sort_description        : sort_description,
                description             : description,
                category                : parseInt(category),
                ...(tags        &&  { tags      : tags }),
                ...(image       &&  { image     : image }),
                ...(video_url   &&  { video_url : video_url })
            }
            if(!editId) {
                const where = {
                    type : "count",
                    condition : { title : title }
                }
                const dataCount = await commonServices.select(where, 'articles');
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
                    const result = await commonServices.insert(insertParam, 'articles');
                    return response.sendResponse(res, response.build("SUCCESS", { result }));
                }
            } else {
                const where = {
                    type : "count",
                    condition : {
                        id : parseInt(editId)
                    }
                }
                const dataCount = await commonServices.select(where, 'articles');
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
                    const result = await commonServices.update(updateParam, 'articles');
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
            const result = await commonServices.update(updateParam, 'articles');
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
            const dataCount = await commonServices.select(where, 'articles');
            if(dataCount > 0){
                const result = await commonServices.delete({ id : parseInt(editId) }, 'articles');
                return response.sendResponse(res, response.build("SUCCESS", { result : { message: "Article deleted successfully" } }));
            } else{
                return response.sendResponse(res, response.build("ERROR_DATA_NOT_FOUND", {  }));
            }
        }
    } catch (error) {
        console.log('error',error)
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
    }
}//End of Function
