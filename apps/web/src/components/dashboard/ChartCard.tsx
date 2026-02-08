import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

type configprops = {
  title: string
  info: string
  details: string
  color: string
}

type props = {
  config: configprops
}

const chartData = [
  { month: 'January', desktop: 186 },
  { month: 'February', desktop: 305 },
  { month: 'March', desktop: 237 },
  { month: 'April', desktop: 73 },
  { month: 'May', desktop: 209 },
  { month: 'June', desktop: 214 },
]

export default function ChartAreaCard({ config }: props) {
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
