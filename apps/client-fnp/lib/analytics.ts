declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
  }
}

interface PurchaseItem {
  item_id: string
  item_name: string
  item_category: string
  price: number
  quantity: number
}

export function trackPurchase(params: {
  transaction_id: string
  value: number       // in dollars (not cents)
  currency?: string
  items: PurchaseItem[]
}) {
  if (typeof window === "undefined") return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ ecommerce: null }) // clear previous ecommerce data
  window.dataLayer.push({
    event: "purchase",
    ecommerce: {
      transaction_id: params.transaction_id,
      value: params.value,
      currency: params.currency ?? "USD",
      items: params.items,
    },
  })
}
