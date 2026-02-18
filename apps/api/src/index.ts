import config from '#config/index.js'
import { prisma } from '#lib/prisma.js'
import metricsCollector from '#modules/system/collector.js'

import { createServer } from './server.js'

const port = config.port

const app = createServer()

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`)

  // Scheduler
  const safeCollect = () => {
    metricsCollector().catch((err: unknown) => {
      console.error('[metrics] collection failed:', err)
    })
  }

  safeCollect()
  const intervalId = setInterval(safeCollect, 15_000)

  const shutdown = () => {
    clearInterval(intervalId)
    server.close(() => {
      prisma
        .$disconnect()
        .then(() => process.exit(0))
        .catch(() => process.exit(1))
    })
  }

  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
})
