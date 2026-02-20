import type { User } from '@linux-mgmt/db'

import config from '#config/index.js'
import { prisma } from '#lib/prisma.js'
import { ValidationErrors } from '#utils/errors.js'
import { LoginRequestKeys } from '@linux-mgmt/shared'
import bcrypt from 'bcrypt'
import Jwt from 'jsonwebtoken'

import { modifyCode } from '../services'

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

export const generateTokens = async (user: User, token?: string) => {
  const accessToken = Jwt.sign(
    { email: user.email, id: user.id, role: user.role, username: user.username },
    config.secret,
    {
      expiresIn: '1h',
    },
  )
  const refreshToken = Jwt.sign(
    { email: user.email, id: user.id, role: user.role, username: user.username },
    config.secret,
    {
      expiresIn: '7d',
    },
  )

  await prisma.refreshToken.upsert({
    create: {
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      token: refreshToken,
      userId: user.id,
    },
    update: {
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      token: refreshToken,
      userId: user.id,
    },
    where: { token: token ?? '' },
  })

  return { accessToken, refreshToken }
}

export const handleRefreshTokenExpiry = async (refreshtoken: string) => {
  const token = await prisma.refreshToken.findUnique({
    where: {
      token: refreshtoken,
    },
  })

  if (token) {
    const user = await findUserById(token.userId)

    if (user && token.expiresAt > new Date()) {
      const { accessToken, refreshToken } = await generateTokens(user, refreshtoken)
      return { accessToken, refreshToken }
    }
    return null
  }
}

export const registerUser = async (
  username: string,
  password: string,
  email: string,
  code: string,
): Promise<User> => {
  const existingUser = await findUserByEmail(email)

  if (existingUser) {
    throw new ValidationErrors<typeof LoginRequestKeys>({
      code: 'ERR_FAILED',
      fields: { email: 'User already registered' },
      message: 'User already registered',
      statusCode: 400,
      validation: true,
    })
  }

  await modifyCode(code, email)

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

export const loginUser = async (
  email: string,
  password: string,
): Promise<{
  accessToken: string
  refreshToken: string
  user: User
}> => {
  const user = await findUserByEmail(email)

  if (!user) {
    throw new ValidationErrors<typeof LoginRequestKeys>({
      code: 'ERR_NF',
      fields: { email: 'User not found' },
      message: 'User not found',
      statusCode: 400,
      validation: true,
    })
  }

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    throw new ValidationErrors<typeof LoginRequestKeys>({
      code: 'ERR_FAILED',
      fields: { password: 'Invalid Password' },
      message: 'Invalid Password',
      statusCode: 400,
      validation: true,
    })
  }

  const { accessToken, refreshToken } = await generateTokens(user)

  return { accessToken, refreshToken, user }
}

export const logoutUser = async (refreshToken: string) => {
  await prisma.refreshToken.delete({
    where: {
      token: refreshToken,
    },
  })
}

export const getTokenDetails = (token: string) => {
  const payload = Jwt.verify(token, config.secret)
  return payload
}
