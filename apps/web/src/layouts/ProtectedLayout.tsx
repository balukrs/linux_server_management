import { Outlet } from 'react-router'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'

import { useQuery } from '@tanstack/react-query'
import { me } from '../api/services/auth'

import FullScreenLoader from '@/components/common/PageLoader'

const ProtectedLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(true)

  const { isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: me,
    staleTime: 1000 * 60 * 10,
  })

  if (isLoading) {
    return <FullScreenLoader />
  }

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
