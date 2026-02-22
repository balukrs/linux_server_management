import type { Request } from 'express'

import type { TokenPayload } from './Auth.js'

export type ReqOptimised = Request & { cookies: RequestCookieType } & {
  tokenPayload?: TokenPayload
}

interface RequestCookieType {
  accessToken?: string
  refreshToken?: string
}
