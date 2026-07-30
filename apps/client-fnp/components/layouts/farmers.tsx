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
import {ArrowRight} from "lucide-react"
import {ClientListSkeleton} from "@/components/skeletons/client-list"

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
  const produceFilter = searchParams?.get("produce") ?? ""
  const categoryFilter = searchParams?.get("category") ?? ""

  const {data, isError, isFetching} = useQuery({
    queryKey: ["results-farmers", {p: page, produce: produceFilter, category: categoryFilter}],
    queryFn: () => queryBy != undefined ? queryClientsByProduct('farmer', queryBy, {p: page}) : queryClients('farmer', {p: page, produce: produceFilter ? [produceFilter] : [], category: categoryFilter ? [categoryFilter] : []}),
    refetchOnWindowFocus: false
  })

  if (isError) {
    return null
  }

  if (isFetching) {
    return <ClientListSkeleton />
  }

  const farmers = data?.data?.data as ApplicationUser[]
  const total = data?.data?.total as number

  const pageCount = Math.ceil(total / 10)

  if (farmers == undefined || farmers == null) {
    return null
  }


  return (
    <section className="space-y-8">
      {/* Post a request lot CTA */}
      <Link
        href="/sell"
        className="flex items-center justify-between gap-4 rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 hover:bg-primary/10 transition-colors group"
      >
        <div>
          <p className="text-sm font-semibold text-foreground">
            {queryBy ? `Looking to buy ${capitalizeFirstLetter(plural(queryBy))}?` : "Looking to buy produce?"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Post a request lot and let farmers come to you with their available stock.
          </p>
        </div>
        <ArrowRight className="h-4 w-4 text-primary flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
      </Link>

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
      <div className="space-y-3">
        {farmers.map((farmer, farmerIndex) => (
          <div key={farmerIndex} className="flex gap-4 rounded-lg border bg-card p-4 hover:border-primary/30 hover:shadow-sm transition-all">
            <div className="hidden sm:flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted/30 text-muted-foreground text-lg font-bold">
              {farmer.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold hover:text-primary transition-colors">
                <Link href={`/farmer/${slug(farmer.name)}`}>{capitalizeFirstLetter(farmer.name)}</Link>
              </h4>
              {farmer.short_description && farmer.short_description.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {capitalizeFirstLetter(farmer.short_description)}
                </p>
              )}
              <Contacts user={user} client={farmer} quickOverview={true}/>
              {(farmer.main_produce || (farmer.other_produce ?? []).length > 0) && (
                <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-1.5 mt-2 pt-2 border-t">
                  {[farmer.main_produce, ...(farmer.other_produce ?? [])].filter(Boolean).map((p: any) => (
                    <span key={p.name} className="text-[10px] px-2 py-1 rounded-md bg-muted/50 text-muted-foreground text-center truncate">
                      {capitalizeFirstLetter(p.name)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

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


