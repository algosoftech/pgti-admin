const response = require('../../../../util/response');
const commonServices = require("../../../services/commonServices");
const moment = require('moment');
const { getOrCreateGuestSession, getUserIdentifier } = require('../../../../util/guestSession');

/*********************************************************************************
* Function Name     :   addToCart
 * Purpose          :   This function is used to add product to cart
 * Created Data     :   04-11-2025
 ********************************************************************************/
exports.addToCart = async function (req, res) {
    try {
        const { product_id, variant_id, quantity = 1 } = req.body;

        if (!product_id || !variant_id) {
            return response.sendResponse(res, response.build("PERMISSION_ERROR", { error: "Product ID and Variant ID are required" }, false));
        }

        // Get user identifier (authenticated user or guest)
        const userInfo = getUserIdentifier(req);
        let guestSessionId = userInfo.guestSessionId;

        // If guest, create or get guest session
        if (userInfo.isGuest) {
            guestSessionId = getOrCreateGuestSession(req, res);
        }

        // Check if product variant exists and is available
        const variant = await commonServices.select({
            type: 'single',
            condition: {
                id: parseInt(variant_id),
                product: parseInt(product_id),
                status: 'A'
            }
        }, 'products_variants');

        if (!variant) {
            return response.sendResponse(res, response.build("PERMISSION_ERROR", { error: "Product variant not found or unavailable" }, false));
        }

        // Check available stock
        if (variant.available_stock < quantity) {
            return response.sendResponse(res, response.build("PERMISSION_ERROR", { error: "Insufficient stock available" }, false));
        }

        // Build condition for checking existing cart item
        const cartCondition = {
            product_id: parseInt(product_id),
            variant_id: parseInt(variant_id)
        };

        if (userInfo.userId) {
            cartCondition.user_id = userInfo.userId;
            cartCondition.guest_session_id = null;
        } else {
            cartCondition.user_id = null;
            cartCondition.guest_session_id = guestSessionId;
        }

        // Check if item already exists in cart
        const existingCartItem = await commonServices.select({
            type: 'single',
            condition: cartCondition
        }, 'cart');
        if (existingCartItem) {
            // Update quantity
            const newQuantity = existingCartItem.quantity + parseInt(quantity);
            
            if (variant.available_stock < newQuantity) {
                return response.sendResponse(res, response.build("PERMISSION_ERROR", { error: "Insufficient stock available" }, false));
            }
            
            const updated = await commonServices.update({
                condition: { id: existingCartItem.id },
                data: {
                    quantity: newQuantity,
                    updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
                }
            }, 'cart');

            return response.sendResponse(res, response.build("SUCCESS", { result: updated[0] || existingCartItem }, false));
        } else {
            // Add new item to cart
            const cartData = {
                user_id: userInfo.userId || null,
                guest_session_id: userInfo.isGuest ? guestSessionId : null,
                product_id: parseInt(product_id),
                variant_id: parseInt(variant_id),
                quantity: parseInt(quantity),
                created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
            };
            const newCartItem = await commonServices.insert(cartData, 'cart');
            return response.sendResponse(res, response.build("SUCCESS", { result: newCartItem }, false));
        }
    } catch (error) {
        console.log('error', error);
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }, false));
    }
}; //End of Function

/*********************************************************************************
* Function Name     :   getCart
 * Purpose          :   This function is used to get user's cart items
 * Created Data     :   04-11-2025
 ********************************************************************************/
