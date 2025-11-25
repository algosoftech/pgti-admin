import { frontPostRequest as postRequest } from '../API'
const API_URL = process.env.REACT_APP_API_BASE_URL
/*********************************************************
* Function Name : industryList
* Description   : Get list of users list
* Date          : 06-10-2025 
*********************************************************/
export const industryList = async (options={}) =>{
    try {
        const params = {
            url : `${API_URL}./front/common/industry-list`,
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