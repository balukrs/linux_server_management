import { type Request, type Response, Router } from 'express'

const Dashboard: Router = Router()

Dashboard.get('/health', (req: Request, res: Response) => {
  res.json({ message: 'Good', ok: true })
})

export default Dashboard
