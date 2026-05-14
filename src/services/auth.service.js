import { extractApiError } from 'utils/apiError';
import { postRequest, getRequest } from 'services/api';
import { encryptData } from 'utils/encryption';

const _u = process.env.REACT_APP_API_BASE_URL || '';
const BASE = _u.endsWith('/') ? _u.slice(0, -1) : _u;

export const login = async (options) => {
    try {
        const { email, password } = options;
        if (!email)    return { status: false, message: "Email is required" };
        if (!password) return { status: false, message: "Password is required" };

        const res = await postRequest({ url: `${BASE}/admin/auth/login`, postData: options });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, message: `Your One Time Password is sent to ${email}` };
        }
        return { status: false, message: extractApiError(res, 'Login failed') };
    } catch (error) {
        return { status: false, message: extractApiError(error, 'Login failed') };
    }
};

export const verifyLoginOtp = async (options) => {
    try {
        const { email, otp } = options;
        if (!email) return { status: false, message: "Email is required" };
        if (!otp)   return { status: false, message: "One Time Password is required" };

        const res = await postRequest({ url: `${BASE}/admin/auth/verify-otp`, postData: options });
        if (res?.status === 200 && res?.data?.status) {
            const result = res.data.response.result;
            sessionStorage.setItem('TOKEN', result.token);
            sessionStorage.setItem('ADMIN-INFO', JSON.stringify(result));

            const permission = res.data.response?.permission;
            if (permission) {
                const encodedData = await encryptData(JSON.stringify(permission));
                sessionStorage.setItem('ADMIN-PERMISSION', JSON.stringify(encodedData));
            }
            return { status: true, message: `Welcome Back! ${result.name}` };
        }
        return { status: false, message: extractApiError(res, 'Invalid OTP') };
    } catch (error) {
        return { status: false, message: extractApiError(error, 'Verification failed') };
    }
};

export const logout = async () => {
    try {
        await getRequest({ url: `${BASE}/admin/auth/logout` });
    } catch (_) {
        // ignore
    } finally {
        sessionStorage.clear();
    }
    return { status: true, message: "Success" };
};

export const forgotPassword = async (options) => {
    try {
        const { email } = options;
        if (!email) return { status: false, message: "Email is required" };

        const res = await postRequest({ url: `${BASE}/admin/auth/forgot-password`, postData: options });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, message: `Your One Time Password is sent to ${email}` };
        }
        return { status: false, message: extractApiError(res, 'Request failed') };
    } catch (error) {
        return { status: false, message: extractApiError(error, 'Request failed') };
    }
};

export const resetPassword = async (options) => {
    try {
        const { email, otp, password } = options;
        if (!email)    return { status: false, message: "Email is required" };
        if (!password) return { status: false, message: "New Password required" };
        if (!otp)      return { status: false, message: "OTP is required" };

        const res = await postRequest({ url: `${BASE}/admin/auth/reset-password`, postData: options });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, message: 'Password reset successfully.' };
        }
        return { status: false, message: extractApiError(res, 'Reset failed') };
    } catch (error) {
        return { status: false, message: extractApiError(error, 'Reset failed') };
    }
};
