import Link from "next/link"
import Image from "next/image"
import { Bug, Beaker } from "lucide-react"
import { Button } from "@/components/ui/button"
import { sendGTMEvent } from '@next/third-parties/google'
import { formatProductName } from "@/lib/utilities"

interface AgroChemicalCardProps {
  chemical: any
  mode: "guide" | "shop"
}

export function AgroChemicalCard({ chemical, mode }: AgroChemicalCardProps) {
  const categorySlug = chemical.agrochemical_category?.slug || 'all'
  const href = mode === "shop"
    ? `/buy-agrochemicals/${chemical.slug}`
    : `/agrochemical-guides/${categorySlug}/${chemical.slug}`

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/50 group">
      {/* Image Section */}
      <Link href={href} className="block">
        <div className="relative aspect-square bg-white">
          {chemical.images && chemical.images[0] && chemical.images[0].img?.src ? (
            <Image
              src={chemical.images[0].img.src}
              alt={chemical.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
              <Beaker className="w-16 h-16 text-muted-foreground/30" />
            </div>
          )}
        </div>
      </Link>

      {/* Content Section */}
      <div className="p-4 space-y-3 border-t">
        {/* Brand */}
        {chemical.brand && (
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            {chemical.brand.name}
          </p>
        )}

        {/* Product Name */}
        <Link href={href}>
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
            {formatProductName(chemical.name)}
          </h3>
        </Link>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1.5">
            <Bug className="w-3.5 h-3.5" />
            <span>{chemical.targets?.length || 0} {chemical.targets?.length === 1 ? 'target' : 'targets'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Beaker className="w-3.5 h-3.5" />
            <span>{chemical.active_ingredients?.length || 0} active</span>
          </div>
        </div>

        {/* CTA - Different based on mode */}
        {mode === "shop" ? (
          <div className="pt-3 space-y-2">
            {chemical.show_price && chemical.sale_price > 0 ? (
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold">${(chemical.sale_price / 100).toFixed(2)}</span>
                {chemical.show_was_price && chemical.was_price > 0 && chemical.was_price > chemical.sale_price && (
                  <span className="text-xs text-muted-foreground line-through">${(chemical.was_price / 100).toFixed(2)}</span>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Price on request</p>
            )}
            <Link href={href} className="block" onClick={() => sendGTMEvent({ event: 'action', value: 'ShopBuyOnline' })}>
              <Button className="w-full" size="sm">
                Buy Now
              </Button>
            </Link>
          </div>
        ) : (
          <Link href={href} className="block pt-2">
            <Button
              variant="outline"
              className="w-full"
              size="sm"
              onClick={() => sendGTMEvent({ event: 'link', value: 'ViewGuide' })}
            >
              View Guide
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
