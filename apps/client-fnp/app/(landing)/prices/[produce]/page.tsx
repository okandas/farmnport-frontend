import Link from "next/link"
import { ProduceBoardRouter } from "@/components/structures/produce-board-router"
import type { Metadata } from "next"
import { capitalizeFirstLetter } from "@/lib/utilities"

interface ProducePageProps {
  params: Promise<{ produce: string }>
  searchParams: Promise<{ code?: string; type?: string }>
}

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3744"

const TYPE_NAMES: Record<string, string> = {
  lwt: "Liveweight",
  cdm: "Cold Dress Mass",
  ph: "Per Head",
}

async function getGradeName(produce: string, code: string): Promise<string> {
  try {
    const res = await fetch(`${BASE}/v1/prices/series/summary`, { next: { revalidate: 3600 } })
    if (!res.ok) return capitalizeFirstLetter(code)
    const data = await res.json()
    const series = data?.data ?? []
    const match = series.find((s: any) =>
      s.code?.toLowerCase() === code.toLowerCase() &&
      s.category?.toLowerCase() === produce.toLowerCase()
    )
    return match?.name ?? capitalizeFirstLetter(code)
  } catch {
    return capitalizeFirstLetter(code)
  }
}

const PRODUCE_SEO: Record<string, { keywords: string; description: string }> = {
  beef: {
    keywords: "beef prices zimbabwe, cold dress mass beef, beef market rates, beef per kg zimbabwe, beef grades zimbabwe",
    description: "Current beef prices in Zimbabwe from verified buyers. Compare cold dress mass rates by grade — super, choice, commercial, manufacturing. Updated weekly in USD.",
  },
  cattle: {
    keywords: "cattle prices zimbabwe, liveweight cattle prices, cattle market rates, cattle per kg zimbabwe, livestock prices",
    description: "Current liveweight cattle prices in Zimbabwe from verified buyers. Compare rates by grade and weight category across all major buyers. Updated weekly in USD.",
  },
  chicken: {
    keywords: "chicken prices zimbabwe, broiler prices, chicken market rates, poultry prices zimbabwe, chicken per kg",
    description: "Current chicken and broiler prices in Zimbabwe from verified buyers. Compare live bird and dressed prices by weight category. Updated weekly in USD.",
  },
  pork: {
    keywords: "pork prices zimbabwe, pig prices, pork market rates, pork per kg zimbabwe, pig carcass prices",
    description: "Current pork and pig prices in Zimbabwe from verified buyers. Compare cold dress mass rates by grade. Updated weekly in USD.",
  },
  goat: {
    keywords: "goat prices zimbabwe, goat meat prices, goat market rates, chevon prices zimbabwe, goat per kg",
    description: "Current goat prices in Zimbabwe from verified buyers. Compare liveweight and cold dress mass rates. Updated weekly in USD.",
  },
  mutton: {
    keywords: "mutton prices zimbabwe, sheep prices, lamb prices zimbabwe, mutton market rates, mutton per kg",
    description: "Current mutton and lamb prices in Zimbabwe from verified buyers. Compare cold dress mass rates by grade. Updated weekly in USD.",
  },
  lamb: {
    keywords: "lamb prices zimbabwe, lamb market rates, lamb per kg zimbabwe, sheep prices, lamb cold dress mass",
    description: "Current lamb prices in Zimbabwe from verified buyers. Compare cold dress mass and liveweight rates by grade. Updated weekly in USD.",
  },
  sheep: {
    keywords: "sheep prices zimbabwe, sheep market rates, ewe prices, ram prices zimbabwe, sheep per head",
    description: "Current sheep prices in Zimbabwe from verified buyers. Compare ewe, ram, and lamb prices by weight and grade. Updated weekly in USD.",
  },
}

export async function generateMetadata({ params, searchParams }: ProducePageProps): Promise<Metadata> {
  const { produce } = await params
  const { code, type } = await searchParams
  const produceName = capitalizeFirstLetter(produce.replace(/-/g, ' '))
  const seo = PRODUCE_SEO[produce.toLowerCase()]

  const codeName = code ? await getGradeName(produce, code) : ""
  const typeName = type ? TYPE_NAMES[type.toLowerCase()] ?? "" : ""

  // Build SEO strings based on whether code/type filters are active
  const hasFilters = codeName || typeName
  const filterLabel = [codeName, typeName].filter(Boolean).join(" ")

  const title = hasFilters
    ? `${filterLabel} ${produceName} Prices Zimbabwe | farmnport.com`
    : `${produceName} Prices Zimbabwe – Current Market Rates | farmnport.com`

  const description = hasFilters
    ? `Current ${filterLabel.toLowerCase()} ${produceName.toLowerCase()} prices in Zimbabwe from verified buyers. Compare rates by grade updated weekly in USD on farmnport.com.`
    : seo?.description ?? `Compare current ${produceName.toLowerCase()} prices from verified buyers across Zimbabwe. Grade-by-grade pricing updated weekly in USD on farmnport.com.`

  const filterKeywords = hasFilters
    ? `${filterLabel.toLowerCase()} ${produceName.toLowerCase()} prices zimbabwe, ${filterLabel.toLowerCase()} prices, ${codeName.toLowerCase()} prices zimbabwe`
    : ""
  const keywords = [
    filterKeywords,
    seo?.keywords ?? `${produceName.toLowerCase()} prices zimbabwe, ${produceName.toLowerCase()} market rates, ${produceName.toLowerCase()} per kg zimbabwe`,
  ].filter(Boolean).join(", ")

  return {
    title,
    description,
    keywords,
    alternates: { canonical: `/prices/${produce}` },
    openGraph: {
      title,
      description,
      url: `https://farmnport.com/prices/${produce}`,
      siteName: 'farmnport',
      type: 'website',
    },
  }
}

export default async function ProducePricePage({ params, searchParams }: ProducePageProps) {
  const { produce } = await params
  const { code, type } = await searchParams
  const produceName = capitalizeFirstLetter(produce.replace(/-/g, ' '))

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://farmnport.com" },
      { "@type": "ListItem", "position": 2, "name": "Prices", "item": "https://farmnport.com/prices" },
      { "@type": "ListItem", "position": 3, "name": `${produceName} Prices`, "item": `https://farmnport.com/prices/${produce}` },
    ],
  }

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": `${produceName} Prices Zimbabwe`,
    "description": PRODUCE_SEO[produce.toLowerCase()]?.description ?? `Compare current ${produceName.toLowerCase()} prices from verified buyers across Zimbabwe.`,
    "url": `https://farmnport.com/prices/${produce}`,
    "isPartOf": { "@type": "WebSite", "name": "farmnport", "url": "https://farmnport.com" },
    "about": {
      "@type": "Product",
      "name": produceName,
      "category": "Agricultural Commodities",
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-4">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link href="/prices" className="hover:text-foreground transition-colors">Prices</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{produceName}</span>
        </nav>
      </div>
      <h1 className="sr-only">{produceName} Prices Zimbabwe – Current Market Rates</h1>
      <ProduceBoardRouter produce={produce} code={code ?? ""} priceType={type ?? ""} />
    </>
  )
}
