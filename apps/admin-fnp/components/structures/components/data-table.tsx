"use client"

import { Dispatch, SetStateAction, useState } from "react"
import { ZoomInIcon } from "@radix-ui/react-icons"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { provinces } from "../data/data"
import { FacetedFilter } from "./faceted-filter"
import { Pagination } from "./pagination"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  total: number
  pagination: PaginationState
  setPagination: Dispatch<SetStateAction<PaginationState>>
  searchClient: string
  setSearchClient: Dispatch<SetStateAction<string>>
}

export function DataTable<TData, TValue>({
  columns,
  data,
  total,
  pagination,
  setPagination,
  searchClient,
  setSearchClient,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({
    data,
    columns,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    initialState: {
      pagination,
    },
    state: {
      rowSelection,
    },
    pageCount: total,
    manualPagination: true,
    debugTable: true,
  })

  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="space-y-8 pb-8">
      <div className="flex justify-end">
        <div className="flex items-center justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <Input
              placeholder="Search for client..."
              value={searchClient ?? ""}
              onChange={(event) => setSearchClient(event.target.value)}
              className="h-8 w-[150px] lg:w-[250px]"
            />
            <Button
              variant="outline"
              onClick={() => console.log(searchClient)}
              className="h-8 px-2 lg:px-3"
            >
              Search
              <ZoomInIcon className="ml-2 h-4 w-4" />
            </Button>
            {table.getColumn("province") && (
              <FacetedFilter
                column={table.getColumn("province")}
                title="Province"
                options={provinces}
              />
            )}
            {isFiltered && (
              <Button
                variant="ghost"
                onClick={() => table.resetColumnFilters()}
                className="h-8 px-2 lg:px-3"
              >
                Reset
                <ZoomInIcon className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="rounded-md border bg-background shadow-sm overflow-x-auto sticky top-0">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination table={table} />
    </div>
  )
}
