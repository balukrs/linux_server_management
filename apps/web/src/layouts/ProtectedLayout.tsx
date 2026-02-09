import { Outlet } from 'react-router'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'

const ProtectedLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(true)
  return (
    <div className="h-screen flex">
      <Sidebar isOpen={isSidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex flex-col flex-1">
        <Header isOpen={isSidebarOpen} setOpen={setSidebarOpen} />
        <ScrollArea className="flex-1 overflow-y-auto">
          <main className="p-6">
            <Outlet />
          </main>
        </ScrollArea>
      </div>
    </div>
  )
}

export default ProtectedLayout
