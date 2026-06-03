import { postRequest } from 'services/api';
import { extractApiError } from 'utils/apiError';

const _u = process.env.REACT_APP_API_BASE_URL || '';
const BASE = _u.endsWith('/') ? _u.slice(0, -1) : _u;

export const listOtherArticlePages = async (options = {}) => {
  try {
    const { skip = 0, limit = 10, ...rest } = options;
    const page = Math.floor(skip / limit) + 1;
    const res = await postRequest({
      url: `${BASE}/admin/cms/other-article-pages/list`,
      postData: { page, limit, ...rest },
    });
    if (res?.status === 200 && res?.data?.status) {
      return {
        status: true,
        result: res?.data?.response?.result || [],
        count: res?.data?.response?.count || 0,
        pagination: res?.data?.response?.pagination || null,
        pageTypes: res?.data?.response?.page_types || [],
      };
    }
    return { status: false, message: extractApiError(res, 'Failed to fetch other article pages') };
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};

export const getOtherArticlePageTypes = async () => {
  try {
    const res = await postRequest({
      url: `${BASE}/admin/cms/other-article-pages/page-types`,
      postData: {},
    });
    if (res?.status === 200 && res?.data?.status) {
      return { status: true, result: res?.data?.response?.result || [] };
    }
    return { status: false, message: extractApiError(res, 'Failed to fetch page types') };
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};

export const addEditOtherArticlePage = async (options = {}) => {
  try {
    const { editId, ...rest } = options;
    const res = await postRequest({
      url: `${BASE}/admin/cms/other-article-pages/add-edit`,
      postData: { ...rest, ...(editId && { edit_id: editId }) },
    });
    if (res?.status === 200 && res?.data?.status) {
      return { status: true, result: res?.data?.response?.result };
    }
    return { status: false, message: extractApiError(res, 'Failed to save other article page') };
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};

export const changeOtherArticlePageStatus = async (options = {}) => {
  try {
    const res = await postRequest({
      url: `${BASE}/admin/cms/other-article-pages/change-status`,
      postData: options,
    });
    if (res?.status === 200 && res?.data?.status) {
      return { status: true, result: res?.data?.response?.result };
    }
    return { status: false, message: extractApiError(res, 'Failed to update page status') };
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};

export const deleteOtherArticlePage = async (options = {}) => {
  try {
    const res = await postRequest({
      url: `${BASE}/admin/cms/other-article-pages/delete`,
      postData: options,
    });
    if (res?.status === 200 && res?.data?.status) {
      return { status: true, result: res?.data?.response?.result };
    }
    return { status: false, message: extractApiError(res, 'Failed to delete page') };
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};
