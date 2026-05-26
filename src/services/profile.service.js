import { getRequest, postRequest } from "services/api";
import { extractApiError } from "utils/apiError";

const _u = process.env.REACT_APP_API_BASE_URL || "";
const BASE = _u.endsWith("/") ? _u.slice(0, -1) : _u;

export const getProfile = async () => {
  try {
    const result = await getRequest({ url: `${BASE}/admin/auth/profile` });
    if (result) return { status: true, result };
    return { status: false, message: "Failed to load profile." };
  } catch (error) {
    return { status: false, message: extractApiError(error, "Failed to load profile.") };
  }
};

export const requestFieldUpdate = async (postData = {}) => {
  try {
    const res = await postRequest({ url: `${BASE}/admin/auth/profile/field/request`, postData });
    if (res?.status === 200 && res?.data?.status) {
      return {
        status: true,
        result: res?.data?.response,
        message: res?.data?.response?.message || "OTP sent successfully.",
      };
    }
    return { status: false, message: extractApiError(res, "Failed to send OTP.") };
  } catch (error) {
    return { status: false, message: extractApiError(error, "Failed to send OTP.") };
  }
};

export const verifyFieldUpdate = async (postData = {}) => {
  try {
    const res = await postRequest({ url: `${BASE}/admin/auth/profile/field/verify`, postData });
    if (res?.status === 200 && res?.data?.status) {
      return {
        status: true,
        result: res?.data?.response?.result,
        message: res?.data?.response?.message || "Field updated successfully.",
      };
    }
    return { status: false, message: extractApiError(res, "Failed to verify OTP.") };
  } catch (error) {
    return { status: false, message: extractApiError(error, "Failed to verify OTP.") };
  }
};

export const sendPasswordChangeOtp = async () => {
  try {
    const res = await postRequest({ url: `${BASE}/admin/auth/profile/password/send-otp`, postData: {} });
    if (res?.status === 200 && res?.data?.status) {
      return {
        status: true,
        result: res?.data?.response,
        message: res?.data?.response?.message || "OTP sent successfully.",
      };
    }
    return { status: false, message: extractApiError(res, "Failed to send OTP.") };
  } catch (error) {
    return { status: false, message: extractApiError(error, "Failed to send OTP.") };
  }
};

export const verifyPasswordChangeOtp = async (postData = {}) => {
  try {
    const res = await postRequest({ url: `${BASE}/admin/auth/profile/password/verify-otp`, postData });
    if (res?.status === 200 && res?.data?.status) {
      return {
        status: true,
        message: res?.data?.response?.message || "OTP verified successfully.",
      };
    }
    return { status: false, message: extractApiError(res, "Failed to verify OTP.") };
  } catch (error) {
    return { status: false, message: extractApiError(error, "Failed to verify OTP.") };
  }
};

export const updateOwnPassword = async (postData = {}) => {
  try {
    const res = await postRequest({ url: `${BASE}/admin/auth/profile/password/update`, postData });
    if (res?.status === 200 && res?.data?.status) {
      return {
        status: true,
        message: res?.data?.response?.message || "Password updated successfully.",
      };
    }
    return { status: false, message: extractApiError(res, "Failed to update password.") };
  } catch (error) {
    return { status: false, message: extractApiError(error, "Failed to update password.") };
  }
};
