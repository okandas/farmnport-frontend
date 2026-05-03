"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Beaker, Heart, Egg, Leaf, FileText, ArrowRight, ShoppingBag } from "lucide-react"
import { AgroChemicalCard } from "@/components/agrochemical/AgroChemicalCard"
import { formatProductName } from "@/lib/utilities"

const CATEGORIES = [
  { id: "agrochemicals", label: "Agrochemicals", icon: Beaker, href: "/buy-agrochemicals" },
  { id: "animal-health", label: "Animal Health", icon: Heart, href: "/buy-animal-health" },
  { id: "animal-feed", label: "Animal Feed", icon: Egg, href: "/buy-feeds" },
  { id: "plant-nutrition", label: "Plant Nutrition", icon: Leaf, href: "/buy-plant-nutrition" },
  { id: "documents", label: "Plans & Documents", icon: FileText, href: "/buy-documents" },
]

// ── Shared product card shell ─────────────────────────────────────────────────

function ProductCard({ href, imageSrc, name, brand, meta }: {
  href: string
  imageSrc?: string
  name: string
  brand?: string
  meta?: string
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-lg border border-border bg-card overflow-hidden hover:border-primary/60 hover:shadow-md transition-all"
    >
      <div className="relative aspect-square bg-white">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-contain transition-transform duration-200 group-hover:scale-105 p-2"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
            <ShoppingBag className="w-10 h-10 text-muted-foreground/30" />
          </div>
        )}
      </div>
      <div className="p-3 border-t flex flex-col gap-1">
        {brand && <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium truncate">{brand}</p>}
        <p className="text-sm font-semibold leading-tight line-clamp-2 capitalize group-hover:text-primary transition-colors">
          {formatProductName(name)}
        </p>
        {meta && <p className="text-xs text-muted-foreground truncate">{meta}</p>}
      </div>
    </Link>
  )
}

// ── Document card ─────────────────────────────────────────────────────────────

function DocumentCard({ doc }: { doc: any }) {
  const price = doc.price_cents ? `$${(doc.price_cents / 100).toFixed(2)}` : "Free"
  const preview = doc.preview_images?.[0]
  return (
    <Link
      href={`/buy-documents/${doc.slug}`}
      className="group flex flex-col rounded-lg border border-border bg-card overflow-hidden hover:border-primary/60 hover:shadow-md transition-all"
    >
      <div className="relative aspect-square bg-muted/20 flex items-center justify-center">
        {preview ? (
          <Image src={preview} alt={doc.title} fill className="object-cover" sizes="25vw" />
        ) : (
          <FileText className="w-12 h-12 text-muted-foreground/30" />
        )}
      </div>
      <div className="p-3 border-t flex flex-col gap-1">
        <p className="text-sm font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">{doc.title}</p>
        <p className="text-xs font-semibold text-primary">{price}</p>
      </div>
    </Link>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ id, label, icon: Icon, href, children, count }: {
  id: string
  label: string
  icon: React.ElementType
  href: string
  children: React.ReactNode
  count?: number
}) {
  return (
    <section id={id} className="scroll-mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">{label}</h2>
          {count !== undefined && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{count.toLocaleString()} products</span>
          )}
        </div>
        <Link
          href={href}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
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
  const [activeId, setActiveId] = useState("agrochemicals")
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px" }
    )
    CATEGORIES.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observerRef.current?.observe(el)
    })
    return () => observerRef.current?.disconnect()
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8 py-8">
      <div className="flex gap-8">

        {/* ── Sidebar ── */}
        <aside className="hidden lg:flex flex-col w-56 flex-shrink-0">
          <div className="sticky top-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Categories</p>
            <nav className="flex flex-col gap-0.5">
              {CATEGORIES.map(({ id, label, icon: Icon, href }) => {
                const isActive = activeId === id
                return (
                  <a
                    key={id}
                    href={`#${id}`}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {label}
                  </a>
                )
              })}
            </nav>

          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0 flex flex-col gap-12">

          {/* Agrochemicals */}
          <Section id="agrochemicals" label="Agrochemicals" icon={Beaker} href="/buy-agrochemicals" count={agrochemicalTotal}>
            {agrochemicals.slice(0, 4).map((p) => (
              <ProductCard
                key={p.id}
                href={`/buy-agrochemicals/${p.slug}`}
                imageSrc={p.images?.[0]?.img?.src}
                name={p.name}
                brand={p.brand?.name}
                meta={p.agrochemical_category?.name}
              />
            ))}
          </Section>

          {/* Animal Health */}
          <Section id="animal-health" label="Animal Health" icon={Heart} href="/buy-animal-health" count={animalHealthTotal}>
            {animalHealth.slice(0, 4).map((p) => (
              <ProductCard
                key={p.id}
                href={`/buy-animal-health/${p.slug}`}
                imageSrc={p.images?.[0]?.img?.src}
                name={p.name}
                brand={p.brand?.name}
                meta={p.animal_health_category?.name}
              />
            ))}
          </Section>

          {/* Animal Feed */}
          <Section id="animal-feed" label="Animal Feed" icon={Egg} href="/buy-feeds" count={feedsTotal}>
            {feeds.slice(0, 4).map((p) => (
              <ProductCard
                key={p.id}
                href={`/buy-feeds/${p.slug}`}
                imageSrc={p.images?.[0]?.img?.src}
                name={p.name}
                brand={p.brand?.name}
                meta={p.animal ? `${p.animal}${p.phase ? ` · ${p.phase}` : ""}` : undefined}
              />
            ))}
          </Section>

          {/* Plant Nutrition */}
          <Section id="plant-nutrition" label="Plant Nutrition" icon={Leaf} href="/buy-plant-nutrition" count={plantNutritionTotal}>
            {plantNutrition.slice(0, 4).map((p) => (
              <ProductCard
                key={p.id}
                href={`/buy-plant-nutrition/${p.slug}`}
                imageSrc={p.images?.[0]?.img?.src}
                name={p.name}
                brand={p.brand?.name}
                meta={p.plant_nutrition_category?.name}
              />
            ))}
          </Section>

          {/* Documents */}
          <Section id="documents" label="Plans & Documents" icon={FileText} href="/buy-documents" count={documentsTotal}>
            {documents.slice(0, 4).map((doc) => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </Section>

        </main>
      </div>
    </div>
  )
}
