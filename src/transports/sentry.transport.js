const { Writable } = require('stream')
const Sentry = require('@sentry/node')
const { PINO_LVL } = require('../misc')

const DEF_ERR_MSG = 'Undefined error'
/**
 * @param {Object} options
 * @param {string} options.dsn
 * @param {string} [options.environment] default to "local" to avoid poluting production
 * @param {string} [options.level]
 * @param {boolean} [options.enableLogs]
 */
const sentryTransporter = ({ level, dsn, environment, enableLogs}) => {
    return {
        target: require.resolve('./sentry.transport.js'),
        level: level || 'error',
        options: {
            environment: environment || "local",
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
                const { level: levelNum, msg, err, stack, ...extra } = JSON.parse(log)
                const level = PINO_LVL[levelNum]
                let user
                if(typeof extra?.user === 'object') {
                    const { id, username } = extra?.user
                    user = { id, username }
                    delete extra?.user
                }
                if (levelNum >= PINO_LVL.error) {
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
                }
                let logMethod = Sentry.logger[level] || Sentry.logger.info
                logMethod(msg, { err, ...extra })
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
