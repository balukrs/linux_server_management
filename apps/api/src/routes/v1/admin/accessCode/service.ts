import type { AccessCodeRequest } from '@linux-mgmt/shared'

import { prisma } from '#lib/prisma.js'
import { EntityExists } from '#utils/errors.js'
import { ValidationErrors } from '#utils/errors.js'
import { SignUpRequestKeys } from '@linux-mgmt/shared'
import crypto from 'crypto'

function generateSecure5DigitCode() {
  return crypto.randomInt(10000, 100000).toString()
}

export const findCode = async (code: string) => {
  const accesscode = await prisma.accessCode.findUnique({ where: { code } })
  return accesscode
}

export const modifyCode = async (code: string, email: string) => {
  const accesscode = await findCode(code)

  if (accesscode) {
    if (accesscode.email !== email) {
      throw new ValidationErrors<typeof SignUpRequestKeys>({
        code: 'ERR_FAILED',
        fields: { email: 'Invalid Email' },
        message: 'Invalid Email',
        statusCode: 400,
        validation: true,
      })
    }
    if (accesscode.expiresAt < new Date(Date.now())) {
      throw new ValidationErrors<typeof SignUpRequestKeys>({
        code: 'ERR_FAILED',
        fields: { code: 'Code Expired' },
        message: 'Code Expired',
        statusCode: 400,
        validation: true,
      })
    }
    if (accesscode.used) {
      throw new ValidationErrors<typeof SignUpRequestKeys>({
        code: 'ERR_FAILED',
        fields: { code: 'Code Expired' },
        message: 'Code Expired',
        statusCode: 400,
        validation: true,
      })
    }
    await prisma.accessCode.update({ data: { used: true }, where: { email } })
  } else
    throw new ValidationErrors<typeof SignUpRequestKeys>({
      code: 'ERR_FAILED',
      fields: { code: 'Code not Available' },
      message: 'Code not Available',
      statusCode: 400,
      validation: true,
    })
}

export const createAccessCode = async (obj: AccessCodeRequest) => {
  const code = generateSecure5DigitCode()

  const isCodeAvailable = await findCode(code)

  const isUserAvailable = await prisma.accessCode.findUnique({ where: { email: obj.email } })

  if (isUserAvailable) {
    throw new EntityExists({ code: 'ERR_EXISTS', message: 'User Already Exists', statusCode: 409 })
  }

  if (isCodeAvailable) {
    await createAccessCode(obj)
    return
  }

  await prisma.accessCode.create({
    data: {
      code,
      email: obj.email,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })
}
