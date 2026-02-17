import { type Request, type Response, Router } from 'express'

const Users: Router = Router()

Users.get('/health', (req: Request, res: Response) => {
  res.json({ message: 'Good', ok: true })
})

export default Users
