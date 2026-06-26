declare global {
  interface Window {
    dataLayer: object[]
  }
}

interface PurchaseItem {
  item_id: string
  item_name: string
  item_category: string
  price: number
  quantity: number
}

interface EcomItem {
  item_id: string
  item_name: string
  item_category: string
  price: number
  quantity: number
}

function pushEcom(event: string, payload: Record<string, unknown>) {
  if (typeof window === "undefined") return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ ecommerce: null })
  window.dataLayer.push({ event, ecommerce: payload })
}

export function trackViewItem(params: {
  item_id: string
  item_name: string
  item_category: string
  price: number        // in dollars
}) {
  pushEcom("view_item", {
    currency: "USD",
    value: params.price,
    items: [{ ...params, quantity: 1 }],
  })
}

export function trackAddToCart(params: {
  item_id: string
  item_name: string
  item_category: string
  price: number        // in dollars
  quantity: number
}) {
  pushEcom("add_to_cart", {
    currency: "USD",
    value: params.price * params.quantity,
    items: [params],
  })
}

export function trackBeginCheckout(params: {
  value: number        // in dollars
  items: EcomItem[]
}) {
  pushEcom("begin_checkout", {
    currency: "USD",
    value: params.value,
    items: params.items,
  })
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
