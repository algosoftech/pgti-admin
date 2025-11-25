// import  { REACT_APP_API_BASE_URL }  from '../../config/constants';
import {getRequest, postRequest} from '../API';
import {encryptData} from "../Encryption"
const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL
/*********************************************************
 *  This function is use to login api
 *********************************************************/
export const login = async (options)=>{
    try{
        const {email, password}= options;
        if(!email){
            return {status : false, message:"Email is required"}
        } else if(!password){
            return {status : false, message:"Password is required"}
        } else{
            const postData ={ 
                url : REACT_APP_API_BASE_URL+'./admin/accounts/login',
                postData : options
             }
             const res = await postRequest(postData);
            if(res.status === true || res.status === 200){
                return {status : true, message:`Your One Time Password is sent to ${email}`, username : `${res?.response?.result?.username}`}
            } else{
                return {status : false, message:res?.response?.data?.statusMessage}
            }
        }
    }catch(error){
        console.log('error', error);
        return { status : false, message : error?.response?.data?.statusMessage }
    }
}; //End of Function

/*********************************************************
 *  This function is use to login api
 *********************************************************/
export const verifyLoginOtp = async (options)=>{
    try{
        const {email, otp}= options;
        if(!email){
            return {status : false, message:"Email is required"}
        } else if(!otp){
            return {status : false, message:"One Time Password is required"}
        } else{
            const posrData ={ 
                url : REACT_APP_API_BASE_URL+'./admin/accounts/verify-otp',
                postData : options
             }
            const res = await postRequest(posrData);
            console.log('res', res);
            if(res.status === true || res.status === 200){
                sessionStorage.setItem('TOKEN', res.data.response.result.token);
                sessionStorage.setItem('ADMIN-INFO', JSON.stringify(res.data.response.result));

                sessionStorage.setItem('ADMIN-INFO', JSON.stringify(res.data.response.result));
                sessionStorage.setItem('TOKEN', res.data.response.result.token);
                if(res.data.response?.permission){
                    sessionStorage.setItem('ADMIN-PERMISSION', JSON.stringify(res.data.response?.permission));
                    const encodedData = await encryptData(JSON.stringify(res.data.response?.permission));
                    sessionStorage.setItem('ADMIN-PERMISSION', JSON.stringify(encodedData));

                }
                return {status : true, message:`Welcome Back! ${res.data.response.result.name}`};
            } else{
                return {status : false, message : res?.response?.data?.statusMessage}
            }
        }
    }catch(error){
        console.log(error);
        return {status : false, message : error?.response?.data?.statusMessage}
    }
}; //End of Function
/*********************************************************
 *  This function is use to logout user and clear session and local storage
 *********************************************************/
export const logout = async() => {
    try{
        const postData ={ 
            url : REACT_APP_API_BASE_URL+'./crm/users/logout',
         }
        await getRequest(postData);
        sessionStorage.clear();
        sessionStorage.clear();
        return {status : true, message:"Success"}
    } catch(error){
        sessionStorage.clear();
        sessionStorage.clear();
        return {status : true, message:"Success"}
    }   
}

/*********************************************************
 *  This function is use to forgot password
 *********************************************************/
export const forgotPassword = async (options)=>{
    try{
        const {email}= options;
        if(!email){
            return {status : false, message:"Email is required"}
        } else{
            const postData ={ 
                url : REACT_APP_API_BASE_URL+'./admin/accounts/forgot-password',
                postData : options
             }
            const res = await postRequest(postData);
            if(res.status === true || res.status === 200){
                return {status : true, message:`Your One Time Password is sent to ${email}`}
            } else{
                return {status : false, message:res?.response?.data?.statusMessage}
            }
        }
    }catch(error){
        return {status : false, message : error?.response?.data?.statusMessage}
    }
}; //End of Function

/*********************************************************
 *  This function is use to forgot password
 *********************************************************/
export const resetPassword = async (options)=>{
    try{
        const {email, otp, password}= options;
        if(!email){
            return {status : false, message:"Email is required"}
        } else if(!password){
            return {status : false, message:"New Password required"}
        } else if(!otp){
            return {status : false, message:"OTP is required"}
        } else{
            const posrData ={ 
                url : REACT_APP_API_BASE_URL+'./admin/accounts/reset-password',
                postData : options
             }
            const res = await postRequest(posrData);
            if(res.status === true || res.status === 200){
                return {status : true, message:`Password reset successfully.`}
            } else{
                return {status : false, message:res?.response?.data?.statusMessage}
            }
        }
    }catch(error){
        return {status : false, message:"Under Maintenance, Please try after some time."}
    }
}; //End of Function

/*********************************************************
* Function Name : updateProfile
* Description   : this function is used for updateProfile
* By            : Noor Alam
* Date          : 16May-2024 
*********************************************************/
export const updateProfile = async (options) =>{
    try {
        const params = {
            url : `${REACT_APP_API_BASE_URL}./crm/users/update-profile`,
            postData : options
        }
        const res = await postRequest(params);
        if(res.status === true || res.status === 200){
            sessionStorage.setItem('ADMIN-INFO', JSON.stringify(res?.data?.response?.result))
            return {status : true, result : res?.data?.response?.result};
        } else{
            return {status : false, message:res?.response?.data?.statusMessage}
        }
    } catch (error) {
        return {status : false, message:"Under Maintenance, Please try after some time."}
    }
};//End of Function

/*********************************************************
* Function Name : sentReVerifyOtp
* Description   : this function is used for updateProfile
* By            : Afsar Ali
* Date          : 30-04-2025
*********************************************************/
export const sentReVerifyOtp = async () =>{
    try {
        const params = {
            url : `${REACT_APP_API_BASE_URL}./crm/users/sent-otp`,
            postData : {}
        }
        const res = await postRequest(params);
        if(res.status === true || res.status === 200){
            return {status : true, result : {}};
        } else{
            return {status : false, message:res?.response?.data?.statusMessage}
        }
    } catch (error) {
        return {status : false, message:"Under Maintenance, Please try after some time."}
    }
};//End of Function

/*********************************************************
* Function Name : verifyOtp
* Description   : this function is used for updateProfile
* By            : Afsar Ali
* Date          : 30-04-2025
*********************************************************/
export const verifyOtp = async (option) =>{
    try {
        const params = {
            url : `${REACT_APP_API_BASE_URL}./crm/users/verify-otp`,
            postData : option
        }
        const res = await postRequest(params);
        if(res.status === true || res.status === 200){
            return {status : true, result : {}};
        } else{
            return {status : false, message:res?.response?.data?.statusMessage}
        }
    } catch (error) {
        return {status : false, message:"Under Maintenance, Please try after some time."}
    }
};//End of Function
