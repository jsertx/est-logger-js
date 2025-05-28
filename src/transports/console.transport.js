/**
 * 
 * @param {Object} options
 * @param {string} [options.level] default info
 */
const consoleTransporter = ({ level } = {}) => {
    return {
        target: 'pino-pretty',
        level: level || 'info',
        options: {},
    }
}

module.exports = { consoleTransporter }
