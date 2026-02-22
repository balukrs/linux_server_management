import type { ReqOptimised } from '#types/Request.js'
import type { NextFunction, Response } from 'express'

import { UnAuthorized } from '#utils/errors.js'
import { Role } from '@linux-mgmt/db'

export default function adminRouteHandler(req: ReqOptimised, _res: Response, next: NextFunction) {
  if (req.tokenPayload?.role !== Role.ADMIN) {
    throw new UnAuthorized({ code: 'ERR_VALID', message: 'Not Authorized', statusCode: 401 })
  }
  next()
}
