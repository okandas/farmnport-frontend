"use client"

import {useCallback} from "react"
import {usePathname, useRouter, useSearchParams} from "next/navigation"
import {useQuery} from "@tanstack/react-query"
import Link from "next/link"

import {Pagination} from "@/components/generic/pagination"
import {Contacts} from "@/components/layouts/contacts"

import {queryClients, queryClientsByProduct} from "@/lib/query"
import {ApplicationUser, AuthenticatedUser} from "@/lib/schemas"
import {slug, capitalizeFirstLetter, plural} from "@/lib/utilities"

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

  const {data, isError, isFetching} = useQuery({
    queryKey: ["results-buyers", {p: page}],
    queryFn: () => queryBy != undefined ? queryClientsByProduct('buyer', queryBy, {p: page}) : queryClients('buyer', {p: page}),
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
      {
        queryBy == undefined ?
          <div>
            <h1 className="text-lg font-medium">{total} Farm Produce Buyers.</h1>
            <p className="text-base text-muted-foreground pt-1">Connect with farm produce buyers across Zimbabwe.</p>
          </div>
          :
          <div>
            <h1 className="text-lg font-medium">{total} { capitalizeFirstLetter(plural(queryBy)) } Produce Buyers.</h1>
            <p className="text-base text-muted-foreground pt-1">Sell your {plural(queryBy)} produce with {plural('buyer', total)} across Zimbabwe.</p>
          </div>
      }
      <ul role="list" className="divide-y">
        {buyers.map((buyer, buyerIndex) => (
          <li key={buyerIndex} className="py-4 first:pt-2">

            <div>
              <h4 className="text-lg hover:underline hover:decoration-2">
                <Link href={`/buyer/${slug(buyer.name)}`}>{capitalizeFirstLetter(buyer.name)}</Link>
              </h4>
              {buyer.short_description.length > 0 ? <h4
                className="text-muted-foreground text-sm">{capitalizeFirstLetter(buyer.short_description)}</h4> : null}
              <Contacts user={user} client={buyer} quickOverview={true}/>
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


