import type { ApiResponse } from './responses'

//  Signup Request
export interface SignUpRequest {
  email: string
  password: string
  username: string
  code: string
}

export type SignUpResponse = ApiResponse<null>

export const SignUpRequestKeys = {
  email: 'email',
  password: 'password',
  username: 'username',
  code: 'code',
} as const

// Login Request
export interface LoginRequest {
  email: string
  password: string
}
export const LoginRequestKeys = {
  email: 'email',
  password: 'password',
} as const

export interface AccessCodeRequest {
  email: string
  expiresAt: string
}

export type LoginResponse = ApiResponse<null>

// Me Response
export type MeResponse = ApiResponse<{
  email: string
  id: string
  role: string
  username: string
}>

// Logout Response
export type LogoutResponse = ApiResponse<null>
