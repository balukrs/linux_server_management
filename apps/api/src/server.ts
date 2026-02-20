import config from '#config/index.js'
import errorHandler from '#middleware/error-handling.js'
import morganMiddleware from '#middleware/morgan-middleware.js'
import v1 from '#routes/v1/index.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { type Express, type Request, type Response } from 'express'

export const createServer = (): Express => {
  const app = express()
  app
    .disable('x-powered-by')
    .disable('etag')
    .use(morganMiddleware)
    .use(express.urlencoded({ extended: true }))
    .use(express.json())
    .use(cors({ credentials: true, origin: config.clientUrl }))
    .use(cookieParser())

  app.get('/health', (req: Request, res: Response) => {
    res.json({ message: 'Good', ok: true })
  })

  // Artificial delay for testing (remove before production)
  app.use((_req, _res, next) => setTimeout(next, 500))

  // Routes
  app.use('/api/v1', v1)

  // Error Handling
  app.use(errorHandler)

  return app
}
