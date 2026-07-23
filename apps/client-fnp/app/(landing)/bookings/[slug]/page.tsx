import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { bookingsEnabled, preorderDepositEnabled } from "@/flags"
import { serverFetch } from "@/lib/serverFetch"
import { guardTestItem } from "@/lib/guardTestItem"
import PreOrderDetailClient from "./PreOrderDetailClient"

interface Props {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        const { slug } = await params
        const res = await serverFetch(`/booking/preorders/${slug}`).catch(() => null)
        const p = res?.preorder
        if (!p) return { title: 'Booking | farmnport.com', robots: { index: false } }

        const supplier = p.client_name || p.brand_name || ""
        const produce = p.produce_name || ""
        const isBuyer = p.market_side === "demand"
        const action = isBuyer ? "Buying" : "Selling"
        const cta = isBuyer ? "Supply Now" : "Book Now"

        const title = `${supplier} ${action} ${produce} — ${cta} | farmnport`
        const description = p.description || (isBuyer
            ? `${supplier} is looking for ${produce}. Supply them now on farmnport.com.`
            : `${supplier} is selling ${produce}. Pre-order now on farmnport.com — secure your stock before it sells out.`)
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://farmnport.com"

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                url: `${baseUrl}/bookings/${slug}`,
                images: p.image_src ? [{ url: p.image_src }] : [],
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
    } catch {
        return { robots: { index: false } }
    }
}

export default async function PreOrderDetailPage({ params }: Props) {
    const { slug } = await params
    const showBookings = await bookingsEnabled()
    if (!showBookings) notFound()

    const res = await serverFetch(`/booking/preorders/${slug}`).catch(() => null)
    const preorder = res?.preorder ?? null
    if (!preorder) notFound()
    await guardTestItem(!!preorder.is_test)

    const depositEnabled = await preorderDepositEnabled()

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://farmnport.com"
    const isBuyer = preorder.market_side === "demand"
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": `${preorder.client_name || preorder.brand_name || "Supplier"} — ${preorder.produce_name || "Farm Produce"}`,
        "image": preorder.image_src ? [preorder.image_src] : [`${baseUrl}/og-image.png`],
        "description": preorder.description || `${isBuyer ? "Buying" : "Selling"} ${preorder.produce_name || "farm produce"} on farmnport.com`,
        "sku": preorder.id || slug,
        "category": "Farm Bookings",
        "offers": {
            "@type": "Offer",
            "url": `${baseUrl}/bookings/${slug}`,
            "priceCurrency": "USD",
            "price": preorder.deposit_cents ? (preorder.deposit_cents / 100).toFixed(2) : "0.00",
            "availability": preorder.status === "active" ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
            "itemCondition": "https://schema.org/NewCondition",
            "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            "seller": { "@type": "Organization", "name": "farmnport" },
        },
    }

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
            <PreOrderDetailClient preorder={preorder} depositEnabled={depositEnabled} />
        </>
    )
}
