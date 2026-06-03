import { postRequest } from 'services/api';
import { extractApiError } from 'utils/apiError';

const _u = process.env.REACT_APP_API_BASE_URL || '';
const BASE = _u.endsWith('/') ? _u.slice(0, -1) : _u;

export const listTvTimings = async (options = {}) => {
  try {
    const { skip = 0, limit = 10, ...rest } = options;
    const page = Math.floor(skip / limit) + 1;
    const res = await postRequest({ url: `${BASE}/admin/cms/tv-timings/list`, postData: { page, limit, ...rest } });
    if (res?.status === 200 && res?.data?.status) {
      return {
        status: true,
        result: res?.data?.response?.result || [],
        count: res?.data?.response?.count || 0,
        pagination: res?.data?.response?.pagination || null,
      };
    }
    return { status: false, message: extractApiError(res, 'Failed to fetch TV timings') };
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};

export const addEditTvTiming = async (options = {}) => {
  try {
    const { editId, ...rest } = options;
    const postData = { ...rest, ...(editId && { edit_id: editId }) };
    const res = await postRequest({ url: `${BASE}/admin/cms/tv-timings/add-edit`, postData });
    if (res?.status === 200 && res?.data?.status) {
      return { status: true, result: res?.data?.response?.result };
    }
    return { status: false, message: extractApiError(res, 'Failed to save TV timing') };
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};

export const changeTvTimingStatus = async (options = {}) => {
  try {
    const res = await postRequest({ url: `${BASE}/admin/cms/tv-timings/change-status`, postData: options });
    if (res?.status === 200 && res?.data?.status) {
      return { status: true, result: res?.data?.response?.result };
    }
    return { status: false, message: extractApiError(res, 'Failed to change TV timing status') };
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};

export const deleteTvTiming = async (options = {}) => {
  try {
    const res = await postRequest({ url: `${BASE}/admin/cms/tv-timings/delete`, postData: options });
    if (res?.status === 200 && res?.data?.status) {
      return { status: true, result: res?.data?.response?.result };
    }
    return { status: false, message: extractApiError(res, 'Failed to delete TV timing') };
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};
