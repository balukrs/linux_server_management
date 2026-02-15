import type { ErrorCode } from './type.js'

export class CustomError<C> extends Error {
  code: C
  message: string
  statusCode: number
  constructor({ code, message, statusCode }: { code: C; message: string; statusCode: number }) {
    super()
    this.code = code
    this.statusCode = statusCode
    this.message = message
  }
}

export class EntityNotFound extends CustomError<ErrorCode> {}
export class OperationFailed extends CustomError<ErrorCode> {}

// General Error
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An error occurred'
}
