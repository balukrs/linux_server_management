const config = {
  adminpassword: process.env.ADMIN_SEED_PASSWORD ?? 'mySecurePassword',
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  debug: process.env.APP_DEBUG === 'true',
  LogLevel: process.env.LogLevel ?? 'info',
  port: process.env.PORT ?? '9001',
  scheduler: process.env.SCHEDULER === 'true',
  scheduler_interval: Number(process.env.SHEDULER_INTERVAL),
  secret: process.env.APP_SECRET ?? '',
  storagepaths: ['/', '/srv/storage'],
}

export default config
