import { postRequest, getRequest } from "services/api";
import { extractApiError } from "utils/apiError";

const root = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");

const getUrl = (url) => `${root}/admin/qschool/${url}`;

const call = async (url, postData = {}, fallback) => {
  try {
    const res = await postRequest({
      url: getUrl(url),
      postData,
    });

    return res?.status === 200 && res?.data?.status
      ? {
          status: true,
          ...(res.data.response || {}),
        }
      : {
          status: false,
          message: extractApiError(res, fallback),
        };
  } catch (error) {
    return {
      status: false,
      message: error?.message || fallback,
    };
  }
};

/**
 * Q-School Page Setup
 */
export const getQSchoolSetup = () =>
  call(
    "setup/get",
    {},
    "Failed to fetch Q-School setup"
  );

export const saveQSchoolSetup = (data) =>
  call(
    "setup/save",
    data,
    "Failed to save Q-School setup"
  );

/**
 * Q-School Applications
 */
export const listQSchoolApplications = ({
  page = 1,
  skip,
  limit = 20,
  year = new Date().getFullYear(),
  email_status = "",
  search = "",
  ...data
} = {}) => {
  const currentPage =
    page ||
    (skip !== undefined
      ? Math.floor(skip / limit) + 1
      : 1);

  return call(
    "applications/list",
    {
      ...data,
      page: currentPage,
      limit,
      year,
      email_status,
      search,
    },
    "Failed to fetch applications"
  );
};

export const getQSchoolApplication = (id) =>
  call(
    "applications/get",
    { id },
    "Failed to fetch application"
  );

/**
 * Converts application data into FormData.
 */
const buildApplicationFormData = (data = {}) => {
  const formData = new FormData();

  const excludedFields = [
    "current_handicap",
    "payment_slip",
    "preferred_locations",
    "preferred_location_1",
    "preferred_location_2",
    "preferred_location_3",
  ];

  Object.entries(data).forEach(([key, value]) => {
    if (excludedFields.includes(key)) {
      return;
    }

    if (value === undefined || value === null) {
      return;
    }

    if (typeof value === "boolean") {
      formData.append(key, value ? "1" : "0");
      return;
    }

    if (value instanceof File) {
      return;
    }

    formData.append(key, String(value));
  });

  /**
   * Preferred locations
   */
  if (Array.isArray(data.preferred_locations)) {
    formData.append(
      "preferred_locations",
      JSON.stringify(data.preferred_locations)
    );
  }

  if (
    data.preferred_location_1 !== undefined &&
    data.preferred_location_1 !== null
  ) {
    formData.append(
      "preferred_location_1",
      data.preferred_location_1
    );
  }

  if (
    data.preferred_location_2 !== undefined &&
    data.preferred_location_2 !== null
  ) {
    formData.append(
      "preferred_location_2",
      data.preferred_location_2
    );
  }

  if (
    data.preferred_location_3 !== undefined &&
    data.preferred_location_3 !== null
  ) {
    formData.append(
      "preferred_location_3",
      data.preferred_location_3
    );
  }

  /**
   * Current handicap / certificate file
   */
  if (data.current_handicap instanceof File) {
    formData.append(
      "current_handicap",
      data.current_handicap
    );
  }

  /**
   * Payment slip
   */
  if (data.payment_slip instanceof File) {
    formData.append(
      "payment_slip",
      data.payment_slip
    );
  }

  /**
   * Always send checkbox values.
   */
  formData.set(
    "payment_status",
    data.payment_status ? "1" : "0"
  );

  formData.set(
    "email_confirmed",
    data.email_confirmed ? "1" : "0"
  );

  return formData;
};

/**
 * Update Q-School Application
 *
 * Endpoint:
 * POST /admin/qschool/applications/update/:id
 */
export const updateQSchoolApplication = async (
  id,
  data = {},
  files = {}
) => {
  try {
    const formData = buildApplicationFormData({
      ...data,
      current_handicap:
        files.current_handicap ??
        data.current_handicap,
      payment_slip:
        files.payment_slip ??
        data.payment_slip,
    });

    const res = await postRequest({
      url: getUrl(`applications/update/${id}`),
      postData: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res?.status === 200 && res?.data?.status
      ? {
          status: true,
          ...(res.data.response || {}),
        }
      : {
          status: false,
          message: extractApiError(
            res,
            "Failed to update application"
          ),
        };
  } catch (error) {
    return {
      status: false,
      message:
        error?.message ||
        "Failed to update application",
    };
  }
};

/**
 * Delete Q-School Application
 */
export const deleteQSchoolApplication = (id) =>
  call(
    "applications/delete",
    { id },
    "Failed to delete application"
  );

/**
 * Payment Status
 *
 * POST /admin/qschool/applications/update-payment/:id
 */
export const updateQSchoolPaymentStatus = async (
  id,
  payment_status
) => {
  try {
    const res = await postRequest({
      url: getUrl(
        `applications/update-payment/${id}`
      ),
      postData: {
        payment_status: Boolean(payment_status),
      },
    });

    return res?.status === 200 && res?.data?.status
      ? {
          status: true,
          ...(res.data.response || {}),
        }
      : {
          status: false,
          message: extractApiError(
            res,
            "Failed to update payment status"
          ),
        };
  } catch (error) {
    return {
      status: false,
      message:
        error?.message ||
        "Failed to update payment status",
    };
  }
};

/**
 * Email Confirmation
 *
 * POST /admin/qschool/applications/update-email/:id
 */
export const updateQSchoolEmailConfirmation = async (
  id,
  email_confirmed,
  email_confirmation_note = ""
) => {
  try {
    const res = await postRequest({
      url: getUrl(
        `applications/update-email/${id}`
      ),
      postData: {
        email_confirmed: Boolean(email_confirmed),
        email_confirmation_note:
          email_confirmation_note || "",
      },
    });

    return res?.status === 200 && res?.data?.status
      ? {
          status: true,
          ...(res.data.response || {}),
        }
      : {
          status: false,
          message: extractApiError(
            res,
            "Failed to update email confirmation"
          ),
        };
  } catch (error) {
    return {
      status: false,
      message:
        error?.message ||
        "Failed to update email confirmation",
    };
  }
};

/**
 * Excel Export
 *
 * Authenticated request returning Blob.
 */
export const downloadQSchoolExcel = async (year = new Date().getFullYear()) => {
  try {
    const res = await getRequest({
      url: getUrl("applications/download-excel"),
      params: {
        year,
      },
      responseType: "blob",
    });

    return res;
  } catch (error) {
    throw error;
  }
};

/**
 * Kept for backward compatibility.
 */
export const getQSchoolExcelUrl = (year = new Date().getFullYear()) =>
  getUrl(
    `applications/download-excel?year=${encodeURIComponent(
      year
    )}`
  );