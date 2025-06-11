/**
 * 
 * @param {{ level: string } & import("pino-pretty").PrettyOptions} options
 */
const consoleTransporter = ({ level, ...targetOptions } = {}) => {
    return {
        target: 'pino-pretty',
        level: level || 'info',
        options: {
            translateTime: 'yyyy-mm-dd HH:MM:ss.l',
            ...targetOptions
        },
    }
}

module.exports = { consoleTransporter }
