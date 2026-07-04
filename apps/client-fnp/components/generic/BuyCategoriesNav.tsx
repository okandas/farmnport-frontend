import { bookingsEnabled } from "@/flags"
import { BuyCategoriesNavClient } from "./BuyCategoriesNavClient"

const ALL_CATEGORIES: { label: string; href: string; flag?: () => Promise<boolean> }[] = [
  { label: "Bookings", href: "/bookings", flag: bookingsEnabled },
  { label: "Agrochemicals", href: "/buy-agrochemicals" },
  { label: "Animal Health", href: "/buy-animal-health" },
  { label: "Animal Feed", href: "/buy-feeds" },
  { label: "Plant Nutrition", href: "/buy-plant-nutrition" },
  { label: "Seeds", href: "/buy-seed-products" },
]

export async function getBuyCategories(): Promise<{ label: string; href: string }[]> {
  const resolved = await Promise.all(
    ALL_CATEGORIES.map(async (c) => {
      if (!c.flag) return c
      const enabled = await c.flag()
      return enabled ? c : null
    })
  )
  return resolved.filter(Boolean) as { label: string; href: string }[]
}

export async function BuyCategoriesNav() {
  const categories = await getBuyCategories()
  return <BuyCategoriesNavClient categories={categories} />
}
