import { api } from '../axios'
import type { SummaryApiResponse, MetricsApiResponse, MetricsRequest } from '@linux-mgmt/shared'

export const summary = async () => {
  const { data } = await api.get<SummaryApiResponse>('/user/dashboard/summary')
  return data
}

export const metrics = async (params: MetricsRequest) => {
  const { data } = await api.get<MetricsApiResponse>('/user/dashboard/metrics', {
    params,
  })
  return data
}
