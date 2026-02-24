import ChartAreaCard from '@/components/dashboard/ChartCard'
import { useQuery } from '@tanstack/react-query'
import { metrics } from '@/api/services/dashboard'
import { useState } from 'react'
import type { MetricsRequest } from '@linux-mgmt/shared'
import type { SystemMetric } from '@linux-mgmt/shared'
import { Skeleton } from '@/components/ui/skeleton'

const MemoryGraph = ({ eventData }: { eventData: SystemMetric[] }) => {
  const [params, setParams] = useState<MetricsRequest>({ type: 'memory', period: '1h' })

  const { data, isPending } = useQuery({
    queryKey: ['dashboard-metrics-memory', params.type, params.period],
    queryFn: () => metrics(params),
  })

  const reqUpdatedReading =
    eventData?.filter((item) => item.type === 'MEMORY_AVAILABLE' || item.type === 'MEMORY_TOTAL') ||
    []

  const reqReadings = (data?.data?.data || []).concat(reqUpdatedReading.reverse())

  const availableEntries = reqReadings?.filter((i) => i.type === 'MEMORY_AVAILABLE') ?? []
  const totalEntries = reqReadings?.filter((i) => i.type === 'MEMORY_TOTAL') ?? []
  const available = availableEntries[availableEntries.length - 1]?.value ?? 0
  const total = totalEntries[totalEntries.length - 1]?.value ?? 0

  // Pair MEMORY_AVAILABLE and MEMORY_TOTAL by timestamp, compute usage %
  const filteredData = (() => {
    if (!reqReadings) return []
    const byTimestamp = new Map<
      string,
      { available?: number; total?: number; item: SystemMetric }
    >()
    for (const item of reqReadings) {
      const key = String(item.timestamp)
      if (!byTimestamp.has(key)) byTimestamp.set(key, { item })
      const entry = byTimestamp.get(key)!
      if (item.type === 'MEMORY_AVAILABLE') entry.available = item.value
      if (item.type === 'MEMORY_TOTAL') entry.total = item.value
    }
    return Array.from(byTimestamp.values())
      .filter((e) => e.available !== undefined && e.total !== undefined)
      .map((e) => ({
        ...e.item,
        type: 'MEMORY_USAGE',
        value: ((e.total! - e.available!) / e.total!) * 100,
        unit: '%',
      }))
  })()

  const latestUsage = filteredData[filteredData.length - 1]?.value ?? 0

  if (isPending) return <Skeleton className="h-auto md:h-[80%] w-full" />

  return (
    <ChartAreaCard<string, MetricsRequest, SystemMetric>
      config={{
        title: 'Memory Usage',
        info: `${latestUsage.toFixed(3)}% Used`,
        details: `${Number((total - available) / 1024).toFixed(2)} GB / ${Number(total / 1024).toFixed(2)} GB`,
        colors: ['var(--chart-2)', 'var(--chart-4)'],
        unit: '%',
        keys: ['value'],
      }}
      period={params.period}
      setPeriod={setParams}
      data={filteredData}
    />
  )
}

export default MemoryGraph
