import { Router } from 'express'

import { generateAccessCode } from './controller'

const AccessCode: Router = Router()

AccessCode.use(generateAccessCode)

export default AccessCode
