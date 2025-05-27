/**
 * 
 * @param {Object} options
 * @param {string} [options.level] default info
 * @returns 
 */
const consoleTransporter = ({ level } = {}) => {
    return {
        target: 'pino-pretty',
        level: level || 'info',
        options: {},
    }
}

module.exports = { consoleTransporter }
