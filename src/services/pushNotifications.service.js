import { postRequest } from 'services/api';
import { extractApiError } from 'utils/apiError';

const _u = process.env.REACT_APP_API_BASE_URL || '';
const BASE = _u.endsWith('/') ? _u.slice(0, -1) : _u;

const unwrap = (res, fallback) => {
  if (res?.status === 200 && res?.data?.status) {
    return {
      status: true,
      result: res?.data?.response?.result,
      count: res?.data?.response?.count || 0,
      pagination: res?.data?.response?.pagination || null,
    };
  }
  return { status: false, message: extractApiError(res, fallback) };
};

export const listPushTemplates = async (options = {}) => {
  try {
    const { skip = 0, limit = 20, ...rest } = options;
    const page = Math.floor(skip / limit) + 1;
    const res = await postRequest({ url: `${BASE}/admin/push-notifications/templates/list`, postData: { page, limit, ...rest } });
    return unwrap(res, 'Failed to load push notification templates');
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};

export const savePushTemplate = async (options = {}) => {
  try {
    const res = await postRequest({ url: `${BASE}/admin/push-notifications/templates/save`, postData: options });
    return unwrap(res, 'Failed to save push notification template');
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};

export const changePushTemplateStatus = async (options = {}) => {
  try {
    const res = await postRequest({ url: `${BASE}/admin/push-notifications/templates/change-status`, postData: options });
    return unwrap(res, 'Failed to update template status');
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};

export const sendCustomPushNotification = async (options = {}) => {
  try {
    const res = await postRequest({ url: `${BASE}/admin/push-notifications/send-custom`, postData: options });
    return unwrap(res, 'Failed to send notification');
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};

export const sendPresetPushNotification = async (options = {}) => {
  try {
    const res = await postRequest({ url: `${BASE}/admin/push-notifications/send-template`, postData: options });
    return unwrap(res, 'Failed to send preset notification');
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};

export const listPushCampaigns = async (options = {}) => {
  try {
    const { skip = 0, limit = 20, ...rest } = options;
    const page = Math.floor(skip / limit) + 1;
    const res = await postRequest({ url: `${BASE}/admin/push-notifications/campaigns/list`, postData: { page, limit, ...rest } });
    return unwrap(res, 'Failed to load notification history');
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};

export const resendPushCampaign = async (options = {}) => {
  try {
    const res = await postRequest({ url: `${BASE}/admin/push-notifications/campaigns/resend`, postData: options });
    return unwrap(res, 'Failed to resend notification');
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};

export const getAdminPushUnreadCount = async () => {
  try {
    const res = await postRequest({ url: `${BASE}/admin/push-notifications/admin-unread-count`, postData: {} });
    return unwrap(res, 'Failed to load notification count');
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};

export const listAdminUnreadPushNotifications = async (limit = 10) => {
  try {
    const res = await postRequest({
      url: `${BASE}/admin/push-notifications/campaigns/list`,
      postData: {
        page: 1,
        limit,
        condition: {
          platform_scope: 'admin',
          unread_only: true,
        },
      },
    });
    return unwrap(res, 'Failed to load admin notifications');
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};

export const markAdminPushNotificationsRead = async () => {
  try {
    const res = await postRequest({ url: `${BASE}/admin/push-notifications/admin-mark-read`, postData: {} });
    return unwrap(res, 'Failed to mark notifications as read');
  } catch (error) {
    return { status: false, message: extractApiError(error, 'Request failed') };
  }
};
