"use client"

import { useQuery } from "@tanstack/react-query"
import { sendGTMEvent } from "@next/third-parties/google"
import Link from "next/link"

import { queryClient } from "@/lib/query"
import { ApplicationUser, AuthenticatedUser } from "@/lib/schemas"
import { capitalizeFirstLetter, makeAbbveriation, titleCase } from "@/lib/utilities"
import { Icons } from "@/components/icons/lucide"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Contacts } from "@/components/layouts/contacts"
import { BuyerContacts } from "@/components/structures/buyer-contacts"
import { ProductResources } from "@/components/monetization/product-resources"


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

  if (isError) {
    return null
  }
  if (isFetching) {
    return null
  }

  if (client === undefined) {
    return null
  }

  const name = titleCase(client.name)


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
                {client.has_booking && (
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">
                    Accepts Online Bookings
                  </Badge>
                )}
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
            {/* Buyer Contacts (buyers only) */}
            {client.type === 'buyer' && (
              <BuyerContacts clientId={client.id} clientName={client.name} user={user} />
            )}



          </div>

          {/* Right Sidebar - Contact (1/3 width) */}
          <div className="space-y-6">
            {client.has_booking && client.type === 'buyer' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-3">
                <div>
                  <p className="font-semibold text-sm text-blue-900">Sell to {capitalizeFirstLetter(client.name)}</p>
                  <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                    This buyer accepts online delivery bookings. Reserve your drop-off slot directly from the platform.
                  </p>
                </div>
                <Link
                  href={`/book-delivery/${client.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="block w-full text-center bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-800 transition-colors"
                >
                  Book a Sale →
                </Link>
              </div>
            )}

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

          </div>
        </div>
      </div>
    </div>
  )
}
