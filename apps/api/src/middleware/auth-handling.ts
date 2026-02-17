import type { ReqOptimised } from '#types/Request.js'
import type { NextFunction, Response } from 'express'

import config from '#config/index.js'
import { handleRefreshTokenExpiry } from '#routes/v1/auth/services.js'
import { getErrorMessage, UnAuthorized } from '#utils/errors.js'
import Jwt from 'jsonwebtoken'

interface TokenPayload {
  email: string
  id: string
  role: string
  username: string
}

export default async function authHandler(req: ReqOptimised, res: Response, next: NextFunction) {
  const accessToken = req.cookies.accessToken
  const refreshToken = req.cookies.refreshToken

  if (!accessToken || !refreshToken) {
    throw new UnAuthorized({ code: 'ERR_VALID', message: 'Not Authorized', statusCode: 401 })
  }

  try {
    const payload = Jwt.verify(accessToken, config.secret) as TokenPayload
    req.role = payload.role
    next()
  } catch (err: unknown) {
    if (getErrorMessage(err) === 'jwt expired') {
      const data = await handleRefreshTokenExpiry(refreshToken)

      if (!data) {
        throw new UnAuthorized({ code: 'ERR_VALID', message: 'Not Authorized', statusCode: 401 })
      }
      res.cookie('accessToken', data.accessToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000, // 1 hour (matches JWT expiry)
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
      })
      res.cookie('refreshToken', data.refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (matches JWT expiry)
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
      })
      const payload = Jwt.verify(data.accessToken, config.secret) as TokenPayload
      req.role = payload.role
      next()
    } else {
      throw new UnAuthorized({ code: 'ERR_VALID', message: getErrorMessage(err), statusCode: 401 })
    }
  }
}
