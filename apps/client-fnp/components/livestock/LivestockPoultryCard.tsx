"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { AddToCartButton } from "@/components/cart/AddToCartButton"

interface LivestockPoultryCardProps {
  product: any
  mode: "guide" | "shop"
}

export function LivestockPoultryCard({ product, mode }: LivestockPoultryCardProps) {
  const href = `/buy-livestock-poultry/${product.slug}`

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/50 group">
      {/* Image */}
      <Link href={href} className="block">
        <div className="relative aspect-square bg-white">
          {product.images?.[0]?.img?.src ? (
            <Image
              src={product.images[0].img.src}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-muted/30" />
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 space-y-3 border-t">
        {product.brand && (
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            {product.brand.name}
          </p>
        )}

        <Link href={href}>
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t">
          {product.species && (
            <span className="capitalize">{product.species}</span>
          )}
          {product.type && (
            <span className="capitalize text-muted-foreground/70">· {product.type}</span>
          )}
        </div>

        {mode === "shop" ? (
          <div className="pt-3 space-y-2">
            <div className="flex items-baseline gap-2 h-7">
              {product.sale_price > 0 ? (
                <>
                  <span className="text-lg font-bold">${(product.sale_price / 100).toFixed(2)}</span>
                  {product.was_price > 0 && product.was_price > product.sale_price && (
                    <span className="text-xs text-muted-foreground line-through">${(product.was_price / 100).toFixed(2)}</span>
                  )}
                </>
              ) : (
                <span className="text-sm text-muted-foreground">Price on request</span>
              )}
            </div>
            <AddToCartButton
              productId={product.id}
              productType="livestock_poultry"
              productName={product.name}
              productSlug={product.slug}
              imageSrc={product.images?.[0]?.img?.src}
              unitPrice={product.sale_price > 0 ? product.sale_price : null}
              loginRedirect={href}
            />
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
