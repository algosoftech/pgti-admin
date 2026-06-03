export const TOUR_TYPE_OPTIONS = [
  { value: "M", label: "PGTI Main Tour" },
  { value: "F", label: "PGTI NextGen" },
];

export const TOUR_TYPE_TAB_OPTIONS = [
  { key: "all", label: "All" },
  { key: "A", label: "Active" },
  { key: "I", label: "Inactive" },
  { key: "F", label: "NextGen" },
];

export const getTourTypeLabel = (value) => (String(value || "").toUpperCase() === "F" ? "NextGen Tour" : "Main Tour");

export const normalizeTourType = (value) => (String(value || "M").toUpperCase() === "F" ? "F" : "M");

export const getTourTypeFromState = (state = {}, fallback = "M") =>
  normalizeTourType(state?.tour_type ?? state?.result?.tour_type ?? state?.tourType ?? state?.type ?? fallback);

export const isSameTourType = (left, right) => normalizeTourType(left) === normalizeTourType(right);

export const shouldUseExistingTourTypeRecord = (id, savedTourType, currentTourType) =>
  Boolean(id) && isSameTourType(savedTourType, currentTourType);
