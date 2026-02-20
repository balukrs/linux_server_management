import { Outlet } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Navigate } from 'react-router'

const AuthLayout = () => {
  const queryClient = useQueryClient()
  const userData = queryClient.getQueryData(['me'])

  if (userData) return <Navigate to="/" replace />
  return (
    <div className="absolute inset-0 min-h-screen flex items-center justify-center bg-[url('@/styles/assets/auth-bg.png')] bg-cover bg-center bg-no-repeat">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative z-10">
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout
