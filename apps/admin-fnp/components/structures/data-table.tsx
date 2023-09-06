"use client"

import { Dispatch, SetStateAction, useState } from "react"
import Link from "next/link"
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

import { cn } from "@/lib/utilities"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Icons } from "@/components/icons/lucide"

import { Pagination } from "./pagination"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  newUrl: string
  tableName: string
  total: number
  pagination: PaginationState
  setPagination: Dispatch<SetStateAction<PaginationState>>
  searchClient: string
  setSearchClient: Dispatch<SetStateAction<string>>
}

export function DataTable<TData, TValue>({
  columns,
  data,
  newUrl,
  tableName,
  total,
  pagination,
  setPagination,
  searchClient,
  setSearchClient,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({})

  const pageCount = Math.floor(total / pagination.pageSize)

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
    manualPagination: true,
    pageCount: pageCount,
  })

  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="pb-8 space-y-8">
      <div className="flex justify-between">
        <div className="flex justify-start">
          <Link
            href={newUrl}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            <>
              New {tableName}
              <Icons.add className="w-4 h-4 ml-2" />
            </>
          </Link>
        </div>
        <div className="flex justify-end">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1 space-x-2">
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
                <Icons.search className="w-4 h-4 ml-2" />
              </Button>
              {isFiltered && (
                <Button
                  variant="ghost"
                  onClick={() => table.resetColumnFilters()}
                  className="h-8 px-2 lg:px-3"
                >
                  Reset
                  <Icons.close className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="sticky top-0 overflow-x-auto border rounded-md shadow-sm bg-background">
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
            {table?.getRowModel()?.rows?.length ? (
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
