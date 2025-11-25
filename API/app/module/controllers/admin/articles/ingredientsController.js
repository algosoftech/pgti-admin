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
            const result = await commonServices.select(where, 'ingredients');
            if(result && result?.length > 0){
                const option = {
                    type : "count",
                    condition : {
                        ...condition,
                    }
                }
                const count = await commonServices.select(option, 'ingredients');
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
 * Purpose          :   This function is used for bulk add/edit data
 * Created Data     :   17-11-2025
 ********************************************************************************/
exports.addEditData = async function (req, res) {
    try {
        const userId = req.user.userId;
        const { ingredients } = req.body;
        
        if(!userId){
            return response.sendResponse(res, response.build("PERMISSION_ERROR", { }));
        }
        
        // Check if ingredients array is provided
        if(!ingredients || !Array.isArray(ingredients) || ingredients.length === 0){
            return response.sendResponse(res, response.build("INGREDIENTS_EMPTY", { }));
        }
        
        const ipAddress = await getIpAddress(req);
        const results = [];
        const errors = [];
        
        // Process each ingredient
        for(let i = 0; i < ingredients.length; i++){
            const ingredient = ingredients[i];
            const { editId, article_id, product_id, variant_id, qty } = ingredient;
            
            // Validate required fields
            if(!article_id){
                errors.push({ index: i, error: "ARTICLE_ID_EMPTY" });
                continue;
            }
            if(!product_id){
                errors.push({ index: i, error: "PRODUCT_ID_EMPTY" });
                continue;
            }
            if(!qty || qty <= 0){
                errors.push({ index: i, error: "QUANTITY_EMPTY" });
                continue;
            }
            
            const params = {
                article_id: parseInt(article_id),
                product_id: parseInt(product_id),
                qty: parseFloat(qty)
            };
            
            // Add variant_id only if provided (it's optional)
            if(variant_id){
                params.variant_id = parseInt(variant_id);
            }
            
            try {
                if(!editId) {
                    // Create new ingredient
                    // Check for duplicate (same article, product, and variant combination)
                    const where = {
                        type: "count",
                        condition: { 
                            article_id: parseInt(article_id), 
                            product_id: parseInt(product_id),
                            ...(variant_id ? { variant_id: parseInt(variant_id) } : { variant_id: null })
                        }
                    };
                    const dataCount = await commonServices.select(where, 'ingredients');
                    
                    if(dataCount > 0){
                        errors.push({ index: i, error: "ERROR_ALREADY_EXIST", ingredient });
                        continue;
                    }
                    
                    const insertParam = {
                        ...params,
                        status: "A",
                        created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                        created_ip: ipAddress,
                        created_by: userId
                    };
                    
                    const result = await commonServices.insert(insertParam, 'ingredients');
                    results.push({ index: i, action: 'created', result });
                } else {
                    // Update existing ingredient
                    const where = {
                        type: "count",
                        condition: {
                            id: parseInt(editId)
                        }
                    };
                    const dataCount = await commonServices.select(where, 'ingredients');
                    
                    if(dataCount === 0){
                        errors.push({ index: i, error: "ERROR_DATA_NOT_FOUND", ingredient });
                        continue;
                    }
                    
                    // Check for duplicate if article_id, product_id, or variant_id changed
                    const existingIngredient = await commonServices.select({
                        type: 'single',
                        condition: { id: parseInt(editId) }
                    }, 'ingredients');
                    
                    if(existingIngredient && (
                        existingIngredient.article_id !== parseInt(article_id) ||
                        existingIngredient.product_id !== parseInt(product_id) ||
                        (existingIngredient.variant_id || null) !== (variant_id ? parseInt(variant_id) : null)
                    )){
                        // Check if new combination already exists
                        const duplicateCheck = {
                            type: "count",
                            condition: { 
                                article_id: parseInt(article_id), 
                                product_id: parseInt(product_id),
                                ...(variant_id ? { variant_id: parseInt(variant_id) } : { variant_id: null }),
                                id: { $ne: parseInt(editId) } // Exclude current record
                            }
                        };
                        const duplicateCount = await commonServices.select(duplicateCheck, 'ingredients');
                        
                        if(duplicateCount > 0){
                            errors.push({ index: i, error: "ERROR_ALREADY_EXIST", ingredient });
                            continue;
                        }
                    }
                    
                    const updateParam = {
                        condition: { id: parseInt(editId) },
                        data: {
                            ...params,
                            updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                            updated_ip: ipAddress,
                            updated_by: userId
                        }
                    };
                    
                    const result = await commonServices.update(updateParam, 'ingredients');
                    results.push({ index: i, action: 'updated', result });
                }
            } catch (itemError) {
                console.log(`Error processing ingredient ${i}:`, itemError);
                errors.push({ index: i, error: "ERROR_PROCESSING", ingredient, details: itemError.message });
            }
        }
        
        // Return response based on results
        if(errors.length > 0 && results.length === 0){
            // All failed
            return response.sendResponse(res, response.build("ERROR_BULK_OPERATION_FAILED", { errors }));
        } else if(errors.length > 0 && results.length > 0){
            // Partial success
            return response.sendResponse(res, response.build("SUCCESS", { 
                result: results,
                errors: errors,
                message: `${results.length} ingredient(s) processed successfully, ${errors.length} failed`
            }));
        } else {
            // All succeeded
            return response.sendResponse(res, response.build("SUCCESS", { 
                result: results,
                message: `${results.length} ingredient(s) processed successfully`
            }));
        }
    } catch (error) {
        console.log('error', error);
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
            const result = await commonServices.update(updateParam, 'ingredients');
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
            const dataCount = await commonServices.select(where, 'ingredients');
            if(dataCount > 0){
                const result = await commonServices.delete({ id : parseInt(id) }, 'ingredients');
                return response.sendResponse(res, response.build("SUCCESS", { result : { message: "Ingredient deleted successfully" } }));
            } else{
                return response.sendResponse(res, response.build("ERROR_DATA_NOT_FOUND", {  }));
            }
        }
    } catch (error) {
        console.log('error',error)
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
    }
}//End of Function
