import {API_ADMIN_URL} from '../../config/constants'
import { postRequest, getRequest } from '../API'

/*********************************************************
* Function Name : List
* Description   : Get list of all service category
* By            : Afsar Ali
* Date          : 29-01-2024 
*********************************************************/
export const list = async (options) =>{
    try {
        const params = {
            url : `${API_ADMIN_URL}accounts/users/list`,
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


/*********************************************************
* Function Name : addeditdata
* Description   : chnage service status
* By            : Afsar Ali
* Date          : 04-03-2024 
*********************************************************/
export const addeditdata = async (options) =>{
    try {
        const { url, postData={} } = options;
        const params = {
            url : `${API_ADMIN_URL}${url}`,
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
                ipAddress : sessionStorage.getItem('IP_ADDRESS')
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
* Function Name : getDashboardData
* Description   : Get data for dashboard
* By            : Afsar Ali
* Date          : 16-07-2024 
*********************************************************/
export const getDashboardData = async () =>{
    try {
        const params = {
            url : `${API_ADMIN_URL}common/dashboard-info`,
            postData : ''
        }
        return await getRequest(params);
    } catch (error) {
        console.log(error)
        return {status : false, message:"Under Maintenance, Please try after some time."}
    }
};//End of Function