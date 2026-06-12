import { postRequest } from 'services/api';
import { extractApiError } from 'utils/apiError';

const _u = process.env.REACT_APP_API_BASE_URL || '';
const BASE = _u.endsWith('/') ? _u.slice(0, -1) : _u;

export const listGolfCourses = async (options = {}) => {
  try {
    const { skip = 0, limit = 10, ...rest } = options;
    const page = Math.floor(skip / limit) + 1;
    const res = await postRequest({ url: `${BASE}/admin/cms/golf-courses/list`, postData: { page, limit, ...rest } });
    if (res?.status === 200 && res?.data?.status) {
      return {
        status: true,
        result: res?.data?.response?.result || [],
        count: res?.data?.response?.count || 0,
        pagination: res?.data?.response?.pagination || null,
      };
    }
    return { status: false, message: extractApiError(res, 'Failed to fetch golf courses') };
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};

export const addEditGolfCourse = async (options = {}) => {
  try {
    const { editId, ...rest } = options;
    const postData = { ...rest, ...(editId && { edit_id: editId }) };
    const res = await postRequest({ url: `${BASE}/admin/cms/golf-courses/add-edit`, postData });
    if (res?.status === 200 && res?.data?.status) {
      return { status: true, result: res?.data?.response?.result };
    }
    return { status: false, message: extractApiError(res, 'Failed to save golf course') };
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};

export const changeGolfCourseStatus = async (options = {}) => {
  try {
    const res = await postRequest({ url: `${BASE}/admin/cms/golf-courses/change-status`, postData: options });
    if (res?.status === 200 && res?.data?.status) {
      return { status: true, result: res?.data?.response?.result };
    }
    return { status: false, message: extractApiError(res, 'Failed to update golf course status') };
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};

export const deleteGolfCourse = async (options = {}) => {
  try {
    const res = await postRequest({ url: `${BASE}/admin/cms/golf-courses/delete`, postData: options });
    if (res?.status === 200 && res?.data?.status) {
      return { status: true, result: res?.data?.response?.result };
    }
    return { status: false, message: extractApiError(res, 'Failed to delete golf course') };
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};

export const listGolfCourseMedia = async (options = {}) => {
  try {
    const { skip = 0, limit = 10, ...rest } = options;
    const page = Math.floor(skip / limit) + 1;
    const res = await postRequest({ url: `${BASE}/admin/cms/golf-courses/media/list`, postData: { page, limit, ...rest } });
    if (res?.status === 200 && res?.data?.status) {
      return {
        status: true,
        course: res?.data?.response?.course || null,
        result: res?.data?.response?.result || [],
        count: res?.data?.response?.count || 0,
        pagination: res?.data?.response?.pagination || null,
      };
    }
    return { status: false, message: extractApiError(res, 'Failed to fetch golf course media') };
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};

export const addEditGolfCourseMedia = async (options = {}) => {
  try {
    const { editId, ...rest } = options;
    const postData = { ...rest, ...(editId && { edit_id: editId }) };
    const res = await postRequest({ url: `${BASE}/admin/cms/golf-courses/media/add-edit`, postData });
    if (res?.status === 200 && res?.data?.status) {
      return { status: true, result: res?.data?.response?.result };
    }
    return { status: false, message: extractApiError(res, 'Failed to save golf course media') };
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};

export const changeGolfCourseMediaStatus = async (options = {}) => {
  try {
    const res = await postRequest({ url: `${BASE}/admin/cms/golf-courses/media/change-status`, postData: options });
    if (res?.status === 200 && res?.data?.status) {
      return { status: true, result: res?.data?.response?.result };
    }
    return { status: false, message: extractApiError(res, 'Failed to update media status') };
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};

export const deleteGolfCourseMedia = async (options = {}) => {
  try {
    const res = await postRequest({ url: `${BASE}/admin/cms/golf-courses/media/delete`, postData: options });
    if (res?.status === 200 && res?.data?.status) {
      return { status: true, result: res?.data?.response?.result };
    }
    return { status: false, message: extractApiError(res, 'Failed to delete media') };
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};
