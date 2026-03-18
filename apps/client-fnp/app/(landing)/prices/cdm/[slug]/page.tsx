import { CdmPriceCard } from "@/components/structures/cdm-price-card"
import { RelatedCdmPricesSidebar } from "@/components/structures/related-cdm-prices-sidebar"
import { formatDate, capitalizeFirstLetter, slug as slugify } from "@/lib/utilities"
import { AppURL } from "@/lib/schemas"
import axios from "axios"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Calendar, ArrowLeft } from "lucide-react"
import type { Metadata } from "next"

interface CdmDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

async function getCdmPriceBySlug(slug: string) {
  try {
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3744"
    const response = await axios.get(`${baseURL}/v1/cdmprices/all?p=1&limit=100`)
    const prices = response.data?.data || []

    const price = prices.find((p: any) => {
      const pDate = new Date(p.effectiveDate).toISOString().split('T')[0]
      const pSlug = `${p.client_name.toLowerCase().replace(/\s+/g, '-')}-${pDate}`
      return pSlug === slug
    })

    return { price: price || null, allPrices: prices }
  } catch {
    return { price: null, allPrices: [] }
  }
}

export async function generateMetadata({ params }: CdmDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const { price } = await getCdmPriceBySlug(slug)

  if (!price) {
    return { title: 'CDM Price List Not Found | farmnport.com' }
  }

  const name = capitalizeFirstLetter(price.client_name)
  const date = formatDate(price.effectiveDate)

  return {
    alternates: {
      canonical: `${AppURL}/prices/cdm/${slug}`,
    },
    title: `${name} CDM Cattle Prices — ${date} | farmnport.com`,
    description: `${name} Cold Dress Mass cattle pricing effective ${date}. Carcass grades and liveweight prices per kg in USD and ZiG.`,
    openGraph: {
      title: `${name} — CDM Cattle Price List`,
      description: `${name} Cold Dress Mass cattle pricing effective ${date}. View carcass grades and liveweight prices on Farmnport.`,
      url: `${AppURL}/prices/cdm/${slug}`,
      siteName: 'farmnport',
      type: 'website',
    },
  }
}

export default async function CdmPriceDetailPage({ params }: CdmDetailPageProps) {
  const { slug } = await params
  const { price, allPrices } = await getCdmPriceBySlug(slug)

  if (!price) {
    notFound()
  }

  const formattedDate = formatDate(price.effectiveDate)

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${price.client_name} CDM Price List`,
    "description": `Cold Dress Mass cattle pricing from ${price.client_name} effective ${formattedDate}`,
    "datePublished": price.effectiveDate,
    "publisher": {
      "@type": "Organization",
      "name": price.client_name
    },
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "item": { "@type": "Product", "name": "Commercial Grade CDM", "offers": { "@type": "Offer", "price": price.carcass_grades.commercial.delivered_usd, "priceCurrency": "USD" } } },
      { "@type": "ListItem", "position": 2, "item": { "@type": "Product", "name": "Economy Grade CDM", "offers": { "@type": "Offer", "price": price.carcass_grades.economy.delivered_usd, "priceCurrency": "USD" } } },
      { "@type": "ListItem", "position": 3, "item": { "@type": "Product", "name": "Manufacturing Grade CDM", "offers": { "@type": "Offer", "price": price.carcass_grades.manufacturing.delivered_usd, "priceCurrency": "USD" } } },
    ]
  }

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12 min-h-[70lvh]">
        {/* Back link */}
        <Link
          href="/prices/cdm"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to CDM Prices
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold font-heading">
              {capitalizeFirstLetter(price.client_name)}
            </h1>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted px-2.5 py-1 rounded">
              CDM
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Effective:</span>
              <span className="font-medium text-foreground">{formattedDate}</span>
            </div>

            {price.exchange_rate > 0 && (
              <div className="text-muted-foreground">
                1 USD = {price.exchange_rate} ZiG
              </div>
            )}
          </div>
        </div>

        <div className="lg:flex lg:items-start lg:gap-8">
          <div className="flex-1">
            <CdmPriceCard price={price} hideHeader />
          </div>

          <aside className="hidden lg:block lg:w-72 lg:flex-shrink-0 sticky top-20 self-start">
            <RelatedCdmPricesSidebar
              currentClientName={price.client_name}
              currentPriceId={price.id}
              allPrices={allPrices}
            />
          </aside>
        </div>

        {/* Mobile: Related prices at bottom */}
        <div className="mt-8 lg:hidden">
          <RelatedCdmPricesSidebar
            currentClientName={price.client_name}
            currentPriceId={price.id}
            allPrices={allPrices}
          />
        </div>
      </div>
    </main>
  )
}
