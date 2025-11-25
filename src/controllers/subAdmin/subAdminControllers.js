import { postRequest } from '../API'
const API_ADMIN_URL = process.env.REACT_APP_API_BASE_URL;
/*********************************************************
* Function Name : List
* Description   : Get list of all sub admin 
* By            : Afsar Ali
* Date          : 13-08-2024 
*********************************************************/
export const list = async (options) =>{
    try {
        const params = {
            url : `${API_ADMIN_URL}admin/accounts/sub-admin/list`,
            postData : options
        }
        const res = await postRequest(params);
        if(res.status === true || res.status === 200){
            return {status : true, result : res?.data?.response?.result, count : res?.data?.response?.count};
        } else{
            return {status : false, message:res?.response?.data?.statusMessage}
        }
    } catch (error) {
        console.log(error)
        return {status : false, message:"Under Maintenance, Please try after some time."}
    }
};//End of Function


/*********************************************************
* Function Name : addeditdata
* Description   : This function is used for add/edit sub admin user
* By            : Afsar Ali
* Date          : 04-03-2024 
*********************************************************/
export const addeditdata = async (options) =>{
    try {
        const { url, postData={} } = options;
        const params = {
            url : `${API_ADMIN_URL}admin/accounts/sub-admin/addeditdata`,
            postData : postData
        }
        const res = await postRequest(params);
        if(res.status === true || res.status === 200){
            return {status : true, result : res?.data?.response?.result};
        } else{
            return {status : false, message:res?.response?.data?.statusMessage}
        }
    } catch (error) {
        return {status : false, message:"Under Maintenance, Please try after some time."}
    }
};//End of Function

/*********************************************************
* Function Name : chnageStatus
* Description   : chnage service status
* By            : Afsar Ali
* Date          : 04-03-2024 
*********************************************************/
export const chnageStatus = async (options) =>{
    try {
        const { url, postData={} } = options;
        const params = {
            url : `${API_ADMIN_URL}${url}`,
            postData : {
                ...postData,
            }
        }
        const res = await postRequest(params);
        if(res.status === true || res.status === 200){
            return {status : true, result : res?.data?.response?.result};
        } else{
            return {status : false, message:res?.response?.data?.statusMessage}
        }
    } catch (error) {
        return {status : false, message:"Under Maintenance, Please try after some time."}
    }
};//End of Function

/*********************************************************
* Function Name : getPermission
* Description   : Get permission list of sub admin 
* By            : Afsar Ali
* Date          : 14-08-2024 
*********************************************************/
export const getPermission = async (options) =>{
    try {
        const params = {
            url : `${API_ADMIN_URL}admin/accounts/sub-admin/permission`,
            postData : options
        }
        const res = await postRequest(params);
        if(res.status === true || res.status === 200){
            return {status : true, result : res?.data?.response?.result};
        } else{
            return {status : false, message:res?.response?.data?.statusMessage}
        }
    } catch (error) {
        console.log(error)
        return {status : false, message:"Under Maintenance, Please try after some time."}
    }
};//End of Function
