import { PriceDetailsGrid } from "@/components/structures/price-details-grid"
import { RelatedPricesSidebar } from "@/components/structures/related-prices-sidebar"
import { ContactBuyerButton } from "@/components/structures/contact-buyer-button"
import { formatDate, capitalizeFirstLetter } from "@/lib/utilities"
import { AppURL } from "@/lib/schemas"
import axios from "axios"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Calendar, Building2, ArrowLeft } from "lucide-react"
import { auth } from "@/auth"
import type { Metadata } from "next"

const validProduce = ["beef", "lamb", "mutton", "goat", "chicken", "pork", "slaughter"]

interface ProducePageProps {
  params: Promise<{
    slug: string
    produce: string
  }>
}

async function getPriceListBySlug(slug: string) {
  try {
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3744"
    const response = await axios.get(`${baseURL}/v1/prices/all?p=1&limit=100`)
    const priceLists = response.data?.data || []

    const priceList = priceLists.find((pl: any) => {
      const plDate = new Date(pl.effectiveDate).toISOString().split('T')[0]
      const plSlug = `${pl.client_name.toLowerCase().replace(/\s+/g, '-')}-${plDate}`
      return plSlug === slug
    })

    return { priceList: priceList || null, allPrices: priceLists }
  } catch (error) {
    return { priceList: null, allPrices: [] }
  }
}

export async function generateMetadata({ params }: ProducePageProps): Promise<Metadata> {
  const { slug, produce } = await params

  if (!validProduce.includes(produce)) {
    return { title: 'Not Found | farmnport.com' }
  }

  const { priceList } = await getPriceListBySlug(slug)

  if (!priceList || !priceList[produce]) {
    return { title: 'Price List Not Found | farmnport.com' }
  }

  const name = capitalizeFirstLetter(priceList.client_name)
  const produceName = capitalizeFirstLetter(produce)
  const date = formatDate(priceList.effectiveDate.toString())

  return {
    title: `${produceName} Prices — ${name} ${date} | farmnport.com`,
    description: `${name} ${produceName.toLowerCase()} price list effective ${date}. View current ${produceName.toLowerCase()} market rates by grade — delivered and collected prices.`,
    alternates: {
      canonical: `${AppURL}/prices/${slug}/${produce}`,
    },
    openGraph: {
      title: `${produceName} Prices — ${name} ${date}`,
      description: `${name} ${produceName.toLowerCase()} price list effective ${date}. View current market rates on Farmnport.`,
      url: `${AppURL}/prices/${slug}/${produce}`,
      siteName: 'farmnport',
      type: 'website',
    },
  }
}

export default async function ProduceDetailPage({ params }: ProducePageProps) {
  const { slug, produce } = await params

  if (!validProduce.includes(produce)) {
    notFound()
  }

  const { priceList, allPrices } = await getPriceListBySlug(slug)
  const session = await auth()

  if (!priceList || !priceList[produce]) {
    notFound()
  }

  const formattedDate = formatDate(priceList.effectiveDate.toString())
  const produceName = capitalizeFirstLetter(produce)

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `${produceName} — ${capitalizeFirstLetter(priceList.client_name)}`,
    "description": `${produceName} price list from ${capitalizeFirstLetter(priceList.client_name)} effective ${formattedDate}`,
    "brand": {
      "@type": "Organization",
      "name": priceList.client_name
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "validFrom": priceList.effectiveDate,
    },
  }

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12 min-h-[70lvh]">
        <Link
          href={`/prices/produce/${produce}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to {produceName} Prices
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-4xl font-bold font-heading">
              {produceName} Prices — {capitalizeFirstLetter(priceList.client_name)}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Buyer:</span>
              <Link href={`/buyer/${priceList.client_name.toLowerCase().replace(/\s+/g, '-')}`} className="font-medium text-primary hover:underline">
                {capitalizeFirstLetter(priceList.client_name)}
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Effective:</span>
              <span className="font-medium text-card-foreground">{formattedDate}</span>
            </div>
          </div>
        </div>

        <div className="lg:flex lg:items-start lg:gap-8">
          <div className="flex-1">
            <div className="mb-8 bg-card border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-3">
                Contact {capitalizeFirstLetter(priceList.client_name)} Directly
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Want to sell your {produceName.toLowerCase()} to {capitalizeFirstLetter(priceList.client_name)}? We can connect you directly with the buyer responsible for {produceName.toLowerCase()} procurement.
              </p>
              <ContactBuyerButton
                user={session?.user}
                clientName={priceList.client_name}
                clientId={priceList.client_id}
              />
            </div>

            <PriceDetailsGrid priceList={priceList} produce={produce} />
          </div>

          <aside className="hidden lg:block lg:w-72 lg:flex-shrink-0 sticky top-20 self-start">
            <RelatedPricesSidebar
              currentClientName={priceList.client_name}
              currentPriceId={priceList.id}
              allPrices={allPrices}
            />
          </aside>
        </div>

        <div className="mt-8 lg:hidden">
          <RelatedPricesSidebar
            currentClientName={priceList.client_name}
            currentPriceId={priceList.id}
            allPrices={allPrices}
          />
        </div>
      </div>
    </main>
  )
}
