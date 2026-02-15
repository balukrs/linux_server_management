import type { NextFunction, Request, Response } from 'express'

import config from '../config/index.js'
import { getErrorMessage } from '../utils/errors.js'
import { CustomError } from '../utils/errors.js'

export default function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (res.headersSent || config.debug) {
    next(error)
    return
  }

  if (error instanceof CustomError) {
    res
      .status(error.statusCode)
      .json({ error: { code: String(error.code), message: error.message } })
    return
  }

  res.status(500).json({
    error: {
      message: getErrorMessage(error) || 'An error occured',
    },
  })
}
