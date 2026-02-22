import type { SystemMetric } from '@linux-mgmt/db'
import type { ApiResponse } from './responses'

export const periodMap = {
  '1h': 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
}

export const typeMap = {
  cpu: ['CPU'],
  memory: ['MEMORY_AVAILABLE', 'MEMORY_TOTAL', 'MEMORY_FREE'],
  network: ['DOWNLOAD', 'UPLOAD'],
}

export type Type = keyof typeof typeMap
export type Period = keyof typeof periodMap

export interface SummaryResponse {
  cpu: SystemMetric | null
  cpu_temp: SystemMetric | null
  download: SystemMetric | null
  hostname: string
  mem_avaialble: SystemMetric | null
  mem_free: SystemMetric | null
  mem_total: SystemMetric | null
  storage: [SystemMetric | null, SystemMetric | null, SystemMetric | null][]
  upload: SystemMetric | null
  uptime: SystemMetric | null
}

export type SummaryApiResponse = ApiResponse<SummaryResponse>

export interface MetricsRequest {
  type: Type
  period: Period
}

export interface MetricsResponse {
  data: SystemMetric[]
  period: '1h' | '6h' | '24h' | '7d'
  type: 'cpu' | 'memory' | 'network'
}

export type MetricsApiResponse = ApiResponse<MetricsResponse>
