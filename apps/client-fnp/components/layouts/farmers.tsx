"use client"

import {useCallback} from "react"
import {usePathname, useRouter, useSearchParams} from "next/navigation"
import {useQuery} from "@tanstack/react-query"
import Link from "next/link"
import {Search} from "lucide-react"

import {Pagination} from "@/components/generic/pagination"
import {Icons} from "@/components/icons/lucide"

import {queryClients, queryClientsByProduct} from "@/lib/query"
import {AdSenseInFeed} from "@/components/ads/AdSenseInFeed"
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
  const provinceFilters = searchParams?.getAll("province") ?? []
  const produceFilters = searchParams?.getAll("produce") ?? []
  const categoryFilters = searchParams?.getAll("category") ?? []
  const paymentTermsFilters = searchParams?.getAll("payment_terms") ?? []
  const pricingFilters = searchParams?.getAll("pricing") ?? []

  const {data, isError, isFetching} = useQuery({
    queryKey: ["results-farmers", {p: page, province: provinceFilters, produce: produceFilters, category: categoryFilters, payment_terms: paymentTermsFilters, pricing: pricingFilters, queryBy}],
    queryFn: () => queryBy != undefined ? queryClientsByProduct('farmer', queryBy, {p: page, province: provinceFilters}) : queryClients('farmer', {p: page, province: provinceFilters, produce: produceFilters, category: categoryFilters, payment_terms: paymentTermsFilters, pricing: pricingFilters}),
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
    <section className="space-y-8 mt-[21px]">
      {
        queryBy == undefined ?
          <div>
            <h1 className="text-lg font-medium">{total} Farm Produce Sellers.</h1>
            <p className="text-base text-muted-foreground pt-1">Connect with reliable produce sellers near you.</p>
          </div>
          :
          <div>
            <h1 className="text-lg font-medium">{total} { capitalizeFirstLetter(plural(queryBy)) } Produce Sellers.</h1>
            <p className="text-base text-muted-foreground pt-1">Buy your {plural(queryBy)} produce from {plural('farmer', total)} across Zimbabwe.</p>
          </div>
      }

      {/* Search Bar - Commented out until we have enough users, using sidebar filter for now */}
      {/* <div className="relative">
        <form className="relative flex items-center">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search farmers by name, produce, or location..."
              className="w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </form>
      </div> */}

      <div className="space-y-3">
        {farmers.map((farmer, farmerIndex) => (
          <div key={farmerIndex}>
          {farmerIndex > 0 && farmerIndex % 3 === 0 && <AdSenseInFeed />}
          <Link href={`/farmer/${slug(farmer.name)}`} className="block bg-card border rounded-lg p-6 hover:shadow-md hover:border-primary/40 transition-all group">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                <span className="text-lg font-bold">{farmer.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-semibold group-hover:text-primary transition-colors truncate">
                    {capitalizeFirstLetter(farmer.name)}
                  </h4>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {capitalizeFirstLetter(farmer.city)}, {capitalizeFirstLetter(farmer.province)}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span>Selling {farmer.main_produce?.name ? capitalizeFirstLetter(plural(farmer.main_produce.name)) : 'Various Products'}</span>
                  {farmer.primary_category && (
                    <>
                      <span className="hidden sm:inline">•</span>
                      <span className="font-medium text-foreground">{capitalizeFirstLetter(farmer.primary_category.name)}</span>
                    </>
                  )}
                </div>
                {farmer.short_description.length > 0 && (
                  <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
                    {capitalizeFirstLetter(farmer.short_description)}
                  </p>
                )}
                {(farmer.contact_views || 0) > 0 && (
                  <p className="text-orange-600 text-xs font-medium mt-2 flex items-center gap-1">
                    <Icons.eye className="h-3.5 w-3.5" />
                    {farmer.contact_views} {farmer.contact_views === 1 ? 'person viewed' : 'people viewed'} this contact recently
                  </p>
                )}
              </div>
            </div>
          </Link>
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


