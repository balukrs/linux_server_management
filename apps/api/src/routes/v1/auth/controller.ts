import type { SignUpRequest } from '@linux-mgmt/shared'
import type { Request, Response } from 'express'

import { getErrorMessage, OperationFailed } from '#utils/errors.js'
import { sendSuccess } from '#utils/response.js'

import { findUserByEmail, registerUser } from './services.js'

export const signUp = async (req: Request<object, object, SignUpRequest>, res: Response) => {
  try {
    const { email, password, username } = req.body

    const existingUser = await findUserByEmail(email)

    if (existingUser) {
      throw new OperationFailed({
        code: 'ERR_FAILED',
        message: 'User already registered',
        statusCode: 400,
      })
    }

    const user = await registerUser(username, password, email)
    sendSuccess(res, 'User Registered', 201, { email: user.email, username: user.username })
  } catch (error) {
    throw new OperationFailed({
      code: 'ERR_FAILED',
      message: getErrorMessage(error),
      statusCode: 400,
    })
  }
}
