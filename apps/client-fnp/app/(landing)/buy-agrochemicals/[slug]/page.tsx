import { queryAgroChemical } from "@/lib/query"
import Link from "next/link"
import { Beaker } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BuyProductInteractive } from "@/components/shop/BuyProductInteractive"

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

    const tabs = ["overview", "active-ingredients", ...(chemical.targets?.length > 0 ? ["targets"] : [])]

    const tabsContent = (
        <Tabs defaultValue="overview">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-1">
                {tabs.map((tab) => (
                    <TabsTrigger key={tab} value={tab} className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-sm px-3 pb-2 capitalize">
                        {tab.replace("-", " ")}
                    </TabsTrigger>
                ))}
            </TabsList>
            <TabsContent value="overview" className="mt-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {chemical.product_overview
                        ? chemical.product_overview
                        : chemical.agrochemical_category?.name
                        ? <>This is a <span className="font-medium capitalize">{chemical.agrochemical_category.name}</span> designed for effective pest and disease control when used as directed.</>
                        : `${chemical.name} is a professional agrochemical for crop protection.`}
                </p>
            </TabsContent>
            <TabsContent value="active-ingredients" className="mt-4">
                {chemical.active_ingredients?.length > 0 ? (
                    <div className="divide-y">
                        {chemical.active_ingredients.map((ai: any, idx: number) => (
                            <div key={idx} className="flex justify-between py-2 text-sm">
                                <span className="capitalize">{ai.name}</span>
                                <span className="font-semibold">{ai.dosage_value} {ai.dosage_unit}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground mt-4">No information available.</p>
                )}
            </TabsContent>
            {chemical.targets?.length > 0 && (
                <TabsContent value="targets" className="mt-4">
                    <ul className="space-y-1.5">
                        {chemical.targets.map((target: any, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0 mt-1.5" />
                                <span>
                                    <span className="font-medium">{target.name}</span>
                                    {target.scientific_name && (
                                        <span className="text-xs text-muted-foreground italic ml-1">({target.scientific_name})</span>
                                    )}
                                </span>
                            </li>
                        ))}
                    </ul>
                </TabsContent>
            )}
        </Tabs>
    )

    return (
        <div className="min-h-screen bg-background">
            {structuredData && (
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
            )}
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
                <BuyProductInteractive
                    product={chemical}
                    slug={slug}
                    baseUrl={baseUrl}
                    productType="agrochemical"
                    categoryName={chemical.agrochemical_category?.name}
                    brandHref={chemical.brand ? `/buy-agrochemicals?brand=${chemical.brand.id}` : undefined}
                    shopHref="/buy-agrochemicals"
                    guideHref={`/agrochemical-guides/${chemical.agrochemical_category?.slug || ""}/${slug}?from=buy-agrochemicals/${slug}`}
                    loginRedirect={`/buy-agrochemicals/${slug}`}
                    fallbackIcon={<Beaker className="w-28 h-28 text-muted-foreground/20" />}
                    tabsContent={tabsContent}
                />
            </div>
        </div>
    )
}
