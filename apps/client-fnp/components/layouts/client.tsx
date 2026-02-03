"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { queryClient, queryClientPricing } from "@/lib/query"
import { ApplicationUser, AuthenticatedUser } from "@/lib/schemas"
import { capitalizeFirstLetter, makeAbbveriation, plural, formatDate } from "@/lib/utilities"
import { Icons } from "@/components/icons/lucide"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Contacts } from "@/components/layouts/contacts"


interface ClientPageProps {
  slug: string
  user: AuthenticatedUser | null
}

export function Client({ slug, user }: ClientPageProps) {
  const [pricingPage, setPricingPage] = useState(1)

  const { data, isError, isFetching } = useQuery({
    queryKey: [`result-client-${slug}`, slug],
    queryFn: () => queryClient(slug),
    refetchOnWindowFocus: false
  })

  const client = data?.data as ApplicationUser

  // Fetch pricing data separately (only for buyers with pricing)
  const { data: pricingData, isLoading: pricingLoading } = useQuery({
    queryKey: [`client-pricing-${client?.id}`, client?.id, pricingPage],
    queryFn: () => queryClientPricing(client?.id || '', { p: pricingPage }),
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

  const pricingRelations = pricingData?.data?.data || []
  const pricingTotal = pricingData?.data?.total || 0
  const pricingPageCount = Math.ceil(pricingTotal / 20)

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

      {/* Main Content with Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">
              {client.type === 'farmer' ? 'Products' : 'Pricing'}
            </TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
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
                        <Icons.creditCard className="h-3.5 w-3.5" />
                        Payment Terms
                      </dt>
                      <dd className="text-base font-semibold">
                        {client.payment_terms ? capitalizeFirstLetter(client.payment_terms) : 'N/A'}
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
                    <div className="space-y-1">
                      <dt className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                        <Icons.shoppingBag className="h-3.5 w-3.5" />
                        {client.type === 'farmer' ? 'Other Products' : 'Other Interests'}
                      </dt>
                      <dd className="text-base font-semibold">
                        {client.other_produce && client.other_produce.length > 0
                          ? client.other_produce
                              .filter(p => p.name !== client.main_produce?.name)
                              .map(p => capitalizeFirstLetter(p.name))
                              .join(', ') || 'N/A'
                          : 'N/A'}
                      </dd>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Sidebar - Contact & Quick Info (1/3 width) */}
              <div className="space-y-6">
                {/* Contact Card */}
                <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Icons.phone className="h-5 w-5 text-primary" />
                    Contact
                  </h2>
                  <Contacts user={user} client={client} />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Activity Tab - Products or Pricing */}
          <TabsContent value="activity" className="space-y-6">
            {client.type === 'farmer' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">Products & Produce</h2>
                  {client.main_produce && (
                    <div className="mb-4">
                      <h3 className="text-sm text-muted-foreground mb-2">Primary Product</h3>
                      <Badge className="text-base px-4 py-2">{capitalizeFirstLetter(client.main_produce.name)}</Badge>
                    </div>
                  )}
                  {client.other_produce && client.other_produce.length > 0 && (
                    <div>
                      <h3 className="text-sm text-muted-foreground mb-2">Other Products</h3>
                      <div className="flex flex-wrap gap-2">
                        {client.other_produce.map((produce, index) => (
                          <Badge key={index} variant="outline">
                            {capitalizeFirstLetter(produce.name)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="bg-card border rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-2">Product Details</h2>
                  <p className="text-sm text-muted-foreground">Detailed product information coming soon</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {pricingLoading ? (
                  <div className="bg-card border rounded-xl p-12 shadow-sm">
                    <div className="flex flex-col items-center justify-center">
                      <Icons.spinner className="h-8 w-8 animate-spin text-primary mb-4" />
                      <p className="text-sm text-muted-foreground">Loading pricing data...</p>
                    </div>
                  </div>
                ) : client.has_prices && pricingRelations.length > 0 ? (
                  <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/20">
                            <th className="text-left py-3 px-6 text-sm font-semibold text-muted-foreground">Effective Date</th>
                            <th className="text-left py-3 px-6 text-sm font-semibold text-muted-foreground">Type</th>
                            <th className="text-left py-3 px-6 text-sm font-semibold text-muted-foreground">Category</th>
                            <th className="text-right py-3 px-6 text-sm font-semibold text-muted-foreground">Product Tags</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pricingRelations.map((priceList: any, index: number) => {
                            // Count available products
                            const productKeys = ['beef', 'lamb', 'mutton', 'goat', 'chicken', 'pork', 'slaughter', 'catering']
                            const availableProducts = productKeys.filter(key => {
                              const product = priceList[key]
                              return product && (product.hasPrice === true || product.HasPrice === true)
                            })
                            const tagCount = availableProducts.length

                            return (
                              <tr key={index} className="border-b last:border-b-0 hover:bg-muted/10 transition-colors">
                                <td className="py-4 px-6">
                                  <div className="flex items-center gap-2">
                                    <Icons.calender className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{formatDate(priceList.effectiveDate)}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  <Badge variant="outline" className="font-medium">
                                    {capitalizeFirstLetter(priceList.pricing_basis || 'Live Weight')}
                                  </Badge>
                                </td>
                                <td className="py-4 px-6 text-sm">
                                  {capitalizeFirstLetter(priceList.client_specialization || client.primary_category?.name || '-')}
                                </td>
                                <td className="py-4 px-6 text-right">
                                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                    {tagCount} {tagCount === 1 ? 'Product' : 'Products'}
                                  </Badge>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {pricingPageCount > 1 && (
                      <div className="p-6 border-t bg-muted/10">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            Page {pricingPage} of {pricingPageCount} • {pricingTotal} total price {pricingTotal === 1 ? 'list' : 'lists'}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPricingPage(p => Math.max(1, p - 1))}
                              disabled={pricingPage === 1 || pricingLoading}
                            >
                              <Icons.chevronLeft className="h-4 w-4 mr-1" />
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPricingPage(p => Math.min(pricingPageCount, p + 1))}
                              disabled={pricingPage === pricingPageCount || pricingLoading}
                            >
                              Next
                              <Icons.chevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Icons.circleDollarSign className="h-16 w-16 text-muted-foreground/30 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Pricing Available</h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        This buyer hasn't shared pricing information yet. Check back later or contact them directly for pricing details.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Insights Tab - Recommendations & Matching */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Icons.sparkles className="h-5 w-5 text-primary" />
                  {client.type === 'farmer' ? 'Agro Chemical Matches' : 'Supplier Matches'}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {client.type === 'farmer'
                    ? 'Based on your products, we recommend these agro chemicals'
                    : 'Farmers matching your product interests'}
                </p>
                <div className="bg-muted/50 rounded-lg p-8 text-center">
                  <Icons.sparkles className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">Coming soon</p>
                </div>
              </div>
              <div className="bg-card border rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Icons.barChart className="h-5 w-5 text-primary" />
                  Market Insights
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Market trends and analytics for your products
                </p>
                <div className="bg-muted/50 rounded-lg p-8 text-center">
                  <Icons.barChart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">Coming soon</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}


