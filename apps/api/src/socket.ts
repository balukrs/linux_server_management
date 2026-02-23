import type { TokenPayload } from '#types/Auth.js'
import type { Server as HttpServer } from 'http'

import { metricsEventBus } from '#lib/eventbus.js'
import { parse } from 'cookie'
import Jwt from 'jsonwebtoken'
import { type DefaultEventsMap, Server } from 'socket.io'

import config from './config'

interface SocketData {
  user: TokenPayload
}

export function initSocket(httpServer: HttpServer) {
  const io = new Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>(
    httpServer,
    {
      cors: { credentials: true, origin: config.clientUrl },
    },
  )

  io.use((socket, next) => {
    const cookies = parse(socket.handshake.headers.cookie ?? '')
    const token = cookies.accessToken
    if (!token) {
      next(new Error('UNAUTHORIZED'))
      return
    }

    try {
      const payload = Jwt.verify(token, config.secret) as TokenPayload
      socket.data.user = payload // attach user to socket for later use
      next()
    } catch {
      next(new Error('UNAUTHORIZED'))
    }
  })

  metricsEventBus.on('batch-collected', (metrics) => {
    io.emit('metrics-update', metrics)
  })

  return io
}
