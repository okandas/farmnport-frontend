import { BuyerProducePriceHistory } from "@/components/structures/buyer-produce-price-history"
import type { Metadata } from "next"
import { capitalizeFirstLetter } from "@/lib/utilities"

interface SheetCategoryPageProps {
  params: Promise<{ produce: string; category: string }>
}

function parseSheetSlug(sheet: string): { clientSlug: string; clientName: string; effectiveDate: string | null } {
  const dateMatch = sheet.match(/-(\d{4}-\d{2}-\d{2})$/)
  const effectiveDate = dateMatch ? dateMatch[1] : null
  const nameSlug = effectiveDate ? sheet.slice(0, sheet.length - effectiveDate.length - 1) : sheet
  const clientName = nameSlug.split("-").map(w => capitalizeFirstLetter(w)).join(" ")
  return { clientSlug: sheet, clientName, effectiveDate }
}

export async function generateMetadata({ params }: SheetCategoryPageProps): Promise<Metadata> {
  const { produce: sheet, category } = await params
  const { clientName, effectiveDate } = parseSheetSlug(sheet)
  const categoryName = capitalizeFirstLetter(category)
  const dateLabel = effectiveDate ? ` – ${effectiveDate}` : ""
  return {
    title: `${clientName} ${categoryName} Prices${dateLabel} | farmnport.com`,
    description: `View ${clientName}'s ${categoryName.toLowerCase()} price history on farmnport.com.`,
    alternates: { canonical: `/prices/${sheet}/${category}` },
    openGraph: {
      title: `${clientName} ${categoryName} Prices Zimbabwe`,
      description: `View ${clientName}'s ${categoryName.toLowerCase()} price history on farmnport.com.`,
      url: `/prices/${sheet}/${category}`,
      siteName: "farmnport",
      type: "website",
    },
  }
}

export default async function BuyerCategoryPage({ params }: SheetCategoryPageProps) {
  const { produce: sheet, category } = await params
  const { clientSlug, clientName, effectiveDate } = parseSheetSlug(sheet)

  return (
    <>
      <h1 className="sr-only">{clientName} {capitalizeFirstLetter(category)} Prices Zimbabwe</h1>
      <BuyerProducePriceHistory
        clientSlug={clientSlug}
        clientName={clientName}
        produce={category}
        effectiveDate={effectiveDate}
      />
    </>
  )
}
