import { extractApiError } from 'utils/apiError';
/**
 * media.service.js — Single source of truth for all media uploads.
 *
 * All image fields across the project must call `uploadMedia(file, folder)`.
 * The backend uploads the file to Bunny CDN Storage and returns the public CDN URL.
 *
 * Folder convention (must match backend Bunny Storage path):
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

const normalizeImageUrl = (url = '') => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || url.startsWith('//')) return url;
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(url)) return `https://${url}`;

  const cdnBase = (process.env.REACT_APP_BUNNY_CDN_PULL_ZONE || '').replace(/\/$/, '');
  if (cdnBase && !url.startsWith('/')) {
    const base = /^https?:\/\//i.test(cdnBase) ? cdnBase : `https://${cdnBase}`;
    return `${base}/${url.replace(/^\//, '')}`;
  }

  const base = (process.env.REACT_APP_IMAGE_BASE_URL || '').replace(/\/$/, '');
  return `${base}/${url.replace(/^\//, '')}`;
};

/**
 * Upload a single file to Bunny CDN via the backend proxy.
 *
 * @param {File}   file    - The file object (after crop/compression from ImageEditor).
 * @param {string} folder  - Destination folder on the CDN (see convention above).
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
 * Delete a media file by its CDN URL.
 *
 * @param {string} url  - Full CDN URL of the file to delete.
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
