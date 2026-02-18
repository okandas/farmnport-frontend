import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Bug, Beaker, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { sendGTMEvent } from '@next/third-parties/google'

interface AgroChemicalCardProps {
  chemical: any
  mode: "guide" | "shop"
}

export function AgroChemicalCard({ chemical, mode }: AgroChemicalCardProps) {
  const router = useRouter()
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
          <h3 className="font-semibold text-sm leading-tight capitalize line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
            {chemical.name}
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
            {/* Price placeholder - will be populated from backend */}
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-primary">$25.00</span>
              <span className="text-xs text-muted-foreground line-through">$35.00</span>
            </div>
            <Button
              className="w-full"
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                // Track GTM event for shop click
                sendGTMEvent({ event: 'action', value: 'ShopBuyOnline' })
                // Redirect to waiting list
                router.push('/waiting-list-shop')
              }}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        ) : (
          <Link href={href} className="block pt-2">
            <Button variant="outline" className="w-full" size="sm">
              View Guide
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
