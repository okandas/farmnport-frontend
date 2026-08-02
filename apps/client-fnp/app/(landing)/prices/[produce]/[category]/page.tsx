import Link from "next/link"
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
  const clientName = nameSlug.split("-").map(w => w.length <= 2 ? w.toUpperCase() : capitalizeFirstLetter(w)).join(" ")
  return { clientSlug: nameSlug, clientName, effectiveDate }
}

export async function generateMetadata({ params }: SheetCategoryPageProps): Promise<Metadata> {
  const { produce: sheet, category } = await params
  const { clientName, effectiveDate } = parseSheetSlug(sheet)
  const categoryName = capitalizeFirstLetter(category)
  const dateLabel = effectiveDate ? new Date(effectiveDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : ""
  const title = dateLabel
    ? `${clientName} ${categoryName} Prices ${dateLabel} Zimbabwe | farmnport.com`
    : `${clientName} ${categoryName} Prices Zimbabwe | farmnport.com`
  const description = dateLabel
    ? `${clientName} ${categoryName.toLowerCase()} livestock prices in Zimbabwe as of ${dateLabel}. View grade-by-grade pricing including liveweight and per-head rates on farmnport.com.`
    : `${clientName} ${categoryName.toLowerCase()} livestock price history in Zimbabwe. Browse all upload dates and grade-by-grade pricing on farmnport.com.`
  const keywords = `${clientName.toLowerCase()} ${categoryName.toLowerCase()} prices, ${categoryName.toLowerCase()} prices zimbabwe, ${clientName.toLowerCase()} livestock prices`
  return {
    title,
    description,
    keywords,
    alternates: { canonical: `/prices/${sheet}/${category}` },
    openGraph: {
      title,
      description,
      url: `https://farmnport.com/prices/${sheet}/${category}`,
      siteName: "farmnport",
      type: "website",
    },
  }
}

export default async function BuyerCategoryPage({ params }: SheetCategoryPageProps) {
  const { produce: sheet, category } = await params
  const { clientSlug, clientName, effectiveDate } = parseSheetSlug(sheet)
  const categoryName = capitalizeFirstLetter(category)

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://farmnport.com" },
      { "@type": "ListItem", "position": 2, "name": "Prices", "item": "https://farmnport.com/prices" },
      { "@type": "ListItem", "position": 3, "name": `${clientName} ${categoryName}`, "item": `https://farmnport.com/prices/${sheet}/${category}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-4">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link href="/prices" className="hover:text-foreground transition-colors">Prices</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{clientName} {categoryName}</span>
        </nav>
      </div>
      <BuyerProducePriceHistory
        clientSlug={clientSlug}
        clientName={clientName}
        produce={category}
        effectiveDate={effectiveDate}
      />
    </>
  )
}
