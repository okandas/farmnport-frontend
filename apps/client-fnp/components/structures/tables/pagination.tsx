import { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"

interface PaginationProps<TData> {
  table: Table<TData>
}

export function Pagination<TData>({ table }: PaginationProps<TData>) {
  const pageCount = Math.max(table.getPageCount(), 1)
  const current = table.getState().pagination.pageIndex

  const goTo = (i: number) => {
    table.setPageIndex(i)
    window.scrollTo({ top: 0 })
  }

  const pages: (number | "…")[] = []
  const delta = 2
  const range: number[] = []
  for (let i = Math.max(0, current - delta); i <= Math.min(pageCount - 1, current + delta); i++) {
    range.push(i)
  }
  if (range[0] > 1) pages.push(0, "…")
  else if (range[0] === 1) pages.push(0)
  pages.push(...range)
  if (range[range.length - 1] < pageCount - 2) pages.push("…", pageCount - 1)
  else if (range[range.length - 1] === pageCount - 2) pages.push(pageCount - 1)

  if (pageCount <= 1) return null

  return (
    <div className="flex justify-center items-center gap-1 pt-2">
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-1 text-sm text-muted-foreground select-none">…</span>
        ) : (
          <Button
            key={p}
            variant={p === current ? "default" : "outline"}
            className="h-8 w-8 p-0 text-sm"
            onClick={() => goTo(p as number)}
          >
            {(p as number) + 1}
          </Button>
        )
      )}
    </div>
  )
}
