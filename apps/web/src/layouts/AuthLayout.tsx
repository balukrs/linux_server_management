import { Outlet } from 'react-router'

const AuthLayout = () => {
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
