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

interface FarmersPageProps {
  user: AuthenticatedUser | null
  queryBy?: string
}

export function Farmers({user, queryBy}: FarmersPageProps) {

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
    queryKey: ["results-farmers", {p: page}],
    queryFn: () => queryBy != undefined ? queryClientsByProduct('farmer', queryBy, {p: page}) : queryClients('farmer', {p: page}),
    refetchOnWindowFocus: false
  })

  if (isError) {
    return null
  }

  if (isFetching) {
    return null
  }

  const farmers = data?.data?.data as ApplicationUser[]
  const total = data?.data?.total as number

  const pageCount = Math.ceil(total / 10)

  if (farmers == undefined || farmers == null) {
    return null
  }


  return (
    <section className="space-y-8">
      {
        queryBy == undefined ?
          <div>
            <h1 className="text-2xl font-semibold">{total} Farm Produce Sellers.</h1>
            <p className="text-base text-muted-foreground pt-1">Connect with reliable produce sellers near you.</p>
          </div>
          :
          <div>
            <h2 className="text-lg font-medium">{total} { capitalizeFirstLetter(plural(queryBy)) } Produce Sellers.</h2>
          </div>
      }
      <ul role="list" className="divide-y">
        {farmers.map((farmer, farmerIndex) => (
          <li key={farmerIndex} className="py-4 first:pt-2">

            <div>
              <h4 className="text-lg hover:underline hover:decoration-2">
                <Link href={`/farmer/${slug(farmer.name)}`}>{capitalizeFirstLetter(farmer.name)}</Link>
              </h4>
              {farmer.short_description.length > 0 ? <h4
                className="text-muted-foreground text-sm">{capitalizeFirstLetter(farmer.short_description)}</h4> : null}
              <Contacts user={user} client={farmer} quickOverview={true}/>
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


