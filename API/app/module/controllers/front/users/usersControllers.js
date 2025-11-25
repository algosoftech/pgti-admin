const response = require('../../../../util/response');
const commonServices = require("../../../services/commonServices");
const moment = require('moment');
const { getIpAddress } = require("../../../../util/utility");
const { generateToken } = require("../../../../util/authToken");

/*********************************************************************************
 * Function Name    :   login
 * Purpose          :   This function is used for get login
 * Created By       :   Afsar Ali
 * Created Date     :   04-11-2025
 ********************************************************************************/
exports.login = async function (req, res) {
    try {
        const { phone } = req.body;
        if(!phone){
            return response.sendResponse(res, response.build("PHONE_EMPTY", { }, false));
        } else{
            const where = {
                type : "single",
                condition : {
                    phone : phone?.toString()
                },
                select : ['id', 'phone', 'status']
            }
            const userData = await commonServices.select(where,'users');
            const ipAddress = await getIpAddress(req);
            // let code = Math.floor(100000 + Math.random() * 900000);
            let code = 654321;
            if(userData && userData.status === "A"){
                    const updateOption = {
                        condition : {id : userData?.id},
                        data : {
                            users_otp : code,
                        }
                    }
                    await commonServices.update(updateOption, 'users');
                    return response.sendResponse(res, response.build("SUCCESS", { result : {} }, false));
                
            } else if(userData && userData.status === "I"){
                return response.sendResponse(res, response.build("INACTIVE_ACCOUNT", {  },false));
            } else if(userData && userData.status === "B"){
                return response.sendResponse(res, response.build("BLOCK_ACCOUNT", {  },false));
            } else if(userData && userData.status === "D"){
                return response.sendResponse(res, response.build("DELETE_ACCOUNT", {  },false));
            } else {
                const param = {
                    name : "Guest",
                    phone : phone?.toString(),
                    status : "A",
                    users_otp : code,
                    created_at : moment().format("YYYY-MM-DD HH:mm:ss"),
                    created_ip : ipAddress || ":1"
                }
                await commonServices.insert(param, 'users');
                return response.sendResponse(res, response.build("SUCCESS", { result : {} },false));
            }
        }
    } catch (error) {
        console.log('error',error)
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error },false));
    }
}; //End of Function 

/*********************************************************************************
 * Function Name    :   verifyOtp
 * Purpose          :   This function is used for registration
 * Created By       :   Afsar Ali
 * Created Date     :   04-11-2025
 ********************************************************************************/
exports.verifyOtp = async function (req, res) {
    try {
        const {phone, otp, device_id, latitude, longitude} = req.body;
        if(!phone){
            return response.sendResponse(res, response.build("EMAIL_EMPTY", { }, false));
        } else if(!otp){
            return response.sendResponse(res, response.build("OTP_EMPTY", { }, false));
        } else{
            const options = {
                type : "single",
                condition : { phone : phone, status : "A" },
                select : ['id', 'users_otp', 'status']
            }
            const data = await commonServices.select(options, 'users');
            if(data && data?.users_otp?.toString() === otp?.toString()){
                const ipAddress = await getIpAddress(req);
                const token = await generateToken(data?.id, 
                    "Users", 
                    "Users", 
                    '365 days');
                const updateOption = {
                    condition : {id : data?.id},
                    data : {
                        token : token,
                        users_otp : null,
                        login_at : moment().format('YYYY-MM-DD HH:mm:ss'),
                        login_ip : ipAddress || ":1",
                        ...(device_id && {device_id : device_id}),
                        ...(latitude && {latitude : latitude}),
                        ...(longitude && {longitude : longitude}),
                    }
                }
                const result = await commonServices.update(updateOption,'users');
                
                return response.sendResponse(res, response.build("SUCCESS", {result : result?.length > 0 ? result[0]:[]}, false));
            } else {
                return response.sendResponse(res, response.build("INVALID_OTP", { }, false));
            }
        }
    } catch (error) {
        console.log('error',error)
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }, false));
    }
}

/*********************************************************************************
 * Function Name    :   getProfileData
 * Purpose          :   This function is used for get profile data
 * Created Data     :   04-11-2025
 ********************************************************************************/
exports.getProfileData = async function (req, res) {
    try {
        const userId = req.user.userId;
        if(!userId){
            return response.sendResponse(res, response.build("PERMISSION_ERROR", { }, false));
        } else{
            const where = {
                type : "single",
                condition : { id : parseInt(userId) },
            }
            const result = await commonServices.select(where, 'users');
            return response.sendResponse(res, response.build("SUCCESS", {result : result || {} }, false));
        } 
    } catch (error) {
        console.log('error : ',error);
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }, false));
    }
}

/*********************************************************************************
 * Function Name    :   updateProfileData
 * Purpose          :   This function is used for update profile data
 * Created Data     :   11-11-2025
 ********************************************************************************/
exports.updateProfileData = async function (req, res) {
    try {
        const userId = req.user.userId;
        const { name, email, gender, date_of_birth } = req.body;
        if(!userId){
            return response.sendResponse(res, response.build("PERMISSION_ERROR", { }, false));
        } else{
            const ipAddress = await getIpAddress(req);
            const updateOption = {
                condition : { id : userId },
                data : {
                    ...(name && {name : name}),
                    ...(email && {email : email}),
                    ...(gender && {gender : gender}),
                    ...(date_of_birth && {date_of_birth : date_of_birth}),
                    updated_at : moment().format('YYYY-MM-DD HH:mm:ss'),
                    updated_ip : ipAddress,
                    updated_by : userId
                }
            }
            const result = await commonServices.update(updateOption,"users");
            return response.sendResponse(res, response.build("SUCCESS", {result : result[0] || {} }, false));
        } 
    } catch (error) {
        console.log('error : ',error);
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }, false));
    }
}

/*********************************************************************************
 * Function Name    :   logout
 * Purpose          :   This function is used for get logout
 * Created Data     :   04-11-2025
 ********************************************************************************/
exports.logout = async function (req, res) {
    try {
        const userId = req.user.userId;
        if(!userId){
            return response.sendResponse(res, response.build("PERMISSION_ERROR", { }, false));
        } else{
            const option = {
                condition : { id : parseInt(userId) },
                data : { token : "", users_otp : "" }
            }
            const result = await commonServices.update(option, 'users');
            return response.sendResponse(res, response.build("SUCCESS", {result : {} }, false));
        } 
    } catch (error) {
        console.log('error : ',error);
        return response.sendResponse(res, response.build('ERROR_SERVER_ERROR', { error }, false));
    }
}
