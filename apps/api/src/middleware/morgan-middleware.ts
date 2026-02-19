import Logger from '#logger.js'
import morgan from 'morgan'

const morganMiddleware = morgan(':method :url :status :res[content-length] - :response-time ms', {
  stream: {
    write: (message) => Logger.http(message.trim()),
  },
})

export default morganMiddleware
