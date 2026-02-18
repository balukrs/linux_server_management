import { prisma } from '#lib/prisma.js'

import {
  generateCpuMetricsPercentage,
  generateMemoryMetrics,
  generateNetworkRate,
  generateStogeInfo,
} from './metrics'

async function metricsCollector() {
  let cpudata = null
  let memorydata = null
  let networkdata = null
  let storagedata = null

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

  if (cpudata) {
    result.push({ type: 'CPU', unit: cpudata.unit, value: cpudata.cpu_percent })
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
    await prisma.systemMetric.createMany({ data: result })
  }
}

export default metricsCollector
