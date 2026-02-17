import config from '#config/index.js'

import { createServer } from './server.js'

const port = config.port

const server = createServer()

server.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
