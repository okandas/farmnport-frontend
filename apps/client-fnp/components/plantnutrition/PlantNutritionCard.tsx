"use client"

import Link from "next/link"
import Image from "next/image"
import { Beaker, Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { sendGTMEvent } from '@next/third-parties/google'

interface PlantNutritionCardProps {
  product: any
}

export function PlantNutritionCard({ product }: PlantNutritionCardProps) {
  const categorySlug = product.plant_nutrition_category?.slug || 'all'
  const href = `/plant-nutrition-guides/${categorySlug}/${product.slug}`

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/50 group">
      <Link href={href} className="block">
        <div className="relative aspect-square bg-white">
          {product.images && product.images[0] && product.images[0].img?.src ? (
            <Image
              src={product.images[0].img.src}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
              <Leaf className="w-16 h-16 text-muted-foreground/30" />
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 space-y-3 border-t">
        {product.brand && (
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            {product.brand.name}
          </p>
        )}

        <Link href={href}>
          <h3 className="font-semibold text-sm leading-tight capitalize line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1.5">
            <Beaker className="w-3.5 h-3.5" />
            <span>{product.active_ingredients?.length || 0} active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Leaf className="w-3.5 h-3.5" />
            <span>{product.plant_nutrition_category?.name || 'Plant Nutrition'}</span>
          </div>
        </div>

        {product.show_price && product.sale_price > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Guide Price:</span>
            {product.was_price > 0 && product.was_price > product.sale_price && (
              <span className="text-xs text-muted-foreground line-through">${product.was_price.toFixed(2)}</span>
            )}
            <span className="text-sm font-semibold text-primary">${product.sale_price.toFixed(2)}</span>
          </div>
        )}

        <Link href={href} className="block pt-2">
          <Button
            variant="outline"
            className="w-full"
            size="sm"
            onClick={() => sendGTMEvent({ event: 'link', value: 'ViewPlantNutritionGuide' })}
          >
            View Guide
          </Button>
        </Link>
      </div>
    </div>
  )
}
