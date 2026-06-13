/**
 * Extracts a human-readable error message from any axios response shape the
 * backend may return, including 4xx validation errors.
 *
 * Handles:
 *   { message: "..." }                      — standard backend error
 *   { error: "..." }                        — validation error (e.g. Joi / express-validator)
 *   { errors: [{ msg: "..." }] }            — express-validator array
 *   { errors: { field: "message" } }        — object map of field errors
 *   axios AxiosError .response.data.*       — 4xx/5xx from axios throw
 *   axios AxiosError .message               — network-level error
 */
export const extractApiError = (res, fallback = 'Something went wrong. Please try again.') => {
  if (!res) return fallback;

  // ── 1. Successful HTTP but status:false  (200 + { status: false, message })
  const d = res?.data;
  if (d) {
    if (d.response?.error)                  return d.response.error;
    if (d.response?.message)                return d.response.message;
    if (d.error)                            return d.error;
    if (d.message)                          return d.message;
    if (Array.isArray(d.errors) && d.errors.length)
      return d.errors[0]?.msg || d.errors[0]?.message || d.errors[0] || fallback;
    if (d.errors && typeof d.errors === 'object') {
      const first = Object.values(d.errors)[0];
      return typeof first === 'string' ? first : fallback;
    }
    if (d.statusMessage)                    return d.statusMessage;
  }

  // ── 2. axios error object — .response is the actual HTTP response
  const rd = res?.response?.data;
  if (rd) {
    if (rd.response?.error)                 return rd.response.error;
    if (rd.response?.message)               return rd.response.message;
    if (rd.error)                           return rd.error;
    if (rd.message)                         return rd.message;
    if (Array.isArray(rd.errors) && rd.errors.length)
      return rd.errors[0]?.msg || rd.errors[0]?.message || rd.errors[0] || fallback;
    if (rd.errors && typeof rd.errors === 'object') {
      const first = Object.values(rd.errors)[0];
      return typeof first === 'string' ? first : fallback;
    }
    if (rd.statusMessage)                   return rd.statusMessage;
  }

  // ── 3. axios network-level message (e.g. "Network Error")
  if (res?.message && typeof res.message === 'string') return res.message;

  return fallback;
};
