const pino = require('pino')

/**
 * @typedef {Object} Context
 * @property {Error} [err] error that you want to log
 * @property {Object} [user] pruse this variable to reference log to an especific user
 * @property {string} [user.id]
 * @property {string} [user.username]
 */

class Logger {
  /**
   * 
   * @param {pino.BaseLogger} instance 
   */
  constructor(instance) {
    this.instance = instance
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
    this.instance.debug(msgOrContext, message)
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
    this.instance.info(msgOrContext, message)
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
    this.instance.warn(msgOrContext, message)
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
    this.instance.error(msgOrContextOrError, message)
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
    this.instance.fatal(msgOrContextOrError, message)
  }
}


/**
 * 
 * @param {Object} params
 * @param {Array} params.transports 
 * @returns {Logger}
 */
const createLogger = ({ transports }) => {
  const transport = pino.transport({ targets: transports })
  const logger = pino(transport)
  return new Logger(logger)
}

module.exports = createLogger
