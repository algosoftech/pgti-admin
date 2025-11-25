const response = require('../../../../util/response');
const commonServices = require("../../../services/commonServices");
const moment = require('moment');
const { getIpAddress } = require("../../../../util/utility");

/*********************************************************************************
 * Function Name    :   getHomePageContent
 * Purpose          :   This function is used for data list
 * Created Data     :   04-11-2025
 ********************************************************************************/
exports.getHomePageContent = async function (req, res) {
    try {
        const { } = req.body;
        const topBannerOption = {
            type : "",
            condition : { status : "A", page : "Home", type : "Top" },
            select : ["id","type","page","image"],
            skip : skip || 0,
            limit : limit || 10
        }
        const top_banners = await commonServices.select(topBannerOption, 'banners');

        const categoriesOption = {
            type : "",
            condition : { status : "A" },
            select : "*",
            skip : skip || 0,
            limit : limit || 10
        }
        const categories = await commonServices.select(categoriesOption, 'category_with_subcategories');

        const twoOrderProduct = [];
        const subscriptionProducts = [];
        const recipes = [];

        const innerBannerOption = {
            type : "",
            condition : { status : "A", page : "Home", type : "Inner" },
            select : ["id","type","page","image"],
            skip : skip || 0,
            limit : limit || 10
        }
        const innerBanner = await commonServices.select(innerBannerOption, 'banners');

        const result = {
            topBanners : top_banners,
            categories : categories,
            twoOrderProduct : twoOrderProduct,
            subscriptionProducts : subscriptionProducts,
            recipes : recipes,
            innerBanner : innerBanner

        }
        return response.sendResponse(res, response.build("SUCCESS", { result }));
    } catch (error) {
        console.log('error',error)
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
    }
}; //End of Function


/*********************************************************************************
 * Function Name    :   getBanners
 * Purpose          :   This function is used for data list
 * Created Data     :   04-11-2025
 ********************************************************************************/
exports.getBanners = async function (req, res) {
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
        const result = await commonServices.select(where, 'banners');
        if(result && result?.length > 0){
            const option = {
                type : "count",
                condition : {
                    ...condition,
                }
            }
            const count = await commonServices.select(option, 'banners');
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
 * Function Name    :   getCategories
 * Purpose          :   This function is used for data list
 * Created Data     :   04-11-2025
 ********************************************************************************/
exports.getCategories = async function (req, res) {
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
        const result = await commonServices.select(where, 'categories');
        if(result && result?.length > 0){
            const option = {
                type : "count",
                condition : {
                    ...condition,
                }
            }
            const count = await commonServices.select(option, 'categories');
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
 * Function Name    :   getSubCategories
 * Purpose          :   This function is used for data list
 * Created Data     :   04-11-2025
 ********************************************************************************/
exports.getSubCategories = async function (req, res) {
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
        const result = await commonServices.select(where, 'sub_categories');
        if(result && result?.length > 0){
            const option = {
                type : "count",
                condition : {
                    ...condition,
                }
            }
            const count = await commonServices.select(option, 'sub_categories');
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
 * Function Name    :   contactUs
 * Purpose          :   This function is used for data list
 * Created Data     :   14-11-2025
 ********************************************************************************/
exports.contactUs = async function (req, res) {
    try {
        const { phone, email, message, order_no } = req.body;
        if(!phone){
            return response.sendResponse(res, response.build("PHONE_EMPTY", { }, false));
        } else if(!message){
            return response.sendResponse(res, response.build("MESSAGE_EMPTY", { }, false));
        } else{
            const ipAddress = await getIpAddress(req);
            const params = {
                phone : phone,
                message : message,
                ...(email && {email : email}),
                ...(order_no && {order_no : order_no}),
                created_at : moment().format("YYYY-MM-DD HH:mm:ss"),
                created_ip : ipAddress ||":1"
            }
            const result = await commonServices.insert(params, 'contact_us');
            return response.sendResponse(res, response.build("SUCCESS", { result }, false));
        }
        
    } catch (error) {
        console.log('error',error)
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }, false));
    }
}; //End of Function

/*********************************************************************************
 * Function Name    :   contactShopList
 * Purpose          :   This function is used for data list
 * Created Data     :   14-11-2025
 ********************************************************************************/
exports.contactShopList = async function (req, res) {
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
        const result = await commonServices.select(where, 'contact_shops');
        if(result && result?.length > 0){
            const option = {
                type : "count",
                condition : {
                    ...condition,
                }
            }
            const count = await commonServices.select(option, 'contact_shops');
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
 * Function Name    :   getFaqs
 * Purpose          :   This function is used for data list
 * Created Data     :   14-11-2025
 ********************************************************************************/
exports.getFaqs = async function (req, res) {
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
        const result = await commonServices.select(where, 'faqs');
        if(result && result?.length > 0){
            const option = {
                type : "count",
                condition : {
                    ...condition,
                }
            }
            const count = await commonServices.select(option, 'faqs');
            return response.sendResponse(res, response.build("SUCCESS", { result , ...{count : count || 0} }, false));
        } else{
            return response.sendResponse(res, response.build("SUCCESS", { result }, false));
        }
    } catch (error) {
        console.log('error',error)
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }, false));
    }
}; //End of Function

