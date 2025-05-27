const pino = require('pino')

/**
 * @typedef {string | { err: Error, [key:string]: any}} MsgOrObject
 * @typedef {(messageOrObj: MsgOrObject, message?:string) => void} LoggerFnParams
 */

/**
 * @typedef {Object} Logger
 * @property {LoggerFnParams} debug
 * @property {LoggerFnParams} info
 * @property {LoggerFnParams} warn
 * @property {(messageOrObj: MsgOrObject|Error, message:string} error
 * @property {LoggerFnParams} fatal
 */

/**
 * 
 * @param {Object} params
 * @param {Array} params.transports 
 * @returns {Logger}
 */
const getLogger = ({ transports }) => {
  const transport = pino.transport({ targets: transports })
  const logger = pino(transport)
  return logger
}

module.exports = getLogger
