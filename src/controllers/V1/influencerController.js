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
            url : `${API_K_WINN_URL}./admin/influencer/list`,
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
* Function Name : influencerDetails
* Description   : Get list of users list
* Date          : 28-05-2025 
*********************************************************/
export const influencerDetails = async (options={}) =>{
    try {
        const params = {
            url : `${API_K_WINN_URL}./admin/influencer/details`,
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
* Function Name : influencerDetailsData
* Description   : Get list of users list
* Date          : 28-05-2025 
*********************************************************/
export const influencerDetailsData = async (options={}) =>{
    try {
        const params = {
            url : `${API_K_WINN_URL}./admin/influencer/detail-data`,
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
export const addEditUsers = async (options={}) =>{
    try {
        const params = {
            url : `${API_K_WINN_URL}./admin/influencer/addeditdata`,
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
* Function Name : getGeneralData
* Description   : Get list of users list
* Date          : 28-05-2025 
*********************************************************/
export const bulkAddEditUsers = async (options={}) =>{
    try {
        const params = {
            url : `${API_K_WINN_URL}./admin/influencer/bulk-addeditdata`,
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
export const usersChangeStatus = async (options={}) =>{
    try {
        const params = {
            url : `${API_K_WINN_URL}./admin/influencer/change-status`,
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
