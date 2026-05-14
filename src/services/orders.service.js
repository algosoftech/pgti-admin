import { extractApiError } from 'utils/apiError';
import { postRequest } from 'services/api';

const _u = process.env.REACT_APP_API_BASE_URL || '';
const BASE = _u.endsWith('/') ? _u.slice(0, -1) : _u;

export const list = async (options = {}) => {
    try {
        const { skip = 0, limit = 10, ...rest } = options;
        const page = Math.floor(skip / limit) + 1;
        const res = await postRequest({ url: `${BASE}/admin/orders/list`, postData: { page, limit, ...rest } });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result, count: res?.data?.response?.count };
        }
        return { status: false, message: extractApiError(res, 'Failed to fetch orders') };
    } catch (error) {
        return { status: false, message: error.message || 'Network error' };
    }
};

export const getOrderDetails = async (options = {}) => {
    try {
        const res = await postRequest({ url: `${BASE}/admin/orders/details`, postData: options });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result };
        }
        return { status: false, message: extractApiError(res, 'Failed to fetch order details') };
    } catch (error) {
        return { status: false, message: error.message || 'Network error' };
    }
};

export const changeOrderStatus = async (options = {}) => {
    try {
        const res = await postRequest({ url: `${BASE}/admin/orders/change-status`, postData: options });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result };
        }
        return { status: false, message: extractApiError(res, 'Failed to change order status') };
    } catch (error) {
        return { status: false, message: error.message || 'Request failed' };
    }
};
