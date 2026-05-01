import { postRequest, getRequest } from 'services/api'
const API_K_WINN_URL = process.env.REACT_APP_API_BASE_URL
/*********************************************************
* Function Name : getGeneralData
* Description   : Get list of users list
* By            : Afsar Ali
* Date          : 28-05-2025 
*********************************************************/
export const getGeneralData = async () =>{
    try {
        const params = {
            url : `${API_K_WINN_URL}./crm/general-dada`,
        }
        return await getRequest(params);
    } catch (error) {
        console.log(error)
        return {}
    }
};//End of Function

/*********************************************************
* Function Name : updateGeneralData
* Description   : Get list of users list
* By            : Afsar Ali
* Date          : 28-05-2025 
*********************************************************/
export const updateGeneralData = async (option) =>{
    try {
        const params = {
            url : `${API_K_WINN_URL}./crm/general-dada/addeditdata`,
            postData : option
        }
        const res =  await postRequest(params);
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