exports.getCart = async function (req, res) {
    try {
        // Get user identifier (authenticated user or guest)
        const userInfo = getUserIdentifier(req);
        let guestSessionId = userInfo.guestSessionId;
        // If guest, create or get guest session
        if (userInfo.isGuest) {
            guestSessionId = getOrCreateGuestSession(req, res);
        }

        // Build condition for cart items
        const cartCondition = {};
        const whereIn = {};
        if (userInfo.userId && (userInfo.userId !== null || userInfo.userId !== "null")) {
            whereIn.user_id = [userInfo.userId];
            cartCondition.guest_session_id = null;
            const familyList = await commonServices.select({
                condition : { status : "A", bind_with : parseInt(userInfo.userId) },
                limit : 50,
                select : ["id"]
            }, 'users');
            if (Array.isArray(familyList) && familyList.length > 0) {
                const familyIdList = familyList.map(item => item.id);
                whereIn.user_id.push(...familyIdList);
            }
        } else {
            // cartCondition.user_id = null;
            cartCondition.guest_session_id = guestSessionId;
        }
        // Get cart items with product and variant details
        const cartOptions = {
            condition: {
                ...cartCondition,
            },
            ...((whereIn && userInfo.isGuest === false) && {whereIn : whereIn}),
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
                ...(userInfo.isGuest === false
                    ? [{
                        table: 'users',
                        type: 'inner',
                        on: ['cart.user_id', '=', 'users.id']
                    }]
                    : []
                )
            ],
            select: [
                'cart.id',
                'cart.user_id',
                'cart.quantity',
                'cart.created_at',
                'cart.updated_at',
                
                ...(userInfo.isGuest === false
                    ? [
                        'users.name',
                        'users.phone',
                        'users.relation'
                    ]
                    : []
                ),

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
        };
        const cartItems = await commonServices.select(cartOptions, 'cart');
        // Calculate totals
        let subtotal = 0;
        let totalDiscount = 0;
        let total = 0;

        const itemsWithTotals = cartItems.map(item => {
            const itemRate = parseFloat(item.rate) || 0;
            const itemQuantity = parseInt(item.quantity) || 0;
            const itemDiscount = parseFloat(item.discount) || 0;
            const itemDiscountType = item?.discount_type?.toString(); // 'percentage' or 'fixed'

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

            return {
                ...item,
                item_subtotal: itemSubtotal,
                item_discount: itemDiscountAmount,
                item_total: itemTotal
            };
        });

        return response.sendResponse(res, response.build("SUCCESS", {
            result: {
                items: itemsWithTotals,
                summary: {
                    subtotal: subtotal.toFixed(2),
                    total_discount: totalDiscount.toFixed(2),
                    total: total.toFixed(2),
                    item_count: itemsWithTotals.length
                }
            }
        }, false));
    } catch (error) {
        console.log('error', error);
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }, false));
    }
}; //End of Function

/*********************************************************************************
* Function Name     :   updateCartItem
 * Purpose          :   This function is used to update cart item quantity
 * Created Data     :   04-11-2025
 ********************************************************************************/
exports.updateCartItem = async function (req, res) {
    try {
        const { cart_id, quantity } = req.body;

        if (!cart_id || !quantity) {
            return response.sendResponse(res, response.build("PERMISSION_ERROR", { error: "Cart ID and quantity are required" }, false));
        }

        if (parseInt(quantity) <= 0) {
            return response.sendResponse(res, response.build("PERMISSION_ERROR", { error: "Quantity must be greater than 0" }, false));
        }

        // Get user identifier (authenticated user or guest)
        const userInfo = getUserIdentifier(req);
        let guestSessionId = userInfo.guestSessionId;

        // If guest, create or get guest session
        if (userInfo.isGuest) {
            guestSessionId = getOrCreateGuestSession(req, res);
        }

        // Build condition for cart item
        const cartCondition = { id: parseInt(cart_id) };
        if (userInfo.userId) {
            cartCondition.user_id = userInfo.userId;
            cartCondition.guest_session_id = null;
        } else {
            cartCondition.user_id = null;
            cartCondition.guest_session_id = guestSessionId;
        }

        // Get cart item
        const cartItem = await commonServices.select({
            type: 'single',
            condition: cartCondition
        }, 'cart');

        if (!cartItem) {
            return response.sendResponse(res, response.build("PERMISSION_ERROR", { error: "Cart item not found" }, false));
        }

        // Check variant stock
        const variant = await commonServices.select({
            type: 'single',
            condition: {
                id: cartItem.variant_id,
                status: 'A'
            }
        }, 'products_variants');

        if (!variant) {
            return response.sendResponse(res, response.build("PERMISSION_ERROR", { error: "Product variant not available" }, false));
        }

        if (variant.available_stock < parseInt(quantity)) {
            return response.sendResponse(res, response.build("PERMISSION_ERROR", { error: "Insufficient stock available" }, false));
        }

        // Update cart item
        const updated = await commonServices.update({
            condition: { id: parseInt(cart_id) },
            data: {
                quantity: parseInt(quantity),
                updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
            }
        }, 'cart');

        return response.sendResponse(res, response.build("SUCCESS", { result: updated[0] || cartItem }, false));
    } catch (error) {
        console.log('error', error);
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }, false));
    }
}; //End of Function

/*********************************************************************************
* Function Name     :   removeFromCart
 * Purpose          :   This function is used to remove item from cart
 * Created Data     :   04-11-2025
 ********************************************************************************/
