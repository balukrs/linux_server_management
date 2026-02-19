import fs from 'fs/promises'

class FileReader {
  path: string
  type: string
  constructor(type: string, path: string) {
    this.type = type
    this.path = path
  }

  async _readDisk() {
    return await fs.statfs(this.path)
  }

  async _readFile() {
    return await fs.readFile(this.path, 'utf-8')
  }
}

export default FileReader
