import { frontPostRequest as postRequest } from '../API'
const API_URL = process.env.REACT_APP_API_BASE_URL
/*********************************************************
* Function Name : getGeneralData
* Description   : Get list of users list
* Date          : 28-05-2025 
*********************************************************/
export const list = async (options={}) =>{
    try {
        const params = {
            url : `${API_URL}./front/influencer/list`,
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
export const usersChangeStatus = async (options={}) =>{
    try {
        const params = {
            url : `${API_URL}./front/influencer/list`,
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
export const influencerDetails = async (options={}) =>{
    try {
        const params = {
            url : `${API_URL}./front/influencer/details`,
            postData : options
        }
        const res = await postRequest(params);
        if(res.status === true || res.status === 200){
            await updateUserDetails();
            return {status : true, result : res?.data?.response?.result, count : res?.data?.response?.count};
        } else{
            return {status : false, message:res?.response?.data?.statusMessage}
        }
    } catch (error) {
        console.log(error)
        return {}
    }
};//End of Function

const updateUserDetails = async () => {
    try {
        const params = {
            url : `${API_URL}./front/users/get-profile`,
            postData : {}
        }
        const res = await postRequest(params);
        if(res.status === true || res.status === 200){
            sessionStorage.setItem('USER-INFO', JSON.stringify(res.data.response.result));
        }
    } catch (error) {
        return true;
    } finally {
        return true;
    }
}

export const requestContacts = async (option={}) => {
    try {
        const params = {
            url : `${API_URL}./front/influencer/request-contacts`,
            postData : option
        }
        const res = await postRequest(params);
        if(res.status === true || res.status === 200){
            await updateUserDetails();
           return {status : true, result : res?.data?.response?.result};
        }
    } catch (error) {
       console.log(error)
        return {}
    }
}