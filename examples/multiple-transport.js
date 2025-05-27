
const { createServer } = require("node:http")
const { getLogger, sentryTransporter, consoleTransporter } = require("./index")

const logger = getLogger({
    transports: [
        consoleTransporter(),
        sentryTransporter({
            dsn: process.env.SENTRY_DSN,
            enableLogs: true
        })
    ]
})

const server = createServer((req, res) => {
    const { method, url } = req
    logger.info({ method, url }, `${method} ${url}`)
    logger.info('Just text')
    logger.warn('watch out')
    logger.error(new Error('WHY?'))
    logger.fatal(new Error('FATAL?'))
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
