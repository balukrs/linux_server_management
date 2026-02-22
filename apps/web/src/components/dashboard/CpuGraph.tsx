import ChartAreaCard from '@/components/dashboard/ChartCard'
import { useQuery } from '@tanstack/react-query'
import { metrics } from '@/api/services/dashboard'
import { useState } from 'react'
import type { MetricsRequest } from '@linux-mgmt/shared'

const CpuGraph = () => {
  const [params, setParams] = useState<MetricsRequest>({ type: 'cpu', period: '1h' })

  const { data } = useQuery({
    queryKey: ['dashboard-metrics-cpu', params.type, params.period],
    queryFn: () => metrics(params),
  })

  const reqReadings = data?.data?.data

  const finalusage = reqReadings?.[0]?.value || 0

  return (
    <ChartAreaCard<string, MetricsRequest>
      config={{
        title: 'CPU Usage',
        info: '4 Cores',
        details: `${finalusage.toFixed(2)}%`,
        color: 'var(--chart-1)',
      }}
      period={params.period}
      setPeriod={setParams}
    />
  )
}

export default CpuGraph
