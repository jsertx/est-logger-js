'use strict'
const { isString, cloneDeep } = require('lodash')
const pino = require('pino')
const { sanitizeLogObject } = require('./utils')

/**
 * @typedef {Object} Context
 * @property {Error} [err] error that you log
 * @property {object} [user] error that you log
 * @property {object} [user.id] error that you log
 * @property {object} [user.username] error that you log
 */

class Logger {
  /**
   * @param {object} params
   * @param {string} params.environment
   * @param {string} params.release
   * @param {boolean} params.silenceLogs
   * @param {()=>object} [params.getContext]
   * @param {Record<string, any>} params.labels
   * @param {string} [params.sentryDsn]
   */
  constructor (params) {
    this.getContext = params.getContext
    this.silenceLogs = params.silenceLogs
    this.labels = {
      env: params.environment,
      release: params.release,
      ...(params.labels || {})
    }

    this.instance = pino({
      redact: {
        paths: params.redactPaths || [],
        censor: '[REDACTED]'
      },
      formatters: {
        level: (label) => ({ level: label })
      }
    })

    if (params.sentryDsn) {
      this.Sentry = require('@sentry/node')
      this.Sentry.init({
        environment: params.environment,
        dsn: params.sentryDsn,
        release: params.release,
        integrations: [
          this.Sentry.extraErrorDataIntegration()
        ],
        normalizeDepth: 6
      })
    }
  }

  _log (level, objOrMsg, msg = '') {
    if (this.silenceLogs) return
    let obj = {}

    if (objOrMsg instanceof Error) {
      obj = { err: objOrMsg }
    } else if (isString(objOrMsg)) {
      msg = objOrMsg
    } else {
      obj = objOrMsg
    }

    const context = this.getContext ? this.getContext() : {}
    obj = sanitizeLogObject({
      ...cloneDeep(context),
      ...obj,
      ...this.labels
    })

    this.instance[level](obj, msg)

    if (this.Sentry && (level === 'error' || level === 'fatal')) {
      this._sentryCaptureException(level, obj, msg)
    }
  }

  _sentryCaptureException (level, obj, msg) {
    if (!this.Sentry) return

    try {
      const { err, ...extra } = obj
      let user
      if (typeof extra.user === 'object') {
        const { id, username } = extra.user
        user = { id, username }
        delete extra.user
      }
      if (err) {
        this.Sentry.captureException(err, { extra, level, user })
      } else {
        this.Sentry.captureMessage(msg || 'EMPTY ERROR RECEIVED', { extra, level, user })
      }
    } catch (captureErr) {
      this.Sentry.captureException(captureErr, {
        extra: { loggerHandlerError: true }
      })
    }
  }

  /**
   * @param {string | Context} msgOrContext Pass context object or the message
   * @param {string} [message] Ignored if first argument is string
   * @example
   * // with message
   * logger.debug('Debugging status')
   * @example
   * // context and message
   * logger.debug({ foo: 'bar', whatever: 'yes' }, 'Debugging status')
   */
  debug (msgOrContext, message) {
    this._log('debug', msgOrContext, message)
  }

  /**
   * @param {string | Context} msgOrContext Pass context object or the message
   * @param {string} [message] Ignored if first argument is string
   * @example
   * // with message
   * logger.info('Too many event listeners')
   * @example
   * // context and message
   * logger.info({ event: 'completed' }, 'Too many event listeners')
   */
  info (msgOrContext, message) {
    this._log('info', msgOrContext, message)
  }

  /**
   * @param {string | Context} msgOrContext Pass context object or the message
   * @param {string} [message] Ignored if first argument is string
   * @example
   * // with message
   * logger.warn('Too many event listeners')
   * @example
   * // context and message
   * logger.warn({ event: 'completed' }, 'Too many event listeners')
   */
  warn (msgOrContext, message) {
    this._log('warn', msgOrContext, message)
  }

  /**
   * @param {string | Context | Error} msgOrContextOrError Pass context obj with "err", the error itself, or a message
   * @param {string} [message] Ignored if first argument is string
   * @example
   * // with message
   * logger.error('No permission')
   * @example
   * // just error
   * logger.error(new Error('FORBIDDEN'))
   * @example
   * // error with context
   * logger.error({ err: new Error('FORBIDDEN'), userId: 1234 })
   * @example
   * // error with context and custom message
   * logger.error({ err: new Error('FORBIDDEN'), userId: 1234 }, 'No permission')
   * @example
   * // error and message
   * logger.error(new Error('FORBIDDEN'), 'No permission')
   */
  error (msgOrContextOrError, message) {
    this._log('error', msgOrContextOrError, message)
  }

  /**
   * @param {string | Context | Error} msgOrContextOrError Pass context obj with "err", the error itself, or a message
   * @param {string} [message] Ignored if first argument is string
   * @example
   * // with message
   * logger.fatal('Database is down')
   * @example
   * // just error
   * logger.fatal(new Error('FACILITY_DOWN'))
   * @example
   * // error with context
   * logger.fatal({ err: new Error('FACILITY_DOWN'), name: 'db-mysql' })
   * @example
   * // error with context and custom message
   * logger.fatal({ err: new Error('FACILITY_DOWN'), name: 'db-mysql' }, 'Database is down')
   * @example
   * // error and message
   * logger.fatal(new Error('FACILITY_DOWN'), 'Database is down')
   */
  fatal (msgOrContextOrError, message) {
    this._log('fatal', msgOrContextOrError, message)
  }
}

module.exports = { Logger }
