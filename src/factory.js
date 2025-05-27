const pino = require('pino')

const getLogger = ({ transports }) => {
  const transport = pino.transport({ targets: transports })
  const logger = pino(transport)
  return logger
}

module.exports = getLogger
