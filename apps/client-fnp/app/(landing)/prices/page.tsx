import { PriceCardsView } from "@/components/structures/price-cards-view"
import { CdmPriceCardsView } from "@/components/structures/cdm-price-cards-view"
import Link from "next/link"
import { ArrowRight, Scale, Beef, TrendingUp, RefreshCw, ShieldCheck } from "lucide-react"

export const metadata = {
  title: 'Agricultural Market Prices Zimbabwe – Livestock, Produce & More | farmnport.com',
  description: 'Compare current agricultural prices from verified buyers across Zimbabwe. Liveweight cattle, cold dress mass, beef, lamb, mutton, goat, chicken, pork — updated weekly in USD and ZiG.',
  alternates: {
    canonical: '/prices',
  },
  openGraph: {
    title: 'Agricultural Market Prices Zimbabwe',
    description: 'Compare current agricultural prices from verified buyers across Zimbabwe. Updated weekly in USD and ZiG.',
    siteName: 'farmnport',
    type: 'website',
  },
}

const categories = [
  {
    title: "Liveweight Prices",
    tag: "LWT",
    description: "Per kg delivered rates for cattle, sheep, goats and pigs — by grade, teeth category and weight range.",
    href: "/prices/lwt",
    icon: Scale,
    gradient: "from-emerald-500 to-teal-600",
    iconBg: "bg-emerald-500",
  },
  {
    title: "Cold Dress Mass",
    tag: "CDM",
    description: "Carcass grade pricing from abattoirs — commercial, economy and manufacturing grades, ex leakage.",
    href: "/prices/cdm",
    icon: Beef,
    gradient: "from-blue-500 to-indigo-600",
    iconBg: "bg-blue-500",
  },
]

export default async function PricesPage() {
  return (
    <main>
      {/* Hero */}
      <section className="border-b">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-10 pb-8">
          <p className="text-xs font-semibold text-primary tracking-wide uppercase">Market Intelligence</p>
          <h1 className="mt-1 text-3xl font-bold font-heading tracking-tight">
            Market Prices
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Transparent pricing from verified buyers across Zimbabwe.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
            {[
              { icon: RefreshCw, text: "Updated weekly" },
              { icon: ShieldCheck, text: "Verified sources" },
              { icon: TrendingUp, text: "USD & ZiG rates" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5">
                <Icon className="h-3 w-3 text-primary" />
                <span className="font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 py-8">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Browse by type</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon
            return (
              <Link key={cat.href} href={cat.href} className="group block">
                <div className="relative h-full rounded-xl border bg-card p-4 hover:shadow-md hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br ${cat.gradient}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold font-heading group-hover:text-primary transition-colors">
                        {cat.title}
                      </h3>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        {cat.tag}
                      </span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </Link>
            )
          })}

          <div className="relative h-full rounded-xl border border-dashed bg-muted/20 p-4 flex flex-col items-center justify-center text-center">
            <p className="text-xs font-semibold text-muted-foreground">More coming soon</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Grains, vegetables, dairy and more
            </p>
          </div>
        </div>
      </section>

      {/* Latest Prices */}
      <section className="border-t bg-muted/20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-8">
          <h2 className="text-lg font-bold font-heading mb-5">Latest Prices</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center justify-center h-6 w-6 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600">
                  <Scale className="h-3 w-3 text-white" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Liveweight</h3>
              </div>
              <div className="rounded-lg border bg-card px-3">
                <PriceCardsView limit={4} viewAllHref="/prices/lwt" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center justify-center h-6 w-6 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600">
                  <Beef className="h-3 w-3 text-white" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Cold Dress Mass</h3>
              </div>
              <div className="rounded-lg border bg-card px-3">
                <CdmPriceCardsView limit={4} viewAllHref="/prices/cdm" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="border-t">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-8">
          <h2 className="text-base font-bold font-heading mb-2">About Agricultural Pricing in Zimbabwe</h2>
          <p className="text-xs text-muted-foreground">
            Transparent market prices from verified buyers and abattoirs across Zimbabwe.
          </p>
        </div>
      </section>
    </main>
  )
}
