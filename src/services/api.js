import axios from "axios";
import { decryptData } from 'utils/encryption';

const REACT_APP_API_KEY = process.env.REACT_APP_API_KEY;

const redirectToAdminLogin = () => {
    sessionStorage.removeItem('TOKEN');
    sessionStorage.removeItem('ADMIN-INFO');
    if (typeof window !== 'undefined' && window.location.pathname !== '/admin/login') {
        window.location.replace('/admin/login');
    }
};

const redirectToUserLogin = () => {
    sessionStorage.removeItem('USER-INFO');
    sessionStorage.removeItem('USER-TOKEN');
};

/** Returns true if the response payload looks like an AES-GCM encrypted object */
const isEncryptedPayload = (value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    return Array.isArray(value.data) && Array.isArray(value.tag);
};

/** Decrypts res.data.response in-place if it looks encrypted */
const maybeDecrypt = async (res) => {
    const payload = res?.data?.response;
    if (isEncryptedPayload(payload)) {
        const decodedText = await decryptData(payload);
        if (typeof decodedText === 'string' && decodedText) {
            res.data.response = JSON.parse(decodedText);
        }
    }
    return res;
};

/*****************************************************
 * Admin GET Request
 *****************************************************/
export const getRequest = async (options) => {
    try {
        const { url } = options;
        const token = sessionStorage.getItem('TOKEN');
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(url, { headers });
        if (response?.status !== 200) return false;
        await maybeDecrypt(response);
        const payload = response?.data?.response;
        if (!payload) return false;
        return payload?.result ?? payload;
    } catch (error) {
        if (error?.response?.status === 401) {
            redirectToAdminLogin();
        }
        return false;
    }
};

/*****************************************************
 * Admin POST Request
 *****************************************************/
export const postRequest = async (options, cancelToken = {}) => {
    try {
        const { url, postData = {} } = options;
        const token = sessionStorage.getItem('TOKEN');
        const headers = { Authorization: `Bearer ${token}` };
        const config = { headers };
        if (cancelToken?.token) config.cancelToken = cancelToken.token;
        const res = await axios.post(url, postData, config);
        await maybeDecrypt(res);
        return res;
    } catch (error) {
        if (error?.response) {
            await maybeDecrypt(error.response);
        }
        if (error?.response?.status === 401) {
            redirectToAdminLogin();
        }
        return error;
    }
};

/*****************************************************
 * Front POST Request
 *****************************************************/
export const frontPostRequest = async (options, cancelToken = {}) => {
    try {
        const { url, postData = {} } = options;
        const token = sessionStorage.getItem('USER-TOKEN');
        const headers = { 'x-api-key': REACT_APP_API_KEY };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const config = { headers };
        if (cancelToken?.token) config.cancelToken = cancelToken.token;
        const res = await axios.post(url, postData, config);
        await maybeDecrypt(res);
        return res;
    } catch (error) {
        if (error?.response) {
            await maybeDecrypt(error.response);
        }
        if (error?.response?.status === 401) {
            redirectToUserLogin();
        }
        return error;
    }
};

/*****************************************************
 * Front GET Request
 *****************************************************/
export const getFrontRequest = async (options) => {
    try {
        const { url } = options;
        const token = sessionStorage.getItem('USER-TOKEN');
        const headers = { 'x-api-key': REACT_APP_API_KEY };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const response = await axios.get(url, { headers });
        if (response?.status !== 200) return false;
        await maybeDecrypt(response);
        const payload = response?.data?.response;
        if (!payload) return false;
        return payload?.result ?? payload;
    } catch (error) {
        if (error?.response?.status === 401) {
            redirectToUserLogin();
        }
        return false;
    }
};
