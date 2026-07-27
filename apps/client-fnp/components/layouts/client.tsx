"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Calendar, Phone, Mail, MessageCircle, ExternalLink } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { sendGTMEvent } from "@next/third-parties/google"
import Link from "next/link"

import { queryClient, recordContactView, listPreOrders } from "@/lib/query"
import { ApplicationUser, AuthenticatedUser } from "@/lib/schemas"
import { capitalizeFirstLetter, makeAbbveriation, titleCase, formatDate } from "@/lib/utilities"
import { Icons } from "@/components/icons/lucide"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BuyerPriceUploads } from "@/components/structures/buyer-price-uploads"
import { ClientActivity } from "@/components/structures/client-activity"
import { ShareBar } from "@/components/shared/ShareBar"
import { QuickLinks } from "@/components/generic/quick-links"

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

  const { data: preordersData } = useQuery({
    queryKey: ["client-preorders-sidebar", slug],
    queryFn: () => listPreOrders({ client_slug: slug }).then((r) => r.data),
  })

  const preorders: any[] = preordersData?.preorders ?? []
  const client = data?.data as ApplicationUser

  if (isError || isFetching || client === undefined) return null

  const hasActiveBookings = (client.has_booking || client.has_active_booking) && preorders.length > 0

  const name = titleCase(client.name)
  const city = client.city ? capitalizeFirstLetter(client.city) : ""
  const province = client.province ? capitalizeFirstLetter(client.province) : ""
  const location = city.toLowerCase() === province.toLowerCase() ? city : [city, province].filter(Boolean).join(", ")
  const produces = [client.main_produce, ...(client.other_produce ?? [])].filter(Boolean).map((p: any) => capitalizeFirstLetter(p.name))

  return (
    <div className="w-full bg-background min-h-screen pb-12">
      <div className="container pt-4 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link href={`/${client.type}s`} className="hover:text-foreground transition-colors capitalize">{client.type}s</Link>
            <span>/</span>
            <span className="text-foreground font-medium capitalize">{name}</span>
          </nav>
          <ShareBar name={name} />
        </div>
      </div>

      <div className="container">
        <div className="lg:flex lg:gap-8">
          {/* Left — Main content */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Profile header */}
            <div className="flex items-start gap-4 pt-4">
              <Avatar className="h-20 w-20 shrink-0 ring-2 ring-border shadow">
                <AvatarImage />
                <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                  {makeAbbveriation(client.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
                  {client.verified ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200 text-[10px]">
                      <Icons.verified className="h-3 w-3 mr-1" />Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px]">
                      <Icons.unverified className="h-3 w-3 mr-1" />Unverified
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-[10px]">{capitalizeFirstLetter(client.type)}</Badge>
                  {client.has_booking && (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200 text-[10px]">Accepts Online Bookings</Badge>
                  )}
                  {client.has_prices && (
                    <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50 text-[10px]">Pricing Available</Badge>
                  )}
                </div>
                {client.short_description && (
                  <p className="text-sm text-muted-foreground">{capitalizeFirstLetter(client.short_description)}</p>
                )}
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border rounded-lg p-4">
              {location && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm font-medium">
                      {client.address ? client.address.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : location}
                    </p>
                    {client.address && <p className="text-xs text-muted-foreground">{location}</p>}
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Date Joined</p>
                  <p className="text-sm font-medium">{formatDate(client.created)}</p>
                </div>
              </div>
              {client.primary_category && (
                <div className="flex items-start gap-3">
                  <Icons.info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p className="text-sm font-medium">{capitalizeFirstLetter(client.primary_category.name)}</p>
                  </div>
                </div>
              )}
              {client.main_produce && (
                <div className="flex items-start gap-3">
                  <Icons.tag className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Primary Product</p>
                    <p className="text-sm font-medium">{capitalizeFirstLetter(client.main_produce.name)}</p>
                  </div>
                </div>
              )}
              {client.payment_terms && (
                <div className="flex items-start gap-3">
                  <Icons.calender className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Payment Terms</p>
                    <p className="text-sm font-medium">{capitalizeFirstLetter(client.payment_terms)}</p>
                  </div>
                </div>
              )}
              {client.scale && (
                <div className="flex items-start gap-3">
                  <Icons.info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Scale</p>
                    <p className="text-sm font-medium">{capitalizeFirstLetter(client.scale)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Produces */}
            {produces.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">{client.type === "buyer" ? "Products They Buy" : "Products They Sell"}</h3>
                <div className="flex flex-wrap gap-2">
                  {produces.map((p) => (
                    <span key={p} className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground">{p}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Prices section (buyers only) */}
            {client.type === 'buyer' && latestPrices && latestPrices.entries?.length > 0 && (
              <div id="price-history">
                <BuyerPriceUploads clientName={client.name} latestPrices={latestPrices} />
              </div>
            )}

            {/* Activity — lots & bookings */}
            <div id="activity">
              <ClientActivity slug={slug} />
            </div>
          </div>

          {/* Right — Sticky sidebar */}
          <aside className="hidden lg:block lg:w-72 shrink-0">
            <div className="sticky top-20 space-y-4 pt-4">
              {/* Contact card — hidden when buyer has active bookings */}
              {!hasActiveBookings && (
                <div className="rounded-lg border bg-card p-5 space-y-3">
                  <h3 className="text-sm font-bold">Contact {name}</h3>
                  {(client.phone || !user) && (
                    <div>
                      {!user ? (
                        <Button variant="outline" className="w-full justify-start gap-2 text-sm" onClick={() => { sendGTMEvent({ event: 'login_prompt', reason: 'view_phone', client_name: client.name }); router.push(`/login?entity=${client.type}&wantToSee=${slug}`) }}>
                          <Phone className="h-4 w-4" />Log in to see number
                        </Button>
                      ) : showPhone ? (
                        <a href={`tel:${client.phone}`} className="flex items-center gap-2 w-full px-4 py-2 rounded-md border text-sm font-medium hover:bg-muted transition-colors">
                          <Phone className="h-4 w-4 text-primary" />{client.phone}
                        </a>
                      ) : (
                        <Button variant="outline" className="w-full justify-start gap-2 text-sm" onClick={() => { sendGTMEvent({ event: 'phone_reveal', client_name: client.name }); if (user?.id) recordContactView(user.id, client.id, "phone").catch(() => {}); setShowPhone(true) }}>
                          <Phone className="h-4 w-4" />Show Phone Number
                        </Button>
                      )}
                    </div>
                  )}
                  {(client.phone || !user) && (
                    <div>
                      {!user ? (
                        <Button variant="outline" className="w-full justify-start gap-2 text-sm" onClick={() => { sendGTMEvent({ event: 'login_prompt', reason: 'view_whatsapp', client_name: client.name }); router.push(`/login?entity=${client.type}&wantToSee=${slug}`) }}>
                          <MessageCircle className="h-4 w-4" />Log in to see WhatsApp
                        </Button>
                      ) : showWhatsapp ? (
                        <a href={`https://wa.me/263${client.phone.replace(/^0/, '')}`} target="_blank" rel="noopener noreferrer" onClick={() => sendGTMEvent({ event: 'whatsapp_click', client_name: client.name })} className="flex items-center gap-2 w-full px-4 py-2 rounded-md border text-sm font-medium hover:bg-muted transition-colors bg-green-50 border-green-200 text-green-800">
                          <MessageCircle className="h-4 w-4" />Open WhatsApp<ExternalLink className="h-3 w-3 ml-auto" />
                        </a>
                      ) : (
                        <Button variant="outline" className="w-full justify-start gap-2 text-sm" onClick={() => { sendGTMEvent({ event: 'whatsapp_reveal', client_name: client.name }); if (user?.id) recordContactView(user.id, client.id, "whatsapp").catch(() => {}); setShowWhatsapp(true) }}>
                          <MessageCircle className="h-4 w-4" />Show WhatsApp
                        </Button>
                      )}
                    </div>
                  )}
                  {(client.email || !user) && (
                    <div>
                      {!user ? (
                        <Button variant="outline" className="w-full justify-start gap-2 text-sm" onClick={() => { sendGTMEvent({ event: 'login_prompt', reason: 'view_email', client_name: client.name }); router.push(`/login?entity=${client.type}&wantToSee=${slug}`) }}>
                          <Mail className="h-4 w-4" />Log in to see email
                        </Button>
                      ) : showEmail ? (
                        <a href={`mailto:${client.email}`} className="flex items-center gap-2 w-full px-4 py-2 rounded-md border text-sm font-medium hover:bg-muted transition-colors">
                          <Mail className="h-4 w-4 text-primary" />{client.email}
                        </a>
                      ) : (
                        <Button variant="outline" className="w-full justify-start gap-2 text-sm" onClick={() => { sendGTMEvent({ event: 'email_reveal', client_name: client.name }); if (user?.id) recordContactView(user.id, client.id, "email").catch(() => {}); setShowEmail(true) }}>
                          <Mail className="h-4 w-4" />Show Email
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}

              <Link href="/bookings/new" className="block">
                <div className="rounded-lg border p-5 text-center hover:border-primary/40 hover:shadow-sm transition-all">
                  <p className="text-sm font-semibold">Create a Booking</p>
                  <p className="text-xs text-muted-foreground mt-1">Supply or buy produce on a regular basis</p>
                </div>
              </Link>

              <Link href="/lots/new" className="block">
                <div className="rounded-lg border p-5 text-center hover:border-primary/40 hover:shadow-sm transition-all">
                  <p className="text-sm font-semibold">List a Lot</p>
                  <p className="text-xs text-muted-foreground mt-1">Post your harvest and receive bids</p>
                </div>
              </Link>

              <QuickLinks />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
