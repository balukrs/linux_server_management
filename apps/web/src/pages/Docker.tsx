import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import PageShell from '@/components/common/PageShell'

const Docker = () => {
  type Process = {
    pid: string
    name: string
    user: string
    cpu: number
    memory: string
    uptime: string
    status: 'running' | 'sleeping' | 'zombie'
  }

  const data: Process[] = [
    {
      pid: '1241',
      name: 'systemd',
      user: 'root',
      cpu: 0.1,
      memory: '12 MB',
      uptime: '14d',
      status: 'running',
    },
    {
      pid: '2351',
      name: 'node',
      user: 'app-user',
      cpu: 1.2,
      memory: '150 MB',
      uptime: '2d',
      status: 'running',
    },
    {
      pid: '8422',
      name: 'docker-containerd',
      user: 'root',
      cpu: 0.5,
      memory: '45 MB',
      uptime: '14d',
      status: 'sleeping',
    },
    {
      pid: '9911',
      name: 'nginx',
      user: 'www-data',
      cpu: 0.2,
      memory: '22 MB',
      uptime: '5d',
      status: 'running',
    },
    {
      pid: '1011',
      name: 'python3',
      user: 'dev',
      cpu: 0.0,
      memory: '18 MB',
      uptime: '1h',
      status: 'sleeping',
    },
    {
      pid: '11234',
      name: 'postgres',
      user: 'postgres',
      cpu: 0.8,
      memory: '250 MB',
      uptime: '14d',
      status: 'running',
    },
  ]

  const columns: ColumnDef<Process>[] = [
    {
      accessorKey: 'pid',
      header: 'PID',
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'user',
      header: 'User',
    },
    {
      accessorKey: 'cpu',
      header: 'CPU %',
      cell: ({ row }) => {
        return <div className="font-medium">{row.getValue('cpu')}%</div>
      },
    },
    {
      accessorKey: 'memory',
      header: 'Memory',
    },
    {
      accessorKey: 'uptime',
      header: 'Uptime',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        return <Badge variant={status === 'running' ? 'default' : 'secondary'}>{status}</Badge>
      },
    },
  ]
  return <PageShell columns={columns} data={data} isButton={false} />
}

export default Docker
