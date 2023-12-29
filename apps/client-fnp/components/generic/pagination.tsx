import * as React from "react"
import { usePathname, useRouter } from "next/navigation"

import { Icons } from "@/components/icons/lucide"

import { cn } from "@/lib/utilities"
import { Button } from "@/components/ui/button"

interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
    pageCount: number
    page?: number
    per_page?: string
    sort?: string
    createQueryString: (params: Record<string, string | number | null>) => string
    siblingCount?: number
}

export function Pagination({
    pageCount,
    page,
    per_page,
    sort,
    createQueryString,
    siblingCount = 1,
    className,
    ...props
}: PaginationProps) {
    const router = useRouter()
    const pathname = usePathname()
    const [isPending, startTransition] = React.useTransition()

    // Memoize pagination range to avoid unnecessary re-renders
    const paginationRange = React.useMemo(() => {
        const delta = siblingCount + 2

        const range = []
        for (
            let i = Math.max(2, Number(page) - delta);
            i <= Math.min(pageCount - 1, Number(page) + delta);
            i++
        ) {
            range.push(i)
        }

        if (Number(page) - delta > 2) {
            range.unshift("...")
        }
        if (Number(page) + delta < pageCount - 1) {
            range.push("...")
        }

        range.unshift(1)
        if (pageCount !== 1) {
            range.push(pageCount)
        }

        return range
    }, [pageCount, page, siblingCount])

    return (
        <div
            className={cn(
                "flex flex-wrap items-center justify-center gap-2",
                className
            )}
            {...props}
        >

            <Button
                aria-label="Go to previous page"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                    startTransition(() => {
                        router.push(
                            `${pathname}?${createQueryString({
                                page: Number(page) - 1,
                                per_page: per_page ?? null,
                                sort: sort ?? null,
                            })}`
                        )
                    })
                }}
                disabled={Number(page) === 1 || isPending}
            >
                <Icons.chevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            {paginationRange.map((pageNumber, i) =>
                pageNumber === "..." ? (
                    <Button
                        aria-label="Page separator"
                        key={i}
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled
                    >
                        ...
                    </Button>
                ) : (
                    <Button
                        aria-label={`Page ${pageNumber}`}
                        key={i}
                        variant={Number(page) === pageNumber ? "default" : "outline"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                            startTransition(() => {
                                router.push(
                                    `${pathname}?${createQueryString({
                                        page: pageNumber
                                    })}`
                                )
                            })
                        }}
                        disabled={isPending}
                    >
                        {pageNumber}
                    </Button>
                )
            )}
            <Button
                aria-label="Go to next page"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                    startTransition(() => {
                        router.push(
                            `${pathname}?${createQueryString({
                                page: Number(page) + 1
                            })}`
                        )
                    })
                }}
                disabled={Number(page) === (pageCount ?? 10) || isPending}
            >
                <Icons.chevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
        </div>
    )
}