import { postRequest } from 'services/api';
import { extractApiError } from 'utils/apiError';

const _u = process.env.REACT_APP_API_BASE_URL || '';
const BASE = _u.endsWith('/') ? _u.slice(0, -1) : _u;

export const listArticlePages = async (options = {}) => {
  try {
    const { skip = 0, limit = 10, ...rest } = options;
    const page = Math.floor(skip / limit) + 1;
    const res = await postRequest({
      url: `${BASE}/admin/cms/article-pages/list`,
      postData: { page, limit, ...rest },
    });
    if (res?.status === 200 && res?.data?.status) {
      return {
        status: true,
        result: res?.data?.response?.result || [],
        count: res?.data?.response?.count || 0,
        pagination: res?.data?.response?.pagination || null,
      };
    }
    return { status: false, message: extractApiError(res, 'Failed to fetch article pages') };
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};

export const addEditArticlePage = async (options = {}) => {
  try {
    const { editId, ...rest } = options;
    const res = await postRequest({
      url: `${BASE}/admin/cms/article-pages/add-edit`,
      postData: { ...rest, ...(editId && { edit_id: editId }) },
    });
    if (res?.status === 200 && res?.data?.status) {
      return { status: true, result: res?.data?.response?.result };
    }
    return { status: false, message: extractApiError(res, 'Failed to save article page') };
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};

export const changeArticlePageStatus = async (options = {}) => {
  try {
    const res = await postRequest({
      url: `${BASE}/admin/cms/article-pages/change-status`,
      postData: options,
    });
    if (res?.status === 200 && res?.data?.status) {
      return { status: true, result: res?.data?.response?.result };
    }
    return { status: false, message: extractApiError(res, 'Failed to change article page status') };
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};

export const deleteArticlePage = async (options = {}) => {
  try {
    const res = await postRequest({
      url: `${BASE}/admin/cms/article-pages/delete`,
      postData: options,
    });
    if (res?.status === 200 && res?.data?.status) {
      return { status: true, result: res?.data?.response?.result };
    }
    return { status: false, message: extractApiError(res, 'Failed to delete article page') };
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};

export const getArticlePagesListingBanner = async (tourType = "M") => {
  try {
    const res = await postRequest({
      url: `${BASE}/admin/cms/article-pages/banner/detail`,
      postData: { tour_type: tourType },
    });
    if (res?.status === 200 && res?.data?.status) {
      return { status: true, result: res?.data?.response?.result || null };
    }
    return { status: false, message: extractApiError(res, 'Failed to fetch article pages listing banner') };
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};

export const addEditArticlePagesListingBanner = async (options = {}) => {
  try {
    const res = await postRequest({
      url: `${BASE}/admin/cms/article-pages/banner/add-edit`,
      postData: options,
    });
    if (res?.status === 200 && res?.data?.status) {
      return { status: true, result: res?.data?.response?.result };
    }
    return { status: false, message: extractApiError(res, 'Failed to save article pages listing banner') };
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};
