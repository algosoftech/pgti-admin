import { postRequest } from "services/api";
import { extractApiError } from "utils/apiError";

const _u = process.env.REACT_APP_API_BASE_URL || "";
const BASE = _u.endsWith("/") ? _u.slice(0, -1) : _u;

export const getStatsPageSettings = async (postData = {}) => {
  try {
    const res = await postRequest({ url: `${BASE}/admin/cms/stats-page/detail`, postData });
    if (res?.status === 200 && res?.data?.status) {
      return { status: true, result: res?.data?.response?.result || null };
    }
    return { status: false, message: extractApiError(res, "Failed to fetch stats page settings") };
  } catch (error) {
    return { status: false, message: error.message || "Request failed" };
  }
};

export const saveStatsPageSettings = async (postData = {}) => {
  try {
    const res = await postRequest({ url: `${BASE}/admin/cms/stats-page/add-edit`, postData });
    if (res?.status === 200 && res?.data?.status) {
      return { status: true, result: res?.data?.response?.result || null };
    }
    return { status: false, message: extractApiError(res, "Failed to save stats page settings") };
  } catch (error) {
    return { status: false, message: error.message || "Request failed" };
  }
};
