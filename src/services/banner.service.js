import { extractApiError } from 'utils/apiError';
import { postRequest } from 'services/api';

const _u = process.env.REACT_APP_API_BASE_URL || '';
const BASE = _u.endsWith('/') ? _u.slice(0, -1) : _u;

export const list = async (options = {}) => {
    try {
        const { skip = 0, limit = 10, ...rest } = options;
        const page = Math.floor(skip / limit) + 1;
        const res = await postRequest({ url: `${BASE}/admin/banners/list`, postData: { page, limit, ...rest } });
        if (res?.status === 200 && res?.data?.status) {
            return {
                status: true,
                result: res?.data?.response?.result || [],
                count: res?.data?.response?.count || 0,
                pagination: res?.data?.response?.pagination || null
            };
        }
        return { status: false, message: extractApiError(res, 'Failed to fetch banners') };
    } catch (error) {
        return { status: false, message: error.message || 'Network error occurred' };
    }
};

export const addEditBanner = async (options = {}) => {
    try {
        const { editId, ...rest } = options;
        const postData = { ...rest, ...(editId && { edit_id: editId }) };
        const res = await postRequest({ url: `${BASE}/admin/banners/add-edit`, postData });
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

export const bannerChangeStatus = async (options = {}) => {
    try {
        const { editId, id, status } = options;
        const res = await postRequest({ url: `${BASE}/admin/banners/change-status`, postData: { id: id || editId, status } });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result };
        }
        return { status: false, message: extractApiError(res, 'Failed to change status') };
    } catch (error) {
        return { status: false, message: error.message || 'Request failed' };
    }
};

export const deleteBanner = async (options = {}) => {
    try {
        const res = await postRequest({ url: `${BASE}/admin/banners/delete`, postData: options });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result };
        }
        return { status: false, message: extractApiError(res, 'Failed to delete') };
    } catch (error) {
        return { status: false, message: error.message || 'Request failed' };
    }
};

export const uploadBannerImage = async (file) => {
    try {
        const formData = new FormData();
        formData.append('image', file);
        const res = await postRequest({ url: `${BASE}/admin/banners/upload`, postData: formData });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result, url: res?.data?.response?.result?.url };
        }
        return { status: false, message: extractApiError(res, 'Upload failed') };
    } catch (error) {
        return { status: false, message: 'Upload failed. Please try again.' };
    }
};
