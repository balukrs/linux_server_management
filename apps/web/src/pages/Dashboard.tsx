import { Server, HardDrive } from 'lucide-react'
import InfoCard from '@/components/dashboard/InfoCard'

import RenderServerStatus from '@/components/dashboard/RenderServerStatus'
import RenderDiskUsage from '@/components/dashboard/RenderDiskUsage'

import { useQuery } from '@tanstack/react-query'
import { summary as summary_api } from '@/api/services/dashboard'

// Chart
import CpuGraph from '@/components/dashboard/CpuGraph'
import MemoryGraph from '@/components/dashboard/MemoryGraph'
import NetworkGraph from '@/components/dashboard/NetworkChart'

// Table
import StorageTable from '@/components/dashboard/StorageTable'

// Socket
import { socket } from '@/socket/client'
import useSocketStore from '@/store/socket'
import type { SystemMetric } from '@linux-mgmt/shared'

import { useEffect, useState } from 'react'

const RenderQuickStats = () => {
  return (
    <>
      <div className="mb-4 mt-2">
        <div className="flex justify-between">
          <small className="text-muted-foreground">Processes</small>
          <small>142</small>
        </div>
        <div className="flex justify-between">
          <small className="text-muted-foreground">Services</small>
          <small>36</small>
        </div>
        <div className="flex justify-between">
          <small className="text-muted-foreground">Docker</small>
          <small>8</small>
        </div>
        <div className="flex justify-between">
          <small className="text-muted-foreground">Node JS</small>
          <small>3</small>
        </div>
      </div>
    </>
  )
}

const Dashboard = () => {
  const { data, isPending } = useQuery({ queryKey: ['dashboard-summary'], queryFn: summary_api })
  const [metricsEvents, setMetricsEvents] = useState<SystemMetric[]>([])

  const isConnected = useSocketStore((state) => state.isConnected)

  useEffect(() => {
    function onEvents(value: SystemMetric[]) {
      setMetricsEvents((prev) => [...value, ...prev].flat())
    }
    socket.on('metrics-update', onEvents)

    return () => {
      socket.off('metrics-update', onEvents)
    }
  }, [isConnected])

  return (
    <div className="grid grid-cols-12 gap-6 grid-rows-[150px_auto]">
      <div className="col-span-12 md:col-span-4">
        <InfoCard
          Icon={Server}
          RenderComponent={
            <RenderServerStatus data={data} isPending={isPending} eventData={metricsEvents} />
          }
          title="Server Status"
        />
      </div>
      <div className="col-span-12 md:col-span-4">
        <InfoCard
          Icon={HardDrive}
          RenderComponent={
            <RenderDiskUsage data={data} isPending={isPending} eventData={metricsEvents} />
          }
          title="Disk Usage (Root)"
        />
      </div>
      <div className="col-span-12 md:col-span-4">
        <InfoCard RenderComponent={<RenderQuickStats />} title="Quick Stats" />
      </div>

      <div className="col-span-12 md:col-span-4">
        <CpuGraph eventData={metricsEvents} />
      </div>
      <div className="col-span-12 md:col-span-4">
        <MemoryGraph eventData={metricsEvents} />
      </div>
      <div className="col-span-12 md:col-span-4">
        <NetworkGraph eventData={metricsEvents} />
      </div>
      <div className="col-span-12">
        <StorageTable data={data} isPending={isPending} />
      </div>
    </div>
  )
}

export default Dashboard
