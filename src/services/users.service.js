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
            return {
                status: true,
                result: res?.data?.response?.result,
                count: res?.data?.response?.count,
                stats: res?.data?.response?.stats || null,
            };
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

export const getPlayersListingBanner = async () => {
    try {
        const res = await postRequest({ url: `${BASE}/admin/users/banner/detail`, postData: {} });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result || null };
        }
        return { status: false, message: extractApiError(res, 'Failed to fetch players listing banner') };
    } catch (error) {
        return { status: false, message: error.message || 'Request failed' };
    }
};

export const addEditPlayersListingBanner = async (options = {}) => {
    try {
        const res = await postRequest({ url: `${BASE}/admin/users/banner/add-edit`, postData: options });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result };
        }
        return { status: false, message: extractApiError(res, 'Failed to save players listing banner') };
    } catch (error) {
        return { status: false, message: error.message || 'Request failed' };
    }
};

export const getPlayersHandbook = async () => {
    try {
        const res = await postRequest({ url: `${BASE}/admin/users/handbook/detail`, postData: {} });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result || null };
        }
        return { status: false, message: extractApiError(res, 'Failed to fetch players handbook') };
    } catch (error) {
        return { status: false, message: error.message || 'Request failed' };
    }
};

export const savePlayersHandbook = async (formData) => {
    try {
        const res = await postRequest({ url: `${BASE}/admin/users/handbook/add-edit`, postData: formData });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result || null };
        }
        return { status: false, message: extractApiError(res, 'Failed to save players handbook') };
    } catch (error) {
        return { status: false, message: error.message || 'Request failed' };
    }
};

export const getPlayerPrizeSyncStatus = async () => {
    try {
        const res = await postRequest({ url: `${BASE}/admin/users/prize-sync/status`, postData: {} });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result || null };
        }
        return { status: false, message: extractApiError(res, 'Failed to fetch player prize sync status') };
    } catch (error) {
        return { status: false, message: error.message || 'Request failed' };
    }
};

export const runPlayerPrizeSync = async () => {
    try {
        const res = await postRequest({ url: `${BASE}/admin/users/prize-sync/run`, postData: {} });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result || null };
        }
        return { status: false, message: extractApiError(res, 'Failed to run player prize sync') };
    } catch (error) {
        return { status: false, message: error.message || 'Request failed' };
    }
};
