import type { Metadata } from 'next'
import { BaseURL } from "@/lib/schemas"
import { buildGuideMetadata } from "@/lib/utilities"
import { guardTestItem } from "@/lib/guardTestItem"
import { ProductNotFound } from "@/components/shared/ProductNotFound"
import { GuideDetailLayout } from "@/components/shared/GuideDetailLayout"
import { AdSenseInFeed } from "@/components/ads/AdSenseInFeed"
import { WantToBuyCTA } from "@/components/shared/WantToBuyCTA"

type Props = { params: Promise<{ category: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params
  const res = await fetch(`${BaseURL}/equipment/${slug}`, { cache: "no-store" }).catch(() => null)
  const product = res?.ok ? await res.json() : null

  if (!product) {
    return { title: 'Equipment Guide | farmnport.com', robots: { index: false } }
  }

  const categoryName = product.equipment_category?.name || category.replace(/-/g, ' ')
  const description = `${product.name}${product.brand?.name ? ` by ${product.brand.name}` : ''} — ${categoryName} equipment guide. View specifications and usage information on farmnport.com.`

  return buildGuideMetadata(product, categoryName, 'Specifications & Guide', description, `/equipment-guides/${category}/${slug}`, product.images?.[0]?.img?.src)
}

const fetchOptions: RequestInit = { cache: "no-store" }

interface GuidePageProps {
    params: Promise<{ category: string; slug: string }>
}

export default async function EquipmentGuidePage({ params }: GuidePageProps) {
    const { category, slug } = await params
    const res = await fetch(`${BaseURL}/equipment/${slug}`, fetchOptions)
    const product = res.ok ? await res.json() : null

    await guardTestItem(!!product?.is_test)

    if (!product) {
        return <ProductNotFound title="Equipment Guide Not Found" description="The equipment guide you're looking for doesn't exist or may have been removed." primary={{ href: "/equipment-guides", label: "Browse Equipment Guides" }} secondary={{ href: "/buy-equipment", label: "Buy Equipment" }} />
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'
    const url = `${baseUrl}/equipment-guides/${category}/${slug}`
    const imageUrl = product.images?.[0]?.img?.src || `${baseUrl}/default-product.png`

    const description = product.equipment_category?.name
        ? `${product.name} is a ${product.equipment_category.name} equipment product. View specifications and usage information.`
        : `Farm equipment guide for ${product.name}. Complete specifications and usage information.`

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": description,
        "image": imageUrl,
        "category": product.equipment_category?.name || "Farm Equipment",
        "url": url,
        "brand": product.brand?.name ? { "@type": "Brand", "name": product.brand.name } : undefined,
        "additionalProperty": product.specifications?.map((spec: any) => ({
            "@type": "PropertyValue",
            "name": spec.name,
            "value": spec.value
        })) || [],
    }

    return (
        <GuideDetailLayout
            product={product}
            breadcrumbs={[
                { label: "Equipment Guides", href: "/equipment-guides" },
                { label: product.equipment_category?.name || category, href: `/equipment-guides/${category}` },
                { label: product.name, href: url },
            ]}
            categoryBadge={product.equipment_category ? { label: product.equipment_category.name } : undefined}
            buyHref={`/buy-equipment/${slug}`}
            interestHref={`/interest/equipment/${slug}`}
            safetyText="Always follow manufacturer guidelines when operating farm equipment. Wear appropriate protective gear and ensure proper training before use."
            structuredData={structuredData}
        >
            {/* Overview */}
            {product.description && (
                <div>
                    <h2 className="text-lg font-semibold mb-3 text-foreground">Overview</h2>
                    <p className="text-muted-foreground leading-relaxed text-sm">{product.description}</p>
                </div>
            )}

            {/* Want to Buy CTA */}
            <WantToBuyCTA
                available_for_sale={product.available_for_sale}
                name={product.name}
                brand={product.brand?.name}
                href={`/buy-equipment/${slug}`}
                interestHref={`/interest/equipment/${slug}`}
            />

            <AdSenseInFeed />

            {/* Grouped specs */}
            {product.spec_groups && product.spec_groups.length > 0 && (
                <div className="border overflow-hidden">
                    {product.spec_groups.map((group: any, gIdx: number) => (
                        <div key={gIdx}>
                            <div className="bg-muted px-4 py-2 text-xs font-bold uppercase tracking-wider border-b">
                                {group.name}
                            </div>
                            <dl className="divide-y divide-border">
                                {group.specs.map((spec: any, sIdx: number) => (
                                    <div key={sIdx} className="flex justify-between gap-4 px-4 py-2 text-sm">
                                        <dt className="text-muted-foreground">{spec.name}</dt>
                                        <dd className="font-medium text-foreground text-right">{spec.value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    ))}
                </div>
            )}

            {/* Fallback: flat specs */}
            {(!product.spec_groups || product.spec_groups.length === 0) && product.specifications && product.specifications.length > 0 && (
                <div className="rounded-xl border bg-card p-4">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-green-700 dark:text-green-400 mb-3">Specifications</h2>
                    <dl className="space-y-2">
                        {product.specifications.map((spec: any, idx: number) => (
                            <div key={idx} className="flex justify-between gap-4 text-sm">
                                <dt className="text-muted-foreground flex-shrink-0">{typeof spec === "string" ? spec : spec.name}</dt>
                                <dd className="font-medium text-foreground text-right">{typeof spec === "string" ? "" : spec.value}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            )}

            {/* Features */}
            {product.features && product.features.length > 0 && (
                <div className="rounded-xl border bg-card p-4">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3">Features</h2>
                    <ul className="space-y-1.5">
                        {product.features.map((feature: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400 flex-shrink-0 mt-1.5" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </GuideDetailLayout>
    )
}
