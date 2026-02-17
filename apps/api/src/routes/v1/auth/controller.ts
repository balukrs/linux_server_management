import type { LoginRequest, SignUpRequest } from '@linux-mgmt/shared'
import type { Request, Response } from 'express'

import { getErrorMessage, OperationFailed } from '#utils/errors.js'
import { sendSuccess } from '#utils/response.js'

import { loginUser, logoutUser, registerUser } from './services.js'

type RequestAdd = Request & { cookies: RequestCookieType }

interface RequestCookieType {
  accessToken?: string
  refreshToken?: string
}

export const signUp = async (req: Request<object, object, SignUpRequest>, res: Response) => {
  try {
    const { code, email, password, username } = req.body
    const user = await registerUser(username, password, email, code)
    sendSuccess(res, 'User Registered', 201, {
      email: user.email,
      role: user.role,
      username: user.username,
    })
  } catch (error) {
    throw new OperationFailed({
      code: 'ERR_FAILED',
      message: getErrorMessage(error),
      statusCode: 400,
    })
  }
}

export const login = async (req: Request<object, object, LoginRequest>, res: Response) => {
  try {
    const { email, password } = req.body

    const { accessToken, refreshToken, user } = await loginUser(email, password)

    if (accessToken) {
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000, // 1 hour (matches JWT expiry)
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
      })
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (matches JWT expiry)
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
      })
      sendSuccess(res, 'Login Successful', 201, {
        email: user.email,
        role: user.role,
        username: user.username,
      })
    }
  } catch (error) {
    throw new OperationFailed({
      code: 'ERR_FAILED',
      message: getErrorMessage(error),
      statusCode: 400,
    })
  }
}

export const logout = async (req: RequestAdd, res: Response) => {
  const refreshToken = req.cookies.refreshToken

  try {
    await logoutUser(String(refreshToken))
    res.clearCookie('refreshToken')
    res.clearCookie('accessToken')
    sendSuccess(res, 'Logout Successful', 200, {})
  } catch (error) {
    throw new OperationFailed({
      code: 'ERR_FAILED',
      message: getErrorMessage(error),
      statusCode: 400,
    })
  }
}
