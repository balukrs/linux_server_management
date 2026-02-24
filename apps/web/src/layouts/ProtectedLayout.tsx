import { Outlet } from 'react-router'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'

import { useQuery } from '@tanstack/react-query'
import { me as me_api } from '../api/services/auth'
import { useEffect } from 'react'

import FullScreenLoader from '@/components/common/PageLoader'
import useSocketStore from '@/store/socket'
import { socket } from '@/socket/client'

const ProtectedLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(true)

  const updateConnection = useSocketStore((state) => state.updateConnection)

  const { isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: me_api,
    staleTime: 1000 * 60 * 10,
  })

  useEffect(() => {
    function onConnect() {
      updateConnection(true)
    }

    function onDisconnect() {
      updateConnection(false)
    }

    socket.connect()
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.disconnect()
    }
  }, [])

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
