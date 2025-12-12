'use strict'
const { isString, cloneDeep } = require('lodash')
const { default: pino } = require('pino')
const { sanitizeLogObject } = require('./utils')
const { sentryTarget } = require('./sentry.target')
/**
 * @typedef {Object} Context
 * @property {Error} [err] error that you log
 */

class Logger {
  /**
   * @param {object} params
   * @param {string} params.environment
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
      ...(params.labels || {})
    }

    this.instance = pino({
      formatters: {
        level: (label) => ({ level: label })
      }
    })
    this.sentryLogger = null
    if (params.sentryDsn) {
      const transport = pino.transport({
        targets: [
          sentryTarget({
            environment: params.environment,
            dsn: params.sentryDsn
          })
        ]
      })
      this.sentryLogger = pino(transport)
    }
  }

  _log (method, objOrMsg, ...args) {
    if (this.silenceLogs) return
    let obj = {}
    let msg = ''
    if (isString(objOrMsg)) { // all are strings
      msg = [objOrMsg, ...args].join(' ')
    } else {
      obj = objOrMsg
      msg = args.join(' ')
    }
    if (obj instanceof Error) {
      obj = { err: obj }
    }

    const context = this.getContext ? this.getContext() : {}
    obj = sanitizeLogObject({
      ...cloneDeep(context),
      ...obj,
      ...this.labels
    })

    return this.instance[method](obj, msg)
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
    this._log('info', msgOrContext, message)
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
    if (this.sentryLogger) {
      this.sentryLogger.error(msgOrContextOrError, message)
    }
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
    if (this.sentryLogger) {
      this.sentryLogger.error(msgOrContextOrError, message)
    }
  }
}

module.exports = { Logger }
