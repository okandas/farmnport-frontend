import { PriceDetailsGrid } from "@/components/structures/price-details-grid"
import { RelatedPricesSidebar } from "@/components/structures/related-prices-sidebar"
import { ContactBuyerButton } from "@/components/structures/contact-buyer-button"
import { Badge } from "@/components/ui/badge"
import { formatDate, capitalizeFirstLetter } from "@/lib/utilities"
import axios from "axios"
import { notFound } from "next/navigation"
import { Calendar, Building2, CheckCircle2 } from "lucide-react"
import { auth } from "@/auth"

interface PriceDetailsPageProps {
  params: Promise<{
    slug: string
  }>
}

async function getPriceListBySlug(slug: string) {
  try {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3744"

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

  return (
    <main>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12 min-h-[70lvh]">
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

            <div>
              <ContactBuyerButton
                user={session?.user}
                clientName={priceList.client_name}
                clientId={priceList.client_id}
              />
            </div>
          </div>
        </div>

        <div className="lg:flex lg:gap-8">
          <div className="flex-1">
            <PriceDetailsGrid priceList={priceList} />
          </div>

          <aside className="hidden lg:block lg:w-72 lg:flex-shrink-0">
            <div className="sticky top-8">
              <RelatedPricesSidebar
                currentClientName={priceList.client_name}
                currentPriceId={priceList.id}
                allPrices={allPrices}
              />
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
