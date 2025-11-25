import { postRequest } from '../API'
const API_K_WINN_URL = process.env.REACT_APP_API_BASE_URL

/*********************************************************
* Function Name : list
* Description   : Get list of ingredients
* Date          : 11-03-2025 
*********************************************************/
export const list = async (options={}) =>{
    try {
        const params = {
            url : `${API_K_WINN_URL}./admin/articles/ingredients/list`,
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
* Function Name : addEditIngredients
* Description   : Add or edit multiple ingredients
* Date          : 11-03-2025 
*********************************************************/
export const addEditIngredients = async (options={}) =>{
    try {
        const params = {
            url : `${API_K_WINN_URL}./admin/articles/ingredients/addeditdata`,
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
* Function Name : ingredientChangeStatus
* Description   : Change ingredient status
* Date          : 11-03-2025 
*********************************************************/
export const ingredientChangeStatus = async (options={}) =>{
    try {
        const params = {
            url : `${API_K_WINN_URL}./admin/articles/ingredients/change-status`,
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
* Function Name : deleteIngredient
* Description   : Delete ingredient
* Date          : 11-03-2025 
*********************************************************/
export const deleteIngredient = async (options={}) =>{
    try {
        const params = {
            url : `${API_K_WINN_URL}./admin/articles/ingredients/delete`,
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

