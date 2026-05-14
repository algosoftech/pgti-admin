import { extractApiError } from 'utils/apiError';
import { postRequest } from 'services/api';

const _u = process.env.REACT_APP_API_BASE_URL || '';
const BASE = _u.endsWith('/') ? _u.slice(0, -1) : _u;

/**
 * Fetch aggregated dashboard stats.
 * Backend returns: players, activeEvents, tournamentResults, articles, recentPlayers, upcomingEvents, monthlyRegistrations
 */
export const getDashboardStats = async () => {
    try {
        const res = await postRequest({ url: `${BASE}/admin/dashboard/stats`, postData: {} });
        if (res?.status === 200 && res?.data?.status) {
            return { status: true, result: res?.data?.response?.result };
        }
        return { status: false, message: extractApiError(res, 'Failed to load dashboard') };
    } catch (error) {
        return { status: false, message: error.message || 'Network error' };
    }
};
