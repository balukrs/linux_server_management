import { Router } from 'express'

import { metric, summary } from './dashboard/controller'

const User: Router = Router()

// Dashboard
User.get('/dashboard/summary', summary)
User.get('/dashboard/metrics', metric)

export default User
