import { postRequest } from '../API'
const API_K_WINN_URL = process.env.REACT_APP_API_BASE_URL

/*********************************************************
* Function Name : list
* Description   : Get list of categories
* Date          : 11-03-2025 
*********************************************************/
export const list = async (options={}) =>{
    try {
        const params = {
            url : `${API_K_WINN_URL}./admin/category/list`,
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
* Function Name : addEditCategory
* Description   : Add or edit category
* Date          : 11-03-2025 
*********************************************************/
export const addEditCategory = async (options={}) =>{
    try {
        const params = {
            url : `${API_K_WINN_URL}./admin/category/addeditdata`,
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
* Function Name : categoryChangeStatus
* Description   : Change category status
* Date          : 11-03-2025 
*********************************************************/
export const categoryChangeStatus = async (options={}) =>{
    try {
        const params = {
            url : `${API_K_WINN_URL}./admin/category/change-status`,
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

