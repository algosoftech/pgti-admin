import { postRequest } from '../API'
const API_K_WINN_URL = process.env.REACT_APP_API_BASE_URL

/*********************************************************
* Function Name : list
* Description   : Get list of FAQs
* Date          : 11-03-2025 
*********************************************************/
export const list = async (options={}) =>{
    try {
        const params = {
            url : `${API_K_WINN_URL}./admin/cms/faq/list`,
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
* Function Name : addEditFaq
* Description   : Add or edit FAQ
* Date          : 11-03-2025 
*********************************************************/
export const addEditFaq = async (options={}) =>{
    try {
        const params = {
            url : `${API_K_WINN_URL}./admin/cms/faq/addeditdata`,
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
* Function Name : faqChangeStatus
* Description   : Change FAQ status
* Date          : 11-03-2025 
*********************************************************/
export const faqChangeStatus = async (options={}) =>{
    try {
        const params = {
            url : `${API_K_WINN_URL}./admin/cms/faq/change-status`,
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
* Function Name : deleteFaq
* Description   : Delete FAQ
* Date          : 11-03-2025 
*********************************************************/
export const deleteFaq = async (options={}) =>{
    try {
        const params = {
            url : `${API_K_WINN_URL}./admin/cms/faq/delete`,
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

