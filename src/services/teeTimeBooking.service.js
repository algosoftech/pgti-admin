import { postRequest } from "services/api";
import { extractApiError } from "utils/apiError";

const _u = process.env.REACT_APP_API_BASE_URL || "";
const BASE = _u.endsWith("/") ? _u.slice(0, -1) : _u;

const extractTeeTimeError = (res, fallbackMessage) => {
  const responseError =
    res?.data?.response?.error ||
    res?.data?.response?.message ||
    res?.response?.data?.response?.error ||
    res?.response?.data?.response?.message;
  if (responseError) return responseError;
  return extractApiError(res, fallbackMessage);
};

const unwrap = (res, fallbackMessage) => {
  if (res?.status === 200 && res?.data?.status) {
    return { status: true, ...(res?.data?.response || {}) };
  }
  return { status: false, message: extractTeeTimeError(res, fallbackMessage) };
};

export const listTeeTimeWindows = async (options = {}) => {
  try {
    const { skip = 0, limit = 10, ...rest } = options;
    const page = Math.floor(skip / limit) + 1;
    const res = await postRequest({
      url: `${BASE}/admin/tee-time-booking/windows/list`,
      postData: { page, limit, ...rest },
    });
    const parsed = unwrap(res, "Failed to fetch tee-time windows");
    if (!parsed.status) return parsed;
    return {
      status: true,
      result: parsed.result || [],
      count: parsed.count || 0,
      pagination: parsed.pagination || null,
    };
  } catch (error) {
    return { status: false, message: error.message || "Request failed" };
  }
};

export const getTeeTimeWindowsByEvent = async (event_id) => {
  try {
    const res = await postRequest({
      url: `${BASE}/admin/tee-time-booking/windows/detail`,
      postData: { event_id },
    });
    const parsed = unwrap(res, "Failed to fetch tee-time windows");
    if (!parsed.status) return parsed;
    return {
      status: true,
      event: parsed.event || null,
      windows: parsed.windows || [],
    };
  } catch (error) {
    return { status: false, message: error.message || "Request failed" };
  }
};

export const saveTeeTimeWindows = async (postData = {}) => {
  try {
    const res = await postRequest({
      url: `${BASE}/admin/tee-time-booking/windows/upsert`,
      postData,
    });
    const parsed = unwrap(res, "Failed to save tee-time windows");
    if (!parsed.status) return parsed;
    return { status: true, result: parsed.result || null };
  } catch (error) {
    return { status: false, message: error.message || "Request failed" };
  }
};

export const changeTeeTimeWindowStatus = async (postData = {}) => {
  try {
    const res = await postRequest({
      url: `${BASE}/admin/tee-time-booking/windows/change-status`,
      postData,
    });
    const parsed = unwrap(res, "Failed to update tee-time window status");
    if (!parsed.status) return parsed;
    return { status: true, result: parsed.result || null };
  } catch (error) {
    return { status: false, message: error.message || "Request failed" };
  }
};

export const getTeeTimeSheet = async (postData = {}) => {
  try {
    const res = await postRequest({
      url: `${BASE}/admin/tee-time-booking/sheet/detail`,
      postData,
    });
    const parsed = unwrap(res, "Failed to fetch tee sheet");
    if (!parsed.status) return parsed;
    return {
      status: true,
      event: parsed.event || null,
      windows: parsed.windows || [],
      active_window: parsed.active_window || null,
      slots: parsed.slots || [],
    };
  } catch (error) {
    return { status: false, message: error.message || "Request failed" };
  }
};

export const saveTeeTimeSheet = async (postData = {}) => {
  try {
    const res = await postRequest({
      url: `${BASE}/admin/tee-time-booking/sheet/save`,
      postData,
    });
    const parsed = unwrap(res, "Failed to save tee sheet");
    if (!parsed.status) return parsed;
    return { status: true, result: parsed.result || null };
  } catch (error) {
    return { status: false, message: error.message || "Request failed" };
  }
};

export const copyTeeTimeSheet = async (postData = {}) => {
  try {
    const res = await postRequest({
      url: `${BASE}/admin/tee-time-booking/sheet/copy`,
      postData,
    });
    const parsed = unwrap(res, "Failed to copy tee sheet");
    if (!parsed.status) return parsed;
    return { status: true, result: parsed.result || null };
  } catch (error) {
    return { status: false, message: error.message || "Request failed" };
  }
};

export const exportTeeTimeSheet = async (postData = {}) => {
  try {
    const res = await postRequest({
      url: `${BASE}/admin/tee-time-booking/sheet/export`,
      postData,
    });
    const parsed = unwrap(res, "Failed to export tee sheet");
    if (!parsed.status) return parsed;
    return { status: true, result: parsed.result || null };
  } catch (error) {
    return { status: false, message: error.message || "Request failed" };
  }
};
