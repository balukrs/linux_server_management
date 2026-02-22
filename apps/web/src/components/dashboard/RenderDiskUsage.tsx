import { Progress } from '@/components/ui/progress'
import type { SummaryApiResponse } from '@linux-mgmt/shared'

import { Skeleton } from '@/components/ui/skeleton'

const RenderDiskUsage = ({
  data,
  isPending,
}: {
  data: SummaryApiResponse | undefined
  isPending: boolean
}) => {
  const storage = data?.data.storage
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
