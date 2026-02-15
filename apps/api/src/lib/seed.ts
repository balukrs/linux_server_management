import config from '#config/index.js'
import { Role } from '@linux-mgmt/db'
import { hashSync } from 'bcrypt'

import { prisma } from './prisma.js'

const saltRounds = 10
const password = config.adminpassword

async function main() {
  const hash = hashSync(password, saltRounds)

  await prisma.user.upsert({
    create: {
      email: 'baluk05@gmail.com',
      password: hash,
      role: Role.ADMIN,
      username: 'admin',
    },
    update: {},
    where: { username: 'admin' },
  })
}

main()
  .catch((e: unknown) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
