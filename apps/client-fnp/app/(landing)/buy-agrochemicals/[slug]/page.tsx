import { queryAgroChemical } from "@/lib/query"
import Link from "next/link"
import { ProductInteractive } from "./ProductInteractive"

interface BuyAgroChemicalPageProps {
    params: Promise<{ slug: string }>
}

export default async function BuyAgroChemicalPage({ params }: BuyAgroChemicalPageProps) {
    const { slug } = await params

    const response = await queryAgroChemical(slug)
    const chemical = response?.data

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'

    const structuredData = chemical ? {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": chemical.name,
        "image": chemical.images?.[0]?.img?.src || `${baseUrl}/default-chemical.png`,
        "description": chemical.agrochemical_category?.name
            ? `${chemical.name} - ${chemical.agrochemical_category.name} for effective pest and disease control`
            : `Professional agrochemical: ${chemical.name}`,
        "sku": chemical.id || slug,
        "category": chemical.agrochemical_category?.name || "Agrochemical",
        "brand": { "@type": "Brand", "name": chemical.brand?.name || "farmnport" },
        "offers": {
            "@type": "Offer",
            "url": `${baseUrl}/buy-agrochemicals/${slug}`,
            "priceCurrency": "USD",
            "price": chemical.show_price && chemical.sale_price > 0 ? (chemical.sale_price / 100).toFixed(2) : "0.00",
            "availability": chemical.available_for_sale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "seller": { "@type": "Organization", "name": "farmnport" }
        }
    } : null

    if (!chemical) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
                    <p className="text-muted-foreground">The product you&apos;re looking for doesn&apos;t exist.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {structuredData && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                />
            )}

            {/* Breadcrumb */}
            <div className="border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <nav className="flex text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/buy-agrochemicals" className="hover:text-foreground">Shop</Link>
                        <span className="mx-2">/</span>
                        <span className="text-foreground capitalize">{chemical.name}</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ProductInteractive chemical={chemical} slug={slug} baseUrl={baseUrl} />
            </div>
        </div>
    )
}
