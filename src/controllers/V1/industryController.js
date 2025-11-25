import { postRequest } from '../API'
const API_K_WINN_URL = process.env.REACT_APP_API_BASE_URL
/*********************************************************
* Function Name : getGeneralData
* Description   : Get list of users list
* Date          : 28-05-2025 
*********************************************************/
export const list = async (options={}) =>{
    try {
        const params = {
            url : `${API_K_WINN_URL}./admin/cms/industry/list`,
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
        return {}
    }
};//End of Function

/*********************************************************
* Function Name : getGeneralData
* Description   : Get list of users list
* Date          : 28-05-2025 
*********************************************************/
export const addEditData = async (options={}) =>{
    try {
        const params = {
            url : `${API_K_WINN_URL}./admin/cms/industry/addeditdata`,
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
        return {}
    }
};//End of Function

/*********************************************************
* Function Name : coinChangeStatus
* Description   : Get list of users list
* Date          : 28-05-2025 
*********************************************************/
export const changeStatus = async (options={}) =>{
    try {
        const params = {
            url : `${API_K_WINN_URL}./admin/cms/industry/change-status`,
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
        return {}
    }
};//End of Function
