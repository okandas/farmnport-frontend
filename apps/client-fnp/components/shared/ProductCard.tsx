"use client"

import Link from "next/link"
import Image from "next/image"
import { sendGTMEvent } from "@next/third-parties/google"
import { Button } from "@/components/ui/button"
import { formatProductName, centsToDollars } from "@/lib/utilities"
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
  isTest?: boolean
  singleUnit?: boolean
  imageFill?: boolean
  layout?: "grid" | "list"
}

export function ProductCard({
  href, imageSrc, name, brand, meta, mode, buttonLabel = "View Guide",
  salePrice, wasPrice, showWasPrice, availableForSale,
  productId, productType, productSlug, loginRedirect, preorderHref, stockLevel, hasVariants, variantPriceRange, pickupOnly, isTest, singleUnit, imageFill, layout = "grid",
}: ProductCardProps) {
  const inStock = availableForSale && (stockLevel === undefined || stockLevel > 0)

  const variantPriceLabel = variantPriceRange
    ? variantPriceRange.min === variantPriceRange.max
      ? `$${(variantPriceRange.min / 100).toFixed(2)}`
      : `$${(variantPriceRange.min / 100).toFixed(2)} – $${(variantPriceRange.max / 100).toFixed(2)}`
    : null

  if (layout === "list") {
    return (
      <div className="bg-card border border-border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/50 group flex">
        <Link href={href} className="block shrink-0">
          <div className="relative w-32 h-32 sm:w-44 sm:h-44 bg-white">
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={name}
                fill
                sizes="200px"
                className={`${imageFill ? "object-cover p-2" : "object-contain"}`}
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
        <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between min-w-0">
          <div>
            <Link href={href} onClick={mode === "guide" ? () => sendGTMEvent({ event: 'view_guide', value: name, page_location: href }) : undefined}>
              <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {formatProductName(name)}
              </h3>
            </Link>
            {brand && <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium mt-1">{brand}</p>}
            {meta && <p className="text-[11px] text-muted-foreground mt-1">{meta}</p>}
          </div>
          <div className="flex items-center justify-between gap-2 mt-2">
            {mode === "buy" ? (
              <>
                <div>
                  {!hasVariants && (salePrice ?? 0) > 0 && (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-bold leading-none">{centsToDollars(salePrice ?? 0)}</span>
                      {showWasPrice && wasPrice && wasPrice > 0 && wasPrice > (salePrice ?? 0) && (
                        <span className="text-xs text-muted-foreground line-through">{centsToDollars(wasPrice)}</span>
                      )}
                    </div>
                  )}
                  {hasVariants && variantPriceRange && (
                    <p className="text-lg font-bold leading-none">
                      {variantPriceRange.min === variantPriceRange.max
                        ? `$${(variantPriceRange.min / 100).toFixed(2)}`
                        : `$${(variantPriceRange.min / 100).toFixed(2)} – $${(variantPriceRange.max / 100).toFixed(2)}`}
                    </p>
                  )}
                </div>
                <div className="shrink-0">
                  {hasVariants ? (
                    <Link href={href}><Button variant="outline" size="sm">Options</Button></Link>
                  ) : !inStock && preorderHref ? (
                    <Link href={preorderHref}><Button variant="outline" size="sm">Pre-order</Button></Link>
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
                      singleUnit={singleUnit}
                    />
                  )}
                </div>
              </>
            ) : (
              <Link href={href} onClick={() => sendGTMEvent({ event: 'view_guide', value: name, page_location: href })}>
                <Button variant="outline" size="sm">{buttonLabel}</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/50 group flex flex-col">
      <Link href={href} className="block">
        <div className="relative aspect-square bg-muted/30 dark:bg-white">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`${imageFill ? "object-cover p-2" : "object-contain"} transition-transform duration-200 group-hover:scale-105`}
            />
          ) : (
            <div className="absolute inset-0 bg-muted/30" />
          )}
          {pickupOnly && (
            <span className="absolute top-2 left-2 bg-background/90 text-foreground text-[10px] font-medium px-2 py-0.5 rounded-full border border-border">
              Pickup only
            </span>
          )}
          {isTest && (
            <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
              Test Item
            </span>
          )}
        </div>
      </Link>

      <div className="p-3 sm:p-4 border-t flex flex-col flex-1">
        <Link href={href} onClick={mode === "guide" ? () => sendGTMEvent({ event: 'view_guide', value: name, page_location: href }) : undefined}>
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {formatProductName(name)}
          </h3>
        </Link>

        {brand && (
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium mt-1">{brand}</p>
        )}

        {meta && (
          <p className="text-[11px] text-muted-foreground mt-1">{meta}</p>
        )}

        <div className="mt-auto pt-2">
          {mode === "buy" ? (
            <div className="space-y-2">
              {!hasVariants && (salePrice ?? 0) > 0 && (
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold">{centsToDollars(salePrice ?? 0)}</span>
                  {showWasPrice && wasPrice && wasPrice > 0 && wasPrice > (salePrice ?? 0) && (
                    <span className="text-xs text-muted-foreground line-through">{centsToDollars(wasPrice)}</span>
                  )}
                </div>
              )}
              {hasVariants ? (
                <>
                  {variantPriceLabel && (
                    <p className="text-lg font-bold">{variantPriceLabel}</p>
                  )}
                  <Link href={href} className="block">
                    <Button variant="outline" className="w-full" size="sm">Choose Options</Button>
                  </Link>
                </>
              ) : !inStock && preorderHref ? (
                <Link href={preorderHref} className="block">
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
                  singleUnit={singleUnit}
                />
              )}
            </div>
          ) : (
            <Link href={href} className="block" onClick={() => sendGTMEvent({ event: 'view_guide', value: name, page_location: href })}>
              <Button variant="outline" className="w-full" size="sm">
                {buttonLabel}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
