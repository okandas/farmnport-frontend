import type { Metadata } from 'next'
import Link from "next/link"
import { BaseURL } from "@/lib/schemas"
import { EquipmentCategoryClient } from "./EquipmentCategoryClient"

type Props = { params: Promise<{ category: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  const name = category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  return {
    title: `${name} – Farm Equipment Guides | farmnport.com`,
    description: `Browse ${name.toLowerCase()} equipment guides. Compare specifications, brands, and usage information.`,
    alternates: { canonical: `/equipment-guides/${category}` },
    openGraph: {
      title: `${name} – Farm Equipment Guides`,
      description: `Browse ${name.toLowerCase()} equipment guides. Compare specifications, brands, and usage information.`,
      siteName: 'farmnport',
      type: 'website',
    },
  }
}

const fetchOptions: RequestInit = process.env.NODE_ENV === "production"
    ? { next: { revalidate: 3600 } } as RequestInit
    : { cache: "no-store" }

async function getCategoryProducts(category: string) {
    try {
        const res = await fetch(`${BaseURL}/equipment/category/${category}`, fetchOptions)
        if (!res.ok) return { data: [], total: 0 }
        const json = await res.json()
        return { data: json?.data || [], total: json?.total || 0 }
    } catch {
        return { data: [], total: 0 }
    }
}

interface CategoryPageProps {
    params: Promise<{
        category: string
    }>
}

export default async function EquipmentCategoryPage({ params }: CategoryPageProps) {
    const { category } = await params
    const { data: products, total } = await getCategoryProducts(category)

    const categoryName = products[0]?.equipment_category?.name || category

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="border-b">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3">
                    <nav className="flex text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/equipment-guides" className="hover:text-foreground">Equipment Guides</Link>
                        <span className="mx-2">/</span>
                        <span className="text-foreground capitalize">{categoryName}</span>
                    </nav>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-6">
                <EquipmentCategoryClient
                    category={category}
                    categoryName={categoryName}
                    initialProducts={products}
                    initialTotal={total}
                />
            </div>
        </div>
    )
}
