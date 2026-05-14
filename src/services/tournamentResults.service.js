import { extractApiError } from 'utils/apiError';
import { postRequest } from 'services/api';

const _u = process.env.REACT_APP_API_BASE_URL || '';
const BASE = _u.endsWith('/') ? _u.slice(0, -1) : _u;

export const listTournamentResults = async (options = {}) => {
    try {
        const { skip = 0, limit = 10, ...rest } = options;
        const page = Math.floor(skip / limit) + 1;
        const res = await postRequest({
            url: `${BASE}/admin/tournament-results/list`,
            postData: { page, limit, ...rest },
        });
        if (res?.status === 200 && res?.data?.status) {
            return {
                status: true,
                result: res?.data?.response?.result || [],
                count: res?.data?.response?.count || 0,
            };
        }
        return { status: false, message: extractApiError(res, 'Failed to fetch results') };
    } catch (error) {
        return { status: false, message: error.message || 'Network error' };
    }
};

export const addEditTournamentResult = async (options = {}) => {
    try {
        const { editId, ...rest } = options;
        const postData = { ...rest, ...(editId && { edit_id: editId }) };
        const res = await postRequest({
            url: `${BASE}/admin/tournament-results/add-edit`,
            postData,
        });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result };
        }
        return { status: false, message: extractApiError(res, 'Failed to save result') };
    } catch (error) {
        return { status: false, message: error.message || 'Request failed' };
    }
};

export const deleteTournamentResult = async (options = {}) => {
    try {
        const res = await postRequest({
            url: `${BASE}/admin/tournament-results/delete`,
            postData: options,
        });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true };
        }
        return { status: false, message: extractApiError(res, 'Failed to delete') };
    } catch (error) {
        return { status: false, message: error.message || 'Request failed' };
    }
};

export const exportTournamentResultsPDF = async (options = {}) => {
    try {
        const res = await postRequest({
            url: `${BASE}/admin/tournament-results/export-pdf`,
            postData: options,
        });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, url: res?.data?.response?.url || '' };
        }
        return { status: false, message: extractApiError(res, 'Failed to export') };
    } catch (error) {
        return { status: false, message: error.message || 'Network error' };
    }
};
