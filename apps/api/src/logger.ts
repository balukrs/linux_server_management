import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

import config from './config'

const LogLevels = {
  debug: 4,
  error: 0,
  http: 3,
  info: 2,
  warning: 1,
}

const Logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.printf(({ level, LogMetadata, message, stack, timestamp }) => {
      return `${String(timestamp)} ${level} ${typeof LogMetadata === 'string' ? LogMetadata : ''} ${String(message)} ${typeof stack === 'string' ? stack : ''}`
    }),
  ),
  level: config.LogLevel,
  levels: LogLevels,
  transports: [new winston.transports.Console()],
})

const fileRotateTransport = new DailyRotateFile({
  datePattern: 'YYYY-MM-DD',
  filename: 'logs/application-%DATE%.log',
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.json(),
  ),
  maxFiles: '14d',
  maxSize: '20m',
  zippedArchive: true,
})

Logger.add(fileRotateTransport)

export default Logger

// Example use case -   Logger.child({ LogMetadata: `${id} - user id` }).debug('This is a test')
// Example use case -   Logger.debug('This is a test')
