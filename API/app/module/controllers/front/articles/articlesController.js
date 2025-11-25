const response = require('../../../../util/response');
const commonServices = require("../../../services/commonServices");

/*********************************************************************************
 * Function Name    :   list
 * Purpose          :   This function is used for getting list of published articles
 * Created Data     :   17-11-2025
 ********************************************************************************/
exports.list = async function (req, res) {
    try {
        const {type = "", condition = {}, skip, limit, category } = req.body;
        const whereCondition = {
            "articles.status": "A",
            ...condition
        };
        const like = {};
        if(category){
            like["categories.name"] = `%${category}%`;
        }
        const select = [
            'articles.id',
            'articles.title',
            'articles.sort_description',
            'articles.image',
            'articles.video_url',
            'articles.likes',
            'articles.category',
            'articles.is_event',
            'articles.event_id',
            'articles.status',
            'articles.created_at',

            'categories.name as category_name',
        ];
        const join = [
            {
                table: 'categories',
                type: 'inner',
                on: ['articles.category', '=', 'categories.id']
            }
        ];
        const where = {
            type : type,
            condition : whereCondition,
            like : like || {},
            select : select || '*',
            join : join || [],
            skip : skip || 0,
            limit : limit || 10
        }
        const result = await commonServices.select(where, 'articles');
        
        if(result && result?.length > 0){
            const option = {
                type : "count",
                condition : whereCondition
            }
            const count = await commonServices.select(option, 'articles');
            return response.sendResponse(res, response.build("SUCCESS", { result , ...{count : count || 0} }, false));
        } else{
            return response.sendResponse(res, response.build("SUCCESS", { result : [], count : 0 }, false));
        }
    } catch (error) {
        console.log('error',error)
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }, false));
    }
}; //End of Function

/*********************************************************************************
 * Function Name    :   details
 * Purpose          :   This function is used for getting article details
 * Created Data     :   17-11-2025
 ********************************************************************************/
exports.details = async function (req, res) {
    try {
        const { article_id } = req.body;        
        if(!article_id) return response.sendResponse(res, response.build("ID_EMPTY", { }, false));
        //Article Details
        const whereCondition = { "articles.status": "A" };
        if(article_id) whereCondition["articles.id"] = parseInt(article_id); 
        const where = {
            type : "single",
            condition : whereCondition,
            join : [
                {
                    table: 'categories',
                    type: 'inner',
                    on: ['articles.category', '=', 'categories.id']
                }
            ],
            select : [
                'articles.id',
                'articles.title',
                'articles.sort_description',
                'articles.image',
                'articles.video_url',
                'articles.likes',
                'articles.category',
                'articles.is_event',
                'articles.event_id',
                'articles.status',
                'articles.created_at',

                'categories.name as category_name',
            ]
        }
        const result = await commonServices.select(where, 'articles');
        if(!result) return response.sendResponse(res, response.build("ERROR_DATA_NOT_FOUND", { }, false));
        //Ingredients Details
        const ingredientsOptions = {
            type : "",
            condition : { "ingredients.article_id" : parseInt(result.id), "ingredients.status" : "A" },
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

            ]
        }
        const ingredients = await commonServices.select(ingredientsOptions, 'ingredients');
        //Events Details
        const eventsOptions = {
            type : "single",
            condition : { article_id : result.id },
            select : [
                "id",
                "terms_condition",
                "event_start",
                "event_end",
                "capacity",
                "is_paid",
                "event_fee",
                "status"
            ]
        }
        const events = await commonServices.select(eventsOptions, 'events');
        if(result){
            return response.sendResponse(res, response.build("SUCCESS", { result : {...result, ingredients, events} }, false));
        } else{
            return response.sendResponse(res, response.build("ERROR_DATA_NOT_FOUND", { }, false));
        }
    } catch (error) {
        console.log('error',error)
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }, false));
    }
}; //End of Function

