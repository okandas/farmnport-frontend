import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { notFound } from "next/navigation"
import type { Metadata, ResolvingMetadata } from "next"
import { serverFetch } from "@/lib/serverFetch"
import { capitalizeFirstLetter } from "@/lib/utilities"

type Props = {
  params: Promise<{ commodity: string }>
}

interface Breed {
  id: string
  name: string
  slug: string
  description: string
}

interface FarmProduce {
  id: string
  name: string
  slug: string
}

// Editorial guide content per commodity — variety names/descriptions come from DB
const COMMODITY_GUIDES: Record<string, CommodityGuide> = {
  chillies: {
    name: "Chillies",
    title: "Sell Your Chillies Directly to Buyers in Zimbabwe",
    description:
      "List your chilli lot on Farmnport and connect with processors, exporters, restaurants, and spice traders across Zimbabwe.",
    intro:
      "Chillies are one of the highest-value horticultural crops in Zimbabwe. Buyers range from local hot sauce manufacturers and spice processors to restaurants and export traders. Listing your lot on Farmnport puts your produce in front of verified buyers actively looking to purchase.",
    states: ["Fresh", "Dried Whole", "Powder", "Dry Flakes"],
    tips: [
      "Specify the variety — buyers filter by variety and pay more for accurately described lots.",
      "Grade your produce before listing — buyers pay more for uniform size and colour.",
    ],
    cta: "List Your Chilli Lot",
  },
  maize: {
    name: "Maize",
    title: "Sell Your Maize Directly to Buyers in Zimbabwe",
    description:
      "List your maize lot on Farmnport and connect with millers, stockfeed manufacturers, and traders across Zimbabwe.",
    intro:
      "Maize is Zimbabwe's staple grain crop. Buyers include millers, stockfeed producers, commodity traders, and the Grain Marketing Board. Listing your lot on Farmnport gives you direct access to buyers who are actively sourcing — set your price and let them come to you.",
    states: ["Grain (Dry)", "Green Mealies", "Stockfeed Grade"],
    tips: [
      "State the moisture content — buyers need to know if the grain is dry enough for storage.",
      "Specify white or yellow maize — they trade at different prices.",
      "Include your location — transport costs affect buyer decisions significantly.",
    ],
    cta: "List Your Maize Lot",
  },
  cattle: {
    name: "Cattle",
    title: "Sell Your Cattle Directly to Buyers in Zimbabwe",
    description:
      "List your cattle lot on Farmnport and connect with abattoirs, feedlots, and private buyers across Zimbabwe.",
    intro:
      "Selling cattle at auction doesn't always get you the price your animals deserve. On Farmnport, you set the price and timeline. Abattoirs, feedlots, and private buyers browse available lots and make offers — you accept when the price is right.",
    states: ["Live", "On the Hoof"],
    tips: [
      "Specify the breed — buyers pay premiums for known breeds like Brahman, Hereford, and Sussex.",
      "Include weight estimates — buyers calculate price per kilogram live weight.",
      "Add photos — lots with photos get significantly more interest than those without.",
    ],
    cta: "List Your Cattle Lot",
  },
  chicken: {
    name: "Chicken",
    title: "Sell Your Chickens Directly to Buyers in Zimbabwe",
    description:
      "List your chicken lot on Farmnport and connect with abattoirs, restaurants, and wholesale buyers across Zimbabwe.",
    intro:
      "Whether you're selling broilers, layers, road runners, or day-old chicks, Farmnport connects you with buyers who are actively looking. Set your price per bird, specify the type and age, and let buyers come to you.",
    states: ["Live", "Dressed", "Day-Old Chicks", "Point of Lay"],
    tips: [
      "Specify the type — broilers, layers, road runners, and day-old chicks sell to very different buyers.",
      "Include the age or weight — buyers need this to calculate value.",
      "State minimum order quantity — some buyers need volume, others buy small batches.",
    ],
    cta: "List Your Chicken Lot",
  },
}

interface CommodityGuide {
  name: string
  title: string
  description: string
  intro: string
  states: string[]
  tips: string[]
  cta: string
}

export async function generateMetadata({ params }: Props, _parent: ResolvingMetadata): Promise<Metadata> {
  const { commodity } = await params
  const guide = COMMODITY_GUIDES[commodity]
  if (!guide) return {}

  return {
    title: `${guide.title} | farmnport.com`,
    description: guide.description,
    alternates: { canonical: `/sell/${commodity}` },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: `https://farmnport.com/sell/${commodity}`,
      siteName: "Farmnport",
      title: `${guide.title} | farmnport.com`,
      description: guide.description,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: `Sell ${guide.name} on Farmnport` }],
    },
  }
}

async function getBreeds(commodity: string): Promise<Breed[]> {
  try {
    const produce = await serverFetch<FarmProduce>(`/farmproduce/${commodity}`)
    if (!produce?.id) return []
    const res = await serverFetch<{ data: Breed[]; total: number }>(`/breeds/?farm_produce_id=${produce.id}&limit=50`)
    return res?.data ?? []
  } catch {
    return []
  }
}

export default async function SellCommodityPage({ params }: Props) {
  const { commodity } = await params
  const guide = COMMODITY_GUIDES[commodity]

  if (!guide) notFound()

  const breeds = await getBreeds(commodity)

  return (
    <main>
      <div className="mx-auto max-w-4xl px-6 lg:px-8 py-12 space-y-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/sell" className="hover:text-foreground transition-colors">Sell</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{guide.name}</span>
        </nav>

        {/* Hero */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge>Lots Open</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{guide.title}</h1>
          <p className="text-lg text-muted-foreground">{guide.description}</p>
          <p className="text-base text-foreground">{guide.intro}</p>

          <div className="flex items-center gap-3 pt-2">
            <Link
              href="/lots/new"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {guide.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Varieties from DB */}
        {breeds.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Varieties Buyers Are Looking For</h2>
            <p className="text-sm text-muted-foreground">
              Specify your variety when listing — buyers filter by variety and pay more for accurately described lots.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {breeds.map((breed) => (
                <div key={breed.id} className="rounded-xl border bg-card p-4 space-y-1">
                  <h3 className="font-semibold text-sm">{capitalizeFirstLetter(breed.name)}</h3>
                  {breed.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{breed.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* States */}
        {guide.states.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">State</h2>
            <p className="text-sm text-muted-foreground">Select the state of your produce when listing your lot.</p>
            <div className="flex flex-wrap gap-2">
              {guide.states.map((s) => (
                <span key={s} className="rounded-lg border bg-muted/30 px-4 py-2 text-sm font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Tips for Selling Faster</h2>
          <ul className="space-y-2">
            {guide.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <span className="mt-0.5 flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom CTA */}
        <div className="rounded-xl border bg-primary/5 border-primary/20 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-semibold">Ready to list your {guide.name.toLowerCase()}?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Reviewed and listed within 24 hours. Buyers are notified of new lots.
            </p>
          </div>
          <Link
            href="/lots/new"
            className="flex-shrink-0 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {guide.cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Cross-links */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            Looking to see all active lots?{" "}
            <Link href="/lots" className="text-primary hover:underline">Browse lots →</Link>
          </p>
          <p>
            See all seller guides?{" "}
            <Link href="/sell" className="text-primary hover:underline">Back to Sell →</Link>
          </p>
        </div>

      </div>
    </main>
  )
}
