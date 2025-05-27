const { Writable } = require('stream')
const Sentry = require('@sentry/node')
const { PINO_LVL } = require('./misc')

/**
 * @param {Object} options
 * @param {string} options.dsn
 * @param {string} [options.environment]
 * @param {string} [options.level]
 * @param {boolean} [options.enableLogs]
 * @returns 
 */
const sentryTransporter = ({ level, dsn, environment, enableLogs}) => {
    return {
        target: require.resolve('./sentry.transport.js'),
        level: level || 'error',
        options: {
            environment,
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
                const { level: pinoLevel, msg, err, stack, ...extra } = JSON.parse(log)
                if (pinoLevel >= PINO_LVL.error) {
                    const level = PINO_LVL[pinoLevel]
                    if (err && err.stack) {
                        const error = new Error(err.message || msg || 'Captured error')
                        error.stack = err.stack
                        Sentry.captureException(error, { extra, level: level })
                    } else if (stack) {
                        const error = new Error(msg || 'Captured error')
                        error.stack = stack
                        Sentry.captureException(error, { extra, level: level })
                    } else {
                        Sentry.captureMessage(msg || 'Error', 'error')
                    }
                }
                const logMethod = PINO_LVL[pinoLevel]
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
