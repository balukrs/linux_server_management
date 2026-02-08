import type { ColumnDef } from '@tanstack/react-table'
import DataTable from '../common/Table'
import { Badge } from '@/components/ui/badge'

const StorageTable = () => {
  type props = {
    id: string
    path: string
    type: 'Internal' | 'External' | 'NAS'
    used: string
    total: string
    status: 'Healthy' | 'Unhealthy'
  }

  const disks: props[] = [
    {
      id: '1',
      path: '/',
      type: 'Internal',
      used: '350 GB',
      total: '500 GB',
      status: 'Healthy',
    },
    {
      id: '2',
      path: '/mnt/backup',
      type: 'External',
      used: '1.2 TB',
      total: '4 TB',
      status: 'Healthy',
    },
    {
      id: '3',
      path: '/mnt/nas/media',
      type: 'NAS',
      used: '8.5 TB',
      total: '12 TB',
      status: 'Healthy',
    },
  ]

  const columns: ColumnDef<props>[] = [
    {
      accessorKey: 'path',
      header: 'Path',
    },
    {
      accessorKey: 'type',
      header: 'Type',
    },
    {
      accessorKey: 'used',
      header: 'Used',
    },
    {
      accessorKey: 'total',
      header: 'Total',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue<string>('status')
        return (
          <Badge
            className={
              status === 'Healthy'
                ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
                : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
            }
          >
            {status}
          </Badge>
        )
      },
    },
  ]
  return <DataTable columns={columns} data={disks} />
}

export default StorageTable