exports.removeFromCart = async function (req, res) {
    try {
        const { cart_id } = req.body;

        if (!cart_id) {
            return response.sendResponse(res, response.build("PERMISSION_ERROR", { error: "Cart ID is required" }, false));
        }

        // Get user identifier (authenticated user or guest)
        const userInfo = getUserIdentifier(req);
        let guestSessionId = userInfo.guestSessionId;

        // If guest, create or get guest session
        if (userInfo.isGuest) {
            guestSessionId = getOrCreateGuestSession(req, res);
        }

        // Build condition for cart item
        const cartCondition = { id: parseInt(cart_id) };
        if (userInfo.userId) {
            cartCondition.user_id = userInfo.userId;
            cartCondition.guest_session_id = null;
        } else {
            cartCondition.user_id = null;
            cartCondition.guest_session_id = guestSessionId;
        }

        // Verify cart item belongs to user/guest
        const cartItem = await commonServices.select({
            type: 'single',
            condition: cartCondition
        }, 'cart');

        if (!cartItem) {
            return response.sendResponse(res, response.build("PERMISSION_ERROR", { error: "Cart item not found" }, false));
        }

        // Delete cart item
        await commonServices.delete({ id: parseInt(cart_id) }, 'cart');

        return response.sendResponse(res, response.build("SUCCESS", { result: { message: "Item removed from cart successfully" } }, false));
    } catch (error) {
        console.log('error', error);
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }, false));
    }
}; //End of Function

/*********************************************************************************
* Function Name     :   clearCart
 * Purpose          :   This function is used to clear all items from cart
 * Created Data     :   04-11-2025
 ********************************************************************************/
exports.clearCart = async function (req, res) {
    try {
        // Get user identifier (authenticated user or guest)
        const userInfo = getUserIdentifier(req);
        let guestSessionId = userInfo.guestSessionId;

        // If guest, create or get guest session
        if (userInfo.isGuest) {
            guestSessionId = getOrCreateGuestSession(req, res);
        }

        // Build condition for deleting cart items
        const deleteCondition = {};
        if (userInfo.userId) {
            deleteCondition.user_id = userInfo.userId;
            deleteCondition.guest_session_id = null;
        } else {
            deleteCondition.user_id = null;
            deleteCondition.guest_session_id = guestSessionId;
        }

        // Delete all cart items for user/guest
        await commonServices.delete(deleteCondition, 'cart');

        return response.sendResponse(res, response.build("SUCCESS", { result: { message: "Cart cleared successfully" } }, false));
    } catch (error) {
        console.log('error', error);
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }, false));
    }
}; //End of Function

/*********************************************************************************
* Function Name     :   migrateGuestCart
 * Purpose          :   This function is used to migrate guest cart to user cart after login
 * Created Data     :   04-11-2025
 ********************************************************************************/
exports.migrateGuestCart = async function (req, res) {
    try {
        const userId = req.user?.userId || req.user?.data?.id;
        const guestSessionId = req.cookies?.guest_session_id;

        if (!userId) {
            return response.sendResponse(res, response.build("UNAUTHORIZED", { error: "User authentication required" }, false));
        }

        if (!guestSessionId) {
            return response.sendResponse(res, response.build("SUCCESS", { result: { message: "No guest cart to migrate" } }, false));
        }

        // Get guest cart items
        const guestCartItems = await commonServices.select({
            condition: {
                user_id: null,
                guest_session_id: guestSessionId
            }
        }, 'cart');

        if (!guestCartItems || guestCartItems.length === 0) {
            return response.sendResponse(res, response.build("SUCCESS", { result: { message: "No guest cart items to migrate" } }, false));
        }

        let migratedCount = 0;
        let mergedCount = 0;

        // Process each guest cart item
        for (const guestItem of guestCartItems) {
            // Check if user already has this item in cart
            const existingUserItem = await commonServices.select({
                type: 'single',
                condition: {
                    user_id: userId,
                    product_id: guestItem.product_id,
                    variant_id: guestItem.variant_id,
                    guest_session_id: null
                }
            }, 'cart');

            if (existingUserItem) {
                // Merge quantities
                const newQuantity = existingUserItem.quantity + guestItem.quantity;
                await commonServices.update({
                    condition: { id: existingUserItem.id },
                    data: {
                        quantity: newQuantity,
                        updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
                    }
                }, 'cart');
                // Delete the guest cart item after merging
                await commonServices.delete({ id: guestItem.id }, 'cart');
                mergedCount++;
            } else {
                // Migrate item to user cart
                await commonServices.update({
                    condition: { id: guestItem.id },
                    data: {
                        user_id: userId,
                        guest_session_id: null,
                        updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
                    }
                }, 'cart');
                migratedCount++;
            }
        }

        return response.sendResponse(res, response.build("SUCCESS", {
            result: {
                message: "Cart migrated successfully",
                migrated: migratedCount,
                merged: mergedCount,
                total: migratedCount + mergedCount
            }
        }, false));
    } catch (error) {
        console.log('error', error);
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }, false));
    }
}; //End of Function

