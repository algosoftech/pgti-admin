const response = require('../../../../util/response');
const commonServices = require("../../../services/commonServices");

/*********************************************************************************
 * Function Name    :   list
 * Purpose          :   This function is used for getting list of published ingredients
 * Created Data     :   17-11-2025
 ********************************************************************************/
exports.list = async function (req, res) {
    try {
        const {type = "", condition = {}, skip, limit, article_id } = req.body;
        const whereCondition = {
            "ingredients.status": "A", 
            ...condition
        };

        if(article_id){
            whereCondition["ingredients.id"] = parseInt(article_id);
        }

        const ingredientsOptions = {
            type : type,
            condition : whereCondition,
            join : [
                {
                    table: 'products',
                    type: 'inner',
                    on: ['ingredients.product_id', '=', 'products.id']
                },
                {
                    table: 'products_variants',
                    type: 'inner',
                    on: ['ingredients.variant_id', '=', 'products_variants.id']
                }
            ],
            select : [
                //Ingredients
                "ingredients.id",
                "ingredients.article_id",
                "ingredients.product_id",
                "ingredients.variant_id",
                "ingredients.qty",
                "ingredients.status",
                //Products
                "products.image",
                "products.title",
                //Ingredients
                "products_variants.unit",
                "products_variants.rate",
                "products_variants.package_type",
                "products_variants.expire_date",
                "products_variants.discount_type",
                "products_variants.discount_text",
                "products_variants.discount",
                "products_variants.total_stock",
                "products_variants.available_stock",
                "products_variants.total_stock",
                "products_variants.total_stock",

            ],
            skip : skip || 0, 
            limit : skip || 10,
        }
        
        const result = await commonServices.select(ingredientsOptions, 'ingredients');
        
        if(result && result?.length > 0){
            const option = {
                type : "count",
                condition : whereCondition
            }
            const count = await commonServices.select(option, 'ingredients');
            return response.sendResponse(res, response.build("SUCCESS", { result , ...{count : count || 0} }, false));
        } else{
            return response.sendResponse(res, response.build("SUCCESS", { result : [], count : 0 }, false));
        }
    } catch (error) {
        console.log('error',error)
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }, false));
    }
}; //End of Function

