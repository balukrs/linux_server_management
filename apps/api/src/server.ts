import cors from 'cors'
import express, { type Express, type Request, type Response } from 'express'
import morgan from 'morgan'

export const createServer = (): Express => {
  const app = express()
  app
    .disable('x-powered-by')
    .use(morgan('dev'))
    .use(express.urlencoded({ extended: true }))
    .use(express.json())
    .use(cors())

  app.get('/health', (req: Request, res: Response) => {
    res.json({ message: 'Good', ok: true })
  })

  return app
}
