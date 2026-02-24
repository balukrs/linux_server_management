import { Progress } from '@/components/ui/progress'
import type { SummaryApiResponse, SystemMetric } from '@linux-mgmt/shared'

import { Skeleton } from '@/components/ui/skeleton'

const RenderDiskUsage = ({
  data,
  isPending,
  eventData,
}: {
  data: SummaryApiResponse | undefined
  isPending: boolean
  eventData: SystemMetric[]
}) => {
  const reqReadings = eventData.filter((item) => item.type.endsWith('_/'))

  const filteredStorage = (() => {
    if (!reqReadings) return []
    const byTimestamp = new Map<string, { used?: number; total?: number; item: SystemMetric }>()
    for (const item of reqReadings) {
      const key = String(item.timestamp)
      if (!byTimestamp.has(key)) byTimestamp.set(key, { item })
      const entry = byTimestamp.get(key)!
      if (item.type.includes('TOTAL')) entry.total = item.value
      if (item?.type.includes('USED')) entry.used = item.value
    }
    return Array.from(byTimestamp.values())
      .filter((e) => e.total !== undefined && e.used !== undefined)
      .map((e) => ({
        total: Number(Number(e.total).toFixed(2)),
        used: Number(Number(e.used).toFixed(2)),
      }))
  })()

  const currentStorage = data?.data.storage
    .filter((arr) => arr[0]?.type.endsWith('_/'))
    .flat()
    .reduce((acc, x) => {
      if (x?.type.includes('TOTAL')) {
        acc = { ...acc, total: Number(Number(x.value).toFixed(2)) }
      }

      if (x?.type.includes('USED')) {
        acc = { ...acc, used: Number(Number(x.value).toFixed(2)) }
      }

      return acc
    }, {}) as { total: number; used: number }

  const storage = filteredStorage?.[0] || currentStorage

  const percentage = (
    storage?.total && storage?.used ? (storage.used / storage.total) * 100 : 0
  ).toFixed(2)

  if (isPending) return <Skeleton className="h-25 md:h-[80%] w-full" />

  return (
    <>
      <div className="mb-4">
        <h1 className="text-xl font-bold leading-none tracking-tight">
          {storage?.used} GB / {storage?.total} GB
        </h1>
        <small>{percentage} % Used</small>
      </div>
      <Progress value={Number(percentage)} />
    </>
  )
}

export default RenderDiskUsage
