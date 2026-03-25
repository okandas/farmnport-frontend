import { ProducePriceCardsView } from "@/components/structures/produce-price-cards-view"
import { ActionsSidebar } from "@/components/generic/actions-sidebar"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { Metadata } from "next"
import { capitalizeFirstLetter } from "@/lib/utilities"

interface ProducePageProps {
  params: Promise<{ slug: string }>
}

const produceCategories = [
  { name: "Beef", slug: "beef", color: "bg-red-500" },
  { name: "Lamb", slug: "lamb", color: "bg-amber-500" },
  { name: "Mutton", slug: "mutton", color: "bg-orange-500" },
  { name: "Goat", slug: "goat", color: "bg-lime-600" },
  { name: "Chicken", slug: "chicken", color: "bg-yellow-500" },
  { name: "Pork", slug: "pork", color: "bg-pink-500" },
]

export async function generateMetadata({ params }: ProducePageProps): Promise<Metadata> {
  const { slug } = await params
  const produceName = capitalizeFirstLetter(slug.replace(/-/g, ' '))

  return {
    title: `${produceName} Prices Zimbabwe – Current Market Rates | farmnport.com`,
    description: `Browse current ${produceName.toLowerCase()} prices from buyers across Zimbabwe. Compare rates, view buyer profiles, and sell your ${produceName.toLowerCase()} at competitive prices.`,
    alternates: {
      canonical: `/prices/produce/${slug}`,
    },
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

      <section className="border-b">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-6 pb-8">
          <Link
            href="/prices"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Market Prices
          </Link>
          <p className="text-xs font-semibold text-primary tracking-wide uppercase">Prices by Produce</p>
          <h1 className="mt-1 text-3xl font-bold font-heading tracking-tight">
            {produceName} Prices
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Current {produceName.toLowerCase()} market prices from buyers across Zimbabwe.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 lg:px-8 py-8 min-h-[50lvh]">
        {/* Mobile produce pills */}
        <div className="lg:hidden flex flex-wrap gap-1.5 mb-6">
          {produceCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/prices/produce/${cat.slug}`}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                cat.slug === slug
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border bg-card text-muted-foreground hover:text-foreground hover:border-primary/20"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        <div className="lg:grid lg:grid-cols-[180px_1fr_220px] lg:gap-8">
          {/* Left — produce nav */}
          <nav className="hidden lg:block">
            <div className="sticky top-20">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Produce</p>
              <div className="space-y-0.5">
                {produceCategories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/prices/produce/${cat.slug}`}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                      cat.slug === slug
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <div className={`h-2 w-2 rounded-full ${cat.color}`} />
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* Center — price cards */}
          <div className="min-w-0">
            <ProducePriceCardsView produceSlug={slug} />
          </div>

          {/* Right — sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-20">
              <ActionsSidebar type="buyers" product={slug} />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
