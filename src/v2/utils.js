'use strict'

/**
 * @param {Error} err
 */
const makeErrorSafe = (err) => {
  let safeErr = {
    type: err?.constructor.name,
    message: err.message
  }
  if (safeErr.type === 'AxiosError') {
    safeErr = {
      ...safeErr,
      code: err.code,
      request: err.config && {
        method: err.config.method,
        url: sanitizeUrl(err.config.url),
        timeout: err.config.timeout
      },
      response: err.response && {
        data: err.response.data,
        status: err.response.status,
        statusText: err.response.statusText
      }
    }
  }
  return safeErr
}

const sanitizeLogObject = (value, seen = new WeakSet()) => {
  if (value === null || typeof value !== 'object') {
    return value
  }

  if (seen.has(value)) {
    return '[Circular]'
  }
  seen.add(value)

  if (value instanceof Error) {
    return makeErrorSafe(value)
  }

  // Array
  if (Array.isArray(value)) {
    return value.map(v => sanitizeLogObject(v, seen))
  }

  // Plain object
  const result = {}
  for (const [key, val] of Object.entries(value)) {
    result[key] = sanitizeLogObject(val, seen)
  }

  return result
}

const sanitizeUrl = (url) => {
  try {
    const u = new URL(url)
    u.search = ''
    return u.toString()
  } catch {
    return url
  }
}

module.exports = {
  sanitizeLogObject
}
