// Type
import type { MetricsResponse, SummaryResponse } from '@linux-mgmt/shared'

import config from '#config/index.js'
import { prisma } from '#lib/prisma.js'
import { OperationFailed } from '#utils/errors.js'
import { type Period, periodMap, type Type, typeMap } from '@linux-mgmt/shared'
import os from 'os'

const getLatestMetrics = async (value: string) => {
  return await prisma.systemMetric.findFirst({
    orderBy: {
      timestamp: 'desc',
    },
    where: {
      type: value,
    },
  })
}

export const getSummary = async (): Promise<SummaryResponse> => {
  const [cpu, cpu_temp, uptime, mem_avaialble, mem_total, mem_free, download, upload] =
    await Promise.all([
      getLatestMetrics('CPU'),
      getLatestMetrics('CPU_TEMP'),
      getLatestMetrics('UPTIME'),
      getLatestMetrics('MEMORY_AVAILABLE'),
      getLatestMetrics('MEMORY_TOTAL'),
      getLatestMetrics('MEMORY_FREE'),
      getLatestMetrics('DOWNLOAD'),
      getLatestMetrics('UPLOAD'),
    ])

  const storage = await Promise.all(
    config.storagepaths.map((path) =>
      Promise.all([
        getLatestMetrics(`DISK_AVAILABLE_${path}`),
        getLatestMetrics(`DISK_TOTAL_${path}`),
        getLatestMetrics(`DISK_USED_${path}`),
      ]),
    ),
  )

  const hostname = os.hostname()

  return {
    cpu,
    cpu_temp,
    download,
    hostname,
    mem_avaialble,
    mem_free,
    mem_total,
    storage,
    upload,
    uptime,
  }
}

export const getMetric = async (
  period: Period | undefined,
  type: Type | undefined,
): Promise<MetricsResponse> => {
  if (!period) {
    throw new OperationFailed({
      code: 'ERR_FAILED',
      message: 'Bad Request:Period Required',
      statusCode: 400,
    })
  }
  if (!type) {
    throw new OperationFailed({
      code: 'ERR_FAILED',
      message: 'Bad Request:Type Required',
      statusCode: 400,
    })
  }

  const TARGET_POINTS = 200

  const since = new Date(Date.now() - periodMap[period])

  const data = await prisma.systemMetric.findMany({
    orderBy: {
      timestamp: 'asc',
    },

    where: {
      timestamp: { gte: since },
      type: { in: typeMap[type] },
    },
  })

  const grouped = new Map<string, typeof data>()
  for (const row of data) {
    const arr = grouped.get(row.type) ?? []
    arr.push(row)
    grouped.set(row.type, arr)
  }

  const sampled = Array.from(grouped.values())
    .flatMap((group) =>
      group.length <= TARGET_POINTS
        ? group
        : group.filter((_, i) => i % Math.ceil(group.length / TARGET_POINTS) === 0),
    )
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

  return {
    data: sampled,
    period: period,
    type: type,
  }
}
