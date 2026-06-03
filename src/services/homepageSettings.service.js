import { postRequest } from 'services/api';

const _u = process.env.REACT_APP_API_BASE_URL || '';
const BASE = _u.endsWith('/') ? _u.slice(0, -1) : _u;

export const listHomepageSettings = async (options = {}) => {
    try {
        const res = await postRequest({ url: `${BASE}/admin/cms/homepage/list`, postData: { ...options } });
        if (res?.status === 200 && res?.data?.status)
            return { status: true, result: res?.data?.response?.result || {} };
        const data = res?.data ?? res?.response?.data;
        const msg = (data && (data.message ?? data.statusMessage ?? data.error ?? data.response?.error)) || 'Failed to fetch Homepage Settings';
        return { status: false, message: msg };
    } catch (e) {
        return { status: false, message: e.message || 'Network error' };
    }
};

export const addEditHomepageSettings = async (options = {}) => {
    try {
        const { editId, ...rest } = options;
        const postData = { ...rest, ...(editId && { edit_id: editId }) };
        const res = await postRequest({ url: `${BASE}/admin/cms/homepage/addeditdata`, postData });
        if (res?.status === 200 && res?.data?.status)
            return { status: true, result: res?.data?.response?.result };
        const data = res?.data ?? res?.response?.data;
        const msg = (data && (data.message ?? data.statusMessage ?? data.error)) || 'Failed to save';
        return { status: false, message: msg };
    } catch (e) {
        return { status: false, message: e.message || 'Request failed' };
    }
};

export const changeHomepageSettingsStatus = async ({ editId, id, status }) => {
    try {
        const res = await postRequest({ url: `${BASE}/admin/cms/homepage/change-status`, postData: { id: id || editId, status } });
        if (res?.status === 200 && res?.data?.status)
            return { status: true, result: res?.data?.response?.result };
        return { status: false, message: res?.data?.message || 'Failed to change status' };
    } catch (e) {
        return { status: false, message: e.message || 'Network error' };
    }
};
