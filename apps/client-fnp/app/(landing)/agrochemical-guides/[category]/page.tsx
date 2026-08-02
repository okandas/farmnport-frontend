import type { Metadata } from 'next'
import { serverFetch } from "@/lib/serverFetch"
import Link from "next/link"
import { AgroCategoryClient } from "./AgroCategoryClient"

const categoryDescriptions: Record<string, string> = {
    acaricides: "Products that control mites, ticks, and spider mites on crops. Essential for protecting vegetables, fruit trees, and ornamentals from mite damage.",
    fungicides: "Products that prevent and treat fungal diseases like rust, blight, and powdery mildew. Protect your crops from yield-destroying infections.",
    herbicides: "Products that control weeds competing with your crops for water, nutrients, and sunlight. Includes pre-emergent and post-emergent options.",
    insecticides: "Products that control harmful insects like aphids, bollworms, and stalk borers. Protect your crops from pest damage at every growth stage.",
    "foliar-feeds": "Liquid nutrients applied directly to plant leaves for fast absorption. Correct nutrient deficiencies and boost yields during critical growth stages.",
    "seed-treatments": "Products applied to seeds before planting to protect against soil-borne diseases, insects, and early-season pests. Gives seedlings a strong start.",
    fertilizers: "Soil and foliar nutrients that supply essential elements for crop growth. Includes granular, liquid, and specialty blends for different soil conditions.",
    nematicides: "Products that control plant-parasitic nematodes in the soil. Protect root systems from nematode damage that stunts growth and reduces yields.",
    rodenticides: "Products that control rats, mice, and other rodents that damage stored grain, crops, and farm infrastructure.",
    suckercides: "Products that suppress sucker growth on tobacco plants, redirecting energy to the main leaves for better quality and higher yields.",
}

type Props = { params: Promise<{ category: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  const name = category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const description = categoryDescriptions[category] || `Browse ${name.toLowerCase()} products for Zimbabwe farmers. Compare active ingredients, dosage rates, target pests, and application guidelines.`
  return {
    title: `${name} Zimbabwe – Products, Dosage Rates & Labels | farmnport.com`,
    description,
    keywords: `${name.toLowerCase()} zimbabwe, ${name.toLowerCase()} products, ${name.toLowerCase()} dosage rates, agrochemical guides zimbabwe, crop protection ${name.toLowerCase()}`,
    alternates: { canonical: `/agrochemical-guides/${category}` },
    openGraph: {
      title: `${name} Zimbabwe – Agrochemical Guides`,
      description: `Browse ${name.toLowerCase()} products for Zimbabwe farmers. Compare active ingredients, dosage rates, and application guidelines.`,
      url: `https://farmnport.com/agrochemical-guides/${category}`,
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

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://farmnport.com" },
            { "@type": "ListItem", "position": 2, "name": "Agrochemical Guides", "item": "https://farmnport.com/agrochemical-guides" },
            { "@type": "ListItem", "position": 3, "name": categoryName, "item": `https://farmnport.com/agrochemical-guides/${category}` },
        ],
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            {/* Breadcrumb */}
            <div className="border-b">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3">
                    <nav className="flex text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/agrochemical-guides" className="hover:text-foreground">Agrochemical Guides</Link>
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
                    <p className="text-lg text-muted-foreground max-w-2xl">
                        {categoryDescriptions[category] || `Browse our collection of ${categoryName.toLowerCase()} products`}
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
