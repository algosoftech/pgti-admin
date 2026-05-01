import { postRequest } from 'services/api';
import { extractApiError } from 'utils/apiError';

const _u = process.env.REACT_APP_API_BASE_URL || '';
const BASE = _u.endsWith('/') ? _u.slice(0, -1) : _u;

export const listTourPartners = async () => {
    try {
        const res = await postRequest({ url: `${BASE}/admin/cms/tour-partners/list`, postData: {} });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result || {} };
        }
        return { status: false, message: extractApiError(res, 'Failed to fetch Tour Partners') };
    } catch (error) {
        return { status: false, message: extractApiError(error, 'Network error') };
    }
};

export const addEditTourPartners = async (options = {}) => {
    try {
        const { editId, ...rest } = options;
        const postData = { ...rest, ...(editId && { edit_id: editId }) };
        const res = await postRequest({ url: `${BASE}/admin/cms/tour-partners/add-edit`, postData });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result };
        }
        return { status: false, message: extractApiError(res, 'Failed to save') };
    } catch (error) {
        return { status: false, message: extractApiError(error, 'Request failed') };
    }
};
