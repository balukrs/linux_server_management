import { Clock, Activity } from 'lucide-react'
import type { SummaryApiResponse, SystemMetric } from '@linux-mgmt/shared'
import { Skeleton } from '@/components/ui/skeleton'

function formatUptime(totalSeconds: number): string {
  if (!totalSeconds) return ''
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  return `${hours}h ${minutes}m`
}

const RenderServerStatus = ({
  data,
  isPending,
  eventData,
}: {
  data: SummaryApiResponse | undefined
  isPending: boolean
  eventData: SystemMetric[]
}) => {
  const updatedTemp = eventData.find((item) => item.type === 'CPU_TEMP')?.value || 0
  const updatedTime = eventData.find((item) => item.type === 'UPTIME')?.value || null

  if (isPending) return <Skeleton className="h-25 md:h-[80%] w-full" />
  return (
    <>
      <div className="mb-2">
        <h1 className="text-xl font-bold leading-none tracking-tight">Online</h1>
        <small>{data?.data.hostname || 'N/A'}</small>
      </div>
      <div className="flex gap-4 text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock size={13} />{' '}
          <p className="text-sm">
            Up: {formatUptime(Number(updatedTime || data?.data.uptime?.value))}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Activity size={13} />{' '}
          <p className="text-sm">{`${Number(updatedTemp || data?.data.cpu_temp?.value).toFixed(2)} ${data?.data.cpu_temp?.unit}`}</p>
        </div>
      </div>
    </>
  )
}

export default RenderServerStatus
