const getLogger = require("./src/factory")
const { sentryTransporter } = require('./src/transports/sentry.transport')
const { consoleTransporter } = require('./src/transports/console.transport')

module.exports = {
  getLogger,
  consoleTransporter,
  sentryTransporter
}
