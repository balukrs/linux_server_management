import ChartAreaCard from '@/components/dashboard/ChartCard'
import { useQuery } from '@tanstack/react-query'
import { metrics } from '@/api/services/dashboard'
import { useState } from 'react'
import type { MetricsRequest } from '@linux-mgmt/shared'
import type { SystemMetric } from '@linux-mgmt/shared'
import { Skeleton } from '@/components/ui/skeleton'

const NetworkGraph = () => {
  const [params, setParams] = useState<MetricsRequest>({ type: 'network', period: '1h' })

  const { data, isPending } = useQuery({
    queryKey: ['dashboard-metrics-network', params.type, params.period],
    queryFn: () => metrics(params),
  })

  const reqReadings = data?.data?.data

  const uploadEntries = reqReadings?.filter((item) => item.type === 'UPLOAD')
  const downloadEntries = reqReadings?.filter((item) => item.type === 'DOWNLOAD')

  const upload = (uploadEntries?.length && uploadEntries[uploadEntries.length - 1]?.value) || 0
  const download =
    (downloadEntries?.length && downloadEntries[downloadEntries.length - 1]?.value) || 0

  const filteredData = (() => {
    if (!reqReadings) return []
    const byTimestamp = new Map<
      string,
      { upload?: number; download?: number; item: SystemMetric }
    >()
    for (const item of reqReadings) {
      const key = String(item.timestamp)
      if (!byTimestamp.has(key)) byTimestamp.set(key, { item })
      const entry = byTimestamp.get(key)!
      if (item.type === 'UPLOAD') entry.upload = item.value
      if (item.type === 'DOWNLOAD') entry.download = item.value
    }
    return Array.from(byTimestamp.values())
      .filter((e) => e.upload !== undefined && e.download !== undefined)
      .map((e) => ({
        ...e.item,
        type: 'NETWORK_USAGE',
        upload: e.upload,
        downlaod: e.download,
        unit: 'KB/s',
      }))
  })()

  console.log(filteredData, reqReadings)

  if (isPending) return <Skeleton className="h-auto md:h-[80%] w-full" />

  return (
    <ChartAreaCard<string, MetricsRequest, SystemMetric>
      config={{
        title: 'Network Traffic',
        info: `↓ ${Number(download).toFixed(3)} KB/s ↑ ${Number(upload).toFixed(3)} KB/s`,
        details: `${Number(download * 0.008).toFixed(3)} MB/s`,
        colors: ['var(--chart-3)', 'var(--chart-4)'],
        unit: 'KB/s',
        keys: ['upload', 'download'],
      }}
      period={params.period}
      setPeriod={setParams}
      data={[]}
    />
  )
}

export default NetworkGraph
