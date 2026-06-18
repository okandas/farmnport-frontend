import Link from "next/link"
import { notFound } from "next/navigation"
import { Calendar } from "lucide-react"
import { LotsSidebar } from "@/components/layouts/lots-sidebar"
import { QuickLinks } from "@/components/generic/quick-links"
import { fetchLot } from "@/lib/serverFetch"
import { retrieveUser } from "@/lib/actions"
import { capitalizeFirstLetter, formatDate, centsToDollars } from "@/lib/utilities"
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
    const description = `${typeLabel} ${produce}${breed} in Zimbabwe. ${lot.quantity.toLocaleString()} ${lot.unit} available at ${centsToDollars(lot.price_per_unit_cents)}/${lot.unit}. ${lot.notes ?? ""}`

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
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${isSelling ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                                        {isSelling ? "Selling" : "Buying"}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">Listed {formatDate(lot.created)}</p>
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight">{breed ?? produce}</h1>
                            {breed && (
                                <p className="text-sm text-muted-foreground mt-1">{produce}</p>
                            )}
                            {(lot.city || lot.province) && (
                                <p className="text-sm text-muted-foreground mt-0.5 capitalize">
                                    {lot.city ? `${capitalizeFirstLetter(lot.city)}, ` : ""}
                                    {capitalizeFirstLetter(lot.province)}
                                </p>
                            )}
                        </div>

                        {/* Key stats */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-xl border bg-card p-4">
                                <p className="text-xs text-muted-foreground mb-1">Price</p>
                                <p className="text-5xl font-bold">
                                    {centsToDollars(lot.price_per_unit_cents)}
                                </p>
                            </div>

                            <div className="rounded-xl border bg-card p-4">
                                <p className="text-xs text-muted-foreground mb-1">Quantity</p>
                                <p className="text-2xl font-bold">{lot.quantity.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{capitalizeFirstLetter(lot.unit)}</p>
                            </div>

                            <div className="rounded-xl border bg-card p-4">
                                <p className="text-xs text-muted-foreground mb-1">State</p>
                                <p className="text-2xl font-bold">{capitalizeFirstLetter(lot.form)}</p>
                            </div>
                        </div>

                        {/* Meta row */}
                        <div className="flex items-center gap-5 text-sm flex-wrap">
                            {lot.expires_at && (() => {
                                const days = Math.ceil((new Date(lot.expires_at).getTime() - Date.now()) / 86400000)
                                const expired = days <= 0
                                const urgent = days <= 5 && days > 0
                                const color = expired ? "text-red-600" : urgent ? "text-red-500" : "text-green-600"
                                const label = expired ? "Expired" : days === 1 ? "Expires in 1 day" : `Expires in ${days} days`
                                return (
                                    <div className={`flex items-center gap-1.5 ${color}`}>
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>{label} · {formatDate(lot.expires_at)}</span>
                                    </div>
                                )
                            })()}
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
