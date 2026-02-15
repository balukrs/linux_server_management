import { ErrorCodes } from '#config/errorcodes.ts'

type ErrorCode = (typeof ErrorCodes)[number]
// NF - Not found error & VALID - Validation error
