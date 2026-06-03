import { postRequest } from "services/api";
import { extractApiError } from "utils/apiError";

const _u = process.env.REACT_APP_API_BASE_URL || "";
const BASE = _u.endsWith("/") ? _u.slice(0, -1) : _u;

export const getPgtiCareerEarning = async (tourType = "M") => {
  try {
    const res = await postRequest({ url: `${BASE}/admin/stats/pgti-career-earning/detail`, postData: { tour_type: tourType } });
    if (res?.status === 200 && res?.data?.status) {
      return { status: true, result: res?.data?.response?.result || null };
    }
    return { status: false, message: extractApiError(res, "Failed to fetch PGTI career earning document") };
  } catch (error) {
    return { status: false, message: error.message || "Request failed" };
  }
};

export const savePgtiCareerEarning = async (formData) => {
  try {
    const res = await postRequest({ url: `${BASE}/admin/stats/pgti-career-earning/add-edit`, postData: formData });
    if (res?.status === 200 && res?.data?.status) {
      return { status: true, result: res?.data?.response?.result || null };
    }
    return { status: false, message: extractApiError(res, "Failed to save PGTI career earning document") };
  } catch (error) {
    return { status: false, message: error.message || "Request failed" };
  }
};
