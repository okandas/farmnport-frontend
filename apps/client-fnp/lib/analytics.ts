interface EcomItem {
  item_id: string
  item_name: string
  item_category: string
  price: number
  quantity: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dl = () => { (window as any).dataLayer = (window as any).dataLayer || []; return (window as any).dataLayer as any[] }

function pushEcom(event: string, payload: Record<string, unknown>) {
  if (typeof window === "undefined") return
  const dataLayer = dl()
  dataLayer.push({ ecommerce: null })
  dataLayer.push({ event, ecommerce: payload })
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

export function trackAddShippingInfo(params: {
  shipping_tier: string
  value: number
}) {
  pushEcom("add_shipping_info", {
    currency: "USD",
    value: params.value,
    shipping_tier: params.shipping_tier,
  })
}

export function trackAddPaymentInfo(params: {
  payment_type: string
  value: number
}) {
  pushEcom("add_payment_info", {
    currency: "USD",
    value: params.value,
    payment_type: params.payment_type,
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

export function trackSignUp() {
  if (typeof window === "undefined") return
  const dataLayer = (window as any).dataLayer = (window as any).dataLayer || []
  dataLayer.push({ event: "sign_up" })
}


export function trackPurchase(params: {
  transaction_id: string
  value: number       // in dollars (not cents)
  currency?: string
  items: EcomItem[]
}) {
  if (typeof window === "undefined") return
  pushEcom("purchase", {
    transaction_id: params.transaction_id,
    value: params.value,
    currency: params.currency ?? "USD",
    items: params.items,
  })
}
