// Shared types and utilities between frontend and backend

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

export interface HealthCheckResponse {
  status: 'ok' | 'error'
  timestamp: string
}

// Add more shared types here as your project grows
