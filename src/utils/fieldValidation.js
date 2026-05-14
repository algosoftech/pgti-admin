/**
 * fieldValidation.js
 * Centralised character limits and image specs for all add/edit forms.
 * Import { LIMITS, showLimitError, validateImageFile } from 'utils/fieldValidation'
 */
import { notification } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import React from 'react';

/* ── Character limits ────────────────────────────────────────────────────── */
export const LIMITS = {
  title:             { min: 5,   max: 150 },
  short_description: { min: 50,  max: 300 },
  description:       { min: 100, max: 15000 },
  question:          { min: 10,  max: 200 },
  answer:            { min: 20,  max: 1500 },
  about_info:        { min: 50,  max: 2000 },
  notes:             { min: 0,   max: 500 },
  subject:           { min: 5,   max: 200 },
  tags:              { min: 0,   max: 200 },
  video_url:         { min: 0,   max: 500 },
};

/* ── Image specs ─────────────────────────────────────────────────────────── */
export const IMAGE_SPECS = {
  articles:        { recommended: "800×500 px",   maxMB: 2, note: "Landscape ratio preferred. Displayed as card thumbnail and article header." },
  news:            { recommended: "800×500 px",   maxMB: 1, note: "Landscape ratio preferred. Shown as thumbnail on listing cards." },
  banners:         { recommended: "1920×600 px",  maxMB: 2, note: "Wide banner image. Use high-resolution images for best results." },
  events:          { recommended: "800×500 px",   maxMB: 2, note: "Clear, vibrant image that represents the event." },
  users:           { recommended: "400×400 px",   maxMB: 1, note: "Square crop preferred. Use a professional headshot." },
  accounts:        { recommended: "400×400 px",   maxMB: 1, note: "Square crop preferred. Shown as admin avatar." },
  'cms/about-us':  { recommended: "1200×800 px",  maxMB: 2, note: "High-quality image for the About Us page." },
  'cms/tour-partners': { recommended: "200×80 px (logo)", maxMB: 0.5, note: "Transparent PNG preferred for logos." },
  'cms/anti-doping':   { recommended: "800×600 px",  maxMB: 2, note: "Clear image representing the section." },
  'cms/indian-golf':   { recommended: "1200×700 px",  maxMB: 2, note: "High-resolution landscape image." },
  'cms/golf-facts':    { recommended: "1200×600 px",  maxMB: 2, note: "Wide banner format works best." },
  'cms/gallery':       { recommended: "1200×800 px",  maxMB: 2, note: "Landscape image preferred for photo gallery cards." },
  'cms/listing-banners': { recommended: "1920×600 px", maxMB: 2, note: "Wide hero banner for front listing pages like gallery, news, events, and articles." },
  listing_banner_mobile: { recommended: "440×300 px", maxMB: 1, note: "Mobile-responsive banner for front listing pages. Use a clean crop that reads well on smaller screens." },
  hero_banner_mobile: { recommended: "440×300 px", maxMB: 1, note: "Mobile-responsive hero/banner image for CMS page setup sections." },
  'cms/gallery-banner': { recommended: "1920×600 px", maxMB: 2, note: "Wide hero banner for the front gallery listing page." },
  'cms/press-release': { recommended: "1200×800 px",  maxMB: 2, note: "Portrait or clean article scan preferred for press release cards." },
  'cms/contact-us':    { recommended: "1920×600 px",  maxMB: 2, note: "Wide landscape banner. Use a high-resolution image for best results." },
  'cms/homepage':      { recommended: "1920×700 px",  maxMB: 3, note: "Hero banner image. Use a high-resolution wide image for best visual impact." },
  common:          { recommended: "800×600 px",   maxMB: 2, note: "" },
};

/* ── Show a limit error notification ─────────────────────────────────────── */
export const showLimitError = (message) => {
  notification.open({
    message: "Field Limit Error",
    description: message,
    placement: "topRight",
    icon: React.createElement(InfoCircleOutlined, { style: { color: "#f59e0b" } }),
    duration: 4,
  });
};

/* ── Validate plain-text or stripped rich-text length ───────────────────── */
export const stripHtml = (html = "") =>
  html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

export const validateLength = (value, fieldLabel, limits, isRichText = false) => {
  const text = isRichText ? stripHtml(value) : (value || "").trim();
  const { min, max } = limits;
  if (min && text.length < min) {
    showLimitError(`${fieldLabel} must be at least ${min} characters. Currently ${text.length}.`);
    return false;
  }
  if (max && text.length > max) {
    showLimitError(`${fieldLabel} cannot exceed ${max} characters. Currently ${text.length}.`);
    return false;
  }
  return true;
};

/* ── Validate image file (size only; dimensions need FileReader) ─────────── */
export const validateImageFile = (file, spec = {}) => {
  const maxBytes = (spec.maxMB || 2) * 1024 * 1024;
  if (file.size > maxBytes) {
    notification.open({
      message: "Image Too Large",
      description: `The selected image (${(file.size / 1024 / 1024).toFixed(1)} MB) exceeds the maximum allowed size of ${spec.maxMB || 2} MB. Please compress or resize the image and try again.`,
      placement: "topRight",
      icon: React.createElement(InfoCircleOutlined, { style: { color: "#ef4444" } }),
      duration: 5,
    });
    return false;
  }
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) {
    notification.open({
      message: "Invalid File Type",
      description: `Only JPG, PNG, WebP, or GIF images are accepted. You uploaded: ${file.type || "unknown"}.`,
      placement: "topRight",
      icon: React.createElement(InfoCircleOutlined, { style: { color: "#ef4444" } }),
      duration: 4,
    });
    return false;
  }
  return true;
};

export const validateVideoFile = (file, spec = {}) => {
  const maxBytes = (spec.maxMB || 15) * 1024 * 1024;
  if (file.size > maxBytes) {
    notification.open({
      message: "Video Too Large",
      description: `The selected video (${(file.size / 1024 / 1024).toFixed(1)} MB) exceeds the maximum allowed size of ${spec.maxMB || 15} MB. Please compress it and try again.`,
      placement: "topRight",
      icon: React.createElement(InfoCircleOutlined, { style: { color: "#ef4444" } }),
      duration: 5,
    });
    return false;
  }
  const allowed = ["video/mp4", "video/webm", "video/quicktime"];
  if (!allowed.includes(file.type)) {
    notification.open({
      message: "Invalid Video Type",
      description: `Only MP4, WebM, or MOV videos are accepted. You uploaded: ${file.type || "unknown"}.`,
      placement: "topRight",
      icon: React.createElement(InfoCircleOutlined, { style: { color: "#ef4444" } }),
      duration: 4,
    });
    return false;
  }
  return true;
};
