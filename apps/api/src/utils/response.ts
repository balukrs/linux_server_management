import type { Response } from 'express'

export const sendSuccess = (res: Response, message: string, statusCode: number, data?: unknown) => {
  return res.status(statusCode).json({
    data: data ?? {},
    message,
    success: true,
  })
}
