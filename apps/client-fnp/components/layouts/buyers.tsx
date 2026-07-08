"use client"

import {useCallback} from "react"
import {usePathname, useRouter, useSearchParams} from "next/navigation"
import {useQuery} from "@tanstack/react-query"
import Link from "next/link"
import {Users} from "lucide-react"

import {Pagination} from "@/components/generic/pagination"
import {ArrowRight} from "lucide-react"

import {queryClients, queryClientsByProduct} from "@/lib/query"
import {AdSenseInFeed} from "@/components/ads/AdSenseInFeed"
import {ApplicationUser, AuthenticatedUser} from "@/lib/schemas"
import {capitalizeFirstLetter, plural} from "@/lib/utilities"
import {BuyerContactsCard} from "@/components/layouts/buyer-contacts"
import {ClientListSkeleton} from "@/components/skeletons/client-list"

interface BuyersPageProps {
  user: AuthenticatedUser | null
  queryBy?: string
}

export function Buyers({queryBy}: BuyersPageProps) {

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
  const produceFilter = searchParams?.get("produce") ?? ""
  const categoryFilter = searchParams?.get("category") ?? ""
  const paymentTermsFilters = searchParams?.getAll("payment_terms") ?? []
  const pricingFilters = searchParams?.getAll("pricing") ?? []
  const verifiedFilters = searchParams?.getAll("verified") ?? []
  const hasBookingFilter = searchParams?.get("has_booking") ?? ""

  const {data, isError, isFetching} = useQuery({
    queryKey: ["results-buyers", {p: page, province: provinceFilters, produce: produceFilter, category: categoryFilter, payment_terms: paymentTermsFilters, pricing: pricingFilters, verified: verifiedFilters, has_booking: hasBookingFilter, queryBy}],
    queryFn: () => queryBy != undefined ? queryClientsByProduct('buyer', queryBy, {p: page, province: provinceFilters, verified: verifiedFilters}) : queryClients('buyer', {p: page, province: provinceFilters, produce: produceFilter ? [produceFilter] : [], category: categoryFilter ? [categoryFilter] : [], payment_terms: paymentTermsFilters, pricing: pricingFilters, verified: verifiedFilters, has_booking: hasBookingFilter || undefined}),
    refetchOnWindowFocus: false
  })

  if (isError) {
    return null
  }

  if (isFetching) {
    return <ClientListSkeleton />
  }

  const buyers = data?.data?.data as ApplicationUser[]
  const total = data?.data?.total as number
  const bookingCount = data?.data?.booking_count as number

  const pageCount = Math.ceil(total / 10)

  if (buyers == undefined || buyers == null) {
    return null
  }

  if (buyers.length === 0) {
    const produceName = queryBy ? capitalizeFirstLetter(plural(queryBy)) : "Produce"
    return (
      <section className="mt-[21px]">
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center border rounded-lg bg-muted/30">
          <Users className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold mb-1">No {produceName} Buyers Yet</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            There are currently no registered {queryBy ? plural(queryBy) : ""} buyers on the platform.
            Check back soon as new buyers join regularly.
          </p>
          <Link href="/buyers" className="mt-4 text-sm text-primary hover:underline">
            Browse all buyers
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-8">
      {/* Sell CTA */}
      <Link
        href={queryBy ? `/sell/${queryBy}` : "/sell"}
        className="flex items-center justify-between gap-4 rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 hover:bg-primary/10 transition-colors group"
      >
        <div>
          <p className="text-sm font-semibold text-foreground">
            {queryBy ? `Selling ${capitalizeFirstLetter(plural(queryBy))}?` : "Are you a farmer selling produce?"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {queryBy ? `List your ${plural(queryBy)} lot and reach these buyers directly.` : "List a lot and connect directly with buyers on Farmnport."}
          </p>
        </div>
        <ArrowRight className="h-4 w-4 text-primary flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
      </Link>

      {
        queryBy == undefined ?
          <div>
            <h1 className="text-2xl font-semibold">{total} Farm Produce Buyers.</h1>
            <p className="text-base text-muted-foreground pt-1">Connect with farm produce buyers across Zimbabwe.</p>
          </div>
          :
          <div>
            <h2 className="text-lg font-medium">{total} { capitalizeFirstLetter(plural(queryBy)) } Produce Buyers.</h2>
          </div>
      }

      {/* Online bookings filter toggle */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => {
            router.push(pathname + "?" + createQueryString({ has_booking: hasBookingFilter === "true" ? null : "true", page: null }))
          }}
          className={`group inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border font-medium transition-colors ${
            hasBookingFilter === "true"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-background text-foreground border-border hover:border-blue-400 hover:text-blue-600"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Takes Online Bookings
          {bookingCount > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${hasBookingFilter === "true" ? "bg-white/20 text-white" : "bg-blue-50 text-blue-700"}`}>
              <span className="group-hover:hidden">{bookingCount}</span>
              <span className="hidden group-hover:inline">×</span>
            </span>
          )}
        </button>
      </div>

      {/* Search Bar - Commented out until we have enough users, using sidebar filter for now */}
      {/* <div className="relative">
        <form className="relative flex items-center">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search buyers by name, produce, or location..."
              className="w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </form>
      </div> */}

      <ul role="list" className="divide-y">
        {buyers.map((buyer, buyerIndex) => (
          <li key={buyerIndex} className="py-4 first:pt-2">
            {buyerIndex > 0 && buyerIndex % 3 === 0 && <AdSenseInFeed />}
            <BuyerContactsCard buyer={buyer} />
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


