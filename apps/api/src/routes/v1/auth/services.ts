import type { User } from '@linux-mgmt/db'

import config from '#config/index.js'
import { prisma } from '#lib/prisma.js'
import { EntityNotFound, OperationFailed } from '#utils/errors.js'
import bcrypt from 'bcrypt'
import Jwt from 'jsonwebtoken'

export const findUserByEmail = async (email: string): Promise<null | User> => {
  return prisma.user.findUnique({
    where: {
      email,
    },
  })
}

export const findUserById = async (id: string): Promise<null | User> => {
  return prisma.user.findUnique({
    where: {
      id,
    },
  })
}

export const registerUser = async (username: string, password: string, email: string) => {
  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      username,
    },
  })
  return user
}

export const loginUser = async (email: string, password: string) => {
  const user = await findUserByEmail(email)

  if (!user) {
    throw new EntityNotFound({ code: 'ERR_NF', message: 'User not found', statusCode: 401 })
  }

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    throw new OperationFailed({
      code: 'ERR_FAILED',
      message: 'Invalid Password',
      statusCode: 400,
    })
  }

  const token = Jwt.sign(
    { email: user.email, id: user.id, username: user.username },
    config.secret,
    {
      expiresIn: '1h',
    },
  )
  return token
}
