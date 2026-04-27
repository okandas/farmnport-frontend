"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus, Beaker, Check, ShoppingCart, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShareButton } from "./ShareButton"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { addToCart } from "@/lib/query"
import { useCart } from "@/contexts/cart-context"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface ProductInteractiveProps {
  chemical: any
  slug: string
  baseUrl: string
}

export function ProductInteractive({ chemical, slug, baseUrl }: ProductInteractiveProps) {
  const hasVariants = chemical.variants && chemical.variants.length > 0
  const [selectedVariant, setSelectedVariant] = useState<any>(hasVariants ? chemical.variants[0] : null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [fulfillment, setFulfillment] = useState<"delivery" | "pickup">("delivery")
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const { data: session } = useSession()
  const router = useRouter()
  const { openCart } = useCart()
  const qc = useQueryClient()

  const addMutation = useMutation({
    mutationFn: addToCart,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] })
      openCart()
    },
    onError: () => toast.error("Failed to add to cart"),
  })

  function handleAddToCart() {
    if (!session) {
      router.push(`/login?next=/buy-agrochemicals/${slug}`)
      return
    }
    if (!displayPrice) {
      toast.info("Please contact us for pricing")
      return
    }
    addMutation.mutate({
      product_id: chemical.id,
      product_type: "agrochemical",
      product_name: selectedVariant ? `${chemical.name} - ${selectedVariant.name}` : chemical.name,
      product_slug: slug,
      image_src: chemical.images?.[0]?.img?.src ?? "",
      unit_price: displayPrice,
      quantity,
    })
  }

  const displayPrice = selectedVariant?.sale_price
    ? selectedVariant.sale_price / 100
    : chemical.show_price && chemical.sale_price > 0
    ? chemical.sale_price / 100
    : null

  const displayWasPrice =
    selectedVariant?.was_price > 0 && selectedVariant.was_price > selectedVariant.sale_price
      ? selectedVariant.was_price / 100
      : chemical.was_price > 0 && chemical.was_price > chemical.sale_price
      ? chemical.was_price / 100
      : null

  const savings = displayPrice && displayWasPrice ? displayWasPrice - displayPrice : null
  const discount = displayPrice && displayWasPrice ? Math.round((1 - displayPrice / displayWasPrice) * 100) : null

  const images = chemical.images || []

  return (
    <div className="pb-20 lg:pb-0">
    <div className="grid lg:grid-cols-[480px_1fr_300px] gap-6 items-start">

      {/* ── Column 1: Image ── */}
      <div className="flex gap-2">
        {/* Vertical thumbnail strip */}
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
                  <Image src={img.img.src} alt={`${chemical.name} ${idx + 1}`} fill sizes="64px" className="object-contain p-1" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Main image — tall square */}
        <div className="relative flex-1 bg-white rounded-xl border overflow-hidden" style={{ height: "520px" }}>
          {images[selectedImage]?.img?.src ? (
            <Image
              src={images[selectedImage].img.src}
              alt={chemical.name}
              fill
              sizes="(max-width: 1024px) 100vw, 480px"
              className="object-contain p-10"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Beaker className="w-28 h-28 text-muted-foreground/20" />
            </div>
          )}
        </div>
      </div>

      {/* ── Column 2: Product info ── */}
      <div className="space-y-5">
        {chemical.brand && (
          <Link href={`/buy-agrochemicals?brand=${chemical.brand.id}`} className="text-xs text-primary hover:underline uppercase tracking-widest font-semibold">
            {chemical.brand.name}
          </Link>
        )}

        <h1 className="text-2xl lg:text-3xl font-bold capitalize leading-snug">{chemical.name}</h1>

        {chemical.agrochemical_category && (
          <Badge variant="secondary" className="capitalize">{chemical.agrochemical_category.name}</Badge>
        )}

        <div className="h-px bg-border" />

        {/* Variant Picker */}
        {hasVariants && (
          <div>
            <p className="text-sm font-semibold mb-3">Pack size</p>
            {/* sr-only: crawler-readable pack size list */}
            <ul className="sr-only">
              {chemical.variants.map((v: any, idx: number) => {
                const variantPrice = v.sale_price ? v.sale_price / 100 : null
                return (
                  <li key={idx}>
                    {chemical.name} {v.name}{variantPrice ? ` - $${variantPrice.toFixed(2)}` : ""}
                  </li>
                )
              })}
            </ul>
            <div className="flex flex-wrap gap-2">
              {chemical.variants.map((v: any, idx: number) => {
                const isSelected = selectedVariant?.name === v.name
                const variantPrice = v.sale_price ? v.sale_price / 100 : null
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedVariant(v)}
                    className={`relative px-4 py-2.5 rounded-lg border-2 text-sm transition-colors text-left ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-2 h-2 text-white" />
                      </span>
                    )}
                    <p className="font-semibold">{v.name}</p>
                    {variantPrice && (
                      <p className={`text-xs mt-0.5 ${isSelected ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                        ${variantPrice.toFixed(2)}
                      </p>
                    )}
                    {v.quantity > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5">{v.quantity} avail.</p>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-1">
            {["overview", "active-ingredients", "targets"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-sm px-3 pb-2 capitalize"
              >
                {tab.replace("-", " ")}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {chemical.product_overview
                ? chemical.product_overview
                : chemical.agrochemical_category?.name
                ? <>This is a <span className="font-medium capitalize">{chemical.agrochemical_category.name}</span> designed for effective pest and disease control when used as directed.</>
                : `${chemical.name} is a professional agrochemical for crop protection.`}
            </p>
          </TabsContent>

          <TabsContent value="active-ingredients" className="mt-4">
            {chemical.active_ingredients?.length > 0 ? (
              <div className="divide-y">
                {chemical.active_ingredients.map((ai: any, idx: number) => (
                  <div key={idx} className="flex justify-between py-2 text-sm">
                    <span className="capitalize">{ai.name}</span>
                    <span className="font-semibold">{ai.dosage_value} {ai.dosage_unit}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-4">No information available.</p>
            )}
          </TabsContent>

          <TabsContent value="targets" className="mt-4">
            {chemical.targets?.length > 0 ? (
              <ul className="space-y-1.5">
                {chemical.targets.map((target: any, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0 mt-1.5" />
                    <span>
                      <span className="font-medium">{target.name}</span>
                      {target.scientific_name && (
                        <span className="text-xs text-muted-foreground italic ml-1">({target.scientific_name})</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground mt-4">No information available.</p>
            )}
          </TabsContent>
        </Tabs>

        <Link
          href={`/agrochemical-guides/${chemical.agrochemical_category?.slug || ""}/${slug}?from=buy-agrochemicals/${slug}`}
          className="text-sm text-primary hover:underline inline-flex items-center gap-1"
        >
          View Application Guide & Dosage Information →
        </Link>
      </div>

      {/* ── Column 3: Pricing panel ── */}
      <div className="sticky top-20">
        <div className="border rounded-xl bg-card overflow-hidden">

          {/* Price + CTA */}
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
                {selectedVariant?.quantity > 0 && <p className="text-[11px] text-muted-foreground mt-0.5">{selectedVariant.quantity} available</p>}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Price on request</p>
            )}
            {!chemical.available_for_sale && (
              <div className="flex items-center gap-1.5 mt-1">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                <span className="text-xs font-medium text-red-700 dark:text-red-400">Out of stock</span>
              </div>
            )}
            <button
              onClick={handleAddToCart}
              disabled={addMutation.isPending || !chemical.available_for_sale}
              className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-semibold text-sm py-2.5 rounded-full transition-colors mt-3"
            >
              {addMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )}
              {chemical.available_for_sale ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>

          {/* Fulfillment */}
          <div className="p-5 border-b space-y-3">
            <p className="text-sm font-bold">How do you want your item?</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFulfillment("delivery")}
                className={`relative rounded-xl border-2 p-3 text-left transition-colors ${
                  fulfillment === "delivery" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                }`}
              >
                {fulfillment === "delivery" && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </span>
                )}
                <p className="text-2xl mb-1">🚚</p>
                <p className="text-sm font-semibold">Delivery</p>
                <p className="text-xs text-muted-foreground">To your door</p>
              </button>
              <button
                onClick={() => setFulfillment("pickup")}
                className={`relative rounded-xl border-2 p-3 text-left transition-colors ${
                  fulfillment === "pickup" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                }`}
              >
                {fulfillment === "pickup" && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </span>
                )}
                <p className="text-2xl mb-1">🏪</p>
                <p className="text-sm font-semibold">Pickup</p>
                <p className="text-xs text-muted-foreground">From seller</p>
              </button>
            </div>
          </div>

          {/* Qty + Add to Cart */}
          <div className="p-5 border-b space-y-3">
            <div className="flex items-center gap-3">
              <p className="text-sm font-medium">Qty:</p>
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors border-r">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors border-l">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              {displayPrice && (
                <span className="text-sm font-bold ml-auto">${(displayPrice * quantity).toFixed(2)}</span>
              )}
            </div>
          </div>

          {/* Seller footer */}
          <div className="px-5 pb-5 space-y-2.5 text-xs text-muted-foreground border-t pt-4">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-foreground">Sold by</span>
              <span>farmnport</span>
            </div>
            {/* <div className="flex items-center gap-1.5">
              <RotateCcw className="w-3 h-3 shrink-0" />
              <span>Returns accepted — contact seller</span>
            </div> */}
            <div className="flex items-center gap-1.5">
              <ShareButton
                url={`${baseUrl}/buy-agrochemicals/${slug}?utm_source=farmnport&utm_medium=share&utm_content=${slug}`}
                title={`Buy ${chemical.name} on farmnport`}
              />
            </div>
          </div>
        </div>
      </div>

    </div>

    {/* Mobile sticky CTA — rendered via portal to guarantee fixed positioning */}
    {mounted && createPortal(
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[999] bg-background border-t px-4 py-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground truncate">{chemical.name}{selectedVariant ? ` · ${selectedVariant.name}` : ""}</p>
          {displayPrice !== null
            ? <p className="text-base font-bold leading-tight">${displayPrice.toFixed(2)}</p>
            : <p className="text-sm text-muted-foreground">Price on request</p>
          }
        </div>
        <Link
          href={`/contact?subject=Enquiry: ${encodeURIComponent(chemical.name)}${selectedVariant ? ` - ${selectedVariant.name}` : ""}&utm_source=farmnport&utm_medium=buy-page&utm_content=${slug}`}
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
