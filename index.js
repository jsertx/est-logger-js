const createLogger = require('./src/factory')
const { sentryTransporter } = require('./src/transports/sentry.transport')
const { consoleTransporter } = require('./src/transports/console.transport')
const { Logger } = require('./src/v2/logger')

module.exports = {
  v2: { Logger },
  createLogger,
  consoleTransporter,
  sentryTransporter
}
