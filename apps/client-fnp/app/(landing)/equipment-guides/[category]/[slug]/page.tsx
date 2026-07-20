import type { Metadata } from 'next'
import Image from "next/image"
import Link from "next/link"
import { BaseURL } from "@/lib/schemas"
import { buildGuideMetadata } from "@/lib/utilities"
import { GuideProductTitle } from "@/components/shared/GuideProductTitle"
import { WantToBuyCTA } from "@/components/shared/WantToBuyCTA"
import { ShareBar } from "@/components/shared/ShareBar"
import { AdSenseInFeed } from "@/components/ads/AdSenseInFeed"
import { guardTestItem } from "@/lib/guardTestItem"
import { ProductNotFound } from "@/components/shared/ProductNotFound"
import { SidebarPromo } from "@/components/ads/SidebarPromo"

type Props = { params: Promise<{ category: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params
  const res = await fetch(`${BaseURL}/equipment/${slug}`, { next: { revalidate: 3600 } }).catch(() => null)
  const product = res?.ok ? await res.json() : null

  if (!product) {
    return { title: 'Equipment Guide | farmnport.com' }
  }

  const categoryName = product.equipment_category?.name || category.replace(/-/g, ' ')
  const description = `${product.name}${product.brand?.name ? ` by ${product.brand.name}` : ''} — ${categoryName} equipment guide. View specifications and usage information on farmnport.com.`

  return buildGuideMetadata(product, categoryName, 'Specifications & Guide', description, `/equipment-guides/${category}/${slug}`)
}

interface GuidePageProps {
    params: Promise<{
        category: string
        slug: string
    }>
}

const fetchOptions: RequestInit = process.env.NODE_ENV === "production"
    ? { next: { revalidate: 3600 } } as RequestInit
    : { cache: "no-store" }

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
        "additionalProperty": [
            ...(product.specifications?.map((spec: any) => ({
                "@type": "PropertyValue",
                "name": spec.name,
                "value": spec.value
            })) || [])
        ],
    }

    return (
        <div className="min-h-screen bg-background">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            <div className="border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <nav className="flex text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/equipment-guides" className="hover:text-foreground">Equipment Guides</Link>
                        <span className="mx-2">/</span>
                        <Link href={`/equipment-guides/${category}`} className="hover:text-foreground capitalize">{product.equipment_category?.name || category}</Link>
                        <span className="mx-2">/</span>
                        <span className="text-foreground capitalize">{product.name}</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-[450px,1fr] gap-12 mb-16">
                    {/* Left - Image */}
                    <div className="flex flex-col gap-4">
                        <div className="relative aspect-square bg-white rounded-xl border overflow-hidden shadow-sm">
                            {product.images && product.images[0] && product.images[0].img?.src ? (
                                <Image
                                    src={product.images[0].img.src}
                                    alt={product.name}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 450px"
                                    className="object-contain p-8"
                                    priority
                                />
                            ) : (
                                <div className="absolute inset-0 bg-muted/30" />
                            )}
                        </div>

                        {product.images && product.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-3">
                                {product.images.slice(0, 4).map((img: any, idx: number) => (
                                    <button
                                        key={idx}
                                        className="relative aspect-square bg-white rounded-lg border hover:border-primary transition-colors"
                                    >
                                        {img.img?.src ? (
                                            <Image
                                                src={img.img.src}
                                                alt={`${product.name} ${idx + 1}`}
                                                fill
                                                sizes="(max-width: 1024px) 25vw, 100px"
                                                className="object-contain p-2"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-muted/30 rounded-lg" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        <WantToBuyCTA available_for_sale={product.available_for_sale} name={product.name} brand={product.brand?.name} href={`/buy-equipment/${slug}`} interestHref={`/interest/equipment/${slug}`} />

                        {/* Promo - fills remaining sidebar space */}
                        <div className="flex-1">
                            <SidebarPromo />
                        </div>
                    </div>

                    {/* Right - Product Info */}
                    <div className="space-y-6">
                        <GuideProductTitle name={product.name} brand={product.brand?.name} />
                        <div className="mt-3"><ShareBar name={product.name} /></div>

                        {product.equipment_category && (
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                    {product.equipment_category.name}
                                </div>
                            </div>
                        )}

                        <div className="h-px bg-border" />

                        {product.description && (
                            <div>
                                <h2 className="text-lg font-semibold mb-3 text-foreground">Overview</h2>
                                <p className="text-muted-foreground leading-relaxed text-sm">{product.description}</p>
                            </div>
                        )}

                        {product.brand && (
                            <div className="rounded-xl border bg-card p-4">
                                <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400 mb-2">Brand</h2>
                                <p className="text-sm text-foreground font-medium">{product.brand.name}</p>
                                {product.brand.country && (
                                    <p className="text-xs text-muted-foreground mt-1">{product.brand.country}</p>
                                )}
                            </div>
                        )}

                        <AdSenseInFeed />

                        {product.specifications && product.specifications.length > 0 && (
                            <div className="rounded-xl border bg-card p-4">
                                <h2 className="text-sm font-semibold uppercase tracking-wide text-green-700 dark:text-green-400 mb-3">Specifications</h2>
                                <dl className="space-y-2">
                                    {product.specifications.map((spec: any, idx: number) => (
                                        <div key={idx} className="flex justify-between gap-4 text-sm">
                                            <dt className="text-muted-foreground flex-shrink-0">{spec.name}</dt>
                                            <dd className="font-medium text-foreground text-right">{spec.value}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        )}

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
                    </div>
                </div>
            </div>
        </div>
    )
}
