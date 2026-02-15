import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'

import type { PrismaClient as PrismaClientType } from '@linux-mgmt/db'
import { PrismaClient } from '@linux-mgmt/db'

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const prisma: PrismaClientType = new PrismaClient({ adapter })

export { prisma }
