import type { AccessCodeRequest } from '@linux-mgmt/shared'
import type { Request, Response } from 'express'

import { getErrorMessage, OperationFailed } from '#utils/errors.js'
import { sendSuccess } from '#utils/response.js'

import { createAccessCode } from './service'

export const generateAccessCode = async (
  req: Request<object, object, AccessCodeRequest>,
  res: Response,
) => {
  try {
    await createAccessCode(req.body)
    sendSuccess(res, 'Access Code Created', 201, {})
  } catch (error) {
    throw new OperationFailed({
      code: 'ERR_FAILED',
      message: getErrorMessage(error),
      statusCode: 400,
    })
  }
}
