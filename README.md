# est-logger-js

Logging library built on top of [Pino](https://github.com/pinojs/pino) with support for multiple transports including console output and Sentry integration.

## Features

- Multiple transport support (Console and Sentry)
- Log levels: debug, info, warn, error, fatal
- Structured logging with context
- Error tracking with stack traces

## Installation

```bash
npm install git+https://github.com/estableio/est-logger-js.git
```

## Basic Usage

```js
const { createLogger, consoleTransporter } = require('est-logger-js');

const logger = createLogger({
    transports: [
        consoleTransporter()
    ]
});

logger.info('Hello World!');
logger.info({ user: { id: '123' } }, 'User logged in');
```

## Multiple Transports

You can use multiple transports simultaneously. Here's an example with both console and Sentry:

```js
const { createLogger, consoleTransporter, sentryTransporter } = require('est-logger-js');

const logger = createLogger({
    transports: [
        consoleTransporter(),
        sentryTransporter({
            dsn: process.env.SENTRY_DSN,
            level: 'info',
            enableLogs: true
        })
    ]
});
```

## API Reference

### createLogger(options)

Creates a new logger instance.

```js
const logger = createLogger({
    transports: [] // Array of transport configurations
});
```

### consoleTransporter
```js
consoleTransporter({
    level: 'info' // optional, default: 'info'
})
```

### sentryTransporter
```js
sentryTransporter({
    dsn: 'YOUR_SENTRY_DSN',
    environment: 'production', // optional, default: 'local'
    level: 'error', // optional, default: 'error'
    enableLogs: true // optional
})
```

## Examples
All methods `debug`, `info`, `warn`, `error`, `fatal` can be invoked the same way you will find below with examples for `info` and `error`.

```js
// with just message
logger.info('User logged in')
```

```js
// message with user context
logger.info({ userId: 1234 }, 'User logged in')
```

```js
// message with error and user context
logger.error({ err: new Error('INVALID_CREDENTIALS'), userId: 1234 }, 'User credentials are invalid')
```

```js
// log error directly
logger.error(new Error('SOMETHING_BAD_HAPPENED'))
```

```js
// log error directly with message
logger.error(new Error('SOMETHING_BAD_HAPPENED'), 'Error updating row')
```

### Run example
See the [examples](./examples) directory for more usage examples.
