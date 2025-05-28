const createLogger = require("./src/factory")
const { sentryTransporter } = require('./src/transports/sentry.transport')
const { consoleTransporter } = require('./src/transports/console.transport')

module.exports = {
  createLogger,
  consoleTransporter,
  sentryTransporter
}
