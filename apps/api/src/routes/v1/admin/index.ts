import adminRouteHandler from '#middleware/admin-route-handling.js'
import { Router } from 'express'

import { generateAccessCode } from './accessCode/controller'
import Users from './users'

const Admin: Router = Router()

Admin.get('/users', adminRouteHandler, Users)
Admin.post('/generatecode', adminRouteHandler, generateAccessCode)

export default Admin
