import type { Metadata } from 'next'
import { serverFetch } from "@/lib/serverFetch"
import Link from "next/link"
import { AgroCategoryClient } from "./AgroCategoryClient"

type Props = { params: Promise<{ category: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  const name = category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  return {
    title: `${name} Zimbabwe – Products, Dosage Rates & Labels | farmnport.com`,
    description: `Browse ${name.toLowerCase()} products for Zimbabwe farmers. Compare active ingredients, dosage rates, target pests, and application guidelines.`,
    alternates: { canonical: `/agrochemical-guides/${category}` },
    openGraph: {
      title: `${name} Zimbabwe – Agrochemical Guides`,
      description: `Browse ${name.toLowerCase()} products for Zimbabwe farmers. Compare active ingredients, dosage rates, and application guidelines.`,
      siteName: 'farmnport',
      type: 'website',
    },
  }
}

interface CategoryPageProps {
    params: Promise<{
        category: string
    }>
}

export default async function AgroChemicalCategoryPage({ params }: CategoryPageProps) {
    const { category } = await params

    let initialChemicals: any[] = []
    let initialTotal = 0

    try {
        const result = await serverFetch(`/agrochemical/category/${category}`)
        initialChemicals = result?.data || []
        initialTotal = result?.total || 0
    } catch (error) {
        console.error("Error fetching agrochemicals by category:", error)
    }

    const categoryName = initialChemicals[0]?.agrochemical_category?.name || category
        .split('-')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            {/* Breadcrumb */}
            <div className="border-b">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3">
                    <nav className="flex text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/agrochemical-guides" className="hover:text-foreground">Guides</Link>
                        <span className="mx-2">/</span>
                        <span className="text-foreground capitalize">{categoryName}</span>
                    </nav>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight font-heading mb-4 capitalize">
                        {categoryName}
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Browse our collection of {categoryName.toLowerCase()} products
                    </p>
                </div>

                <AgroCategoryClient
                    category={category}
                    categoryName={categoryName}
                    initialChemicals={initialChemicals}
                    initialTotal={initialTotal}
                />
            </div>
        </div>
    )
}
