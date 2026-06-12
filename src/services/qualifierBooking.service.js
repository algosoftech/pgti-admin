import { postRequest } from "services/api";
import { extractApiError } from "utils/apiError";

const _u = process.env.REACT_APP_API_BASE_URL || "";
const BASE = _u.endsWith("/") ? _u.slice(0, -1) : _u;

const unwrap = (res, fallbackMessage) => {
  if (res?.status === 200 && res?.data?.status) {
    return { status: true, ...(res?.data?.response || {}) };
  }
  return { status: false, message: extractApiError(res, fallbackMessage) };
};

export const listQualifierBookingSettings = async () => {
  try {
    const res = await postRequest({
      url: `${BASE}/admin/qualifier-booking/settings/list`,
      postData: {},
    });
    const parsed = unwrap(res, "Failed to fetch qualifier booking settings");
    if (!parsed.status) return parsed;
    return { status: true, result: parsed.result || [] };
  } catch (error) {
    return { status: false, message: error.message || "Request failed" };
  }
};

export const saveQualifierBookingSetting = async (postData = {}) => {
  try {
    const res = await postRequest({
      url: `${BASE}/admin/qualifier-booking/settings/save`,
      postData,
    });
    const parsed = unwrap(res, "Failed to save qualifier booking setting");
    if (!parsed.status) return parsed;
    return { status: true, result: parsed.result || null };
  } catch (error) {
    return { status: false, message: error.message || "Request failed" };
  }
};

export const listQualifierBookingApplications = async (options = {}) => {
  try {
    const { skip = 0, limit = 10, ...rest } = options;
    const page = Math.floor(skip / limit) + 1;
    const res = await postRequest({
      url: `${BASE}/admin/qualifier-booking/applications/list`,
      postData: { page, limit, ...rest },
    });
    const parsed = unwrap(res, "Failed to fetch qualifier booking applications");
    if (!parsed.status) return parsed;
    return {
      status: true,
      result: parsed.result || [],
      count: parsed.count || 0,
      pagination: parsed.pagination || null,
      filters: parsed.filters || {},
    };
  } catch (error) {
    return { status: false, message: error.message || "Request failed" };
  }
};

export const markQualifierPaymentReceived = async (postData = {}) => {
  try {
    const res = await postRequest({
      url: `${BASE}/admin/qualifier-booking/applications/mark-payment-received`,
      postData,
    });
    const parsed = unwrap(res, "Failed to mark payment as received");
    if (!parsed.status) return parsed;
    return { status: true, result: parsed.result || null };
  } catch (error) {
    return { status: false, message: error.message || "Request failed" };
  }
};

export const exportQualifierBookingApplications = async (postData = {}) => {
  try {
    const res = await postRequest({
      url: `${BASE}/admin/qualifier-booking/applications/export`,
      postData,
    });
    const parsed = unwrap(res, "Failed to export qualifier booking applications");
    if (!parsed.status) return parsed;
    return { status: true, result: parsed.result || null };
  } catch (error) {
    return { status: false, message: error.message || "Request failed" };
  }
};
