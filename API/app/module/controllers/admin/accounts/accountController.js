const response = require('../../../../util/response');
const accountServices = require("../../../services/adminService");
const commonServices = require("../../../services/commonServices");
const { createMD5Hash, checkMD5Password} = require("../../../../util/crypto");
const { generateToken } = require("../../../../util/authToken");
const {getIpAddress} = require("../../../../util/utility"); 
const moment = require('moment');
/*********************************************************************************
 * Function Name    :   List
 * Purpose          :   This function is used for get users list
 * Created By       :   Afsar Ali
 * Created Data     :   09-12-2024
 * Updated By       :   
 * Update Data      :
 ********************************************************************************/
exports.login = async function (req, res) {
    try {
        const {email, password} = req.body;
        if(!email){
            return response.sendResponse(res, response.build("EMAIL_EMPTY", { }));
        } else if(!password){
            return response.sendResponse(res, response.build("PASSWORD_EMPTY", { }));
        } else{
            const where = {
                type : "single",
                condition : {
                    email : email
                },
                select : ['id', 'email', 'status', 'password']
            }
            const userData = await accountServices.selectAdmins(where);
            if(userData && userData.status === "A"){
                const hashedPassword = await createMD5Hash(password);
                if(hashedPassword === userData?.password){
                    // let code = Math.floor(100000 + Math.random() * 900000);
                    let code = 654321;
                    const updateOption = {
                        condition : {id : userData?.id},
                        data : {
                            users_otp : parseInt(code)
                        }
                    }
                    await accountServices.updateAdmin(updateOption);
                    return response.sendResponse(res, response.build("SUCCESS", { result : {} }));
                } else {
                    return response.sendResponse(res, response.build("INVALID_LOGIN_CREDENTIAL", { }));
                }
            } else if(userData && userData.status === "I"){
                return response.sendResponse(res, response.build("INACTIVE_ACCOUNT", {  }));
            } else if(userData && userData.status === "B"){
                return response.sendResponse(res, response.build("BLOCK_ACCOUNT", {  }));
            } else if(userData && userData.status === "D"){
                return response.sendResponse(res, response.build("DELETE_ACCOUNT", {  }));
            } else {
                return response.sendResponse(res, response.build("INVALID_LOGIN_CREDENTIAL", { }));
            }
        }
    } catch (error) {
        console.log('error',error)
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
    }
}; //End of Function 

/*********************************************************************************
 * Function Name    :   verifyOTP
 * Purpose          :   This function is used for verify OTP
 * Created By       :   Afsar Ali
 * Created Data     :   28-06-2025
 * Updated By       :   
 * Update Data      :
 * Remarks          :
 ********************************************************************************/
exports.verifyOTP = async function (req, res) {
    try {
        const {email, otp} = req.body;
        if(!email){
            return response.sendResponse(res, response.build("EMAIL_EMPTY", { }));
        } else if(!otp){
            return response.sendResponse(res, response.build("OTP_EMPTY", { }));
        } else{
            const where = {
                type : "single",
                condition : {
                    email : email
                },
                // select : ['id', 'email', 'status', 'users_otp']
            }
            const userData = await accountServices.selectAdmins(where);
            if(userData && userData.status === "A"){
                if(parseInt(otp) === userData?.users_otp){
                    const token = await generateToken(userData?.id, 
                        "Super Admin", 
                        "Super Admin", 
                        '365 days');
                    const updateOption = {
                        condition : {id : userData?.id},
                        data : {
                            token : token,
                            users_otp : null,
                            login_at : moment().format('YYYY-MM-DD HH:mm:ss'),
                            login_ip : ":1"
                        }
                    }
                    const result = await accountServices.updateAdmin(updateOption);
                    let permission = [];
                    if(result && result?.id){
                        const permissionWhere = {
                            condition : { status : "A", user_id : result?.id }
                        }
                        permission = await commonServices.select(permissionWhere,'permission_module');
                    }
                    return response.sendResponse(res, response.build("SUCCESS", { result : result, permission : permission }));
                } else {
                    return response.sendResponse(res, response.build("INVALID_OTP", { }));
                }
            } else if(userData && userData.status === "I"){
                return response.sendResponse(res, response.build("INACTIVE_ACCOUNT", {  }));
            } else if(userData && userData.status === "B"){
                return response.sendResponse(res, response.build("BLOCK_ACCOUNT", {  }));
            } else {
                return response.sendResponse(res, response.build("DELETE_ACCOUNT", {  }));
            }
            // if(userData && )
        }
    } catch (error) {
        console.log('error',error)
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
    }
}; //End of Function 

