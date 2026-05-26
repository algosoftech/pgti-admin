import { extractApiError } from 'utils/apiError';
import { postRequest } from 'services/api';

const _u = process.env.REACT_APP_API_BASE_URL || '';
const BASE = _u.endsWith('/') ? _u.slice(0, -1) : _u;

export const list = async (options = {}) => {
    try {
        const { skip = 0, limit = 10, ...rest } = options;
        const page = Math.floor(skip / limit) + 1;
        const res = await postRequest({ url: `${BASE}/admin/events/list`, postData: { page, limit, ...rest } });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result, count: res?.data?.response?.count };
        }
        return { status: false, message: extractApiError(res, 'Failed to fetch events') };
    } catch (error) {
        return { status: false, message: error.message || 'Network error' };
    }
};

export const addEditEvent = async (options = {}) => {
    try {
        const { editId, ...rest } = options;
        const postData = { ...rest, ...(editId && { edit_id: editId }) };
        const res = await postRequest({ url: `${BASE}/admin/events/add-edit`, postData });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result };
        }
        return { status: false, message: extractApiError(res, 'Failed to save') };
    } catch (error) {
        return { status: false, message: error.message || 'Request failed' };
    }
};

export const eventChangeStatus = async (options = {}) => {
    try {
        const { editId, id, status } = options;
        const res = await postRequest({ url: `${BASE}/admin/events/change-status`, postData: { id: id || editId, status } });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result };
        }
        return { status: false, message: extractApiError(res, 'Failed to change status') };
    } catch (error) {
        return { status: false, message: error.message || 'Request failed' };
    }
};

// Backward-compatible alias for any stale imports while the admin build catches up.
export const changeEventStatus = eventChangeStatus;

export const deleteEvent = async (options = {}) => {
    try {
        const res = await postRequest({ url: `${BASE}/admin/events/delete`, postData: options });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result };
        }
        return { status: false, message: extractApiError(res, 'Failed to delete') };
    } catch (error) {
        return { status: false, message: error.message || 'Request failed' };
    }
};

export const getEventListingBanner = async () => {
    try {
        const res = await postRequest({ url: `${BASE}/admin/events/banner/detail`, postData: {} });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result || null };
        }
        return { status: false, message: extractApiError(res, 'Failed to fetch events listing banner') };
    } catch (error) {
        return { status: false, message: error.message || 'Request failed' };
    }
};

export const addEditEventListingBanner = async (options = {}) => {
    try {
        const res = await postRequest({ url: `${BASE}/admin/events/banner/add-edit`, postData: options });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result };
        }
        return { status: false, message: extractApiError(res, 'Failed to save events listing banner') };
    } catch (error) {
        return { status: false, message: error.message || 'Request failed' };
    }
};

export const listAceImports = async (options = {}) => {
    try {
        const { skip = 0, limit = 10, ...rest } = options;
        const page = Math.floor(skip / limit) + 1;
        const res = await postRequest({ url: `${BASE}/admin/events/ace-import/list`, postData: { page, limit, ...rest } });
        if (res?.status === 200 && res?.data?.status) {
            return {
                status: true,
                result: res?.data?.response?.result || [],
                count: res?.data?.response?.count || 0,
                filters: res?.data?.response?.filters || {},
            };
        }
        return { status: false, message: extractApiError(res, 'Failed to fetch ACE import history') };
    } catch (error) {
        return { status: false, message: error.message || 'Request failed' };
    }
};

export const getAceImportDetail = async (id) => {
    try {
        const res = await postRequest({ url: `${BASE}/admin/events/ace-import/detail`, postData: { id } });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result || null };
        }
        return { status: false, message: extractApiError(res, 'Failed to fetch ACE import detail') };
    } catch (error) {
        return { status: false, message: error.message || 'Request failed' };
    }
};

export const uploadAceImport = async (formData) => {
    try {
        const res = await postRequest({ url: `${BASE}/admin/events/ace-import/upload`, postData: formData });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result || null };
        }
        return { status: false, message: extractApiError(res, 'Failed to import ACE file') };
    } catch (error) {
        return { status: false, message: error.message || 'Request failed' };
    }
};

export const getTournamentLiveSyncStatus = async () => {
    try {
        const res = await postRequest({ url: `${BASE}/admin/events/live-sync/status`, postData: {} });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result || null };
        }
        return { status: false, message: extractApiError(res, 'Failed to fetch tournament live sync status') };
    } catch (error) {
        return { status: false, message: error.message || 'Request failed' };
    }
};

export const runTournamentLiveSync = async () => {
    try {
        const res = await postRequest({ url: `${BASE}/admin/events/live-sync/run`, postData: {} });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result || null };
        }
        return { status: false, message: extractApiError(res, 'Failed to run tournament live sync') };
    } catch (error) {
        return { status: false, message: error.message || 'Request failed' };
    }
};

export const listTournamentLiveSyncBatches = async (options = {}) => {
    try {
        const { skip = 0, limit = 10 } = options;
        const page = Math.floor(skip / limit) + 1;
        const res = await postRequest({ url: `${BASE}/admin/events/live-sync/list`, postData: { page, limit } });
        if (res?.status === 200 && res?.data?.status) {
            return {
                status: true,
                result: res?.data?.response?.result || [],
                count: res?.data?.response?.count || 0,
                pagination: res?.data?.response?.pagination || null,
            };
        }
        return { status: false, message: extractApiError(res, 'Failed to fetch tournament live sync batches') };
    } catch (error) {
        return { status: false, message: error.message || 'Request failed' };
    }
};

export const getTournamentLiveSyncBatchDetail = async (id) => {
    try {
        const res = await postRequest({ url: `${BASE}/admin/events/live-sync/detail`, postData: { id } });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result || null };
        }
        return { status: false, message: extractApiError(res, 'Failed to fetch tournament live sync batch detail') };
    } catch (error) {
        return { status: false, message: error.message || 'Request failed' };
    }
};
