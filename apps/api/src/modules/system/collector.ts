import { metricsEventBus } from '#lib/eventbus.js'
import { prisma } from '#lib/prisma.js'
import Logger from '#logger.js'
import { getErrorMessage } from '#utils/errors.js'

import {
  generateCpuMetricsPercentage,
  generateCpuTempMetrics,
  generateMemoryMetrics,
  generateNetworkRate,
  generateStogeInfo,
  generateUpTimeMetrics,
} from './metrics'

export async function pruneOldMetrics() {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  try {
    const { count } = await prisma.systemMetric.deleteMany({
      where: { timestamp: { lt: cutoff } },
    })
    if (count > 0) Logger.info(`[metrics] pruned ${String(count)} records older than 7 days`)
  } catch (error) {
    Logger.error(`[metrics] prune failed: ${getErrorMessage(error)}`)
  }
}

async function metricsCollector() {
  let cpudata = null
  let memorydata = null
  let networkdata = null
  let storagedata = null
  let tempdata = null
  let uptimedata = null

  interface ResultType {
    type: string
    unit: string
    value: number
  }

  const result: ResultType[] = []

  try {
    cpudata = await generateCpuMetricsPercentage()
  } catch (error) {
    if (error) {
      cpudata = null
    }
  }

  try {
    memorydata = await generateMemoryMetrics()
  } catch (error) {
    if (error) {
      memorydata = null
    }
  }

  try {
    networkdata = await generateNetworkRate()
  } catch (error) {
    if (error) {
      networkdata = null
    }
  }

  try {
    storagedata = await generateStogeInfo()
  } catch (error) {
    if (error) {
      storagedata = null
    }
  }

  try {
    tempdata = await generateCpuTempMetrics()
  } catch (error) {
    if (error) {
      tempdata = null
    }
  }
  try {
    uptimedata = await generateUpTimeMetrics()
  } catch (error) {
    if (error) {
      uptimedata = null
    }
  }

  if (cpudata) {
    result.push({ type: 'CPU', unit: cpudata.unit, value: cpudata.cpu_percent })
  }
  if (tempdata) {
    result.push({ type: 'CPU_TEMP', unit: tempdata.unit, value: tempdata.temp })
  }
  if (uptimedata) {
    result.push({ type: 'UPTIME', unit: uptimedata.unit, value: uptimedata.time })
  }
  if (memorydata) {
    result.push({ type: 'MEMORY_AVAILABLE', unit: memorydata.unit, value: memorydata.MemAvailable })
    result.push({ type: 'MEMORY_FREE', unit: memorydata.unit, value: memorydata.MemFree })
    result.push({ type: 'MEMORY_TOTAL', unit: memorydata.unit, value: memorydata.MemTotal })
  }
  if (networkdata) {
    result.push({ type: 'DOWNLOAD', unit: networkdata.unit, value: networkdata.download })
    result.push({ type: 'UPLOAD', unit: networkdata.unit, value: networkdata.upload })
  }
  if (storagedata?.length) {
    storagedata.forEach((storage) => {
      result.push({
        type: `DISK_AVAILABLE_${storage.path}`,
        unit: storage.unit,
        value: storage.available,
      })
      result.push({ type: `DISK_TOTAL_${storage.path}`, unit: storage.unit, value: storage.total })
      result.push({ type: `DISK_USED_${storage.path}`, unit: storage.unit, value: storage.used })
    })
  }

  if (result.length) {
    const collectedAt = new Date()
    try {
      await prisma.systemMetric.createMany({
        data: result.map((r) => ({ ...r, timestamp: collectedAt })),
      })
      metricsEventBus.emit('batch-collected', result)
    } catch (error) {
      Logger.error(getErrorMessage(error))
    }
  }
}

export default metricsCollector
