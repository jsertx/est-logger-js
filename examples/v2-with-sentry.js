
const { default: axios } = require('axios')
const { v2 } = require('../index')
const { random } = require('lodash')

const logger = new v2.Logger({
  environment: 'sergio-local',
  version: '1.0.23',
  labels: {
    app: 'example'
  },
  sentryDsn: process.env.SENTRY_DSN
})

// logger.error(new Error('ONLY_ERROR'))

// logger.error({ err: new Error('ERR_IN_ERR_PATH') })

axios.post('https://testing-sergio.com?token=shouldberedacted', {}, { headers: { Authorization: 'should be redacted' } })
  .catch(err => logger.error({ err, user: { id: random(10) + 1 } }))
// logger.error({ err: new Error('ERR_IN_ERR_PATH'), trace_id: '1234' })
