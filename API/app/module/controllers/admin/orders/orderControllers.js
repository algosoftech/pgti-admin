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
                join: [
                    {
                        table: 'users',
                        type: 'inner',
                        on: ['orders.user_id', '=', 'users.id']
                    },
                    {
                        table: 'users_address',
                        type: 'inner',
                        on: ['orders.address_id', '=', 'users_address.id']
                    }
                ],
                select : [
                    "orders.id",
                    "orders.order_no ",
                    "orders.user_id",
                    "orders.address_id",
                    "orders.promo_code_id",
                    "orders.promo_code",
                    "orders.subtotal",
                    "orders.product_discount",
                    "orders.promo_discount",
                    "orders.total",
                    "orders.payment_method",
                    "orders.payment_status",
                    "orders.order_status",
                    "orders.created_at",

                    "users.id as users_id",
                    "users.name as users_name",
                    "users.phone  as users_phone",
                    "users.email as users_email",
                    
                ],
                skip : skip || 0,
                limit : limit || 10
            }
            const result = await commonServices.select(where, 'orders');
            if(result && result?.length > 0){
                const option = {
                    type : "count",
                    condition : {
                        ...condition,
                    }
                }
                const count = await commonServices.select(option, 'orders');
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
