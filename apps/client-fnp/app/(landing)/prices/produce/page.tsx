import { ProducePriceCardsView } from "@/components/structures/produce-price-cards-view"
import { ProduceFilter } from "@/components/structures/produce-filter"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: 'Prices by Produce – Beef, Lamb, Chicken & More | farmnport.com',
  description: 'Browse current agricultural produce prices across Zimbabwe. Filter by beef, lamb, mutton, goat, chicken, and pork. Compare rates from verified buyers.',
  alternates: {
    canonical: '/prices/produce',
  },
  openGraph: {
    title: 'Prices by Produce – Beef, Lamb, Chicken & More',
    description: 'Browse current agricultural produce prices across Zimbabwe. Filter by produce type.',
    url: '/prices/produce',
    siteName: 'farmnport',
    type: 'website',
  },
}

const produceCategories = [
  { name: "Beef", slug: "beef" },
  { name: "Lamb", slug: "lamb" },
  { name: "Mutton", slug: "mutton" },
  { name: "Goat", slug: "goat" },
  { name: "Chicken", slug: "chicken" },
  { name: "Pork", slug: "pork" },
]

interface ProducePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ProduceIndexPage({ searchParams }: ProducePageProps) {
  const params = await searchParams
  const activeFilter = typeof params.filter === "string" ? params.filter : ""

  const filtered = activeFilter
    ? produceCategories.filter((p) => p.slug === activeFilter)
    : produceCategories

  return (
    <main>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 min-h-[70lvh]">
        <div className="pt-6 pb-4">
          <Link
            href="/prices"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            All prices
          </Link>
        </div>

        <h1 className="text-3xl font-bold font-heading pb-2">
          Prices by Produce
        </h1>
        <p className="text-muted-foreground mb-6">
          Current produce prices from buyers across Zimbabwe, in USD.
        </p>

        <ProduceFilter
          categories={produceCategories}
          activeFilter={activeFilter}
        />

        <div className="mt-6 space-y-8">
          {filtered.map((produce) => (
            <section key={produce.slug}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold font-heading">{produce.name}</h2>
                <Link
                  href={`/prices/produce/${produce.slug}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View all {produce.name.toLowerCase()} prices
                </Link>
              </div>
              <ProducePriceCardsView produceSlug={produce.slug} limit={4} />
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
