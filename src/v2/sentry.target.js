const { Writable } = require('stream')
const Sentry = require('@sentry/node')

const DEF_ERR_MSG = 'Undefined error'
/**
 * @param {Object} options
 * @param {string} options.dsn
 * @param {string} [options.environment] default to "local" to avoid poluting production
 * @param {string} [options.level]
 */
const sentryTarget = ({ level, dsn, environment }) => {
  return {
    target: require.resolve('./sentry.target.js'),
    level: level || 'error',
    options: {
      environment,
      dsn
    }
  }
}

const buildSentryTargetWorker = (opts) => {
  Sentry.init(opts)
  return new Writable({
    objectMode: true,
    write (log, enc, cb) {
      try {
        const { level, msg, err, stack, ...extra } = log

        let user
        if (typeof extra?.user === 'object') {
          const { id, username } = extra?.user
          user = { id, username }
          delete extra?.user
        }
        if (err && err.stack) {
          const error = new Error(err.message || msg || DEF_ERR_MSG)
          error.stack = err.stack
          Sentry.captureException(error, { extra, level, user })
        } else if (stack) {
          const error = new Error(msg || DEF_ERR_MSG)
          error.stack = stack
          Sentry.captureException(error, { extra, level, user })
        } else {
          Sentry.captureMessage(msg || DEF_ERR_MSG, { extra, level, user })
        }
        cb()
      } catch (err) {
        Sentry.captureException(new Error('ERROR CAPTURING EXCEPTION'))
        cb()
      }
    }
  })
}

// pino requires default export of the transporter
buildSentryTargetWorker.sentryTarget = sentryTarget
module.exports = buildSentryTargetWorker
