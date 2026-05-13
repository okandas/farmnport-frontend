import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Truck, Shield, RotateCcw } from "lucide-react"
import { AddToCartButton, type CartProductType } from "@/components/cart/AddToCartButton"
import { ShareButton } from "@/components/shop/ShareButton"

interface BuyProductDetailProps {
  // Identity
  productId: string
  productName: string
  productSlug: string
  productType: CartProductType
  // Images
  images?: Array<{ img?: { src?: string } }>
  fallbackIcon?: React.ReactNode
  // Brand
  brand?: { id: string; name: string } | null
  brandHref: string
  // Category
  categoryName?: string
  // Pricing — pass as dollars (already divided by 100)
  salePrice?: number | null
  wasPrice?: number | null
  // Availability
  availableForSale?: boolean
  // Navigation
  breadcrumb: { href: string; label: string }
  guideHref?: string
  loginRedirect: string
  shareUrl?: string
  // Slots
  extraStats?: React.ReactNode
  tabsContent?: React.ReactNode
  extraActions?: React.ReactNode
}

export function BuyProductDetail({
  productId,
  productName,
  productSlug,
  productType,
  images = [],
  fallbackIcon,
  brand,
  brandHref,
  categoryName,
  salePrice,
  wasPrice,
  availableForSale,
  breadcrumb,
  guideHref,
  loginRedirect,
  shareUrl,
  extraStats,
  tabsContent,
  extraActions,
}: BuyProductDetailProps) {
  const discount =
    salePrice && wasPrice && wasPrice > salePrice
      ? Math.round((1 - salePrice / wasPrice) * 100)
      : null

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span className="mx-2">/</span>
            <Link href={breadcrumb.href} className="hover:text-foreground">{breadcrumb.label}</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground capitalize">{productName}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column — Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-lg border overflow-hidden">
              {images[0]?.img?.src ? (
                <Image
                  src={images[0].img.src}
                  alt={productName}
                  fill
                  sizes="(max-width: 1024px) 100vw, 450px"
                  className="object-contain p-4"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  {fallbackIcon}
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square bg-white rounded border hover:border-primary"
                  >
                    {img.img?.src && (
                      <Image
                        src={img.img.src}
                        alt={`${productName} ${idx + 1}`}
                        fill
                        sizes="(max-width: 1024px) 25vw, 100px"
                        className="object-contain p-2"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column — Product Info */}
          <div className="space-y-6">
            {brand && (
              <Link
                href={brandHref}
                className="text-sm text-primary hover:underline uppercase tracking-wide font-medium"
              >
                {brand.name}
              </Link>
            )}

            <h1 className="text-3xl font-bold capitalize leading-tight">{productName}</h1>

            {categoryName && (
              <Badge variant="secondary" className="capitalize">{categoryName}</Badge>
            )}

            {extraStats}

            <div className="h-px bg-border w-full" />

            {/* Price */}
            {salePrice != null && salePrice > 0 && (
              <div className="space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-primary">${salePrice.toFixed(2)}</span>
                  {wasPrice && wasPrice > salePrice && (
                    <>
                      <span className="text-lg text-muted-foreground line-through">${wasPrice.toFixed(2)}</span>
                      {discount && <Badge variant="destructive">{discount}% OFF</Badge>}
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Incl. Tax</p>
              </div>
            )}

            {/* Stock status */}
            <div className="flex items-center gap-2">
              {availableForSale ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">In Stock</span>
                </>
              ) : (
                <>
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-400">Out of Stock</span>
                </>
              )}
            </div>

            <AddToCartButton
              productId={productId}
              productType={productType}
              productName={productName}
              productSlug={productSlug}
              imageSrc={images[0]?.img?.src}
              unitPrice={salePrice ?? null}
              available={availableForSale}
              loginRedirect={loginRedirect}
            />

            {/* Delivery & Returns */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Free Delivery</div>
                  <div className="text-xs text-muted-foreground">On orders over $50</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Quality Guaranteed</div>
                  <div className="text-xs text-muted-foreground">Authentic products only</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RotateCcw className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <div className="font-medium text-sm">7-Day Returns</div>
                  <div className="text-xs text-muted-foreground">Unopened products</div>
                </div>
              </div>
            </div>

            {guideHref && (
              <Link
                href={guideHref}
                className="text-sm text-primary hover:underline inline-flex items-center gap-2"
              >
                View Application Guide &amp; Dosage Information <span>→</span>
              </Link>
            )}

            {extraActions}

            {/* Seller footer */}
            {shareUrl && (
              <div className="space-y-2 text-xs text-muted-foreground border-t pt-4">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-foreground">Sold by</span>
                  <span>farmnport</span>
                </div>
                <ShareButton url={shareUrl} title={`Buy ${productName} on farmnport`} />
              </div>
            )}
          </div>
        </div>

        {tabsContent && <div className="mt-12">{tabsContent}</div>}
      </div>
    </div>
  )
}
