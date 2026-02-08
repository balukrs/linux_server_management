import { Server, HardDrive, Clock, Activity } from 'lucide-react'
import InfoCard from '@/components/dashboard/InfoCard'
import { Progress } from '@/components/ui/progress'

// Chart
import ChartAreaCard from '@/components/dashboard/ChartCard'

// Table
import StorageTable from '@/components/dashboard/StorageTable'

const RenderServerStatus = () => {
  return (
    <>
      <div className="mb-2">
        <h1 className="text-xl font-bold leading-none tracking-tight">Online</h1>
        <small>ununtu-server-01</small>
      </div>
      <div className="flex gap-4 text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock size={13} /> <p>Up: 14d 2h</p>
        </div>
        <div className="flex items-center gap-1">
          <Activity size={13} /> <p>0.45</p>
        </div>
      </div>
    </>
  )
}

const RenderDiskUsage = () => {
  return (
    <>
      <div className="mb-4">
        <h1 className="text-xl font-bold leading-none tracking-tight">350 GB / 500 GB</h1>
        <small>70 % Used</small>
      </div>
      <Progress value={33} />
    </>
  )
}

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
  return (
    <div className="grid grid-cols-12 gap-6 grid-rows-[150px_auto]">
      <div className="col-span-12 md:col-span-4">
        <InfoCard Icon={Server} RenderComponent={<RenderServerStatus />} title="Server Status" />
      </div>
      <div className="col-span-12 md:col-span-4">
        <InfoCard
          Icon={HardDrive}
          RenderComponent={<RenderDiskUsage />}
          title="Disk Usage (Root)"
        />
      </div>
      <div className="col-span-12 md:col-span-4">
        <InfoCard RenderComponent={<RenderQuickStats />} title="Quick Stats" />
      </div>

      <div className="col-span-12 md:col-span-4">
        <ChartAreaCard
          config={{
            title: 'CPU Usage',
            info: '4 Cores',
            details: '48%',
            color: 'var(--chart-1)',
          }}
        />
      </div>
      <div className="col-span-12 md:col-span-4">
        <ChartAreaCard
          config={{
            title: 'Memory Usage',
            info: '40% Used',
            details: '3.2 GB / 8 GB',
            color: 'var(--chart-2)',
          }}
        />
      </div>
      <div className="col-span-12 md:col-span-4">
        <ChartAreaCard
          config={{
            title: 'Network Traffic',
            info: '↓ 150 KB/s ↑ 20 KB/s',
            details: '150 KB/s',
            color: 'var(--chart-3)',
          }}
        />
      </div>
      <div className="col-span-12">
        <StorageTable />
      </div>
    </div>
  )
}

export default Dashboard
