import type { TokenPayload } from '#types/Auth.js'
import type { LoginRequest, SignUpRequest } from '@linux-mgmt/shared'
import type { Request, Response } from 'express'

import { CustomError, getErrorMessage, OperationFailed } from '#utils/errors.js'
import { sendSuccess } from '#utils/response.js'

import { getTokenDetails, loginUser, logoutUser, registerUser } from './services.js'

type RequestAdd = Request & { cookies: RequestCookieType }

interface RequestCookieType {
  accessToken?: string
  refreshToken?: string
}

export const signUp = async (req: Request<object, object, SignUpRequest>, res: Response) => {
  try {
    const { code, email, password, username } = req.body
    await registerUser(username, password, email, code)
    sendSuccess(res, 'User Registered', 201, {})
  } catch (error) {
    if (error instanceof CustomError) throw error
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

    const { accessToken, refreshToken } = await loginUser(email, password)

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
      sendSuccess(res, 'Login Successful', 201, {})
    }
  } catch (error) {
    if (error instanceof CustomError) throw error
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
    if (error instanceof CustomError) throw error
    throw new OperationFailed({
      code: 'ERR_FAILED',
      message: getErrorMessage(error),
      statusCode: 400,
    })
  }
}

export const getDetails = (req: RequestAdd, res: Response) => {
  const accessToken = req.cookies.accessToken
  try {
    const payload = getTokenDetails(String(accessToken)) as TokenPayload

    sendSuccess(res, 'Detailed Fetched Successfully', 200, {
      email: payload.email,
      id: payload.id,
      role: payload.role,
      username: payload.username,
    })
  } catch (error) {
    if (error instanceof CustomError) throw error
    throw new OperationFailed({
      code: 'ERR_FAILED',
      message: getErrorMessage(error),
      statusCode: 400,
    })
  }
}
