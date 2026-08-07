"use client"

import { useCallback, useSyncExternalStore } from "react"

const STORAGE_KEY = "fnp_guest_cart"
const CART_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

export interface GuestCartItem {
  product_id: string
  sku?: string
  product_type: string
  product_name: string
  product_slug: string
  image_src: string
  unit_price: number
  quantity: number
  seller_id?: string
}

interface StoredCart {
  items: GuestCartItem[]
  timestamp: number
}

// ── external-store plumbing ──────────────────────────────────
let listeners: Array<() => void> = []

function emitChange() {
  for (const l of listeners) l()
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener]
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

const EMPTY: GuestCartItem[] = []
let cachedItems: GuestCartItem[] = EMPTY
let cachedRaw: string | null = null

function getSnapshot(): GuestCartItem[] {
  if (typeof window === "undefined") return EMPTY
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    // Skip re-parse if raw string hasn't changed
    if (raw === cachedRaw) return cachedItems
    cachedRaw = raw

    if (!raw) {
      cachedItems = EMPTY
      return EMPTY
    }
    const stored: StoredCart = JSON.parse(raw)
    if (Date.now() - stored.timestamp > CART_MAX_AGE_MS) {
      localStorage.removeItem(STORAGE_KEY)
      cachedRaw = null
      cachedItems = EMPTY
      return EMPTY
    }
    cachedItems = stored.items
    return cachedItems
  } catch {
    cachedItems = EMPTY
    return EMPTY
  }
}

function getServerSnapshot(): GuestCartItem[] {
  return EMPTY
}

function persist(items: GuestCartItem[]) {
  if (items.length === 0) {
    localStorage.removeItem(STORAGE_KEY)
  } else {
    const stored: StoredCart = { items, timestamp: Date.now() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  }
  emitChange()
}

// ── hook ─────────────────────────────────────────────────────
export function useGuestCart() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const addItem = useCallback((item: GuestCartItem) => {
    const current = getSnapshot()
    const idx = current.findIndex(
      (i) => i.product_id === item.product_id && (i.sku ?? "") === (item.sku ?? "")
    )
    if (idx >= 0) {
      const updated = [...current]
      updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + item.quantity }
      persist(updated)
    } else {
      persist([...current, item])
    }
  }, [])

  const updateItem = useCallback((productId: string, quantity: number, sku?: string) => {
    const current = getSnapshot()
    if (quantity < 1) {
      persist(current.filter((i) => !(i.product_id === productId && (i.sku ?? "") === (sku ?? ""))))
    } else {
      persist(
        current.map((i) =>
          i.product_id === productId && (i.sku ?? "") === (sku ?? "")
            ? { ...i, quantity }
            : i
        )
      )
    }
  }, [])

  const removeItem = useCallback((productId: string, sku?: string) => {
    persist(getSnapshot().filter((i) => !(i.product_id === productId && (i.sku ?? "") === (sku ?? ""))))
  }, [])

  const clearItems = useCallback(() => {
    persist([])
  }, [])

  const hasItems = items.length > 0

  return { items, addItem, updateItem, removeItem, clearItems, hasItems }
}

// ── utilities for sync flow ──────────────────────────────────
export function getGuestCartItems(): GuestCartItem[] {
  return getSnapshot()
}

export function clearGuestCart() {
  persist([])
}
