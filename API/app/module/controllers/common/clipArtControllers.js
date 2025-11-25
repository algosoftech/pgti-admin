const response = require('../../../util/response');
const commonServices = require("../../services/commonServices");
const moment = require('moment');
const {upload_img, delete_img} = require("../../../util/imageHandler");
const path = require("path");
/*********************************************************************************
 * Function Name    :   addImage
 * Purpose          :   This function is used for assets
 * Created By       :   Afsar Ali
 * Created Data     :   30-10-2025
 ********************************************************************************/
exports.addImage = async function (req, res) {
    try {
        const usrId = req.user.userId;
        const {folder} = req.body;
        if(!usrId){
            return response.sendResponse(res, response.build("PERMISSION_ERROR", { }));
        }else if(!folder){
            return response.sendResponse(res, response.build("FOLDER_NAME_EMPTY", { }));
        }else {
            const params = {};
            if(req.file?.fieldname === 'image'){
                params.url        = await upload_img(req.file, folder);
            } 
            params.name = req.file.originalname;
            params.type = path.extname(req.file.originalname) || '.jpg';;
            params.created_at = moment().format("YYYY-MM-DD HH:mm:ss");
            const result = await commonServices.insert(params,"assets_bucket"); 
            return response.sendResponse( res, response.build("SUCCESS", { result }));
        }
    } catch (error) {
        console.log('error',error);
        return response.sendResponse( res, response.build("ERROR_SERVER_ERROR", { error }));
    }
}

/*********************************************************************************
 * Function Name    :   removeImage
 * Purpose          :   This function is used for assets
 * Created By       :   Afsar Ali
 * Created Data     :   30-10-2025
 ********************************************************************************/
exports.removeImage = async function (req, res) {
    try {
        const usrId = req.user.userId;
        const {url} = req.body;
        if(!usrId){
            return response.sendResponse(res, response.build("PERMISSION_ERROR", { }));
        }else if(!url){
            return response.sendResponse(res, response.build("URL_EMPTY", { }));
        }else {
            const where = {
                type : "single",
                condition : { url : url } 
            }
            const result = await commonServices.select(where,"assets_bucket"); 
            if(result && result.id){
                const isDelete = await delete_img(url);
                console.log('isDelete : ', isDelete);
                if(isDelete && isDelete.status === true){
                    const deleteWhere = {
                        id : result.id
                    }
                    console.log("deleteWhere : ", deleteWhere)
                    await commonServices.delete(deleteWhere, "assets_bucket");
                    return response.sendResponse( res, response.build("SUCCESS", {}));
                } else{
                    return response.sendResponse( res, response.build("PROCESS_ERROR", {}));
                }
            } else{
                return response.sendResponse( res, response.build("PROCESS_ERROR", {}));
            }
        }
    } catch (error) {
        console.log('error',error);
        return response.sendResponse( res, response.build("ERROR_SERVER_ERROR", { error }));
    }
}

/*********************************************************************************
 * Function Name    :   list
 * Purpose          :   This function is used for reset password
 * Created Data     :   28-06-2025
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
            const result = await commonServices.select(where, 'assets_bucket');
            if(result && result?.length > 0){
                const option = {
                    type : "count",
                    condition : {
                        ...condition,
                    }
                }
                const count = await commonServices.select(option, 'assets_bucket');
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