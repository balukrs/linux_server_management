import { Outlet } from 'react-router'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { useState } from 'react'

const ProtectedLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(true)
  return (
    <div className="h-screen flex">
      <Sidebar isOpen={isSidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex flex-col flex-1">
        <Header isOpen={isSidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default ProtectedLayout
