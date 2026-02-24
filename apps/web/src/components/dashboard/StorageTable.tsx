import type { ColumnDef } from '@tanstack/react-table'
import DataTable from '../common/Table'

import type { SummaryApiResponse } from '@linux-mgmt/shared'

type props = {
  id: number
  path: string
  type: 'Internal' | 'External'
  used: string
  total: string
}

const StorageTable = ({
  data,
  isPending,
}: {
  data: SummaryApiResponse | undefined
  isPending: boolean
}) => {
  const storage = data?.data.storage

  const disks: props[] =
    storage?.map((item, inx) => {
      const used = item.find((x) => x?.type.includes('DISK_USED'))
      const total = item.find((x) => x?.type.includes('DISK_TOTAL'))

      const path = used?.type.split('_').pop() ?? ''

      return {
        id: inx,
        path,
        type: path === '/' ? 'Internal' : 'External',
        used: Number(used?.value).toFixed(2),
        total: Number(total?.value).toFixed(2),
      }
    }) ?? []

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
  ]

  return <DataTable columns={columns} data={disks} isPending={isPending} />
}

export default StorageTable
