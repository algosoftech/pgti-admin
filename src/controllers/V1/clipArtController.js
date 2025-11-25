import { postRequest } from '../API'
const API_K_WINN_URL = process.env.REACT_APP_API_BASE_URL

/*********************************************************
* Function Name : list
* Description   : Get list of clipart images
* Date          : 30-10-2025 
*********************************************************/
export const list = async (options={}) =>{
    try {
        const params = {
            url : `${API_K_WINN_URL}./common/clip-art/list`,
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
* Function Name : uploadImage
* Description   : Upload new clipart image
* Date          : 30-10-2025 
*********************************************************/
export const uploadImage = async (file, folder="images") =>{
    try {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('folder', folder);

        const params = {
            url : `${API_K_WINN_URL}./common/clip-art/upload`,
            postData : formData
        }
        const res = await postRequest(params);
        if(res.status === true || res.status === 200){
            return {status : true, result : res?.data?.response?.result};
        } else{
            return {status : false, message:res?.response?.data?.statusMessage || 'Upload failed'}
        }
    } catch (error) {
        console.log(error)
        return {}
    }
};//End of Function

/*********************************************************
* Function Name : deleteImage
* Description   : Delete clipart image
* Date          : 30-10-2025 
*********************************************************/
export const deleteImage = async (url) =>{
    try {
        const params = {
            url : `${API_K_WINN_URL}./common/clip-art/delete`,
            postData : { url }
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

