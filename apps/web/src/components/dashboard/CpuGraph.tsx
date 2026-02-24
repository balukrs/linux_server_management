import ChartAreaCard from '@/components/dashboard/ChartCard'
import { useQuery } from '@tanstack/react-query'
import { metrics } from '@/api/services/dashboard'
import { useState } from 'react'
import type { MetricsRequest } from '@linux-mgmt/shared'
import type { SystemMetric } from '@linux-mgmt/shared'
import { Skeleton } from '@/components/ui/skeleton'

const CpuGraph = ({ eventData }: { eventData: SystemMetric[] }) => {
  const [params, setParams] = useState<MetricsRequest>({ type: 'cpu', period: '1h' })

  const { data, isPending } = useQuery({
    queryKey: ['dashboard-metrics-cpu', params.type, params.period],
    queryFn: () => metrics(params),
  })

  const reqUpdatedReading = eventData?.filter((item) => item.type === 'CPU') || []

  const reqReadings = (data?.data?.data || []).concat(reqUpdatedReading.reverse())

  const finalusage = reqReadings?.[reqReadings.length - 1]?.value || 0

  if (isPending) return <Skeleton className="h-auto md:h-[80%] w-full" />

  return (
    <ChartAreaCard<string, MetricsRequest, SystemMetric>
      config={{
        title: 'CPU Usage',
        info: '4 Cores',
        details: `${finalusage.toFixed(2)}%`,
        colors: ['var(--chart-1)', 'var(--chart-4)'],
        unit: '%',
        keys: ['value'],
      }}
      period={params.period}
      setPeriod={setParams}
      data={reqReadings || []}
    />
  )
}

export default CpuGraph
