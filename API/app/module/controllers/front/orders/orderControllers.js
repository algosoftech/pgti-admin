const response = require('../../../../util/response');
const commonServices = require("../../../services/commonServices");
const moment = require('moment');
const {getIpAddress} = require('../../../../util/utility');
/*********************************************************************************
* Function Name     :   createOrder
 * Purpose          :   This function is used to create an order from cart items
 * Created Data     :   04-11-2025
 ********************************************************************************/
exports.createOrder = async function (req, res) {
    try {
        const userId = req.user?.userId;
        const { address_id, promo_code, payment_method, payment_status = 'pending' } = req.body;
        if (!userId) {
            return response.sendResponse(res, response.build("PERMISSION_ERROR", { }, false));
        }
        if (!address_id) {
            return response.sendResponse(res, response.build("ADDRESS_EMPTY", { }, false));
        }
        if(!payment_method){
            return response.sendResponse(res, response.build("PROMO_CODE_EMPTY", { }, false));
        }
        const ipAddress = await getIpAddress(req);
        // Validate address belongs to user
        const address = await commonServices.select({
            type: 'single',
            condition: {
                id: parseInt(address_id),
                users_id: parseInt(userId),
                status: 'A'
            }
        }, 'users_address');

        if (!address) {
            return response.sendResponse(res, response.build("ADDRESS_ERROR", { }, false));
        }

        // Get cart items for the user (including family members)
        const cartCondition = {};
        const whereIn = {};
        whereIn.user_id = [userId];
        
        const familyList = await commonServices.select({
            condition: { status: "A", bind_with: parseInt(userId) },
            limit: 50,
            select: ["id"]
        }, 'users');
        
        if (Array.isArray(familyList) && familyList.length > 0) {
            const familyIdList = familyList.map(item => item.id);
            whereIn.user_id.push(...familyIdList);
        }

        cartCondition.guest_session_id = null;

        // Get cart items with product and variant details
        const cartItems = await commonServices.select({
            condition: cartCondition,
            whereIn: whereIn,
            join: [
                {
                    table: 'products',
                    type: 'inner',
                    on: ['cart.product_id', '=', 'products.id']
                },
                {
                    table: 'products_variants',
                    type: 'inner',
                    on: ['cart.variant_id', '=', 'products_variants.id']
                },
                {
                    table: 'users',
                    type: 'inner',
                    on: ['cart.user_id', '=', 'users.id']
                }
            ],
            select: [
                'cart.id',
                'cart.user_id',
                'cart.quantity',
                'users.name',
                'users.phone',
                'users.relation',
                'products.id as product_id',
                'products.title as product_title',
                'products.image as product_image',
                'products.slug as product_slug',
                'products_variants.id as variant_id',
                'products_variants.unit',
                'products_variants.rate',
                'products_variants.package_type',
                'products_variants.discount_type',
                'products_variants.discount',
                'products_variants.discount_text',
                'products_variants.available_stock'
            ],
            sort: ['cart.created_at', 'desc']
        }, 'cart');

        if (!cartItems || cartItems.length === 0) {
            return response.sendResponse(res, response.build("CART_EMPTY", { }, false));
        }

        // Validate stock availability and calculate totals
        let subtotal = 0;
        let totalDiscount = 0;
        let total = 0;
        const orderItems = [];

        for (const item of cartItems) {
            const itemRate = parseFloat(item.rate) || 0;
            const itemQuantity = parseInt(item.quantity) || 0;
            const itemDiscount = parseFloat(item.discount) || 0;
            const itemDiscountType = item.discount_type.toString(); // 'percentage' or 'fixed'

            // Check stock availability
            if (item.available_stock < itemQuantity) {
                return response.sendResponse(res, response.build("STOCK_ERROR", { 
                    error: `Insufficient stock for ${item.product_title} (${item.unit}). Available: ${item.available_stock}, Requested: ${itemQuantity}` 
                }, false));
            }

            let itemSubtotal = itemRate * itemQuantity;
            let itemDiscountAmount = 0;

            if (itemDiscountType === '2') {
                itemDiscountAmount = (itemSubtotal * itemDiscount) / 100;
            } else if (itemDiscountType === '1') {
                itemDiscountAmount = itemDiscount * itemQuantity;
            }

            const itemTotal = itemSubtotal - itemDiscountAmount;

            subtotal += itemSubtotal;
            totalDiscount += itemDiscountAmount;
            total += itemTotal;

            orderItems.push({
                product_id: item.product_id,
                variant_id: item.variant_id,
                quantity: itemQuantity,
                rate: itemRate,
                discount_type: itemDiscountType,
                discount: itemDiscount,
                discount_amount: itemDiscountAmount,
                subtotal: itemSubtotal,
                total: itemTotal,
                user_id: item.user_id,
                user_name: item.name,
                user_phone: item.phone,
                user_relation: item.relation
            });
        }

        // Validate and apply promo code if provided
        let promoCodeDiscount = 0;
        let promoCodeId = null;
        if (promo_code) {
            const promoCodeData = await commonServices.select({
                type: 'single',
                condition: {
                    code: promo_code.toUpperCase(),
                    status: 'A'
                }
            }, 'promo_codes');

            if (!promoCodeData) {
                return response.sendResponse(res, response.build("PROMOCODE_ERROR", { error: "Invalid promo code" }, false));
            }

            // Check promo code validity dates
            const now = moment();
            const startDate = moment(promoCodeData.start_date);
            const endDate = moment(promoCodeData.end_date);

            if (now.isBefore(startDate) || now.isAfter(endDate)) {
                return response.sendResponse(res, response.build("PROMOCODE_ERROR", { error: "Promo code is not valid for current date" }, false));
            }

            // Check eligible amount
            if (promoCodeData.eligible_amount && subtotal < promoCodeData.eligible_amount) {
                return response.sendResponse(res, response.build("PROMOCODE_ERROR", { 
                    error: `Minimum order amount of ${promoCodeData.eligible_amount} required for this promo code` 
                }, false));
            }

            // Calculate promo code discount
            const promoDiscountType = promoCodeData.discount_type; // 1 = percentage, 2 = fixed
            const promoDiscount = parseFloat(promoCodeData.discount) || 0;

            if (promoDiscountType === 1) { // Percentage
                promoCodeDiscount = (total * promoDiscount) / 100;
                // Apply min/max cap if exists
                if (promoCodeData.min_cap && promoCodeDiscount < promoCodeData.min_cap) {
                    promoCodeDiscount = promoCodeData.min_cap;
                }
                if (promoCodeData.max_cap && promoCodeDiscount > promoCodeData.max_cap) {
                    promoCodeDiscount = promoCodeData.max_cap;
                }
            } else if (promoDiscountType === 2) { // Fixed
                promoCodeDiscount = promoDiscount;
            }

            promoCodeId = promoCodeData.id;
        }

        // Calculate final total
        const finalTotal = total - promoCodeDiscount;
        if (finalTotal < 0) {
            return response.sendResponse(res, response.build("ORDER_AMOUNT_ERROR", { error: "Invalid order total" }, false));
        }

        // Generate order number
        const orderNumber = `ORD${moment().format('YYYYMMDDHHMMSS')}${Math.floor(100000 + Math.random() * 900000)}`;

        // Create order
        const orderData = {
            order_no: orderNumber,
            user_id: parseInt(userId),
            address_id: parseInt(address_id),
            promo_code_id: promoCodeId,
            promo_code: promo_code ? promo_code.toUpperCase() : null,
            subtotal: subtotal.toFixed(2),
            product_discount: totalDiscount.toFixed(2),
            promo_discount: promoCodeDiscount.toFixed(2),
            total: finalTotal.toFixed(2),
            payment_method: payment_method || 'cash',
            payment_status: payment_status,
            order_status: 'Pending',
            created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
            created_ip: ipAddress,
            created_by: userId
        };

        const order = await commonServices.insert(orderData, 'orders');
        if (!order || !order.id) {
            return response.sendResponse(res, response.build("ORDER_ERROR", { error: "Failed to create order" }, false));
        }

        const orderId = order.id;

        // Create order items and update stock
        for (const item of orderItems) {
            // Create order item
            const orderItemData = {
                order_no: orderId,
                product_id: item.product_id,
                variant_id: item.variant_id,
                user_id: item.user_id,
                quantity: item.quantity,
                rate: item.rate,
                discount_type: item.discount_type,
                discount: item.discount,
                discount_amount: item.discount_amount,
                subtotal: item.subtotal,
                total: item.total,
                status: 'A',
                created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                created_ip: ipAddress,
                created_by: userId
            };

            await commonServices.insert(orderItemData, 'order_items');

            // Update product variant stock
            const variant = await commonServices.select({
                type: 'single',
                condition: { id: item.variant_id }
            }, 'products_variants');

            if (variant) {
                const newStock = parseInt(variant.available_stock) - item.quantity;
                await commonServices.update({
                    condition: { id: item.variant_id },
                    data: {
                        available_stock: newStock >= 0 ? newStock : 0,
                        updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
                    }
                }, 'products_variants');
            }
        }

        // Clear cart items for the user
        await commonServices.deleteByCondition(
            { 
                condition : {guest_session_id: null},
                whereIn : whereIn
            }, 
            'cart');

        // Get complete order details
        const orderDetails = await commonServices.select({
            type: 'single',
            condition: { 'orders.id': orderId },
            join: [
                {
                    table: 'users_address',
                    type: 'inner',
                    on: ['orders.address_id', '=', 'users_address.id']
                }
            ],
            select: [
                'orders.id',
                'orders.order_no',
                'orders.user_id',
                'orders.subtotal',
                'orders.product_discount',
                'orders.promo_discount',
                'orders.total',
                'orders.payment_method',
                'orders.payment_status',
                'orders.order_status',
                'orders.created_at',
                'orders.updated_at',
                'users_address.house',
                'users_address.floor',
                'users_address.locality',
                'users_address.area',
                'users_address.map_address',
                'users_address.latitude',
                'users_address.longitude',
                'users_address.type as address_type'
            ]
        }, 'orders');

        return response.sendResponse(res, response.build("SUCCESS", { 
            result: {
                order: orderDetails,
                items: orderItems,
                summary: {
                    subtotal: subtotal.toFixed(2),
                    product_discount: totalDiscount.toFixed(2),
                    promo_discount: promoCodeDiscount.toFixed(2),
                    total: finalTotal.toFixed(2),
                    item_count: orderItems.length
                }
            }
        }, false));
    } catch (error) {
        console.log('error', error);
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }, false));
    }
}; //End of Function

