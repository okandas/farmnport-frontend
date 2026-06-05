"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { formatProductName } from "@/lib/utilities"
import { AddToCartButton, CartProductType } from "@/components/cart/AddToCartButton"

interface ProductCardProps {
  href: string
  imageSrc?: string
  name: string
  brand?: string
  meta?: string
  mode: "buy" | "guide"
  buttonLabel?: string
  // buy mode
  salePrice?: number
  wasPrice?: number
  showWasPrice?: boolean
  availableForSale?: boolean
  stockLevel?: number
  productId?: string
  productType?: CartProductType
  productSlug?: string
  loginRedirect?: string
  preorderHref?: string
  hasVariants?: boolean
  variantPriceRange?: { min: number; max: number }
  pickupOnly?: boolean
}

export function ProductCard({
  href, imageSrc, name, brand, meta, mode, buttonLabel = "View Guide",
  salePrice, wasPrice, showWasPrice, availableForSale,
  productId, productType, productSlug, loginRedirect, preorderHref, stockLevel, hasVariants, variantPriceRange, pickupOnly,
}: ProductCardProps) {
  const inStock = availableForSale && (stockLevel === undefined || stockLevel > 0)

  const variantPriceLabel = variantPriceRange
    ? variantPriceRange.min === variantPriceRange.max
      ? `$${(variantPriceRange.min / 100).toFixed(2)}`
      : `$${(variantPriceRange.min / 100).toFixed(2)} – $${(variantPriceRange.max / 100).toFixed(2)}`
    : null

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/50 group">
      <Link href={href} className="block">
        <div className="relative aspect-square bg-white">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-muted/30" />
          )}
          {pickupOnly && (
            <span className="absolute top-2 left-2 bg-background/90 text-foreground text-[10px] font-medium px-2 py-0.5 rounded-full border border-border">
              Pickup only
            </span>
          )}
        </div>
      </Link>

      <div className="p-4 space-y-3 border-t">
        <Link href={href}>
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {formatProductName(name)}
          </h3>
        </Link>

        {brand && (
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{brand}</p>
        )}

        {meta && (
          <p className="text-xs text-muted-foreground pt-2 border-t">{meta}</p>
        )}

        {mode === "buy" ? (
          <div className="space-y-2">
            {!hasVariants && salePrice && salePrice > 0 && (
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold">${(salePrice / 100).toFixed(2)}</span>
                {showWasPrice && wasPrice && wasPrice > 0 && wasPrice > salePrice && (
                  <span className="text-xs text-muted-foreground line-through">${(wasPrice / 100).toFixed(2)}</span>
                )}
              </div>
            )}
            {hasVariants ? (
              <>
                {variantPriceLabel && (
                  <p className="text-lg text-muted-foreground">{variantPriceLabel}</p>
                )}
                <Link href={href} className="block mt-3">
                  <Button variant="outline" className="w-full" size="sm">Choose Options</Button>
                </Link>
              </>
            ) : !inStock && preorderHref ? (
              <Link href={preorderHref} className="block mt-3">
                <Button variant="outline" className="w-full" size="sm">Pre-order</Button>
              </Link>
            ) : (
              <AddToCartButton
                productId={productId!}
                productType={productType!}
                productName={name}
                productSlug={productSlug!}
                imageSrc={imageSrc}
                unitPrice={salePrice && salePrice > 0 ? salePrice : null}
                available={inStock}
                loginRedirect={loginRedirect ?? href}
              />
            )}
          </div>
        ) : (
          <Link href={href} className="block">
            <Button variant="outline" className="w-full" size="sm">
              {buttonLabel}
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
