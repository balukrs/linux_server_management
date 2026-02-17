import { Router } from 'express'

import Dashboard from './dashboard'

const User: Router = Router()

User.use('/dashboard', Dashboard)

export default User
