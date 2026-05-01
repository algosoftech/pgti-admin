import { postRequest } from 'services/api';
import { extractApiError } from 'utils/apiError';

const _u = process.env.REACT_APP_API_BASE_URL || '';
const BASE = _u.endsWith('/') ? _u.slice(0, -1) : _u;

export const listGallery = async (options = {}) => {
  try {
    const { skip = 0, limit = 10, ...rest } = options;
    const page = Math.floor(skip / limit) + 1;
    const res = await postRequest({ url: `${BASE}/admin/cms/gallery/list`, postData: { page, limit, ...rest } });
    if (res?.status === 200 && res?.data?.status) {
      return {
        status: true,
        result: res?.data?.response?.result || [],
        count: res?.data?.response?.count || 0,
        pagination: res?.data?.response?.pagination || null,
      };
    }
    return { status: false, message: extractApiError(res, 'Failed to fetch gallery items') };
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};

export const addEditGallery = async (options = {}) => {
  try {
    const { editId, ...rest } = options;
    const postData = { ...rest, ...(editId && { edit_id: editId }) };
    const res = await postRequest({ url: `${BASE}/admin/cms/gallery/add-edit`, postData });
    if (res?.status === 200 && res?.data?.status) {
      return { status: true, result: res?.data?.response?.result };
    }
    return { status: false, message: extractApiError(res, 'Failed to save gallery item') };
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};

export const changeGalleryStatus = async (options = {}) => {
  try {
    const res = await postRequest({ url: `${BASE}/admin/cms/gallery/change-status`, postData: options });
    if (res?.status === 200 && res?.data?.status) {
      return { status: true, result: res?.data?.response?.result };
    }
    return { status: false, message: extractApiError(res, 'Failed to change gallery status') };
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};

export const deleteGallery = async (options = {}) => {
  try {
    const res = await postRequest({ url: `${BASE}/admin/cms/gallery/delete`, postData: options });
    if (res?.status === 200 && res?.data?.status) {
      return { status: true, result: res?.data?.response?.result };
    }
    return { status: false, message: extractApiError(res, 'Failed to delete gallery item') };
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};
