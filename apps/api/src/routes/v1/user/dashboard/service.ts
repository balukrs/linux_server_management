import config from '#config/index.js'
import { prisma } from '#lib/prisma.js'
import { OperationFailed } from '#utils/errors.js'
import { type Period, periodMap, type Type, typeMap } from '@linux-mgmt/shared'

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

export const getSummary = async () => {
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

  return { cpu, cpu_temp, download, mem_avaialble, mem_free, mem_total, storage, upload, uptime }
}

export const getMetric = async (period: Period | undefined, type: Type | undefined) => {
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

  const since = new Date(Date.now() - periodMap[period])

  const data = await prisma.systemMetric.findMany({
    where: {
      timestamp: { gte: since },
      type: { in: typeMap[type] },
    },
  })

  return {
    data,
    period: period,
    type: type,
  }
}
