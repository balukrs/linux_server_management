import authHandler from '#middleware/auth-handling.js'
import { Router } from 'express'

import AdminRoute from './admin/index.js'
import AuthRoute from './auth/index.js'
import UserRoute from './user/index.js'

const v1: Router = Router()

v1.use('/auth', AuthRoute)
v1.use('/user', authHandler, UserRoute)
v1.use('/admin', authHandler, AdminRoute)

export default v1
