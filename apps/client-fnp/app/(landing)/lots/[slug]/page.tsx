import Link from "next/link"
import { notFound } from "next/navigation"
import { Calendar } from "lucide-react"
import { LotImageGallery } from "@/components/ui/lot-image-gallery"
import { QuickLinks } from "@/components/generic/quick-links"
import { PlaceBidForm } from "@/components/forms/place-bid"
import { LotBidsPanel } from "@/components/layouts/lot-bids-panel"
import { fetchLot, fetchLotBids, fetchMyBidOnLot } from "@/lib/serverFetch"
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
    const [lot, user, bidsData, myBidData] = await Promise.all([fetchLot(slug), retrieveUser(), fetchLotBids(slug), fetchMyBidOnLot(slug)])

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

                    {/* Main — two column split */}
                    <div className="flex-1 min-w-0">
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                            {/* LEFT — lot details */}
                            <div className="lg:col-span-3 space-y-5">

                                <LotImageGallery mainImage={lot.main_image} images={lot.images} />

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold border ${isSelling ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-green-50 text-green-700 border-green-200"}`}>
                                            {isSelling ? "Selling" : "Buying"}
                                        </span>
                                        <p className="text-xs text-muted-foreground">Listed {formatDate(lot.created)}</p>
                                    </div>
                                    <div className="flex items-start justify-between gap-4">
                                        <h1 className="text-3xl font-bold tracking-tight">{breed ?? produce}</h1>
                                        <div className="text-right shrink-0">
                                            <p className="text-xs font-mono font-semibold text-foreground">Lot #{slug.split("-").pop()}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{produce}{breed ? ` — ${breed}` : ""}</p>
                                        </div>
                                    </div>
                                    {(lot.city || lot.province) && (
                                        <p className="text-sm text-muted-foreground mt-0.5 capitalize">
                                            {lot.city ? `${capitalizeFirstLetter(lot.city)}, ` : ""}
                                            {capitalizeFirstLetter(lot.province)}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="rounded-xl border bg-card p-4">
                                        <p className="text-xs text-muted-foreground mb-1">Listed price</p>
                                        <p className="text-2xl font-bold">{centsToDollars(lot.price_per_unit_cents)}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">per {lot.unit}</p>
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

                                {lot.expires_at && (() => {
                                    const days = Math.ceil((new Date(lot.expires_at).getTime() - Date.now()) / 86400000)
                                    const expired = days <= 0
                                    const urgent = days <= 5 && days > 0
                                    const color = expired ? "text-red-600" : urgent ? "text-red-500" : "text-green-600"
                                    const label = expired ? "Expired" : days === 1 ? "Expires in 1 day" : `Expires in ${days} days`
                                    return (
                                        <div className={`flex items-center gap-1.5 text-sm ${color}`}>
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span>{label} · {formatDate(lot.expires_at)}</span>
                                        </div>
                                    )
                                })()}

                                {lot.notes && (
                                    <div className="rounded-xl border bg-card p-5">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                                            Notes from {isSelling ? "seller" : "buyer"}
                                        </p>
                                        <p className="text-sm leading-relaxed">{lot.notes}</p>
                                    </div>
                                )}

                                {/* Bid activity */}
                                <div>
                                    <LotBidsPanel
                                        total={bidsData?.total ?? 0}
                                        bids={bidsData?.bids ?? []}
                                        top_bid={bidsData?.top_bid ?? null}
                                        accepted={bidsData?.accepted ?? null}
                                        myBidId={(myBidData as any)?.id}
                                    />
                                </div>

                            </div>

                            {/* RIGHT — bid panel */}
                            <div className="lg:col-span-2">
                                <div className="lg:sticky lg:top-24 rounded-xl border bg-card p-6">
                                    {user && (user as any).id === lot.client_id ? (
                                        <div className="text-center space-y-2 py-2">
                                            <p className="text-sm font-semibold text-foreground">This is your lot</p>
                                            <p className="text-xs text-muted-foreground">You cannot place an offer on your own listing.</p>
                                        </div>
                                    ) : user ? (
                                        <PlaceBidForm lot={lot} topBidCents={bidsData?.top_bid?.offered_price_per_unit_cents} />
                                    ) : (
                                        <div className="text-center space-y-4">
                                            <div className="space-y-1">
                                                <p className="text-base font-semibold">Interested in this lot?</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Sign in to place an offer directly with the {isSelling ? "seller" : "buyer"}.
                                                </p>
                                            </div>
                                            <Link
                                                href={`/login?next=/lots/${slug}`}
                                                className="inline-flex items-center justify-center w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                                            >
                                                Sign in to place an offer
                                            </Link>
                                            <Link
                                                href={`/signup?next=/lots/${slug}`}
                                                className="inline-flex items-center justify-center w-full rounded-lg border px-4 py-2.5 text-sm font-semibold hover:bg-muted transition-colors"
                                            >
                                                Create a free account
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                    <div className="hidden lg:block lg:w-44 shrink-0">
                        <QuickLinks />
                    </div>
                </div>
            </div>
        </main>
    )
}
