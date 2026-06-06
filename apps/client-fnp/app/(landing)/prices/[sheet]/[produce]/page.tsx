import { BuyerProducePriceHistory } from "@/components/structures/buyer-produce-price-history"
import type { Metadata } from "next"
import { capitalizeFirstLetter } from "@/lib/utilities"

interface SheetProducePageProps {
  params: Promise<{ sheet: string; produce: string }>
}

function parseSheetSlug(sheet: string): { clientSlug: string; clientName: string; effectiveDate: string | null } {
  const dateMatch = sheet.match(/-(\d{4}-\d{2}-\d{2})$/)
  const effectiveDate = dateMatch ? dateMatch[1] : null
  const nameSlug = effectiveDate ? sheet.slice(0, sheet.length - effectiveDate.length - 1) : sheet
  const clientName = nameSlug.split("-").map(w => capitalizeFirstLetter(w)).join(" ")
  return { clientSlug: sheet, clientName, effectiveDate }
}

export async function generateMetadata({ params }: SheetProducePageProps): Promise<Metadata> {
  const { sheet, produce } = await params
  const { clientName, effectiveDate } = parseSheetSlug(sheet)
  const produceName = capitalizeFirstLetter(produce)
  const dateLabel = effectiveDate ? ` – ${effectiveDate}` : ""
  return {
    title: `${clientName} ${produceName} Prices${dateLabel} | farmnport.com`,
    description: `View ${clientName}'s ${produceName.toLowerCase()} price history on farmnport.com.`,
    alternates: { canonical: `/prices/${sheet}/${produce}` },
    openGraph: {
      title: `${clientName} ${produceName} Prices Zimbabwe`,
      description: `View ${clientName}'s ${produceName.toLowerCase()} price history on farmnport.com.`,
      url: `/prices/${sheet}/${produce}`,
      siteName: "farmnport",
      type: "website",
    },
  }
}

export default async function BuyerProducePage({ params }: SheetProducePageProps) {
  const { sheet, produce } = await params
  const { clientSlug, clientName, effectiveDate } = parseSheetSlug(sheet)

  return (
    <>
      <h1 className="sr-only">{clientName} {capitalizeFirstLetter(produce)} Prices Zimbabwe</h1>
      <BuyerProducePriceHistory
        clientSlug={clientSlug}
        clientName={clientName}
        produce={produce}
        effectiveDate={effectiveDate}
      />
    </>
  )
}
