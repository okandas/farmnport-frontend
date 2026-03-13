"use client"

import { useQuery } from "@tanstack/react-query"
import { sendGTMEvent } from "@next/third-parties/google"

import { queryClient, queryClientPricing } from "@/lib/query"
import { ApplicationUser, AuthenticatedUser } from "@/lib/schemas"
import { capitalizeFirstLetter, makeAbbveriation, plural } from "@/lib/utilities"
import { paymentTermsLabel } from "@/components/structures/repository/data"
import { Icons } from "@/components/icons/lucide"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Contacts } from "@/components/layouts/contacts"


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
                      <p className="text-xl font-bold">{client.branches <= 1 ? 1 : client.branches}</p>
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
                    <Icons.leaf className="h-4 w-4 text-muted-foreground" />
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

      {/* Quick Stats Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Status */}
          <div className="bg-card border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <p className="text-lg font-bold">
                {client.verified ? 'Verified' : 'Pending'}
              </p>
            </div>
          </div>

          {/* Branches - Only for buyers */}
          {client.type === 'buyer' && (
            <div className="bg-card border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Branches</p>
                <p className="text-lg font-bold">{client.branches || 1}</p>
              </div>
            </div>
          )}

          {/* Scale */}
          <div className="bg-card border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Scale</p>
              <p className="text-lg font-bold">{capitalizeFirstLetter(client.scale)}</p>
            </div>
          </div>

          {/* Pricing or Category */}
          {client.type === 'buyer' && client.has_prices ? (
            <div className="bg-card border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Pricing</p>
                <p className="text-lg font-bold text-green-700">Available</p>
              </div>
            </div>
          ) : (
            <div className="bg-card border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Industry</p>
                <p className="text-lg font-bold">
                  {client.primary_category ? capitalizeFirstLetter(client.primary_category.name) : 'N/A'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business Details Card */}
            <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Icons.info className="h-5 w-5 text-primary" />
                Business Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                    <Icons.tag className="h-3.5 w-3.5" />
                    Category
                  </dt>
                  <dd className="text-base font-semibold">
                    {client.primary_category ? capitalizeFirstLetter(client.primary_category.name) : 'N/A'}
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                    <Icons.package className="h-3.5 w-3.5" />
                    Main Product
                  </dt>
                  <dd className="text-base font-semibold">
                    {client.main_produce?.name ? capitalizeFirstLetter(client.main_produce.name) : 'N/A'}
                  </dd>
                </div>
              </div>
            </div>

            {/* Also Buying/Growing */}
            <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Icons.shoppingBag className="h-5 w-5 text-primary" />
                {client.type === 'farmer' ? 'Also Growing' : 'Also Buying'}
              </h2>
              {client.other_produce && client.other_produce.length > 0
                ? (
                  <ul className="list-disc list-inside space-y-1.5">
                    {client.other_produce
                      .filter(p => p.name !== client.main_produce?.name)
                      .map((p, i) => (
                        <li key={i} className="text-sm font-medium">{capitalizeFirstLetter(p.name)}</li>
                      ))}
                  </ul>
                )
                : <p className="text-sm text-muted-foreground">No additional products listed</p>}
            </div>

            {/* Pricing (buyers only) */}
            {client.type === 'buyer' && (
              <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Icons.lock className="h-5 w-5 text-primary" />
                  Pricing
                </h2>
                <div className="flex items-center gap-2 mb-4">
                  <Icons.creditCard className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Payment Terms:</span>
                  <span className="text-sm font-semibold">{paymentTermsLabel(client.payment_terms)}</span>
                </div>
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
                    <Button
                      onClick={() => sendGTMEvent({ event: 'link', value: 'SubscribePricingFromDetailPage' })}
                    >
                      <Icons.lock className="h-4 w-4 mr-2" />
                      Unlock Pricing
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-4 border-t">
                    This buyer hasn&apos;t shared pricing information yet. Check back later or contact them directly for pricing details.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar - Contact (1/3 width) */}
          <div className="space-y-6">
            <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Icons.phone className="h-5 w-5 text-primary" />
                Contact
              </h2>
              <Contacts user={user} client={client} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


