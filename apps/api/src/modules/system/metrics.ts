import config from '#config/index.js'
import FileReader from '#modules/FileReader.js'

interface CpuTicks {
  idle: number
  iowait: number
  irq: number
  nice: number
  softirq: number
  steal: number
  system: number
  user: number
}

interface NetworkState {
  timestamp: number
  totalRx: number
  totalTx: number
}

let prevCpuTicks: CpuTicks | null = null
let prevNetworkState: NetworkState | null = null

export async function generateCpuMetricsPercentage() {
  const current = await generateCpuMetrics()

  if (!prevCpuTicks) {
    prevCpuTicks = current
    return null
  }

  const total1 =
    prevCpuTicks.user +
    prevCpuTicks.nice +
    prevCpuTicks.system +
    prevCpuTicks.idle +
    prevCpuTicks.iowait +
    prevCpuTicks.irq +
    prevCpuTicks.softirq +
    prevCpuTicks.steal

  const total2 =
    current.user +
    current.nice +
    current.system +
    current.idle +
    current.iowait +
    current.irq +
    current.softirq +
    current.steal

  const idle_delta = current.idle - prevCpuTicks.idle
  const total_delta = total2 - total1

  prevCpuTicks = current

  const cpu_percent = ((total_delta - idle_delta) / total_delta) * 100

  return { cpu_percent, unit: '%' }
}

export async function generateCpuTempMetrics() {
  const filedata = new FileReader('metric', '/sys/class/thermal/thermal_zone0/temp')

  const data = await filedata._readFile()

  const temp = parseFloat(data.trim()) / 1000

  return { temp, unit: '°C' }
}
export async function generateMemoryMetrics(): Promise<{
  MemAvailable: number
  MemFree: number
  MemTotal: number
  unit: string
}> {
  const filedata = new FileReader('metric', '/proc/meminfo')

  const data = await filedata._readFile()

  return data
    .split('\n')
    .slice(0, 3)
    .reduce(
      (acc, s, inx) => {
        const val = parseInt(/\d+/.exec(s)?.[0] ?? '0') / 1024
        let ky = 'MemTotal'
        switch (inx) {
          case 0:
            ky = 'MemTotal'
            break
          case 1:
            ky = 'MemFree'
            break
          case 2:
            ky = 'MemAvailable'
            break
          default:
            break
        }
        acc = { ...acc, [ky]: val, unit: 'MB' }
        return acc
      },
      {} as { MemAvailable: number; MemFree: number; MemTotal: number; unit: string },
    )
}

export async function generateNetworkMetrics() {
  const filedata = new FileReader('metric', '/proc/net/dev')
  const data = await filedata._readFile()

  const lines = data.split('\n').slice(2).filter(Boolean)

  let totalRx = 0
  let totalTx = 0

  for (const line of lines) {
    const [ifacePart, statsPart] = line.trim().split(':')

    const iface = (ifacePart ?? '').trim()
    if (iface === 'lo') continue

    const stats = (statsPart ?? '').trim().split(/\s+/).map(Number)

    const rxBytes = stats[0]
    const txBytes = stats[8]

    totalRx += rxBytes ?? 0
    totalTx += txBytes ?? 0
  }

  return { totalRx, totalTx }
}

export async function generateNetworkRate() {
  const current = await generateNetworkMetrics()
  const now = Date.now()

  if (!prevNetworkState) {
    prevNetworkState = { timestamp: now, ...current }
    return null
  }

  const intervalSeconds = (now - prevNetworkState.timestamp) / 1000
  const rxDelta = current.totalRx - prevNetworkState.totalRx
  const txDelta = current.totalTx - prevNetworkState.totalTx

  prevNetworkState = { timestamp: now, ...current }

  // counter wrap — skip this cycle
  if (rxDelta < 0 || txDelta < 0) return null

  return {
    download: rxDelta / intervalSeconds / 1024,
    unit: 'KB/s',
    upload: txDelta / intervalSeconds / 1024,
  }
}

export async function generateStogeInfo() {
  const paths = config.storagepaths

  const results = await Promise.all(
    paths.map(async (item) => {
      try {
        const data = await generateDiskMetrics(item)
        return { path: item, ...data }
      } catch {
        return null
      }
    }),
  )
  return results.filter((r) => r !== null)
}

export async function generateUpTimeMetrics() {
  const filedata = new FileReader('metric', '/proc/uptime')

  const data = await filedata._readFile()

  const time = parseFloat(data.trim())

  return { time, unit: 'seconds' }
}

function formatGB(bytes: number) {
  return bytes / 1024 ** 3
}

async function generateCpuMetrics(): Promise<CpuTicks> {
  const filedata = new FileReader('metric', '/proc/stat')

  const data = await filedata._readFile()

  const [user, nice, system, idle, iowait, irq, softirq, steal] = (data.split('\n')[0] ?? '')
    .trim()
    .split(/\s+/)
    .slice(1)
    .map(Number)

  return {
    idle: idle ?? 0,
    iowait: iowait ?? 0,
    irq: irq ?? 0,
    nice: nice ?? 0,
    softirq: softirq ?? 0,
    steal: steal ?? 0,
    system: system ?? 0,
    user: user ?? 0,
  }
}

async function generateDiskMetrics(path: string) {
  const filedata = new FileReader('metric', path)

  const data = await filedata._readDisk()
  const total = data.blocks * data.bsize
  const available = data.bavail * data.bsize
  const used = total - data.bfree * data.bsize

  return {
    available: formatGB(available),
    total: formatGB(total),
    unit: 'GB',
    used: formatGB(used),
  }
}
