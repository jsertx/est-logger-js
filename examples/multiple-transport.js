
const { createServer } = require("node:http")
const { getLogger, sentryTransporter, consoleTransporter } = require("../")
const { v4 } = require("uuid")

const logger = getLogger({
    transports: [
        consoleTransporter(),
        sentryTransporter({
            dsn: process.env.SENTRY_DSN,
            level: 'info',
            enableLogs: true
        })
    ]
})

const server = createServer((req, res) => {
    const { method, url } = req
    const userId =  v4()
    logger.info({ method, url }, `Request to ${method} ${url}`)
    logger.warn({ method, url, user: { id: userId } }, `Accessing forbidden place`)
    logger.info('Just text')
    logger.warn('watch out')
    logger.error(new Error('AN_ERROR'))
    logger.fatal(new Error('A_FATAL_ERROR'), 'something fatal happened')
    logger.fatal({ user: { id: userId }}, new Error('A_FATAL_ERROR'), 'something fatal happened')
    setTimeout(() => {
        new Promise((resolve, reject) => {
            reject(new Error('UNHANDLED'))
        })
    }, 500)
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.write('Hello World!')
    res.end()
})

process.on('unhandledRejection', (error) => {
    logger.fatal(error)
})

server.listen(3000, "127.0.0.1")
