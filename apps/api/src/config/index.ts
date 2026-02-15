const config = {
  adminpassword: process.env.ADMIN_SEED_PASSWORD ?? 'mySecurePassword',
  debug: process.env.APP_DEBUG === 'true',
  port: process.env.PORT ?? '9001',
  secret: process.env.APP_SECRET ?? '',
}

export default config
