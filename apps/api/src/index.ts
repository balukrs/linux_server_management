import config from '#config/index.js'

import { createServer } from './server.js'

const port = config.port

const server = createServer()

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
