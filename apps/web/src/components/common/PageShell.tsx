import DataTable from './Table'
import type { DataTableProps } from '@/types/Table'

import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Button } from '@/components/ui/button'

import Pagination from '../common/Pagination'

type PageShellInterface<TData, TValue> = DataTableProps<TData, TValue> & {
  isSearch?: boolean
  isFilter?: boolean
} & (
    | {
        isButton: true
        buttonType: 'default' | 'outline'
        buttonText: string
      }
    | {
        isButton?: false
        buttonType?: never
        buttonText?: never
      }
  )

const PageShell = <TData, TValue>({
  columns,
  data,
  isSearch = true,
  isFilter = true,
  isButton = true,
  buttonText = 'Create',
  ...rest
}: PageShellInterface<TData, TValue>) => {
  const buttonType = 'buttonType' in rest ? rest.buttonType : 'default'
  return (
    <div className="grid grid-cols-12 gap-2">
      <div className="col-span-12 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        {isSearch && (
          <Field orientation="horizontal" className="md:w-[40%]">
            <Input type="search" placeholder="Search..." />
          </Field>
        )}
        <div className="w-full md:flex md:justify-end">
          <div className="flex flex-row gap-2">
            {isFilter && (
              <NativeSelect>
                <NativeSelectOption value="today">Today</NativeSelectOption>
                <NativeSelectOption value="3 days">Last 3 Days</NativeSelectOption>
                <NativeSelectOption value="7 days">Last 7 days</NativeSelectOption>
              </NativeSelect>
            )}
            {isButton && (
              <Button variant={buttonType} className="px-4 py-2">
                {buttonText}
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="col-span-12 flex flex-col gap-3">
        <DataTable columns={columns} data={data} isPending={false} />
        <Pagination className="justify-end" />
      </div>
    </div>
  )
}

export default PageShell
