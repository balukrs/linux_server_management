import { useMutation } from '@tanstack/react-query'
import { api } from '../axios'
import type { LoginRequest } from '@linux-mgmt/shared'

const login = async (credentials: LoginRequest) => {
  const { data } = await api.post('/auth/login', credentials)
  return data
}

export const useLogin = () => {
  return useMutation({
    mutationFn: login,
  })
}
