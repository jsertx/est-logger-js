const { Writable } = require('stream')
const Sentry = require('@sentry/node')
const { PINO_LVL } = require('./misc')

/**
 * @param {Object} options
 * @param {string} options.dsn
 * @param {string} [options.level]
 * @param {boolean} [options.enableLogs]
 * @returns 
 */
const sentryTransporter = ({ level, dsn, enableLogs}) => {
    return {
        target: require.resolve('./sentry.transport.js'),
        level: level || 'error',
        options: {
            dsn,
            _experiments: { enableLogs }
        }
    }
}

const buildSentryTransporter = (opts) => {
    Sentry.init(opts)
    return new Writable({
        objectMode: true,
        write(log, enc, cb) {
            try {
                const { level, msg, err, stack, ...extra } = JSON.parse(log)
                if (level >= PINO_LVL.warn) {
                    if (err && err.stack) {
                        const error = new Error(err.message || msg || 'Captured error')
                        error.stack = err.stack
                        Sentry.captureException(error, { extra })
                    } else if (stack) {
                        const error = new Error(msg || 'Captured error')
                        error.stack = stack
                        Sentry.captureException(error, { extra })
                    } else {
                        Sentry.captureMessage(msg || 'Error', 'error')
                    }
                }
                const logMethod = PINO_LVL[level]
                if(logMethod) {
                    Sentry.logger[logMethod](msg, { err, ...extra })
                }
                cb()
            } catch (e) {
                console.error(e)
                cb()
            }
        },
    })
}


buildSentryTransporter.sentryTransporter = sentryTransporter
module.exports = buildSentryTransporter
