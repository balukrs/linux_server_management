import type { MetricsRequest } from '@linux-mgmt/shared'
import type { Request, Response } from 'express'

import { getErrorMessage, OperationFailed } from '#utils/errors.js'
import { sendSuccess } from '#utils/response.js'

import { getMetric, getSummary } from './service'

export const summary = async (req: Request, res: Response) => {
  try {
    const data = await getSummary()
    sendSuccess(res, 'Dashboard Summary', 200, data)
  } catch (error) {
    throw new OperationFailed({
      code: 'ERR_FAILED',
      message: getErrorMessage(error),
      statusCode: 400,
    })
  }
}

export const metric = async (
  req: Request<object, object, object, MetricsRequest>,
  res: Response,
) => {
  try {
    const { period, type } = req.query
    const data = await getMetric(period, type)
    sendSuccess(res, 'Dashboard Summary', 200, data)
  } catch (error) {
    throw new OperationFailed({
      code: 'ERR_FAILED',
      message: getErrorMessage(error),
      statusCode: 400,
    })
  }
}
