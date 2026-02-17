import type { Request } from 'express'

export type ReqOptimised = Request & { cookies: RequestCookieType } & { role?: string }

interface RequestCookieType {
  accessToken?: string
  refreshToken?: string
}
