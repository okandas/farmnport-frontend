"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { sendGTMEvent } from "@next/third-parties/google"
import Link from "next/link"

import { queryClient, recordContactView } from "@/lib/query"
import { ApplicationUser, AuthenticatedUser } from "@/lib/schemas"
import { capitalizeFirstLetter, makeAbbveriation, titleCase, formatDate } from "@/lib/utilities"
import { Icons } from "@/components/icons/lucide"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { BuyerPriceUploads } from "@/components/structures/buyer-price-uploads"
import { ClientActivity } from "@/components/structures/client-activity"
import { ShareBar } from "@/components/shared/ShareBar"


interface LatestPrices {
  date: string
  category: string
  entries: any[]
}

interface ClientPageProps {
  slug: string
  type?: "buyer" | "farmer"
  user: AuthenticatedUser | null
  latestPrices?: LatestPrices | null
}

export function Client({ slug, type, user, latestPrices }: ClientPageProps) {
  const router = useRouter()
  const [showPhone, setShowPhone] = useState(false)
  const [showWhatsapp, setShowWhatsapp] = useState(false)
  const [showEmail, setShowEmail] = useState(false)

  const { data, isError, isFetching } = useQuery({
    queryKey: [`result-client-${slug}`, slug, type],
    queryFn: () => queryClient(slug, type),
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
    <div className="w-full bg-background min-h-screen pb-12">
      {/* Back */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3">
        <button
          onClick={() => router.back()}
          className="text-sm font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <nav className="flex text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span className="mx-2">/</span>
            <Link href={`/${client.type}s`} className="hover:text-foreground capitalize">{client.type}s</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground capitalize">{name}</span>
          </nav>
          <ShareBar name={name} />
      </div>

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
                  {titleCase(client.name)}
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

              {client.short_description && (
                <p className="text-muted-foreground text-base max-w-3xl">
                  {capitalizeFirstLetter(client.short_description)}
                </p>
              )}

              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <div>
                  <p className="text-sm font-semibold">{formatDate(client.created)}</p>
                  <p className="text-xs text-muted-foreground">Date Joined</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {client.address
                      ? client.address.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                      : client.city && client.province
                      ? client.city.toLowerCase() === client.province.toLowerCase() ? capitalizeFirstLetter(client.city) : `${capitalizeFirstLetter(client.city)}, ${capitalizeFirstLetter(client.province)}`
                      : 'Location N/A'}
                  </p>
                  {client.address && client.city && client.province && (
                    <p className="text-xs text-muted-foreground">{client.city?.toLowerCase() === client.province?.toLowerCase() ? capitalizeFirstLetter(client.city) : `${capitalizeFirstLetter(client.city)}, ${capitalizeFirstLetter(client.province)}`}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Location</p>
                </div>
                {client.primary_category && (
                  <div>
                    <p className="text-sm font-semibold">{capitalizeFirstLetter(client.primary_category.name)}</p>
                    <p className="text-xs text-muted-foreground">Primary Category</p>
                  </div>
                )}
                {client.main_produce && (
                  <div>
                    <p className="text-sm font-semibold">{capitalizeFirstLetter(client.main_produce.name)}</p>
                    <p className="text-xs text-muted-foreground">Primary Product</p>
                  </div>
                )}
              </div>

              {/* Contact row */}
              {(client.phone || client.email || !user || (client.type === 'buyer' && client.branches)) && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                  {client.type === 'buyer' && client.branches > 0 && (
                    <div>
                      <p className="text-sm font-semibold">{client.branches === 1 ? '1 Branch' : `${client.branches} Branches`}</p>
                      <p className="text-xs text-muted-foreground">{client.branches === 1 ? 'Branch' : 'Branches'}</p>
                    </div>
                  )}
                  {(client.phone || !user) && (
                    <div>
                      {!user ? (
                        <button onClick={() => { sendGTMEvent({ event: 'login_prompt', reason: 'view_phone', client_name: client.name }); router.push(`/login?entity=${client.type}&wantToSee=${slug}`) }} className="text-sm font-semibold hover:text-primary transition-colors">
                          See Number →
                        </button>
                      ) : showPhone ? (
                        <a href={`tel:${client.phone}`} className="text-sm font-semibold hover:text-primary transition-colors">{client.phone}</a>
                      ) : (
                        <button onClick={() => { sendGTMEvent({ event: 'phone_reveal', client_name: client.name }); if (user?.id) recordContactView(user.id, client.id, "phone").catch(() => {}); setShowPhone(true) }} className="text-sm font-semibold hover:text-primary transition-colors">
                          Show Number →
                        </button>
                      )}
                      <p className="text-xs text-muted-foreground">Phone</p>
                    </div>
                  )}
                  {(client.phone || !user) && (
                    <div>
                      {!user ? (
                        <button onClick={() => { sendGTMEvent({ event: 'login_prompt', reason: 'view_whatsapp', client_name: client.name }); router.push(`/login?entity=${client.type}&wantToSee=${slug}`) }} className="text-sm font-semibold hover:text-primary transition-colors">
                          See WhatsApp →
                        </button>
                      ) : showWhatsapp ? (
                        <a href={`https://wa.me/263${client.phone.replace(/^0/, '')}`} target="_blank" rel="noopener noreferrer" onClick={() => sendGTMEvent({ event: 'whatsapp_click', client_name: client.name })} className="text-sm font-semibold hover:text-primary transition-colors">
                          Open WhatsApp →
                        </a>
                      ) : (
                        <button onClick={() => { sendGTMEvent({ event: 'whatsapp_reveal', client_name: client.name }); if (user?.id) recordContactView(user.id, client.id, "whatsapp").catch(() => {}); setShowWhatsapp(true) }} className="text-sm font-semibold hover:text-primary transition-colors">
                          Show WhatsApp →
                        </button>
                      )}
                      <p className="text-xs text-muted-foreground">WhatsApp</p>
                    </div>
                  )}
                  {(client.email || !user) && (
                    <div>
                      {!user ? (
                        <button onClick={() => { sendGTMEvent({ event: 'login_prompt', reason: 'view_email', client_name: client.name }); router.push(`/login?entity=${client.type}&wantToSee=${slug}`) }} className="text-sm font-semibold hover:text-primary transition-colors">
                          See Email →
                        </button>
                      ) : showEmail ? (
                        <a href={`mailto:${client.email}`} className="text-sm font-semibold hover:text-primary transition-colors">{client.email}</a>
                      ) : (
                        <button onClick={() => { sendGTMEvent({ event: 'email_reveal', client_name: client.name }); if (user?.id) recordContactView(user.id, client.id, "email").catch(() => {}); setShowEmail(true) }} className="text-sm font-semibold hover:text-primary transition-colors">
                          Show Email →
                        </button>
                      )}
                      <p className="text-xs text-muted-foreground">Email</p>
                    </div>
                  )}
                  {(client.has_booking || client.has_pickup) && client.type === 'buyer' && (
                    <div>
                      <Link href={`/book/${slug}`} className="text-sm font-semibold hover:text-primary transition-colors">
                        Book a Sale →
                      </Link>
                      <p className="text-xs text-muted-foreground">Sell to {titleCase(client.name)}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-8 space-y-6">

        {client.type === 'buyer' && latestPrices && latestPrices.entries?.length > 0 && (
          <div id="price-history">
            <BuyerPriceUploads clientName={client.name} latestPrices={latestPrices} />
          </div>
        )}

        <div id="activity">
          <ClientActivity slug={slug} />
        </div>
      </div>
    </div>
  )
}
