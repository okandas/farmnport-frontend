"use client"

import { useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"

import { Pagination } from "@/components/generic/pagination"
import { queryBuyers } from "@/lib/query"
import { ApplicationUser } from "@/lib/schemas"
import { makeAbbveriation, capitalizeFirstLetter, formatDate } from "@/lib/utilities"
import { Icons } from "@/components/icons/lucide"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


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
        refetchOnWindowFocus: false
    })

    if (isError) {
        return null
    }

    if (isFetching) {
        return null
    }

    const buyers = data?.data?.data as ApplicationUser[]
    const total = data?.data?.total as number

    const pageCount = Math.ceil(total / 10)

    if (buyers === undefined) {
        return null
    }

    return (
        <section className="space-y-8 mt-[21px]">
            <ul role="list" className="divide-y">
                {buyers.map((buyer, buyerIndex) => (
                    <li key={buyerIndex} className="py-4">

                        <div>
                            <h4 className="text-lg">{capitalizeFirstLetter(buyer.name)}</h4>
                            {buyer.short_description.length > 0 ? <h4 className="text-muted-foreground text-sm">{capitalizeFirstLetter(buyer.short_description)}</h4> : null}
                            <div className="grid grid-cols-1 lg:grid-cols-2">
                                <div>
                                    <dl className="-my-3 py-4 text-sm leading-6">
                                        <div className="flex justify-between gap-x-4 py-3">
                                            <dt>
                                                <span className="sr-only">Joined</span>
                                                <Icons.calender className="h-6 w-5" aria-hidden="true" />
                                            </dt>
                                            <dd className="text-sm font-medium leading-6 text-muted-foreground">{formatDate(buyer.created)}</dd>
                                        </div>
                                        <div className="flex justify-between gap-x-4 py-3">
                                            <dt>
                                                <span className="sr-only">Email</span>
                                                <Icons.mail className="h-6 w-5" aria-hidden="true" />
                                            </dt>
                                            <dd className="text-sm font-medium leading-6 text-muted-foreground hover:underline">
                                                <Link href={`mailto:${buyer.email}`}>
                                                    {buyer.email}
                                                </Link>
                                            </dd>
                                        </div>
                                        <div className="flex justify-between gap-x-4 py-3">
                                            <dt>
                                                <span className="sr-only">Phone</span>
                                                <Icons.phone className="h-6 w-5" aria-hidden="true" />
                                            </dt>
                                            <dd className="text-sm font-medium leading-6 text-muted-foreground hover:underline">
                                                <Link href={`tel:${buyer.phone}`}>
                                                    {buyer.phone}
                                                </Link>
                                            </dd>
                                        </div>
                                        <div className="flex justify-between gap-x-4 py-3">
                                            <dt>
                                                <span className="sr-only">Address</span>
                                                <Icons.map className="h-6 w-5" aria-hidden="true" />
                                            </dt>
                                            <dd className="text-sm font-medium leading-6 text-muted-foreground">{buyer.address}</dd>
                                        </div>
                                        <div className="flex justify-between gap-x-4 py-3">
                                            <dt>
                                                <span className="sr-only">City, Province</span>
                                                <Icons.landmark className="h-6 w-5" aria-hidden="true" />
                                            </dt>
                                            <dd className="text-sm font-medium leading-6 text-muted-foreground">{capitalizeFirstLetter(buyer.city)}, {capitalizeFirstLetter(buyer.province)}</dd>
                                        </div>
                                    </dl>
                                </div>
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
