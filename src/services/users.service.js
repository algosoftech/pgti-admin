import { extractApiError } from 'utils/apiError';
import { postRequest } from 'services/api';

const _u = process.env.REACT_APP_API_BASE_URL || '';
const BASE = _u.endsWith('/') ? _u.slice(0, -1) : _u;

export const list = async (options = {}) => {
    try {
        const { skip = 0, limit = 10, ...rest } = options;
        const page = Math.floor(skip / limit) + 1;
        const res = await postRequest({ url: `${BASE}/admin/users/list`, postData: { page, limit, ...rest } });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result, count: res?.data?.response?.count };
        }
        return { status: false, message: extractApiError(res, 'Failed to fetch players') };
    } catch (error) {
        return { status: false, message: error.message || 'Network error' };
    }
};

export const addEditUsers = async (options = {}) => {
    try {
        const { editId, ...rest } = options;
        const postData = { ...rest, ...(editId && { edit_id: editId }) };
        const res = await postRequest({ url: `${BASE}/admin/users/add-edit`, postData });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result };
        }
        return { status: false, message: extractApiError(res, 'Failed to save player') };
    } catch (error) {
        return { status: false, message: error.message || 'Request failed' };
    }
};

export const usersChangeStatus = async (options = {}) => {
    try {
        const { id, status } = options;
        const res = await postRequest({ url: `${BASE}/admin/users/change-status`, postData: { id, status } });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true };
        }
        return { status: false, message: extractApiError(res, 'Failed to change status') };
    } catch (error) {
        return { status: false, message: error.message || 'Request failed' };
    }
};

export const deletePlayer = async (options = {}) => {
    try {
        const res = await postRequest({ url: `${BASE}/admin/users/delete`, postData: options });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true };
        }
        return { status: false, message: extractApiError(res, 'Failed to delete player') };
    } catch (error) {
        return { status: false, message: error.message || 'Request failed' };
    }
};

export const resetPlayerPassword = async (options = {}) => {
    try {
        const res = await postRequest({ url: `${BASE}/admin/users/reset-password`, postData: options });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, message: res?.data?.message || 'Password reset successfully' };
        }
        return { status: false, message: extractApiError(res, 'Failed to reset password') };
    } catch (error) {
        return { status: false, message: error.message || 'Request failed' };
    }
};

export const approveRegistration = async ({ id, reason = '' } = {}) => {
    try {
        const res = await postRequest({ url: `${BASE}/admin/users/approve-registration`, postData: { id, reason } });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, message: res?.data?.message || 'Registration approved' };
        }
        return { status: false, message: extractApiError(res, 'Failed to approve') };
    } catch (error) {
        return { status: false, message: error.message || 'Request failed' };
    }
};

export const rejectRegistration = async ({ id, reason = '' } = {}) => {
    try {
        const res = await postRequest({ url: `${BASE}/admin/users/reject-registration`, postData: { id, reason } });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, message: res?.data?.message || 'Registration rejected' };
        }
        return { status: false, message: extractApiError(res, 'Failed to reject') };
    } catch (error) {
        return { status: false, message: error.message || 'Request failed' };
    }
};

export const updateAmount = async (options = {}) => {
    try {
        const res = await postRequest({ url: `${BASE}/admin/users/update-amount`, postData: options });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result };
        }
        return { status: false, message: extractApiError(res, 'Failed to update amount') };
    } catch (error) {
        return { status: false, message: error.message || 'Request failed' };
    }
};
