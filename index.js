const getLogger = require("./src/factory")
const { sentryTransporter } = require('./src/sentry.transport')
const { consoleTransporter } = require('./src/console.transport')

module.exports = {
  getLogger,
  consoleTransporter,
  sentryTransporter
}
