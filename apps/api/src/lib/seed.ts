import { Role } from '#generated/prisma/client.js'
import { hashSync } from 'bcrypt'

import { prisma } from './prisma.js'

const saltRounds = 10
const password = 'mySecurePassword'

async function main() {
  const hash = hashSync(password, saltRounds)

  await prisma.user.upsert({
    create: {
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
