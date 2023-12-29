"use client"

import { useCallback } from "react"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { Pagination } from "@/components/generic/pagination"
import { queryBuyers } from "@/lib/query"
import { ApplicationUser } from "@/lib/schemas"
import { makeAbbveriation, capitalizeFirstLetter } from "@/lib/utilities"


export function Buyers() {


    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Create query string
    const createQueryString = useCallback(
        (params: Record<string, string | number | null>) => {
            const newSearchParams = new URLSearchParams(searchParams?.toString())

            for (const [key, value] of Object.entries(params)) {
                if (value === null) {
                    newSearchParams.delete(key)
                } else {
                    newSearchParams.set(key, String(value))
                }
            }

            return newSearchParams.toString()
        },
        [searchParams]
    )


    // Search params
    const page = Number(searchParams?.get("page")) ?? 1

    const { data, isError, refetch, isFetching } = useQuery({
        queryKey: ["results-buyers", { p: page }],
        queryFn: () => queryBuyers({ p: page }),
        refetchOnMount: false
    })

    if (isFetching) {
        return null
    }

    const buyers = data?.data?.data as ApplicationUser[]
    const total = data?.data?.total as number

    const pageCount = Math.ceil(total / 10)

    return (
        <section className="space-y-4">
            <ul role="list" className="divide-y">
                {buyers.map((buyer, buyerIndex) => (
                    <li key={buyerIndex} className="py-4">
                        <div className="flex">
                            <div className="mr-4 flex-shrink-0 self-center">
                                <Avatar className="w-32 h-32 mb-1 mr-4">
                                    <AvatarImage />
                                    <AvatarFallback>{makeAbbveriation(buyer?.name)}</AvatarFallback>
                                </Avatar>
                            </div>
                            <div>
                                <h4 className="text-lg">{capitalizeFirstLetter(buyer.name)}</h4>

                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            <div>
                <Pagination
                    pageCount={pageCount}
                    page={page}
                    createQueryString={createQueryString}
                />
            </div>
        </section>

    )
}