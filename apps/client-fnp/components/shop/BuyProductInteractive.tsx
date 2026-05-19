"use client"

import { useState, useEffect, ReactNode } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Check, Share2 } from "lucide-react"
import { AddToCartButton, CartProductType } from "@/components/cart/AddToCartButton"

interface BuyProductInteractiveProps {
  product: any
  slug: string
  baseUrl: string
  productType: CartProductType
  categoryName?: string
  brandHref?: string
  shopHref: string
  guideHref?: string
  guideLabel?: string
  loginRedirect: string
  fallbackIcon?: ReactNode
  tabsContent: ReactNode
}

export function BuyProductInteractive({
  product,
  slug,
  baseUrl,
  productType,
  categoryName,
  brandHref,
  shopHref,
  guideHref,
  guideLabel = "View Application Guide & Dosage Information →",
  loginRedirect,
  fallbackIcon,
  tabsContent,
}: BuyProductInteractiveProps) {
  const hasVariants = product.variants && product.variants.length > 0
  const [selectedVariant, setSelectedVariant] = useState<any>(hasVariants ? product.variants[0] : null)
  const [selectedImage, setSelectedImage] = useState(0)
const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const displayPrice = selectedVariant?.sale_price
    ? selectedVariant.sale_price / 100
    : product.show_price && product.sale_price > 0
    ? product.sale_price / 100
    : null

  const displayWasPrice =
    selectedVariant?.was_price > 0 && selectedVariant.was_price > selectedVariant.sale_price
      ? selectedVariant.was_price / 100
      : product.show_was_price && product.was_price > 0 && product.was_price > product.sale_price
      ? product.was_price / 100
      : null

  const savings = displayPrice && displayWasPrice ? displayWasPrice - displayPrice : null
  const discount = displayPrice && displayWasPrice ? Math.round((1 - displayPrice / displayWasPrice) * 100) : null
  const images = product.images || []

  const handleShare = async () => {
    const url = `${baseUrl}${shopHref}/${slug}?utm_source=farmnport&utm_medium=share&utm_content=${slug}`
    const title = `Buy ${product.name} on farmnport`
    if (navigator.share) {
      await navigator.share({ title, url })
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  return (
    <div className="pb-20 lg:pb-0">
      <div className="grid lg:grid-cols-[480px_1fr_300px] gap-6 items-start">

        {/* ── Column 1: Image ── */}
        <div className="flex gap-2">
          {images.length > 1 && (
            <div className="flex flex-col gap-2 shrink-0">
              {images.map((img: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-16 h-16 rounded-lg border-2 overflow-hidden bg-white transition-colors ${
                    selectedImage === idx ? "border-primary" : "border-border hover:border-primary/50"
                  }`}
                >
                  {img.img?.src && (
                    <Image src={img.img.src} alt={`${product.name} ${idx + 1}`} fill sizes="64px" className="object-contain p-1" />
                  )}
                </button>
              ))}
            </div>
          )}
          <div className="relative flex-1 bg-white rounded-xl border overflow-hidden" style={{ height: "520px" }}>
            {images[selectedImage]?.img?.src ? (
              <Image
                src={images[selectedImage].img.src}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 480px"
                className="object-contain p-10"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                {fallbackIcon}
              </div>
            )}
          </div>
        </div>

        {/* ── Column 2: Product info ── */}
        <div className="space-y-5">
          {product.brand && brandHref && (
            <Link href={brandHref} className="text-xs text-primary hover:underline uppercase tracking-widest font-semibold">
              {product.brand.name}
            </Link>
          )}

          <h1 className="text-2xl lg:text-3xl font-bold capitalize leading-snug">{product.name}</h1>

          {categoryName && (
            <Badge variant="secondary" className="capitalize">{categoryName}</Badge>
          )}

          <div className="h-px bg-border" />

          {hasVariants && (
            <div>
              <p className="text-sm font-semibold mb-3">Pack size</p>
              <ul className="sr-only">
                {product.variants.map((v: any, idx: number) => {
                  const vp = v.sale_price ? v.sale_price / 100 : null
                  return <li key={idx}>{product.name} {v.name}{vp ? ` - $${vp.toFixed(2)}` : ""}</li>
                })}
              </ul>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v: any, idx: number) => {
                  const isSelected = selectedVariant?.name === v.name
                  const vp = v.sale_price ? v.sale_price / 100 : null
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedVariant(v)}
                      className={`relative px-4 py-2.5 rounded-lg border-2 text-sm transition-colors text-left ${
                        isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-2 h-2 text-white" />
                        </span>
                      )}
                      <p className="font-semibold">{v.name}</p>
                      {vp && (
                        <p className={`text-xs mt-0.5 ${isSelected ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                          ${vp.toFixed(2)}
                        </p>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {tabsContent}

          {guideHref && (
            <Link href={guideHref} className="text-sm text-primary hover:underline inline-flex items-center gap-1">
              {guideLabel}
            </Link>
          )}
        </div>

        {/* ── Column 3: Pricing panel ── */}
        <div className="sticky top-20">
          <div className="border rounded-xl bg-card overflow-hidden">
            <div className="p-4 border-b">
              {displayPrice !== null ? (
                <>
                  {displayWasPrice && (
                    <p className="text-xs text-muted-foreground leading-none mb-0.5">
                      Was <span className="line-through">${displayWasPrice.toFixed(2)}</span>
                      {discount && <span className="ml-1 text-green-700 dark:text-green-400">-{discount}%</span>}
                    </p>
                  )}
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold leading-none">${displayPrice.toFixed(2)}</span>
                    {selectedVariant && <span className="text-xs text-muted-foreground">{selectedVariant.name}</span>}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">Price when purchased online</p>
                  {savings && <p className="text-xs text-green-700 dark:text-green-400 font-medium mt-0.5">You save ${savings.toFixed(2)}</p>}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Price on request</p>
              )}
              {!product.available_for_sale && (
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  <span className="text-xs font-medium text-red-700 dark:text-red-400">Out of stock</span>
                </div>
              )}
              <AddToCartButton
                productId={product.id}
                sku={selectedVariant?.sku}
                productType={productType}
                productName={selectedVariant ? `${product.name} - ${selectedVariant.name}` : product.name}
                productSlug={slug}
                imageSrc={product.images?.[0]?.img?.src}
                unitPrice={displayPrice}
                available={product.available_for_sale}
                loginRedirect={loginRedirect}
              />
            </div>

<div className="px-5 pb-5 space-y-2.5 text-xs text-muted-foreground border-t pt-4">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-foreground">Sold by</span>
                <span>farmnport</span>
              </div>
              <button onClick={handleShare} className="flex items-start gap-1.5 hover:text-foreground transition-colors">
                <Share2 className="w-3 h-3 shrink-0 mt-0.5" />
                <span>Share this product with someone who needs it</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {mounted && createPortal(
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[999] bg-background border-t px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">{product.name}{selectedVariant ? ` · ${selectedVariant.name}` : ""}</p>
            {displayPrice !== null
              ? <p className="text-base font-bold leading-tight">${displayPrice.toFixed(2)}</p>
              : <p className="text-sm text-muted-foreground">Price on request</p>
            }
          </div>
          <Link
            href={`/contact?subject=Enquiry: ${encodeURIComponent(product.name)}${selectedVariant ? ` - ${selectedVariant.name}` : ""}&utm_source=farmnport&utm_medium=buy-page&utm_content=${slug}`}
            className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm px-5 py-2.5 rounded-full transition-colors"
          >
            Want to buy
          </Link>
        </div>,
        document.body
      )}
    </div>
  )
}
