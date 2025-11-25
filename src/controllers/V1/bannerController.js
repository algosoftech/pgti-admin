import { postRequest } from '../API'
const API_K_WINN_URL = process.env.REACT_APP_API_BASE_URL

/*********************************************************
* Function Name : list
* Description   : Get list of banners
* Date          : 11-03-2025 
*********************************************************/
export const list = async (options={}) =>{
    try {
        const params = {
            url : `${API_K_WINN_URL}./admin/cms/banner/list`,
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
* Function Name : addEditBanner
* Description   : Add or edit banner
* Date          : 11-03-2025 
*********************************************************/
export const addEditBanner = async (options={}) =>{
    try {
        const params = {
            url : `${API_K_WINN_URL}./admin/cms/banner/addeditdata`,
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
* Function Name : bannerChangeStatus
* Description   : Change banner status
* Date          : 11-03-2025 
*********************************************************/
export const bannerChangeStatus = async (options={}) =>{
    try {
        const params = {
            url : `${API_K_WINN_URL}./admin/cms/banner/change-status`,
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
