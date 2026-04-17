'use strict'

/**
 * @param {Error} err
 */
const redactAxiosError = (err) => {
  if (err?.constructor.name !== 'AxiosError') return err

  const redacted = Object.create(Object.getPrototypeOf(err))
  Object.defineProperties(redacted, Object.getOwnPropertyDescriptors(err))

  redacted.method = err.config?.method
  redacted.url = err.config?.url && sanitizeUrl(err.config.url)
  if (err.config?.headers) {
    redacted.headers = Object.fromEntries(
      Object.entries(err.config.headers)
        .map(([k,v]) => [k, '*'.repeat(v?.toString().length || 1)])
    )

  }
  redacted.timeout = err.config?.timeout
  redacted.response = err.response && {
    data: err.response.data,
    status: err.response.status,
    statusText: err.response.statusText
  }

  delete redacted.request
  delete redacted.config

  return redacted
}

const sanitizeLogObject = (value, seen = new WeakSet()) => {
  if (value === null || typeof value !== 'object') {
    return value
  }

  if (seen.has(value)) {
    return '[Circular]'
  }
  seen.add(value)

  if (value.constructor.name === 'AxiosError') {
    return redactAxiosError(value)
  }

  if (value instanceof Error) {
    return value
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
    for (const key of u.searchParams.keys()) {
      u.searchParams.set(key, '[REDACTED]')
    }
    return u.toString()
  } catch {
    return url
  }
}

module.exports = {
  sanitizeLogObject
}