/*********************************************************************************
 * Function Name    :   forgotPassword
 * Purpose          :   This function is used for get forgot password
 * Created By       :   Afsar Ali
 * Created Data     :   28-06-2025
 * Updated By       :   
 * Update Data      :
 * Remarks          :
 ********************************************************************************/
exports.forgotPassword = async function (req, res) {
    try {
        const {email} = req.body;
        if(!email){
            return response.sendResponse(res, response.build("EMAIL_EMPTY", { }));
        } else{
            const where = {
                type : "single",
                condition : {
                    email : email
                },
                select : ['id', 'email', 'status']
            }
            const userData = await accountServices.selectAdmins(where);
            if(userData && userData.status === "A"){
                // let code = Math.floor(100000 + Math.random() * 900000);
                let code = 654321;
                const updateOption = {
                    condition : {id : userData?.id},
                    data : {
                        users_otp : parseInt(code)
                    }
                }
                await accountServices.updateAdmin(updateOption);
                return response.sendResponse(res, response.build("SUCCESS", { result : {} }));
            } else if(userData && userData.status === "I"){
                return response.sendResponse(res, response.build("INACTIVE_ACCOUNT", {  }));
            } else if(userData && userData.status === "B"){
                return response.sendResponse(res, response.build("BLOCK_ACCOUNT", {  }));
            } else {
                return response.sendResponse(res, response.build("DELETE_ACCOUNT", {  }));
            }
            // if(userData && )
        }
    } catch (error) {
        console.log('error',error)
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
    }
}; //End of Function 

/*********************************************************************************
 * Function Name    :   verifyOTP
 * Purpose          :   This function is used for reset password
 * Created By       :   Afsar Ali
 * Created Data     :   28-06-2025
 * Updated By       :   
 * Update Data      :
 * Remarks          :
 ********************************************************************************/
exports.resetPassword = async function (req, res) {
    try {
        const {email, otp, password} = req.body;
        if(!email){
            return response.sendResponse(res, response.build("EMAIL_EMPTY", { }));
        } else if(!otp){
            return response.sendResponse(res, response.build("OTP_EMPTY", { }));
        } else if(!password){
            return response.sendResponse(res, response.build("PASSWORD_EMPTY", { }));
        } else{
            const where = {
                type : "single",
                condition : {
                    email : email
                },
                // select : { email : true, status : true }
                select : ['id', 'email', 'status', 'users_otp']
            }
            const userData = await accountServices.selectAdmins(where);
            if(userData && userData.status === "A"){
                if(parseInt(otp) === userData?.users_otp){
                    const hashedPassword = await createMD5Hash(password);
                    const updateOption = {
                        condition : {id : userData?.id},
                        data : {
                            password : hashedPassword,
                            users_otp : ""
                        }
                    }
                    const result = await accountServices.updateAdmin(updateOption);
                    return response.sendResponse(res, response.build("SUCCESS", { result : {} }));
                } else {
                    return response.sendResponse(res, response.build("INVALID_OTP", { }));
                }
            } else if(userData && userData.status === "I"){
                return response.sendResponse(res, response.build("INACTIVE_ACCOUNT", {  }));
            } else if(userData && userData.status === "B"){
                return response.sendResponse(res, response.build("BLOCK_ACCOUNT", {  }));
            } else {
                return response.sendResponse(res, response.build("DELETE_ACCOUNT", {  }));
            }
            // if(userData && )
        }
    } catch (error) {
        console.log('error',error)
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
    }
}; //End of Function

/*********************************************************************************
 * Function Name    :   verifyOTP
 * Purpose          :   This function is used for reset password
 * Created Data     :   28-06-2025
 ********************************************************************************/
