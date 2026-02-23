import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { periodMap } from '@linux-mgmt/shared'

type configprops = {
  title: string
  info: string
  details: string
  colors: string[]
  unit: string
  keys: string[]
}

interface props<T, U, K> {
  config: configprops
  period: T
  setPeriod: React.Dispatch<React.SetStateAction<U>>
  data: K[]
}

const formatTick = (value: string, period: string) => {
  const date = new Date(value)
  switch (period) {
    case '1h':
    case '6h':
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    // → "14:30"
    case '24h':
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    // → "08:00"
    case '7d':
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    // → "Mon"
    default:
      return value
  }
}

const getTickInterval = (dataLength: number, period: string) => {
  const desiredTicks = period === '7d' ? 7 : 6
  return Math.max(0, Math.floor(dataLength / desiredTicks) - 1)
}

export default function ChartAreaCard<T, U, K>({
  config,
  period,
  setPeriod,
  data,
}: props<T, U, K>) {
  const chartConfig = Object.fromEntries(
    config.keys.map((key, i) => [key, { color: config.colors[i] }]),
  ) satisfies ChartConfig

  return (
    <Card className="bg-background">
      <CardHeader className="flex justify-between">
        <div className="flex flex-col space-y-1">
          <h3 className="text-2xl font-semibold leading-none tracking-tight">{config.title}</h3>
          <p className="text-sm text-muted-foreground">{config.info}</p>
          <div className="text-2xl font-bold">{config.details}</div>
        </div>
        <Select
          value={String(period)}
          onValueChange={(val) => setPeriod((prev) => ({ ...prev, period: val }))}
        >
          <SelectTrigger className="w-19 rounded-lg sm:ml-auto sm:flex justify-end">
            <SelectValue placeholder={String(period)} />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {Object.keys(periodMap).map((item) => {
              return (
                <SelectItem value={item} className="rounded-lg" key={item}>
                  {item}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={getTickInterval(data.length, period as string)}
              tickFormatter={(value) => formatTick(value, period as string)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  formatter={(value) => [`${Number(value).toFixed(2)} ${config.unit}`]}
                  labelFormatter={(value) =>
                    new Date(value).toLocaleString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  }
                />
              }
            />

            {config.keys.map((key) => (
              <Area
                key={key}
                dataKey={key}
                type="natural"
                fill={`var(--color-${key})`}
                fillOpacity={0.4}
                stroke={`var(--color-${key})`}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
