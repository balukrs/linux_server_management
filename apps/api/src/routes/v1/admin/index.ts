import adminRouteHandler from '#middleware/admin-route-handling.js'
import { Router } from 'express'

import AccessCode from './accessCode'
import Users from './users'

const Admin: Router = Router()

Admin.get('/users', adminRouteHandler, Users)
Admin.post('/generatecode', adminRouteHandler, AccessCode)

export default Admin
