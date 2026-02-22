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
  color: string
}

interface props<T, U> {
  config: configprops
  period: T
  setPeriod: React.Dispatch<React.SetStateAction<U>>
}

const chartData = [
  { month: 'January', desktop: 186 },
  { month: 'February', desktop: 305 },
  { month: 'March', desktop: 237 },
  { month: 'April', desktop: 73 },
  { month: 'May', desktop: 209 },
  { month: 'June', desktop: 214 },
]

export default function ChartAreaCard<T, U>({ config, period, setPeriod }: props<T, U>) {
  const chartConfig = {
    desktop: {
      label: 'Desktop',
      color: config.color,
    },
  } satisfies ChartConfig

  return (
    <Card className="bg-background">
      <CardHeader>
        <div className="flex flex-col space-y-1">
          <h3 className="text-2xl font-semibold leading-none tracking-tight">{config.title}</h3>
          <p className="text-sm text-muted-foreground">{config.info}</p>
          <div className="text-2xl font-bold">{config.details}</div>
        </div>
        <Select
          value={String(period)}
          onValueChange={(val) => setPeriod((prev) => ({ ...prev, period: val }))}
        >
          <SelectTrigger className="w-32 rounded-lg sm:ml-auto sm:flex">
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
          <AreaChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <Area
              dataKey="desktop"
              type="natural"
              fill="var(--color-desktop)"
              fillOpacity={0.4}
              stroke="var(--color-desktop)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
