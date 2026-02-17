import authHandler from '#middleware/auth-handling.js'
import { Router } from 'express'

import { login, logout, signUp } from './controller.js'

const AuthRoute: Router = Router()

AuthRoute.post('/signup', signUp)
AuthRoute.post('/login', login)
AuthRoute.post('/logout', authHandler, logout)

export default AuthRoute
