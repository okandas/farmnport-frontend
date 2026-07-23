import Link from "next/link"
import { notFound } from "next/navigation"
import { LotImageGallery } from "@/components/ui/lot-image-gallery"
import { LotCountdown } from "@/components/ui/lot-countdown"
import { QuickLinks } from "@/components/generic/quick-links"
import { PlaceBidForm } from "@/components/forms/place-bid"
import { LotBidsPanel } from "@/components/layouts/lot-bids-panel"
import { fetchLot, fetchLotBids, fetchMyBidOnLot } from "@/lib/serverFetch"
import { retrieveUser } from "@/lib/actions"
import { capitalizeFirstLetter, formatDate, centsToDollars } from "@/lib/utilities"
import { PayBidButton } from "@/components/ui/pay-bid-button"
import { ShareBar } from "@/components/shared/ShareBar"
import { AppURL } from "@/lib/schemas"
import { guardTestItem } from "@/lib/guardTestItem"

import type { Metadata } from "next"

type Props = {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const lot = await fetchLot(slug)
    if (!lot) return { title: 'Lot | farmnport.com', robots: { index: false } }

    const produce = lot.farm_produce?.name ?? "Farm Produce"
    const breed = lot.breed?.name ? ` — ${lot.breed.name}` : ""
    const typeLabel = lot.type === "sell" ? "Selling" : "Buying"
    const province = lot.province ? `, ${capitalizeFirstLetter(lot.province)}` : ""

    const title = `${typeLabel}: ${produce}${breed}${province} | farmnport.com`
    const description = `${typeLabel} ${produce}${breed} in Zimbabwe. ${lot.quantity.toLocaleString()} ${lot.unit} available at ${centsToDollars(Math.round(lot.price_per_unit_cents * 1.069))}/${lot.unit}. ${lot.notes ?? ""}`

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
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: ["/og-image.png"],
        },
    }
}

