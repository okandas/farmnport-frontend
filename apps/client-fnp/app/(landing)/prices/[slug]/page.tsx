import { PriceDetailsGrid } from "@/components/structures/price-details-grid"
import { RelatedPricesSidebar } from "@/components/structures/related-prices-sidebar"
import { ContactBuyerButton } from "@/components/structures/contact-buyer-button"
import { Badge } from "@/components/ui/badge"
import { formatDate, capitalizeFirstLetter } from "@/lib/utilities"
import { AppURL } from "@/lib/schemas"
import axios from "axios"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Calendar, Building2, CheckCircle2, ArrowLeft } from "lucide-react"
import { auth } from "@/auth"
import type { Metadata } from "next"

interface PriceDetailsPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PriceDetailsPageProps): Promise<Metadata> {
  const { slug } = await params
  const { priceList } = await getPriceListBySlug(slug)

  if (!priceList) {
    return { title: 'Price List Not Found | farmnport.com' }
  }

  const name = capitalizeFirstLetter(priceList.client_name)
  const date = formatDate(priceList.effectiveDate.toString())
  const specialization = priceList.client_specialization ? capitalizeFirstLetter(priceList.client_specialization) : 'Farm Produce'

  return {
    alternates: {
      canonical: `${AppURL}/prices/${slug}`,
    },
    title: `${name} Price List — ${specialization} Prices | farmnport.com`,
    description: `${name} ${specialization.toLowerCase()} price list effective ${date}. View current market rates and connect with this buyer on Farmnport.`,
    openGraph: {
      title: `${name} — ${specialization} Price List`,
      description: `${name} ${specialization.toLowerCase()} price list effective ${date}. View current market rates on Farmnport.`,
      url: `${AppURL}/prices/${slug}`,
      siteName: 'farmnport',
      type: 'website',
    },
  }
}

async function getPriceListBySlug(slug: string) {
  try {
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3744"

    // Fetch all price lists and filter by slug match
    const response = await axios.get(`${baseURL}/v1/prices/all?p=1&limit=100`)
    const priceLists = response.data?.data || []

    // Find matching price list by comparing slug
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

export default async function PriceDetailsPage({ params }: PriceDetailsPageProps) {
  const { slug } = await params
  const { priceList, allPrices } = await getPriceListBySlug(slug)
  const session = await auth()

  if (!priceList) {
    notFound()
  }

  const formattedDate = formatDate(priceList.effectiveDate.toString())

  // Generate JSON-LD structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${priceList.client_name} Price List`,
    "description": `Farm produce price list from ${priceList.client_name} effective ${formattedDate}`,
    "datePublished": priceList.effectiveDate,
    "publisher": {
      "@type": "Organization",
      "name": priceList.client_name
    },
    "itemListElement": priceList.entries?.map((entry: any, index: number) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": entry.produce_name,
        "offers": {
          "@type": "Offer",
          "price": entry.price,
          "priceCurrency": "USD",
          "availability": entry.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "priceValidUntil": priceList.effectiveDate
        }
      }
    })) || []
  }

  return (
    <main>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12 min-h-[70lvh]">
        <Link
          href="/prices/lwt"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to LWT Prices
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-4xl font-bold font-heading">
              {capitalizeFirstLetter(priceList.client_name)}
            </h1>
            {priceList.verified && (
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            )}
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Farm Produce Category:</span>
                <span className="font-medium text-card-foreground">
                  {capitalizeFirstLetter(priceList.client_specialization)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Effective:</span>
                <span className="font-medium text-card-foreground">{formattedDate}</span>
              </div>

              {priceList.pricing_basis && (
                <Badge variant="outline" className="text-xs font-medium capitalize">
                  {priceList.pricing_basis}
                </Badge>
              )}
            </div>

          </div>
        </div>

        <div className="lg:flex lg:items-start lg:gap-8">
          <div className="flex-1">
            {/* Direct Buyer Contact Section */}
            <div className="mb-8 bg-card border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-3">
                Contact {capitalizeFirstLetter(priceList.client_name)} Directly
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Want to sell your produce to {capitalizeFirstLetter(priceList.client_name)}? We can connect you directly with the buyer at this company responsible for {priceList.client_specialization ? capitalizeFirstLetter(priceList.client_specialization).toLowerCase() : 'agricultural'} procurement.
              </p>
              <ContactBuyerButton
                user={session?.user}
                clientName={priceList.client_name}
                clientId={priceList.client_id}
              />
            </div>

            <PriceDetailsGrid priceList={priceList} />
          </div>

          <aside className="hidden lg:block lg:w-72 lg:flex-shrink-0 sticky top-20 self-start">
            <div>
              <RelatedPricesSidebar
                currentClientName={priceList.client_name}
                currentPriceId={priceList.id}
                allPrices={allPrices}
              />
            </div>
          </aside>
        </div>

        {/* Mobile: Related prices at bottom */}
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
