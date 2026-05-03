"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatProductName } from "@/lib/utilities"

const CATEGORIES = [
  { id: "agrochemicals", label: "Agrochemicals", href: "/buy-agrochemicals" },
  { id: "animal-health", label: "Animal Health", href: "/buy-animal-health" },
  { id: "animal-feed", label: "Animal Feed", href: "/buy-feeds" },
  { id: "plant-nutrition", label: "Plant Nutrition", href: "/buy-plant-nutrition" },
  { id: "documents", label: "Plans & Documents", href: "/buy-documents" },
]

// ── Shared product card — matches AgroChemicalCard guide size exactly ─────────

function ProductCard({ href, imageSrc, name, brand, meta }: {
  href: string
  imageSrc?: string
  name: string
  brand?: string
  meta?: string
}) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/50 group">
      <Link href={href} className="block">
        <div className="relative aspect-square bg-white">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-contain transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-muted/30" />
          )}
        </div>
      </Link>
      <div className="p-4 space-y-3 border-t">
        {brand && (
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{brand}</p>
        )}
        <Link href={href}>
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 min-h-[2.5rem] capitalize group-hover:text-primary transition-colors">
            {formatProductName(name)}
          </h3>
        </Link>
        {meta && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
            <span>{meta}</span>
          </div>
        )}
        <Link href={href} className="block">
          <Button variant="outline" className="w-full" size="sm">View Product</Button>
        </Link>
      </div>
    </div>
  )
}

// ── Document card ─────────────────────────────────────────────────────────────

function DocumentCard({ doc }: { doc: any }) {
  const price = doc.price_cents ? `$${(doc.price_cents / 100).toFixed(2)}` : "Free"
  const preview = doc.preview_images?.[0]
  const href = `/buy-documents/${doc.slug}`
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/50 group">
      <Link href={href} className="block">
        <div className="relative aspect-square bg-muted/20">
          {preview ? (
            <Image src={preview} alt={doc.title} fill className="object-cover" sizes="25vw" />
          ) : (
            <div className="absolute inset-0 bg-muted/30" />
          )}
        </div>
      </Link>
      <div className="p-4 space-y-3 border-t">
        <Link href={href}>
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">{doc.title}</h3>
        </Link>
        <div className="flex items-center gap-4 text-xs pt-2 border-t">
          <span className="font-semibold text-primary">{price}</span>
        </div>
        <Link href={href} className="block">
          <Button variant="outline" className="w-full" size="sm">View Document</Button>
        </Link>
      </div>
    </div>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ label, href, children, count }: {
  label: string
  href: string
  children: React.ReactNode
  count?: number
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">{label}</h2>
          {count !== undefined && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{count.toLocaleString()} products</span>
          )}
        </div>
        <Link href={href} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {children}
      </div>
    </section>
  )
}

// ── Main client component ─────────────────────────────────────────────────────

interface BuyPageClientProps {
  agrochemicals: any[]
  agrochemicalTotal: number
  animalHealth: any[]
  animalHealthTotal: number
  feeds: any[]
  feedsTotal: number
  plantNutrition: any[]
  plantNutritionTotal: number
  documents: any[]
  documentsTotal: number
}

export function BuyPageClient({
  agrochemicals, agrochemicalTotal,
  animalHealth, animalHealthTotal,
  feeds, feedsTotal,
  plantNutrition, plantNutritionTotal,
  documents, documentsTotal,
}: BuyPageClientProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8 py-8">
      <div className="flex gap-8">

        {/* ── Sidebar ── */}
        <aside className="hidden lg:flex flex-col w-56 flex-shrink-0">
          <div className="sticky top-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Categories</p>
            <nav className="flex flex-col gap-0.5">
              {CATEGORIES.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0 flex flex-col gap-12">

          <Section label="Agrochemicals" href="/buy-agrochemicals" count={agrochemicalTotal}>
            {agrochemicals.slice(0, 4).map((p) => (
              <ProductCard key={p.id} href={`/buy-agrochemicals/${p.slug}`} imageSrc={p.images?.[0]?.img?.src} name={p.name} brand={p.brand?.name} meta={p.agrochemical_category?.name} />
            ))}
          </Section>

          <Section label="Animal Health" href="/buy-animal-health" count={animalHealthTotal}>
            {animalHealth.slice(0, 4).map((p) => (
              <ProductCard key={p.id} href={`/buy-animal-health/${p.slug}`} imageSrc={p.images?.[0]?.img?.src} name={p.name} brand={p.brand?.name} meta={p.animal_health_category?.name} />
            ))}
          </Section>

          <Section label="Animal Feed" href="/buy-feeds" count={feedsTotal}>
            {feeds.slice(0, 4).map((p) => (
              <ProductCard key={p.id} href={`/buy-feeds/${p.slug}`} imageSrc={p.images?.[0]?.img?.src} name={p.name} brand={p.brand?.name} meta={p.animal ? `${p.animal}${p.phase ? ` · ${p.phase}` : ""}` : undefined} />
            ))}
          </Section>

          <Section label="Plant Nutrition" href="/buy-plant-nutrition" count={plantNutritionTotal}>
            {plantNutrition.slice(0, 4).map((p) => (
              <ProductCard key={p.id} href={`/buy-plant-nutrition/${p.slug}`} imageSrc={p.images?.[0]?.img?.src} name={p.name} brand={p.brand?.name} meta={p.plant_nutrition_category?.name} />
            ))}
          </Section>

          <Section label="Plans & Documents" href="/buy-documents" count={documentsTotal}>
            {documents.slice(0, 4).map((doc) => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </Section>

        </main>
      </div>
    </div>
  )
}
