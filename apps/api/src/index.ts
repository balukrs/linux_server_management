import type { Request, Response } from 'express'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import type { HealthCheckResponse, ApiResponse } from '@linux-mgmt/shared'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.get('/health', (_req: Request, res: Response<HealthCheckResponse>) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/api', (_req: Request, res: Response<ApiResponse<{ message: string }>>) => {
  res.json({
    success: true,
    data: { message: 'Linux Machine Management API' },
    timestamp: new Date().toISOString(),
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
