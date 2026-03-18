"use client"

import { useQuery } from "@tanstack/react-query"
import { sendGTMEvent } from "@next/third-parties/google"
import Link from "next/link"

import { queryClient, queryClientPricing, queryCdmPricesByClient } from "@/lib/query"
import { ApplicationUser, AuthenticatedUser, CdmPrice } from "@/lib/schemas"
import { capitalizeFirstLetter, makeAbbveriation, plural, titleCase } from "@/lib/utilities"
import { paymentTermsLabel } from "@/components/structures/repository/data"
import { Icons } from "@/components/icons/lucide"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Contacts } from "@/components/layouts/contacts"
import { BuyerContacts } from "@/components/structures/buyer-contacts"
import { CdmPriceCard } from "@/components/structures/cdm-price-card"


interface ClientPageProps {
  slug: string
  user: AuthenticatedUser | null
}

export function Client({ slug, user }: ClientPageProps) {
  const { data, isError, isFetching } = useQuery({
    queryKey: [`result-client-${slug}`, slug],
    queryFn: () => queryClient(slug),
    refetchOnWindowFocus: false
  })

  const client = data?.data as ApplicationUser

  // Fetch pricing data separately (only for buyers with pricing)
  const { data: pricingData, isLoading: pricingLoading } = useQuery({
    queryKey: [`client-pricing-${client?.id}`, client?.id],
    queryFn: () => queryClientPricing(client?.id || '', { p: 1 }),
    enabled: !!client?.id && client?.type === 'buyer' && client?.has_prices,
    refetchOnWindowFocus: false
  })

  // Fetch CDM pricing data (for buyers)
  const { data: cdmData } = useQuery({
    queryKey: [`client-cdm-pricing-${client?.id}`, client?.id],
    queryFn: () => queryCdmPricesByClient(client?.id || ''),
    enabled: !!client?.id && client?.type === 'buyer',
    refetchOnWindowFocus: false
  })

  const cdmPrices: CdmPrice[] = cdmData?.data?.data || []

  if (isError) {
    return null
  }
  if (isFetching) {
    return null
  }

  if (client === undefined) {
    return null
  }

  const pricingTotal = pricingData?.data?.total || 0

  // SEO content helpers
  const name = titleCase(client.name)
  const isFarmer = client.type === 'farmer'
  const categoryName = client.primary_category?.name ? titleCase(client.primary_category.name) : 'Agriculture'
  const mainProductName = client.main_produce?.name ? capitalizeFirstLetter(client.main_produce.name) : null
  const mainProductPlural = client.main_produce?.name ? capitalizeFirstLetter(plural(client.main_produce.name)) : 'various agricultural products'
  const otherProducts = (client.other_produce || []).filter(p => p.name !== client.main_produce?.name)
  const hasOtherProducts = otherProducts.length > 0
  const paymentLabel = paymentTermsLabel(client.payment_terms)
  const isProcessing = categoryName.toLowerCase().includes('meat') || categoryName.toLowerCase().includes('abattoir') || categoryName.toLowerCase().includes('processing')


  return (
    <div className="w-full bg-gradient-to-br from-background via-background to-muted/20 min-h-screen pb-12">
      {/* Hero Header Section */}
      <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar and Basic Info */}
            <Avatar className="h-24 w-24 ring-4 ring-background shadow-xl">
              <AvatarImage />
              <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                {makeAbbveriation(client.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  {capitalizeFirstLetter(client.name)}
                </h1>
                {client.verified ? (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                    <Icons.verified className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    <Icons.unverified className="h-3 w-3 mr-1" />
                    Unverified
                  </Badge>
                )}
                <Badge variant="secondary" className="font-medium">
                  {capitalizeFirstLetter(client.type)}
                </Badge>
              </div>

              <p className="text-muted-foreground text-base max-w-3xl">
                {client.short_description
                  ? capitalizeFirstLetter(client.short_description)
                  : `${capitalizeFirstLetter(client.scale)} scale ${client.type} in the ${
                      client.primary_category?.name || 'agriculture'
                    } industry mainly procuring ${
                      client.main_produce?.name ? plural(client.main_produce.name) : 'various products'
                    }.`}
              </p>

              {/* Stats Row */}
              <div className="flex flex-wrap gap-6 mt-4">
                {client.type === 'buyer' && (
                  <div className="flex items-center gap-2">
                    <Icons.building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-semibold">{client.branches <= 1 ? '1 Branch' : `${client.branches} Branches`}</p>
                      <p className="text-xs text-muted-foreground">{client.branches <= 1 ? 'Branch' : 'Branches'}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Icons.mapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-semibold">
                      {client.city && client.province
                        ? `${capitalizeFirstLetter(client.city)}, ${capitalizeFirstLetter(client.province)}`
                        : 'Location N/A'}
                    </p>
                    <p className="text-xs text-muted-foreground">Location</p>
                  </div>
                </div>
                {client.main_produce && (
                  <div className="flex items-center gap-2">
                    <Icons.tag className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-semibold">{capitalizeFirstLetter(client.main_produce.name)}</p>
                      <p className="text-xs text-muted-foreground">Primary Product</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business Details Card */}
            <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold mb-6">
                Business Profile
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">
                    Category
                  </dt>
                  <dd className="text-base font-semibold">
                    {client.primary_category ? capitalizeFirstLetter(client.primary_category.name) : 'N/A'}
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">
                    Main Product
                  </dt>
                  <dd className="text-base font-semibold">
                    {client.main_produce?.name ? capitalizeFirstLetter(client.main_produce.name) : 'N/A'}
                  </dd>
                </div>
              </div>
            </div>

            {/* Buyer Contacts (buyers only) */}
            {client.type === 'buyer' && (
              <BuyerContacts clientId={client.id} clientName={client.name} user={user} />
            )}

            {/* Products & Services */}
            <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold mb-4">
                {isFarmer ? 'Farm Products' : isProcessing ? 'Processing Services' : 'Products Sourced'}
              </h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                {mainProductName && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      {isFarmer ? 'Primary Crop / Livestock' : 'Primary Product'}
                    </h3>
                    <p>
                      {name}&apos;s main {isFarmer ? 'product' : 'procurement focus'} is{' '}
                      <span className="font-medium text-foreground">{mainProductName}</span>
                      {client.primary_category?.name ? `, categorized under ${categoryName}` : ''}.
                      {isFarmer
                        ? ` This is their core farming output, supplied to local and regional buyers.`
                        : isProcessing
                          ? ` They specialize in the processing and handling of ${mainProductPlural} for farmers and traders.`
                          : ` They actively source ${mainProductPlural} from farmers and suppliers.`
                      }
                    </p>
                  </div>
                )}

                {hasOtherProducts && (
                  <div>
                    <ul className="list-disc list-inside grid grid-cols-2 gap-x-4 gap-y-1.5">
                      {otherProducts.map((p, i) => (
                        <li key={i} className="text-sm font-medium">{capitalizeFirstLetter(p.name)}</li>
                      ))}
                    </ul>
                    <p className="mt-3">
                      {isFarmer
                        ? `These products make up ${name}'s full farming portfolio.`
                        : `${name} actively purchases all of these products from farmers and suppliers.`
                      }
                    </p>
                  </div>
                )}

                {isProcessing && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">Processing Capabilities</h3>
                    <p>
                      {name} offers professional processing services including livestock slaughter, deboning,
                      cold storage, and product packaging for farmers and livestock traders in the region.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing (buyers only) */}
            {client.type === 'buyer' && (
              <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-xl font-semibold mb-4">
                  Pricing &amp; Payment Terms
                </h2>
                <div className="flex items-center gap-2 mb-2">
                  <Icons.creditCard className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Payment Terms:</span>
                  <span className="text-sm font-semibold">{paymentTermsLabel(client.payment_terms)}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                  {client.payment_terms && client.payment_terms !== 'not-provided'
                    ? `${name} operates with ${paymentLabel} payment terms. Farmers and suppliers can expect payment under these terms when selling their produce.`
                    : `${name} has not specified their preferred payment terms. Contact them directly to discuss payment arrangements when selling your produce.`
                  }
                </p>
                <p className="text-xs text-lime-700 dark:text-lime-500 mb-4">
                  Note: Always contact {name} directly to verify payment terms.
                </p>
                {pricingLoading ? (
                  <div className="flex items-center gap-3 py-4 border-t">
                    <Icons.spinner className="h-5 w-5 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading pricing data...</p>
                  </div>
                ) : client.has_prices && pricingTotal > 0 ? (
                  <div className="flex items-center justify-between py-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {capitalizeFirstLetter(client.name)} has shared pricing information
                      </p>
                      <p className="text-2xl font-bold text-primary mt-1">
                        {pricingTotal} price {pricingTotal === 1 ? 'list' : 'lists'}
                      </p>
                    </div>
                    <Button asChild
                      onClick={() => sendGTMEvent({ event: 'link', value: 'ViewPricingFromDetailPage' })}
                    >
                      <Link href={`/prices?clients=${encodeURIComponent(client.name)}`}>
                        See Pricing
                        <Icons.arrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-4 border-t">
                    This buyer hasn&apos;t shared pricing information yet. Check back later or contact them directly for pricing details.
                  </p>
                )}
              </div>
            )}

            {/* CDM Pricing */}
            {cdmPrices.length > 0 && (
              <div className="space-y-4">
                {cdmPrices.map((cdmPrice) => (
                  <CdmPriceCard key={cdmPrice.id} price={cdmPrice} />
                ))}
              </div>
            )}

          </div>

          {/* Right Sidebar - Contact (1/3 width) */}
          <div className="space-y-6">
            <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-lg font-semibold mb-4">
                Contact Details
              </h2>
              {(client.contact_views || 0) > 0 && (
                <p className="text-orange-600 text-xs font-medium mb-4 flex items-center gap-1">
                  <Icons.eye className="h-3.5 w-3.5" />
                  {client.contact_views} {client.contact_views === 1 ? 'person viewed' : 'people viewed'} this contact recently
                </p>
              )}
              <Contacts user={user} client={client} />
            </div>

            {/* Quick Stats */}
            <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-lg font-semibold mb-4">
                Quick Overview
              </h2>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Status</dt>
                  <dd className={`text-sm font-semibold ${client.verified ? 'text-lime-700 dark:text-lime-500' : ''}`}>{client.verified ? 'Verified' : 'Pending'}</dd>
                </div>
                {client.type === 'buyer' && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">Branches</dt>
                    <dd className="text-sm font-semibold">{client.branches || 1}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Scale</dt>
                  <dd className="text-sm font-semibold">{capitalizeFirstLetter(client.scale)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Industry</dt>
                  <dd className="text-sm font-semibold">{client.primary_category ? capitalizeFirstLetter(client.primary_category.name) : 'N/A'}</dd>
                </div>
                {client.type === 'buyer' && client.has_prices && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">Pricing</dt>
                    <dd className="text-sm font-semibold text-lime-700 dark:text-lime-500">Available</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
