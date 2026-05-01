import { postRequest } from 'services/api';

const _u = process.env.REACT_APP_API_BASE_URL || '';
const BASE = _u.endsWith('/') ? _u.slice(0, -1) : _u;

export const listGolfFacts = async () => {
    try {
        const res = await postRequest({ url: `${BASE}/admin/cms/golf-facts/list`, postData: {} });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result || null };
        }
        return { status: false, message: res?.data?.message || 'Failed to fetch Golf Facts data' };
    } catch (error) {
        return { status: false, message: error.message || 'Network error' };
    }
};

export const addEditGolfFacts = async (options = {}) => {
    try {
        const { editId, ...rest } = options;
        const postData = { ...rest, ...(editId && { edit_id: editId }) };
        const res = await postRequest({ url: `${BASE}/admin/cms/golf-facts/add-edit`, postData });
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

export const changeGolfFactsStatus = async ({ id, status }) => {
    try {
        const res = await postRequest({ url: `${BASE}/admin/cms/golf-facts/change-status`, postData: { id, status } });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true };
        }
        return { status: false, message: res?.data?.message || 'Failed to change status' };
    } catch (error) {
        return { status: false, message: error.message || 'Network error' };
    }
};
