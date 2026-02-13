import { createServer } from './server.js'
const port = process.env.PORT ?? '9001'

const server = createServer()

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
