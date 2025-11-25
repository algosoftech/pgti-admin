const response = require('../../../../util/response');
const commonServices = require("../../../services/commonServices");
const { getIpAddress, createSlug } = require("../../../../util/utility"); 
const moment = require('moment');
/*********************************************************************************
 * Function Name    :   list
 * Purpose          :   This function is used for data list
 * Created Data     :   11-04-2025
 ********************************************************************************/
exports.list = async function (req, res) {
    try {
        const userId = req.user.userId;
        const {type = "", condition={}, skip, limit } = req.body;
        const { title, available_stock, unit, rate, package_type, discount_type, discount_text, discount, status } = condition;
        if(!userId){
            return response.sendResponse(res, response.build("PERMISSION_ERROR", { }));
        } else{
            const where = {
                type : type,
                condition : {
                    ...(status && {"products_variants.status" : status}),
                    ...(available_stock && {"products_variants.available_stock" : available_stock}),
                    ...(rate && {"products_variants.rate" : rate}),
                    ...(discount && {"products_variants.discount" : discount}),
                    ...(discount_type && {"products_variants.discount_type" : discount_type}),
                },
                like : {
                    ...(title && {"products.title" : `%${title}%`}),
                    ...(unit && {"products_variants.unit" : `%${unit}%`}),
                    ...(package_type && {"products_variants.package_type" : `%${package_type}%`}),
                    ...(discount_text && {"products_variants.discount_text" : `%${discount_text}%`}),
                },
                join : [
                    {
                        table: 'products',
                        type: 'inner',
                        on: ['products_variants.product', '=', 'products.id']
                    }
                ],
                select : [
                    "products.title",

                    "products_variants.id",
                    "products_variants.product",
                    "products_variants.category",
                    "products_variants.subCategory",
                    "products_variants.unit",
                    "products_variants.rate",
                    "products_variants.package_type",
                    "products_variants.expire_date",
                    "products_variants.discount_type",
                    "products_variants.discount_text",
                    "products_variants.discount",
                    "products_variants.total_stock",
                    "products_variants.available_stock",
                    "products_variants.status",
                    "products_variants.created_at",
                    
                ],
                skip : skip || 0,
                limit : limit || 10
            }
            const result = await commonServices.select(where, 'products_variants');
            if(result && result?.length > 0){
                const option = {
                    type : "count",
                    condition : where.condition,
                    like : where.like
                }
                const count = await commonServices.select(option, 'products_variants');
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
 * Created Data     :   11-04-2025
 ********************************************************************************/
exports.addEditData = async function (req, res) {
    try {
        const userId = req.user.userId;
        const {editId, product, unit, rate, package_type, expire_date, discount_type, discount_text, discount, stock} = req.body;
        if(!product){
            return response.sendResponse(res, response.build("PRODUCT_EMPTY", { }));
        } else if(!unit){
            return response.sendResponse(res, response.build("IMAGE_EMPTY", { }));
        } else if(!rate){
            return response.sendResponse(res, response.build("RATE_EMPTY", { }));
        } else if(!editId && !stock){
            return response.sendResponse(res, response.build("STOCK_EMPTY", { }));
        } else if(discount_type && !discount_text){
            return response.sendResponse(res, response.build("DISCOUNT_TEXT_EMPTY", { }));
        } else if(discount_type && !discount){
            return response.sendResponse(res, response.build("DISCOUNT_EMPTY", { }));
        } else{
            const ipAddress = await getIpAddress(req);
            const productWhere = {
                type : "single",
                condition : { id : parseInt(product) },
                select : [ "id", "category","subCategory"]
            }
            const productData = await commonServices.select(productWhere, 'products');
            if(productData) {
                const params = {
                    product         : parseInt(product),
                    category        : parseInt(productData?.category),
                    subCategory     : parseInt(productData?.subCategory),
                    unit            : unit,
                    rate            : rate,
                    ...(package_type && {package_type : package_type}),
                    ...(expire_date && {expire_date : expire_date}),
                    ...(discount_type && {
                        discount_type       : parseInt(discount_type),
                        discount_text       : discount_text,
                        discount            : parseFloat(discount),
                    }),
                }
                if(!editId) {
                    const insertParam = {
                        ...params,
                        total_stock : parseInt(stock),
                        available_stock : parseInt(stock),
                        status : "A",
                        created_at : moment().format('YYYY-MM-DD HH:mm:ss'),
                        created_ip : ipAddress,
                        created_by : userId
                    }
                    const result = await commonServices.insert(insertParam, 'products_variants');
                    return response.sendResponse(res, response.build("SUCCESS", { result }));
                } else {
                    const where = {
                        type : "count",
                        condition : {
                            id : parseInt(editId)
                        }
                    }
                    const dataCount = await commonServices.select(where, 'products_variants');
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
                        const result = await commonServices.update(updateParam, 'products_variants');
                        return response.sendResponse(res, response.build("SUCCESS", { result : result[0] }));
                    } else{
                        return response.sendResponse(res, response.build("ERROR_ALREADY_EXIST", {  }));
                    }
                }
            } else{
                return response.sendResponse(res, response.build("PRODUCT_ERROR", { }));
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
 * Created Data     :   11-04-2025
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
            const result = await commonServices.update(updateParam, 'products_variants');
            return response.sendResponse(res, response.build("SUCCESS", { result : result[0] }));
        } 
    } catch (error) {
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
    }
}//End of Function
