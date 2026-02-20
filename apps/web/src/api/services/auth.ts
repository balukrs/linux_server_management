import { api } from '../axios'
import type { LoginRequest } from '@linux-mgmt/shared'
import type { MeResponse, LoginResponse } from '@linux-mgmt/shared'

export const login = async (credentials: LoginRequest) => {
  const { data } = await api.post<LoginResponse>('/auth/login', credentials)
  return data
}

export const logout = async () => {
  const { data } = await api.post<LoginResponse>('/auth/logout')
  return data
}

export const me = async () => {
  const { data } = await api.get<MeResponse>('/auth/me')
  return data
}
