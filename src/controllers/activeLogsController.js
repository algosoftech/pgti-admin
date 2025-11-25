import { postRequest, getRequest } from './API'
const API_K_WINN_URL = process.env.REACT_APP_API_BASE_URL
/*********************************************************
* Function Name : List
* Description   : Get list of all common listing
* By            : Afsar Ali
* Date          : 30-03-2024 
*********************************************************/
export const list = async (options) =>{
    try {
        const params = {
            url : `${API_K_WINN_URL}./crm/active-logs/list`, 
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
* Function Name : create
* Description   : Get list of all common listing
* By            : Afsar Ali
* Date          : 28-06-2025 
*********************************************************/
export const create = async (options) =>{
    try {
        const params = {
            url : `${API_K_WINN_URL}./crm/active-logs/create`, 
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