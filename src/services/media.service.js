import { extractApiError } from 'utils/apiError';
/**
 * media.service.js — Single source of truth for all media uploads.
 *
 * All image fields across the project must call `uploadMedia(file, folder)`.
 * The backend stores the file on API/server storage and returns a public server URL.
 *
 * Folder convention:
 *   banners           → homepage / CMS banners
 *   categories        → category thumbnail images
 *   sub-categories    → sub-category thumbnail images
 *   products          → product gallery images
 *   articles          → article cover / inline images
 *   events            → event images
 *   users             → user profile / avatar images
 *   accounts          → admin account avatars
 *   cms/about-us      → About Us page assets
 *   cms/tour-partners → Tour Partners page assets
 *   cms/highlight-videos → Highlight Video thumbnails
 *   common            → general / clipart gallery images
 */
import { postRequest } from 'services/api';

const _u = process.env.REACT_APP_API_BASE_URL || '';
const BASE = _u.endsWith('/') ? _u.slice(0, -1) : _u;
const API_ORIGIN = BASE.replace(/\/v1\/?$/i, '');
const IMAGE_BASE = (process.env.REACT_APP_IMAGE_BASE_URL || '').replace(/\/$/, '');
// Bunny CDN is intentionally off for now. Set REACT_APP_USE_BUNNY_CDN=true
// only if the backend is switched back to CDN delivery later.
const USE_BUNNY_CDN = String(process.env.REACT_APP_USE_BUNNY_CDN || '').toLowerCase() === 'true';
const CDN_BASE = (() => {
  if (!USE_BUNNY_CDN) return '';
  const base = (process.env.REACT_APP_BUNNY_CDN_PULL_ZONE || '').replace(/\/$/, '');
  return base && !/^https?:\/\//i.test(base) ? `https://${base}` : base;
})();
const SERVER_MEDIA_BASE = API_ORIGIN || IMAGE_BASE;

const isLocalBrowser = () =>
  typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);

const getPathFromValue = (value = '') => {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) {
    try {
      return new URL(value).pathname.replace(/^\/+/, '');
    } catch {
      return '';
    }
  }
  if (value.startsWith('//')) {
    try {
      return new URL(`https:${value}`).pathname.replace(/^\/+/, '');
    } catch {
      return '';
    }
  }
  return String(value).replace(/^\/+/, '');
};

const localPreviewBaseForPath = (path = '') => {
  if (!isLocalBrowser()) return '';
  const normalized = String(path || '').replace(/^\/+/, '');
  if (!normalized) return '';
  if (normalized.startsWith('userdata/')) return SERVER_MEDIA_BASE;
  if (normalized.startsWith('cms/')) return SERVER_MEDIA_BASE;
  return SERVER_MEDIA_BASE;
};

const shouldUseServerMediaUrl = (path = '') => {
  const normalized = String(path || '').replace(/^\/+/, '');
  return normalized.startsWith('userdata/') || normalized.startsWith('cms/');
};

const normalizeImageUrl = (url = '') => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || url.startsWith('//')) {
    if (!USE_BUNNY_CDN && SERVER_MEDIA_BASE) {
      const path = getPathFromValue(url);
      if (shouldUseServerMediaUrl(path)) {
        return `${SERVER_MEDIA_BASE}/${path}`;
      }
    }
    return url;
  }
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(url)) return `https://${url}`;

  if (CDN_BASE) {
    return `${CDN_BASE}/${url.replace(/^\//, '')}`;
  }

  if (shouldUseServerMediaUrl(url) && SERVER_MEDIA_BASE) {
    return `${SERVER_MEDIA_BASE}/${url.replace(/^\//, '')}`;
  }

  const fallbackBase = IMAGE_BASE || SERVER_MEDIA_BASE;
  return fallbackBase ? `${fallbackBase}/${url.replace(/^\//, '')}` : url;
};

export const resolvePreviewMediaUrl = (value = '') => {
  if (!value) return '';
  if (value.startsWith('blob:')) return value;

  const path = getPathFromValue(value);
  const localBase = localPreviewBaseForPath(path);
  if (localBase && path) {
    return `${localBase.replace(/\/$/, '')}/${path}`;
  }

  return normalizeImageUrl(value);
};

/**
 * Upload a single file to server storage via the backend proxy.
 *
 * @param {File}   file    - The file object (after crop/compression from ImageEditor).
 * @param {string} folder  - Destination folder under server media storage.
 * @returns {{ status: boolean, url?: string, message?: string }}
 */
export const uploadMedia = async (file, folder = 'common') => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);

    const res = await postRequest({
      url: `${BASE}/common/media/upload`,
      postData: formData,
    });

    if (res?.status === 200 && res?.data?.status) {
      const raw = res?.data?.response?.result;
      let url = typeof raw === 'string' ? raw : raw?.url || '';
      // Ensure stored URL is always absolute so preview works everywhere
      url = normalizeImageUrl(url);
      return { status: true, url };
    }
    return {
      status: false,
      message: extractApiError(res, 'Upload failed'),
    };
  } catch (error) {
    console.error('uploadMedia error:', error);
    return { status: false, message: extractApiError(error, 'Upload failed. Please try again.') };
  }
};

export const uploadMultipleMedia = async (files = [], folder = 'common') => {
  try {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    formData.append('folder', folder);

    const res = await postRequest({
      url: `${BASE}/common/media/upload-multiple`,
      postData: formData,
    });

    if (res?.status === 200 && res?.data?.status) {
      const raw = res?.data?.response?.result;
      const urls = Array.isArray(raw) ? raw.map((item) => normalizeImageUrl(item)) : [];
      return { status: true, urls };
    }
    return {
      status: false,
      message: extractApiError(res, 'Upload failed'),
    };
  } catch (error) {
    console.error('uploadMultipleMedia error:', error);
    return { status: false, message: extractApiError(error, 'Upload failed. Please try again.') };
  }
};

/**
 * List uploaded media files in a folder (gallery/picker use).
 *
 * @param {Object} options  - { folder, skip, limit }
 * @returns {{ status: boolean, result?: Array, count?: number }}
 */
export const listMedia = async (options = {}) => {
  try {
    const res = await postRequest({
      url: `${BASE}/common/media/list`,
      postData: options,
    });
    if (res?.status === 200 && res?.data?.status) {
      return {
        status: true,
        result: res?.data?.response?.result,
        count: res?.data?.response?.count,
      };
    }
    return { status: false, message: extractApiError(res, 'Failed to load media.') };
  } catch (error) {
    console.error('listMedia error:', error);
    return { status: false, message: extractApiError(error, 'Failed to load media.') };
  }
};

/**
 * Delete a media file by its public URL.
 *
 * @param {string} url  - Full public URL of the file to delete.
 * @returns {{ status: boolean }}
 */
export const deleteMedia = async (url) => {
  try {
    const res = await postRequest({
      url: `${BASE}/common/media/delete`,
      postData: { url },
    });
    if (res?.status === 200 && res?.data?.status) {
      return { status: true };
    }
    return { status: false, message: extractApiError(res, 'Delete failed.') };
  } catch (error) {
    console.error('deleteMedia error:', error);
    return { status: false, message: extractApiError(error, 'Delete failed.') };
  }
};
