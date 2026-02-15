import { Router } from 'express'

import AuthRoute from './auth/index.js'

const v1: Router = Router()

v1.use(AuthRoute)

export default v1
