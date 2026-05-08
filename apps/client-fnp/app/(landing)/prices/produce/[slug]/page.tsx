import { ProducePriceCardsView } from "@/components/structures/produce-price-cards-view"
import Link from "next/link"
import type { Metadata } from "next"
import { capitalizeFirstLetter } from "@/lib/utilities"

interface ProducePageProps {
  params: Promise<{ slug: string }>
}

const produceCategories = [
  { name: "Beef",    slug: "beef",    color: "bg-red-500" },
  { name: "Lamb",    slug: "lamb",    color: "bg-amber-500" },
  { name: "Mutton",  slug: "mutton",  color: "bg-orange-500" },
  { name: "Goat",    slug: "goat",    color: "bg-lime-600" },
  { name: "Chicken", slug: "chicken", color: "bg-yellow-500" },
  { name: "Pork",    slug: "pork",    color: "bg-pink-500" },
]

export async function generateMetadata({ params }: ProducePageProps): Promise<Metadata> {
  const { slug } = await params
  const produceName = capitalizeFirstLetter(slug.replace(/-/g, ' '))
  return {
    title: `${produceName} Prices Zimbabwe – Current Market Rates | farmnport.com`,
    description: `Browse current ${produceName.toLowerCase()} prices from buyers across Zimbabwe.`,
    alternates: { canonical: `/prices/produce/${slug}` },
    openGraph: {
      title: `${produceName} Prices Zimbabwe – Current Market Rates`,
      description: `Browse current ${produceName.toLowerCase()} prices from buyers across Zimbabwe.`,
      url: `/prices/produce/${slug}`,
      siteName: 'farmnport',
      type: 'website',
    },
  }
}

export default async function ProducePricePage({ params }: ProducePageProps) {
  const { slug } = await params
  const produceName = capitalizeFirstLetter(slug.replace(/-/g, ' '))

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${produceName} Prices in Zimbabwe`,
    "description": `Current ${produceName.toLowerCase()} market prices from buyers across Zimbabwe`,
    "url": `https://farmnport.com/prices/produce/${slug}`,
  }

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Top bar */}
      <div className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/prices" className="hover:text-foreground transition-colors">Prices</Link>
            <span>/</span>
            <Link href="/prices/produce/beef" className="hover:text-foreground transition-colors">Produce</Link>
            <span>/</span>
            <span className="text-foreground font-medium">{produceName}</span>
          </div>
          <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground hidden sm:block">USD · per kg</span>
        </div>
      </div>

      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <h1 className="text-2xl font-bold tracking-tight">{produceName} <span className="text-muted-foreground font-normal">Prices</span></h1>
        <p className="mt-1 text-sm text-muted-foreground">Current market rates from buyers across Zimbabwe</p>

        {/* Produce tabs */}
        <div className="flex flex-wrap gap-2 mt-5">
          {produceCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/prices/produce/${cat.slug}`}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                cat.slug === slug
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${cat.color}`} />
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Full-width table */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 min-h-[50lvh]">
        <ProducePriceCardsView produceSlug={slug} />
      </div>
    </main>
  )
}