/*********************************************************************************
* Function Name     :   changeStatus
 * Purpose          :   This function is used for data list
 * Created Data     :   04-11-2025
 ********************************************************************************/
exports.changeStatus = async function (req, res) {
    try {
        const userId = req.user.userId
        const { order_id, status } = req.body;
        if (!userId || !status || !order_id) {
            return response.sendResponse(res, response.build("PERMISSION_ERROR", { }, false));
        }
        const where = {
            type : "single",
            condition : { id : parseInt(order_id), user_id : parseInt(userId), order_status : "Pending" },
        }
        const result = await commonServices.select(where, 'orders');
        if(result && result?.id){
            const ipAddress = await getIpAddress(req);
            //Update Order Table
            const orderUpdate = {
                condition : { id : parseInt(order_id) },
                data : {
                    payment_status : status,
                    order_status : status,

                    updated_at : moment().format("YYYY-MM-DD HH:mm:ss"),
                    updated_ip : ipAddress,
                    updated_by : userId
                }
            }
            const result = await commonServices.update(orderUpdate, "orders");
            return response.sendResponse(res, response.build("SUCCESS", { result : result[0] || {}}, false));
        } else{
            return response.sendResponse(res, response.build("ERROR_DATA_NOT_FOUND", { }, false));
        }
    } catch (error) {
        console.log('error',error)
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }, false));
    }
}; //End of Function


