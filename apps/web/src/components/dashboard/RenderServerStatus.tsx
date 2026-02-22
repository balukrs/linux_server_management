import { Clock, Activity } from 'lucide-react'
import type { SummaryApiResponse } from '@linux-mgmt/shared'
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
}: {
  data: SummaryApiResponse | undefined
  isPending: boolean
}) => {
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
          <p className="text-sm">Up: {formatUptime(Number(data?.data.uptime?.value))}</p>
        </div>
        <div className="flex items-center gap-1">
          <Activity size={13} />{' '}
          <p className="text-sm">{`${Number(data?.data.cpu_temp?.value).toFixed(2)} ${data?.data.cpu_temp?.unit}`}</p>
        </div>
      </div>
    </>
  )
}

export default RenderServerStatus
