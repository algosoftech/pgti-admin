import { postRequest } from '../API'
const API_K_WINN_URL = process.env.REACT_APP_API_BASE_URL

/*********************************************************
* Function Name : list
* Description   : Get list of articles
* Date          : 11-03-2025 
*********************************************************/
export const list = async (options={}) =>{
    try {
        const params = {
            url : `${API_K_WINN_URL}./admin/articles/list`,
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
* Function Name : addEditArticle
* Description   : Add or edit article
* Date          : 11-03-2025 
*********************************************************/
export const addEditArticle = async (options={}) =>{
    try {
        const params = {
            url : `${API_K_WINN_URL}./admin/articles/addeditdata`,
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
* Function Name : articleChangeStatus
* Description   : Change article status
* Date          : 11-03-2025 
*********************************************************/
export const articleChangeStatus = async (options={}) =>{
    try {
        const params = {
            url : `${API_K_WINN_URL}./admin/articles/change-status`,
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
* Function Name : deleteArticle
* Description   : Delete article
* Date          : 11-03-2025 
*********************************************************/
export const deleteArticle = async (options={}) =>{
    try {
        const params = {
            url : `${API_K_WINN_URL}./admin/articles/delete`,
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

