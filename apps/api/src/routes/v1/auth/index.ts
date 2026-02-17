import authHandler from '#middleware/auth-handling.js'
import { Router } from 'express'

import { getDetails, login, logout, signUp } from './controller.js'

const AuthRoute: Router = Router()

AuthRoute.post('/signup', signUp)
AuthRoute.post('/login', login)
AuthRoute.post('/logout', authHandler, logout)
AuthRoute.get('/me', authHandler, getDetails)

export default AuthRoute
