import { Router } from 'express'

import { signUp } from './controller.js'

const AuthRoute: Router = Router()

AuthRoute.post('/signup', signUp)

export default AuthRoute
