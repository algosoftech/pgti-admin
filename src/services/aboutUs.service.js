import { postRequest } from 'services/api';

const _u = process.env.REACT_APP_API_BASE_URL || '';
const BASE = _u.endsWith('/') ? _u.slice(0, -1) : _u;

export const listAboutUs = async (options = {}) => {
    try {
        const { skip = 0, limit = 10, ...rest } = options;
        const page = Math.floor(skip / limit) + 1;
        const res = await postRequest({ url: `${BASE}/admin/about-us/list`, postData: { page, limit, ...rest } });
        if (res?.status === 200 && res?.data?.status) {
            const raw = res?.data?.response?.result;
            // controller returns an array; about-us is a single-record CMS — take first row
            const record = Array.isArray(raw) ? (raw[0] || null) : (raw || null);
            return { status: true, result: record };
        }
        return { status: false, message: res?.data?.message || 'Failed to fetch About Us' };
    } catch (error) {
        return { status: false, message: error.message || 'Network error' };
    }
};

export const addEditAboutUs = async (options = {}) => {
    try {
        const { editId, ...rest } = options;
        const postData = { ...rest, ...(editId && { edit_id: editId }) };
        const res = await postRequest({ url: `${BASE}/admin/about-us/add-edit`, postData });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result };
        }
        const data = res?.data ?? res?.response?.data;
        const msg = (data && (data.message ?? data.statusMessage ?? data.error)) || 'Failed to save';
        return { status: false, message: msg };
    } catch (error) {
        return { status: false, message: error.message || 'Request failed' };
    }
};

export const changeAboutUsStatus = async ({ editId, id, status }) => {
    try {
        const res = await postRequest({ url: `${BASE}/admin/about-us/change-status`, postData: { id: id || editId, status } });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result };
        }
        return { status: false, message: res?.data?.message || 'Failed to change status' };
    } catch (error) {
        return { status: false, message: error.message || 'Network error' };
    }
};
