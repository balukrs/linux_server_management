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

export interface MetricsRequest {
  type: Type
  period: Period
}
