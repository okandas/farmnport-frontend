import Link from "next/link"
import { notFound } from "next/navigation"
import { MapPin, Scale, Calendar, Leaf } from "lucide-react"
import { LotsSidebar } from "@/components/layouts/lots-sidebar"
import { QuickLinks } from "@/components/generic/quick-links"
import { fetchLot } from "@/lib/serverFetch"
import { retrieveUser } from "@/lib/actions"
import { capitalizeFirstLetter, formatDate } from "@/lib/utilities"
import { AppURL } from "@/lib/schemas"

import type { Metadata } from "next"

type Props = {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const lot = await fetchLot(slug)
    if (!lot) return {}

    const produce = lot.farm_produce?.name ?? "Farm Produce"
    const breed = lot.breed?.name ? ` — ${lot.breed.name}` : ""
    const typeLabel = lot.type === "sell" ? "Selling" : "Buying"
    const province = lot.province ? `, ${capitalizeFirstLetter(lot.province)}` : ""

    const title = `${typeLabel}: ${produce}${breed}${province} | farmnport.com`
    const description = `${typeLabel} ${produce}${breed} in Zimbabwe. ${lot.quantity_kg.toLocaleString()} kg available${lot.price_per_kg_cents ? ` at $${(lot.price_per_kg_cents / 100).toFixed(2)}/kg` : " — price negotiable"}. ${lot.notes ?? ""}`

    return {
        title,
        description,
        alternates: { canonical: `/lots/${slug}` },
        openGraph: {
            title,
            description,
            url: `${AppURL}/lots/${slug}`,
            siteName: "farmnport",
            type: "website",
        },
    }
}

export default async function LotDetailPage({ params }: Props) {
    const { slug } = await params
    const [lot, user] = await Promise.all([fetchLot(slug), retrieveUser()])

    if (!lot) notFound()

    const produce = lot.farm_produce?.name ?? "Farm Produce"
    const breed = lot.breed?.name ?? null
    const isNegotiable = !lot.price_per_kg_cents || lot.price_per_kg_cents === 0
    const isSelling = lot.type === "sell"

    return (
        <main>
            <div className="border-b">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-3">
                    <nav className="flex text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/lots" className="hover:text-foreground">Lots</Link>
                        <span className="mx-2">/</span>
                        <span className="text-foreground">{produce}{breed ? ` — ${breed}` : ""}</span>
                    </nav>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-6 lg:px-8 min-h-[70lvh] py-8">
                <div className="lg:flex lg:space-x-10">

                    <div className="hidden lg:block lg:w-44 relative">
                        <LotsSidebar />
                    </div>

                    <div className="flex-1 min-w-0 space-y-5">

                        {/* Hero */}
                        <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${isSelling ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                                        {isSelling ? "Selling" : "Buying"}
                                    </span>
                                    {breed && (
                                        <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                                            {breed}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground shrink-0">Listed {formatDate(lot.created)}</p>
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                {produce}{breed ? ` — ${breed}` : ""}
                            </h1>
                            {(lot.city || lot.province) && (
                                <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
                                    <MapPin className="h-3.5 w-3.5" />
                                    <span className="capitalize">
                                        {lot.city ? `${capitalizeFirstLetter(lot.city)}, ` : ""}
                                        {capitalizeFirstLetter(lot.province)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Key stats */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-xl border bg-card p-4">
                                <p className="text-xs text-muted-foreground mb-1">Price</p>
                                <p className="text-2xl font-bold">
                                    {isNegotiable ? "Negotiable" : `$${(lot.price_per_kg_cents / 100).toFixed(2)}`}
                                </p>
                                {!isNegotiable && <p className="text-xs text-muted-foreground mt-0.5">per kg</p>}
                            </div>

                            <div className="rounded-xl border bg-card p-4">
                                <p className="text-xs text-muted-foreground mb-1">Quantity</p>
                                <p className="text-2xl font-bold">{lot.quantity_kg.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">kilograms</p>
                            </div>

                            <div className="rounded-xl border bg-card p-4">
                                <p className="text-xs text-muted-foreground mb-1">State</p>
                                <p className="text-2xl font-bold">{capitalizeFirstLetter(lot.form)}</p>
                            </div>
                        </div>

                        {/* Meta row */}
                        <div className="flex items-center gap-5 text-sm flex-wrap">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Scale className="h-3.5 w-3.5" />
                                <span>{lot.quantity_kg.toLocaleString()} kg available</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Leaf className="h-3.5 w-3.5" />
                                <span className="capitalize">{lot.form}</span>
                            </div>
                            {lot.expires_at && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>Expires {formatDate(lot.expires_at)}</span>
                                </div>
                            )}
                        </div>

                        {/* Notes */}
                        {lot.notes && (
                            <div className="rounded-xl border bg-card p-5">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Notes from seller</p>
                                <p className="text-sm leading-relaxed">{lot.notes}</p>
                            </div>
                        )}

                        {/* CTA */}
                        {!user && (
                            <Link
                                href={`/login?next=/lots/${slug}`}
                                className="block w-full text-center border border-border text-sm font-semibold px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                            >
                                Enquire about this lot →
                            </Link>
                        )}

                    </div>

                    <div className="hidden lg:block lg:w-44 shrink-0">
                        <QuickLinks />
                    </div>
                </div>
            </div>
        </main>
    )
}
