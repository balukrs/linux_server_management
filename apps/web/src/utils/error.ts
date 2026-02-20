import { isAxiosError } from 'axios'

export function extractErrorMessage(error: unknown) {
  let message = 'An error occurred'
  let fields = []
  let validation = false
  if (isAxiosError(error)) {
    message = error.response?.data.error.message
    fields = error.response?.data.error.fields
    validation = error.response?.data.error.validation
  }
  if (error && typeof error === 'object' && 'message' in error) {
    message = String(error.message)
  }
  if (typeof error === 'string') {
    message = error
  }
  return { message, fields, validation }
}
