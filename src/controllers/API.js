import axios from "axios";
import { decryptData } from "./Encryption";
const REACT_APP_API_KEY = process.env.REACT_APP_API_KEY
/*****************************************************
 * This function is use to generate GET Request
 *****************************************************/
export const getRequest = async (options)=>{
    try {
        const { url } = options;
        const token = sessionStorage.getItem('TOKEN');
        const headers = { authToken : token, key : REACT_APP_API_KEY };
        const response = await axios.get(url, { headers });
        const decodedData = await decryptData(response.data.response);
        const data = decodedData.result;
        return data;
    } catch (error) {
        return false;
    }
} //End of the function

/*****************************************************
 * This function is use to generate POST Request
 *****************************************************/
export const postRequest = async (options, cancelToken={})=>{
    try{
        const { url, postData ={} } = options;
        const token = sessionStorage.getItem('TOKEN');
        const headers = { authToken : token, key : process.env.REACT_APP_API_KEY };
        let res = await axios.post(url, postData, { headers }, { cancelToken: cancelToken.token });
        const decodeData = await decryptData(res?.data?.response);
        res.data.response = JSON.parse(decodeData);
        return res;
    } catch(error){
        console.log('error', error);
        if(error?.response.status === 500 && error?.response.data.response.error === "Invalid or Expired Token"){
            sessionStorage.removeItem('ADMIN-INFO');
            sessionStorage.removeItem('TOKEN');
        }
        return error;
    }
} //End of the function

/*****************************************************
 * This function is use to generate POST Request
 *****************************************************/
export const frontPostRequest = async (options, cancelToken={})=>{
    try{
        const { url, postData ={} } = options;
        const token = sessionStorage.getItem('USER-TOKEN');
        const headers = { authToken : token, key : process.env.REACT_APP_API_KEY };
        let res = await axios.post(url, postData, { headers }, { cancelToken: cancelToken.token });
        const decodeData = await decryptData(res?.data?.response);
        res.data.response = JSON.parse(decodeData);
        return res;
    } catch(error){
        console.log('error', error);
        if(error?.response.status === 500 && error?.response.data.response.error === "Invalid or Expired Token"){
            sessionStorage.removeItem('USER-INFO');
            sessionStorage.removeItem('USER-TOKEN');
        }
        return error;
    }
} //End of the function

/*****************************************************
 * This function is use to generate GET Request
 *****************************************************/
export const getFrontRequest = async (options)=>{
    try {
        const { url } = options;
        const token = sessionStorage.getItem('USER-TOKEN');
        const headers = { authToken : token, key : REACT_APP_API_KEY };
        const response = await axios.get(url, { headers });
        const decodedData = await decryptData(response.data.response);
        const data = decodedData.result;
        return data;
    } catch (error) {
        return false;
    }
} //End of the function
