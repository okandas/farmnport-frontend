"use client"

import { Dispatch, SetStateAction, useState } from "react"
import Link from "next/link"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
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
import { Plus, Search, AlertCircle } from "lucide-react"

import { Pagination } from "./pagination"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  newUrl?: string
  tableName: string
  total: number
  pagination: PaginationState
  setPagination: Dispatch<SetStateAction<PaginationState>>
  search: string
  setSearch: Dispatch<SetStateAction<string>>
  searchPlaceholder?: string
  filters?: React.ReactNode
  emptyMessage?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  newUrl,
  tableName,
  total,
  pagination,
  setPagination,
  search,
  setSearch,
  searchPlaceholder,
  filters,
  emptyMessage,
}: DataTableProps<TData, TValue>) {
  const [inputValue, setInputValue] = useState(search ?? "")

  const pageCount = Math.ceil(total / pagination.pageSize)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    state: { pagination },
    manualPagination: true,
    pageCount,
  })

  return (
    <div className="pb-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="flex justify-start">
          {newUrl && (
            <Link href={newUrl} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              New {tableName}
              <Plus className="w-4 h-4 ml-2" />
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          {filters}
          <div className="flex items-center gap-2">
            <Input
              placeholder={searchPlaceholder || `Search ${tableName.toLowerCase()}...`}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                if (e.target.value === "") setSearch("")
              }}
              onKeyDown={(e) => { if (e.key === "Enter") setSearch(inputValue) }}
              className="h-8 w-[150px] lg:w-[220px]"
            />
            <Button variant="outline" size="sm" onClick={() => setSearch(inputValue)} className="h-8">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-md bg-background">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                    <AlertCircle className="w-8 h-8" />
                    <p className="text-sm font-medium">{emptyMessage || `No ${tableName.toLowerCase()} found`}</p>
                  </div>
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