exports.getSubAdmin = async function (req, res) {
    try {
        const userId = req.user.userId;
        const {type = "", condition, select, skip, limit } = req.body;
        const {name, phone, email, status} = condition;
        if(!userId){
            return response.sendResponse(res, response.build("PERMISSION_ERROR", { }));
        } else{
            let whereCondition = {};
            let like = {};
            if(name) like['name'] = `%${name}%`;
            if(phone) whereCondition.phone = parseInt(phone);
            if(email) whereCondition.email = email;
            if(status) whereCondition.status = status;
            const where = {
                type : type,
                condition : {
                    ...whereCondition,
                    admin_type : "Sub Admin",
                },
                like : like || {},
                select : select || '*',
                skip : skip || 0,
                limit : limit || 10
            }
            const result = await commonServices.select(where, "admin");
            if(result && result?.length > 0){
                const option = {
                    type : "count",
                    condition : {
                        ...whereCondition,
                        admin_type : "Sub Admin",
                    },
                    like : like || {},
                }
                const count = await commonServices.select(option,"admin");
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
 * Function Name    :   verifyOTP
 * Purpose          :   This function is used for reset password
 * Created Data     :   28-06-2025
 ********************************************************************************/
exports.addEditSubAdmin = async function (req, res) {
    try {
        const userId = req.user.userId;
        const {edit_id, name, email, phone, permissions = [] } = req.body;
        if(!userId){
            return response.sendResponse(res, response.build("PERMISSION_ERROR", { }));
        } else if(!name){
            return response.sendResponse(res, response.build("NAME_EMPTY", { }));
        } else if(!email){
            return response.sendResponse(res, response.build("NAME_EMPTY", { }));
        } else if(!phone){
            return response.sendResponse(res, response.build("NAME_EMPTY", { }));
        // } else if(!password && !editId){
        //     return response.sendResponse(res, response.build("NAME_EMPTY", { }));
        } else{
            const where = {
                type : "count",
                condition : {
                    email : email,
                    // admin_type : "Sub Admin",
                }
            }
            const count = await accountServices.selectAdmins(where);
            if(count > 0 && !edit_id){
                return response.sendResponse(res, response.build("ERROR_ALREADY_EXIST", { }));
            } else {
                const ipAddress = await getIpAddress(req);
                const param = {
                    name : name,
                    phone : phone,
                }
                if(permissions && permissions?.length > 0){
                    await Promise.all(
                        permissions.map(async (item) => {
                        const permissionOptions = {
                            user_id: edit_id || "",
                            module: item?.module,
                            permissions_json: item?.permissions_json,
                        };
                        await addEditModulePermission(permissionOptions);
                        })
                    );
                }
                if(edit_id){
                    const updateParam = {
                        condition : {id : edit_id},
                        data : {
                            ...param,
                            updated_ip : ipAddress 
                        }
                    }
                    const result = await accountServices.updateAdmin(updateParam);
                    return response.sendResponse(res, response.build("SUCCESS", { result }));
                } else {
                    const hashedPassword = await createMD5Hash("Admin@123");
                    const insertParam = {
                        ...param,
                        email : email,
                        admin_type : "Sub Admin",
                        password : hashedPassword,
                        created_at : moment().format('YYYY-MM-DD HH:mm:ss')
                    }
                    const result = await accountServices.insertAdmin(insertParam);
                    return response.sendResponse(res, response.build("SUCCESS", { result }));
                }
            }
        }
    } catch (error) {
        console.log('error',error)
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }));
    }
}; //End of Function
const addEditModulePermission = async (options={}) => {
    try {
        const { user_id, module, permissions_json} = options;
        const where = {
            type : 'single',
            condition : { user_id : user_id, module }
        }
        const isExist = await commonServices.select(where,'permission_module');
        if(isExist){
            const updateOptions = {
                condition: { user_id, module },
                data: { permissions_json, updated_at: new Date() },
            };
            await commonServices.update(updateOptions, "permission_module");
        } else{
            const insertData = {
                user_id,
                module,
                permissions_json,
                status : "A",
                created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
            };
            await commonServices.insert(insertData, "permission_module");
        }

    } catch (error) {
        console.error("Error in addEditModulePermission:", error);
    }
}
/*********************************************************************************
 * Function Name    :   changeSubAdminStatus
 * Purpose          :   This function is used for reset password
 * Created Data     :   28-06-2025
 ********************************************************************************/
exports.changeSubAdminStatus = async function (req, res) {
    try {
        const userId = req.user.userId;
        const {id, status } = req.body;
        if(!userId){
            return response.sendResponse(res, response.build("PERMISSION_ERROR", { }));
        } else{
            const ipAddress = await getIpAddress(req);
            const updateParam = {
                condition : { id : id },
                data : { 
                    status : status,
                    updated_ip : ipAddress
                }
            }
            const result = await accountServices.updateAdmin(updateParam);
            return response.sendResponse(res, response.build("SUCCESS", { result }));
        } 
    } catch (error) {
        
    }
}
/*********************************************************************************
 * Function Name    :   getPermission
 * Purpose          :   This function is used for reset password
 * Created Data     :   16-10-2025
 ********************************************************************************/
exports.getPermission = async function (req, res) {
    try {
        const userId = req.user.userId;
        const { admin_id } = req.body;
        if(!userId || !admin_id){
            return response.sendResponse(res, response.build("PERMISSION_ERROR", { }));
        } else{
            const option = {
                condition : { status : "A", user_id : parseInt(admin_id) },
            }
            const result = await commonServices.select(option,'permission_module');
            return response.sendResponse(res, response.build("SUCCESS", { result }));
        } 
    } catch (error) {
        
    }
}