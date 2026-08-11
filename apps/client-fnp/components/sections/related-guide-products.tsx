"use client"

import { RelatedProducts } from "@/components/sections/related-products"

interface Props {
  collection: string
  categoryName: string
  currentSlug: string
  targets?: string[]
  targetCrops?: string[]
  targetAnimals?: string[]
  title?: string
}

export function RelatedGuideProducts({ collection, categoryName, currentSlug, targets, targetCrops, targetAnimals, title }: Props) {
  const query = categoryName

  return (
    <RelatedProducts
      collection={collection}
      query={query}
      excludeSlug={currentSlug}
      title={title || `Related ${categoryName}`}
    />
  )
}
