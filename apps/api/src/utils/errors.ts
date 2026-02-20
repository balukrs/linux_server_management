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

export class EntityExists extends CustomError<ErrorCode> {}
export class EntityNotFound extends CustomError<ErrorCode> {}
export class OperationFailed extends CustomError<ErrorCode> {}
export class UnAuthorized extends CustomError<ErrorCode> {}

export class ValidationErrors<T> extends CustomError<ErrorCode> {
  fields: object
  validation: boolean
  constructor({
    code,
    fields,
    message,
    statusCode,
    validation,
  }: {
    code: ErrorCode
    fields: Partial<Record<keyof T, string>>
    message: string
    statusCode: number
    validation: boolean
  }) {
    super({ code, message, statusCode })
    this.code = code
    this.statusCode = statusCode
    this.message = message
    this.validation = validation
    this.fields = fields
  }
}

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
