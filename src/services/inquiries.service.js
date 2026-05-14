import { extractApiError } from 'utils/apiError';
import { postRequest } from 'services/api';

const _u = process.env.REACT_APP_API_BASE_URL || '';
const BASE = _u.endsWith('/') ? _u.slice(0, -1) : _u;

export const listContactUsInquiries = async (options = {}) => {
  try {
    const { skip = 0, limit = 20, ...rest } = options;
    const page = Math.floor(skip / limit) + 1;
    const res = await postRequest({
      url: `${BASE}/admin/inquiries/contact-us/list`,
      postData: { page, limit, ...rest },
    });

    if (res?.status === 200 && res?.data?.status) {
      return {
        status: true,
        result: res?.data?.response?.result || [],
        count: res?.data?.response?.count || 0,
      };
    }

    return { status: false, message: extractApiError(res, 'Failed to fetch contact inquiries') };
  } catch (error) {
    return { status: false, message: error.message || 'Network error' };
  }
};
