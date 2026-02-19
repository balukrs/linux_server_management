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
    .use(morganMiddleware)
    .use(express.urlencoded({ extended: true }))
    .use(express.json())
    .use(cors())
    .use(cookieParser())

  app.get('/health', (req: Request, res: Response) => {
    res.json({ message: 'Good', ok: true })
  })

  // Routes
  app.use('/api/v1', v1)

  // Error Handling
  app.use(errorHandler)

  return app
}
