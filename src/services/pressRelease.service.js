import { postRequest } from 'services/api';
import { extractApiError } from 'utils/apiError';

const _u = process.env.REACT_APP_API_BASE_URL || '';
const BASE = _u.endsWith('/') ? _u.slice(0, -1) : _u;

export const listPressRelease = async (options = {}) => {
  try {
    const { skip = 0, limit = 10, ...rest } = options;
    const page = Math.floor(skip / limit) + 1;
    const res = await postRequest({ url: `${BASE}/admin/cms/press-release/list`, postData: { page, limit, ...rest } });
    if (res?.status === 200 && res?.data?.status) {
      return {
        status: true,
        result: res?.data?.response?.result || [],
        count: res?.data?.response?.count || 0,
        pagination: res?.data?.response?.pagination || null,
      };
    }
    return { status: false, message: extractApiError(res, 'Failed to fetch press release items') };
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};

export const addEditPressRelease = async (options = {}) => {
  try {
    const { editId, ...rest } = options;
    const postData = { ...rest, ...(editId && { edit_id: editId }) };
    const res = await postRequest({ url: `${BASE}/admin/cms/press-release/add-edit`, postData });
    if (res?.status === 200 && res?.data?.status) {
      return { status: true, result: res?.data?.response?.result };
    }
    return { status: false, message: extractApiError(res, 'Failed to save press release item') };
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};

export const changePressReleaseStatus = async (options = {}) => {
  try {
    const res = await postRequest({ url: `${BASE}/admin/cms/press-release/change-status`, postData: options });
    if (res?.status === 200 && res?.data?.status) {
      return { status: true, result: res?.data?.response?.result };
    }
    return { status: false, message: extractApiError(res, 'Failed to change press release status') };
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};

export const deletePressRelease = async (options = {}) => {
  try {
    const res = await postRequest({ url: `${BASE}/admin/cms/press-release/delete`, postData: options });
    if (res?.status === 200 && res?.data?.status) {
      return { status: true, result: res?.data?.response?.result };
    }
    return { status: false, message: extractApiError(res, 'Failed to delete press release item') };
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};

export const getPressReleaseListingBanner = async () => {
  try {
    const res = await postRequest({ url: `${BASE}/admin/cms/press-release/banner/detail`, postData: {} });
    if (res?.status === 200 && res?.data?.status) {
      return { status: true, result: res?.data?.response?.result || null };
    }
    return { status: false, message: extractApiError(res, 'Failed to fetch press release listing banner') };
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};

export const addEditPressReleaseListingBanner = async (options = {}) => {
  try {
    const res = await postRequest({ url: `${BASE}/admin/cms/press-release/banner/add-edit`, postData: options });
    if (res?.status === 200 && res?.data?.status) {
      return { status: true, result: res?.data?.response?.result };
    }
    return { status: false, message: extractApiError(res, 'Failed to save press release listing banner') };
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};