/*********************************************************************************
* Function Name     :   list
 * Purpose          :   This function is used for data list
 * Created Data     :   04-11-2025
 ********************************************************************************/
exports.list = async function (req, res) {
    try {
        const userId = req.user.userId
        if (!userId) {
            return response.sendResponse(res, response.build("PERMISSION_ERROR", { }, false));
        }
        const {type = "", condition, select, skip, limit } = req.body;
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
* Function Name     :   list
 * Purpose          :   This function is used for data list
 * Created Data     :   04-11-2025
 ********************************************************************************/
exports.details = async function (req, res) {
    try {
        const userId = req.user.userId;
        const {order_id} = req.body;
        if (!userId || !order_id) {
            return response.sendResponse(res, response.build("PERMISSION_ERROR", { }, false));
        }
        //Order
        const orderOptions = {
            type : "single",
            condition : { id : parseInt(order_id) }
        }
        const orderDetails = await commonServices.select(orderOptions, "orders");

        const orderItemsOptions = {
            condition : { "order_items.order_id" : parseInt(order_id) },
            join : [
                {
                    table: 'products',
                    type: 'inner',
                    on: ['order_items.product_id', '=', 'products.id']
                }
            ],
            select : [
                "order_items.id",
                "order_items.order_id",
                "order_items.order_no",
                "order_items.product_id",
                "order_items.variant_id",
                "order_items.quantity",
                "order_items.rate",
                "order_items.discount_type",
                "order_items.discount",
                "order_items.discount_amount",
                "order_items.subtotal",
                "order_items.total",
                "order_items.status",
                "order_items.created_at",

                "products.title",
                "products.image",

            ]
        }
        const orderItems = await commonServices.select(orderItemsOptions, 'order_items');
        return response.sendResponse(res, response.build("SUCCESS", { result : { orderDetails, orderItems } }, false));
        
    } catch (error) {
        console.log('error',error)
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }, false));
    }
}; //End of Function

