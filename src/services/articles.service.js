import { extractApiError } from 'utils/apiError';
import { postRequest } from 'services/api';

const _u = process.env.REACT_APP_API_BASE_URL || '';
const BASE = _u.endsWith('/') ? _u.slice(0, -1) : _u;

export const list = async (options = {}) => {
    try {
        const { skip = 0, limit = 10, ...rest } = options;
        const page = Math.floor(skip / limit) + 1;
        const res = await postRequest({ url: `${BASE}/admin/articles/list`, postData: { page, limit, ...rest } });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result, count: res?.data?.response?.count };
        }
        return { status: false, message: extractApiError(res, 'Failed to fetch articles') };
    } catch (error) {
        return { status: false, message: error.message || 'Network error' };
    }
};

export const addEditArticle = async (options = {}) => {
    try {
        const { editId, ...rest } = options;
        const postData = { ...rest, ...(editId && { edit_id: editId }) };
        const res = await postRequest({ url: `${BASE}/admin/articles/add-edit`, postData });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result };
        }
        return { status: false, message: extractApiError(res, 'Failed to save') };
    } catch (error) {
        return { status: false, message: error.message || 'Request failed' };
    }
};

export const articleChangeStatus = async (options = {}) => {
    try {
        const { editId, id, status } = options;
        const res = await postRequest({ url: `${BASE}/admin/articles/change-status`, postData: { id: id || editId, status } });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result };
        }
        return { status: false, message: extractApiError(res, 'Failed to change status') };
    } catch (error) {
        return { status: false, message: error.message || 'Request failed' };
    }
};

export const deleteArticle = async (options = {}) => {
    try {
        const res = await postRequest({ url: `${BASE}/admin/articles/delete`, postData: options });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result };
        }
        return { status: false, message: extractApiError(res, 'Failed to delete') };
    } catch (error) {
        return { status: false, message: error.message || 'Request failed' };
    }
};

export const getArticleListingBanner = async () => {
    try {
        const res = await postRequest({ url: `${BASE}/admin/articles/banner/detail`, postData: {} });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result || null };
        }
        return { status: false, message: extractApiError(res, 'Failed to fetch article listing banner') };
    } catch (error) {
        return { status: false, message: error.message || 'Request failed' };
    }
};

export const addEditArticleListingBanner = async (options = {}) => {
    try {
        const res = await postRequest({ url: `${BASE}/admin/articles/banner/add-edit`, postData: options });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result };
        }
        return { status: false, message: extractApiError(res, 'Failed to save article listing banner') };
    } catch (error) {
        return { status: false, message: error.message || 'Request failed' };
    }
};
