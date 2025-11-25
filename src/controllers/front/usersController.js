import { frontPostRequest as postRequest, getFrontRequest as getRequest } from '../API'
const API_K_WINN_URL = process.env.REACT_APP_API_BASE_URL
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
                url : API_K_WINN_URL+'./front/users/login',
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
                url : API_K_WINN_URL+'./front/users/verify-otp',
                postData : options
             }
            const res = await postRequest(posrData);
            console.log('res : ', res);
            if(res.status === true || res.status === 200){
                sessionStorage.setItem('USER-TOKEN', res.data.response.result.token);
                sessionStorage.setItem('USER-INFO', JSON.stringify(res.data.response.result));

                // if(res.data.response?.permission){
                //     sessionStorage.setItem('ADMIN-PERMISSION', JSON.stringify(res.data.response?.permission));
                //     const encodedData = await encryptData(JSON.stringify(res.data.response?.permission));
                //     sessionStorage.setItem('ADMIN-PERMISSION', JSON.stringify(encodedData));

                // }
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
            url : API_K_WINN_URL+'./front/users/logout',
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
                url : API_K_WINN_URL+'./admin/accounts/forgot-password',
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
                url : API_K_WINN_URL+'./admin/accounts/reset-password',
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