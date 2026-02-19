import axios from 'axios'

export const api = axios.create({
  baseURL: `/api/v1/${import.meta.env.VITE_API_URL}`,
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login'
    }

    return Promise.reject(error)
  },
)
