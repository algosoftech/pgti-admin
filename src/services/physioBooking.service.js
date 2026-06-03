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

export const listPhysioSlots = async (options = {}) => {
  try {
    const { skip = 0, limit = 20, ...rest } = options;
    const page = Math.floor(skip / limit) + 1;
    const res = await postRequest({
      url: `${BASE}/admin/physio-booking/slots/list`,
      postData: { page, limit, ...rest },
    });
    const parsed = unwrap(res, "Failed to fetch physio slots");
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

export const createPhysioSlots = async (postData = {}) => {
  try {
    const res = await postRequest({
      url: `${BASE}/admin/physio-booking/slots/create`,
      postData,
    });
    const parsed = unwrap(res, "Failed to create physio slots");
    if (!parsed.status) return parsed;
    return { status: true, result: parsed.result || null };
  } catch (error) {
    return { status: false, message: error.message || "Request failed" };
  }
};

export const changePhysioSlotStatus = async (postData = {}) => {
  try {
    const res = await postRequest({
      url: `${BASE}/admin/physio-booking/slots/change-status`,
      postData,
    });
    const parsed = unwrap(res, "Failed to update physio slot status");
    if (!parsed.status) return parsed;
    return { status: true, result: parsed.result || null };
  } catch (error) {
    return { status: false, message: error.message || "Request failed" };
  }
};

export const listPhysioBookings = async (options = {}) => {
  try {
    const { skip = 0, limit = 20, ...rest } = options;
    const page = Math.floor(skip / limit) + 1;
    const res = await postRequest({
      url: `${BASE}/admin/physio-booking/bookings/list`,
      postData: { page, limit, ...rest },
    });
    const parsed = unwrap(res, "Failed to fetch physio bookings");
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