export default async function LotDetailPage({ params }: Props) {
    const { slug } = await params
    const [lot, user, bidsData, myBidData] = await Promise.all([fetchLot(slug), retrieveUser(), fetchLotBids(slug), fetchMyBidOnLot(slug)])

    if (!lot) notFound()

    await guardTestItem(!!lot.is_test)

    const produce = lot.farm_produce?.name ?? "Farm Produce"
    const breed = lot.breed?.name ?? null
    const isSelling = lot.type === "sell"
    const isOwner = user && (user as any).id === lot.client_id
    const myBid = isOwner ? null : myBidData
    const isExpired = lot.expires_date && lot.expires_time
        ? new Date(`${lot.expires_date}T${lot.expires_time}:00Z`).getTime() < Date.now()
        : false

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": `${produce}${breed ? ` — ${breed}` : ""}`,
        "image": lot.images?.[0]?.img?.src ? [lot.images[0].img.src] : [`${AppURL}/og-image.png`],
        "description": lot.notes || `${isSelling ? "Selling" : "Buying"} ${produce} in Zimbabwe`,
        "sku": lot.id || slug,
        "category": "Farm Lots",
        "offers": {
            "@type": "Offer",
            "url": `${AppURL}/lots/${slug}`,
            "priceCurrency": "USD",
            "price": lot.price_per_unit_cents > 0 ? (lot.price_per_unit_cents / 100).toFixed(2) : "0.00",
            "availability": isExpired ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
            "itemCondition": "https://schema.org/NewCondition",
            "priceValidUntil": lot.expires_at || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            "seller": { "@type": "Organization", "name": "farmnport" },
        },
    }

    return (
        <main>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
            <div className="border-b">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-3">
                    <nav className="flex text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/buy" className="hover:text-foreground">Buy</Link>
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
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between gap-4">
                                        <div>
                                            {isSelling ? (
                                                (lot.city || lot.province) && (
                                                    <p className="text-sm text-muted-foreground capitalize">
                                                        {lot.city ? `${capitalizeFirstLetter(lot.city)}, ` : ""}
                                                        {capitalizeFirstLetter(lot.province)}
                                                    </p>
                                                )
                                            ) : (
                                                <p className="text-sm text-muted-foreground">
                                                    Lot for buyer looking for {produce}{breed ? ` ${breed}` : ""}
                                                    {(lot.city || lot.province) && (
                                                        <span className="capitalize"> in {lot.city ? `${capitalizeFirstLetter(lot.city)}, ` : ""}{capitalizeFirstLetter(lot.province)}</span>
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                        <ShareBar name={breed ?? produce} />
                                    </div>
                                </div>

                                {(lot.main_image || lot.images?.length > 0 || bidsData?.accepted?.supply_images) && (
                                    <LotImageGallery
                                        mainImage={(bidsData?.accepted as any)?.supply_images?.main_image ?? lot.main_image}
                                        images={(bidsData?.accepted as any)?.supply_images?.images ?? lot.images ?? []}
                                    />
                                )}

                                {bidsData?.accepted && (
                                    <div className="text-center">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-foreground mb-1">Deal agreed</p>
                                        <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                                            {centsToDollars(bidsData.accepted.offered_price_per_unit_cents)}
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="rounded-xl border bg-card p-4">
                                        <p className="text-xs text-muted-foreground mb-1">Listed price</p>
                                        <p className="text-2xl font-bold">{centsToDollars(Math.round(lot.price_per_unit_cents * 1.069))}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">per {lot.unit} incl. fees</p>
                                    </div>
                                    <div className="rounded-xl border bg-card p-4">
                                        <p className="text-xs text-muted-foreground mb-1">Quantity</p>
                                        <p className="text-2xl font-bold">{lot.quantity.toLocaleString()}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{capitalizeFirstLetter(lot.unit)}</p>
                                    </div>
                                    {lot.produce_condition?.name && (
                                    <div className="rounded-xl border bg-card p-4">
                                        <p className="text-xs text-muted-foreground mb-1">Condition</p>
                                        <p className="text-2xl font-bold">{capitalizeFirstLetter(lot.produce_condition.name)}</p>
                                    </div>
                                    )}
                                </div>

                            </div>

                            {/* RIGHT — bid action, countdown, notes, offers */}
                            <div className="lg:col-span-2">
                                <div className="lg:sticky lg:top-24 space-y-4">
                                    <div className={isExpired ? "" : "rounded-xl bg-card p-5"}>
                                        {isExpired && bidsData?.accepted && (myBid as any)?.status !== "accepted" ? (
                                            <div className="space-y-1">
                                                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Awaiting payment</p>
                                                <p className="text-xs text-muted-foreground">
                                                    A bid has been accepted and is pending payment. This lot could reopen if payment is not completed within 24 hours.
                                                </p>
                                            </div>
                                        ) : isExpired ? (
                                            <div className="space-y-1">
                                                <p className="text-sm font-semibold text-foreground">Bidding has closed</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {bidsData?.accepted?.status === "paid" || bidsData?.accepted?.status === "completed"
                                                        ? "This lot has a fulfilled order."
                                                        : "This lot is no longer accepting offers."}
                                                </p>
                                            </div>
                                        ) : !lot.moderated ? (
                                            <div className="space-y-1">
                                                <p className="text-sm font-semibold text-foreground">Coming soon</p>
                                                <p className="text-xs text-muted-foreground">This lot is not yet open for bidding — check back shortly.</p>
                                            </div>
                                        ) : user && (user as any).id === lot.client_id ? (
                                            <div className="space-y-3">
                                                <p className="text-sm font-semibold text-foreground">This is your lot</p>
                                                <p className="text-xs text-muted-foreground">Review and respond to offers from your account.</p>
                                                <Link
                                                    href={`/account/lots/${slug}`}
                                                    className="inline-flex items-center justify-center w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                                                >
                                                    Manage Offers
                                                </Link>
                                            </div>
                                        ) : bidsData?.accepted ? (
                                            <div className="space-y-2">
                                                <p className="text-sm font-semibold text-foreground">Offer accepted</p>
                                                <p className="text-xs text-muted-foreground">This lot has an accepted offer and is no longer accepting new bids.</p>
                                                {["accepted", "paid", "completed"].includes((myBid as any)?.status) && (myBid as any)?.id && (
                                                    <Link
                                                        href={`/account/bids/${(myBid as any).id}`}
                                                        className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                                                    >
                                                        Manage your bid →
                                                    </Link>
                                                )}
                                            </div>
                                        ) : user && !lot.has_accepted_bid ? (
                                            <PlaceBidForm lot={lot} topBidCents={bidsData?.top_bid?.offered_price_per_unit_cents} />
                                        ) : user && lot.has_accepted_bid && ["accepted", "paid", "completed"].includes((myBid as any)?.status) && (myBid as any)?.id ? (
                                            <div className="space-y-2">
                                                <p className="text-sm font-semibold text-green-700 dark:text-green-400">Your bid won</p>
                                                <Link
                                                    href={`/account/bids/${(myBid as any).id}`}
                                                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                                                >
                                                    Manage your bid →
                                                </Link>
                                            </div>
                                        ) : !user ? (
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
                                        ) : null}
                                    </div>

                                    {lot.expires_at && !lot.has_accepted_bid && (
                                        <LotCountdown expiresAt={lot.expires_at} formattedDate={formatDate(lot.expires_at)} />
                                    )}

                                    {lot.notes && (
                                        <div className="py-2">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                                                Notes from {isSelling ? "seller" : "buyer"}
                                            </p>
                                            <p className="text-sm leading-relaxed">{lot.notes}</p>
                                        </div>
                                    )}

                                    <LotBidsPanel
                                        slug={slug}
                                        lotType={lot.type}
                                        myBidId={(myBid as any)?.id}
                                        myBidMainImage={(myBid as any)?.supply_images?.main_image ?? null}
                                        myBidImages={(myBid as any)?.supply_images?.images ?? []}
                                    />

                                    {isExpired && (myBid as any)?.status === "accepted" && (
                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <p className="text-sm font-semibold text-foreground">Your bid was accepted!</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Complete payment within 24 hours to secure this lot.
                                                </p>
                                            </div>
                                            <PayBidButton bidId={(myBid as any)?.id} />
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
