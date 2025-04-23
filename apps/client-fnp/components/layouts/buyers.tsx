"use client"

import {useCallback, useState} from "react"
import {usePathname, useRouter, useSearchParams} from "next/navigation"


import {sendGTMEvent} from '@next/third-parties/google'
import {useQuery} from "@tanstack/react-query"
import Link from "next/link"

import {Pagination} from "@/components/generic/pagination"
import {queryBuyers, queryBuyersByProduct} from "@/lib/query"
import {ApplicationUser, AuthenticatedUser} from "@/lib/schemas"
import {slug, capitalizeFirstLetter, formatDate, plural} from "@/lib/utilities"
import {Icons} from "@/components/icons/lucide"

import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Button, buttonVariants} from "@/components/ui/button"
import {Contacts} from "@/components/layouts/contacts"

interface BuyersPageProps {
  user: AuthenticatedUser | null
  queryBy?: string
}

export function Buyers({user, queryBy}: BuyersPageProps) {

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

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

  const {data, isError, refetch, isFetching} = useQuery({
    queryKey: ["results-buyers", {p: page}],
    queryFn: () => queryBy != undefined ? queryBuyersByProduct(queryBy, {p: page}) : queryBuyers({p: page}),
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

  if (buyers == undefined || buyers == null) {
    return null
  }


  return (
    <section className="space-y-8 mt-[21px]">
      <ul role="list" className="divide-y">
        {buyers.map((buyer, buyerIndex) => (
          <li key={buyerIndex} className="py-4 first:pt-2">

            <div>
              <h4 className="text-lg hover:underline hover:decoration-2">
                <Link href={`/buyer/${slug(buyer.name)}`}>{capitalizeFirstLetter(buyer.name)}</Link>
              </h4>
              {buyer.short_description.length > 0 ? <h4
                className="text-muted-foreground text-sm">{capitalizeFirstLetter(buyer.short_description)}</h4> : null}
              <Contacts user={user} buyer={buyer} quickOverview={true}/>
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


