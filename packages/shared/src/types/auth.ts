export interface SignUpRequest {
  email: string
  password: string
  username: string
  code: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AccessCodeRequest {
  email: string
  expiresAt: string
}
