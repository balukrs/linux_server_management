const config = {
  adminpassword: process.env.ADMIN_SEED_PASSWORD ?? 'mySecurePassword',
  debug: process.env.APP_DEBUG === 'true',
  LogLevel: process.env.LogLevel ?? 'info',
  port: process.env.PORT ?? '9001',
  scheduler_interval: Number(process.env.SHEDULER_INTERVAL),
  secret: process.env.APP_SECRET ?? '',
}

export default config
