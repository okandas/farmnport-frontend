"use client"

import { useQuery } from "@tanstack/react-query"
import { Sprout } from "lucide-react"
import { Button } from "@/components/ui/button"
import { queryAllSeedProducts } from "@/lib/query"
import { SeedProductCard } from "@/components/seeds/SeedProductCard"
import { useQueryStates, parseAsArrayOf, parseAsString, parseAsInteger } from "nuqs"

interface BuySeedProductsClientProps {
  initialProducts: any[]
  initialTotal: number
}

export function BuySeedProductsClient({ initialProducts, initialTotal }: BuySeedProductsClientProps) {
  const [queryState, setQueryState] = useQueryStates({
    brand: parseAsArrayOf(parseAsString),
    p: parseAsInteger.withDefault(1),
  })

  const hasFilters = (queryState.brand && queryState.brand.length > 0) || queryState.p > 1

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["seed-products-shop", queryState.p, queryState.brand],
    queryFn: () => queryAllSeedProducts({
      p: queryState.p,
      brand: queryState.brand || [],
    }),
    refetchOnWindowFocus: false,
    placeholderData: !hasFilters ? { data: { data: initialProducts, total: initialTotal } } as any : undefined,
  })

  const products = productsData?.data?.data || []
  const totalPages = Math.ceil((productsData?.data?.total || 0) / 20)

  const handlePageChange = (newPage: number) => {
    setQueryState({ p: newPage })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div>
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="aspect-square bg-muted" />
                <div className="p-4 space-y-3 border-t">
                  <div className="h-3 bg-muted rounded w-1/3" />
                  <div className="h-4 bg-muted rounded w-4/5" />
                  <div className="h-10 bg-muted rounded mt-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <Sprout className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No seed products found.</p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {products.length} of {productsData?.data?.total || 0} products
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((product: any) => (
              <SeedProductCard key={product.id} product={product} mode="shop" />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={queryState.p === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className="min-w-[40px]"
                >
                  {pageNum}
                </Button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
