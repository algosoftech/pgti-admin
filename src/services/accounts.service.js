import { postRequest } from 'services/api';
import { extractApiError } from 'utils/apiError';

const _u = process.env.REACT_APP_API_BASE_URL || '';
const BASE = _u.endsWith('/') ? _u.slice(0, -1) : _u;

export const list = async (options = {}) => {
    try {
        const { skip = 0, limit = 10, ...rest } = options;
        const page = Math.floor(skip / limit) + 1;
        const res = await postRequest({ url: `${BASE}/admin/auth/sub-admin/list`, postData: { page, limit, ...rest } });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result, count: res?.data?.response?.count };
        }
        return { status: false, message: extractApiError(res, 'Failed to fetch accounts') };
    } catch (error) {
        return { status: false, message: extractApiError(error, 'Failed to fetch accounts') };
    }
};

/**
 * Called with flat data: addeditdata({ name, email, phone, password, permissions, editId })
 * editId is optional — omit for create, pass for update.
 */
export const addeditdata = async (options = {}) => {
    try {
        const { editId, ...rest } = options;
        const postData = { ...rest, ...(editId ? { edit_id: editId } : {}) };
        const res = await postRequest({ url: `${BASE}/admin/auth/sub-admin/add-edit`, postData });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result };
        }
        return { status: false, message: extractApiError(res, 'Failed to save administrator') };
    } catch (error) {
        return { status: false, message: extractApiError(error, 'Failed to save administrator') };
    }
};

export const chnageStatus = async (options = {}) => {
    try {
        const { editId, id, status } = options?.postData || options;
        const postData = { id: id || editId, status };
        const res = await postRequest({ url: `${BASE}/admin/auth/sub-admin/change-status`, postData });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result };
        }
        return { status: false, message: extractApiError(res, 'Failed to change status') };
    } catch (error) {
        return { status: false, message: extractApiError(error, 'Failed to change status') };
    }
};

export const deleteAccount = async (options = {}) => {
    try {
        const res = await postRequest({ url: `${BASE}/admin/auth/sub-admin/delete`, postData: options });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true };
        }
        return { status: false, message: extractApiError(res, 'Failed to delete account') };
    } catch (error) {
        return { status: false, message: extractApiError(error, 'Failed to delete account') };
    }
};

export const getPermission = async (options = {}) => {
    try {
        const res = await postRequest({ url: `${BASE}/admin/auth/sub-admin/permissions`, postData: options });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result };
        }
        return { status: false, message: extractApiError(res, 'Failed to fetch permissions') };
    } catch (error) {
        return { status: false, message: extractApiError(error, 'Failed to fetch permissions') };
    }
};
