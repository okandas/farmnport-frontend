import { auth } from "@/auth"

const BASE = (process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3744") + "/v1"

async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const session = await auth()
    const token = (session as any)?.access_token
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch {
    return {}
  }
}

export async function serverFetch<T = any>(path: string, options?: RequestInit): Promise<T> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${BASE}${path}`, {
    cache: "no-store",
    ...options,
    headers: { ...headers, ...(options?.headers as Record<string, string> | undefined) },
  })
  if (!res.ok) throw new Error(`serverFetch ${path} → ${res.status}`)
  return res.json()
}

export async function fetchLot(slug: string) {
  try {
    return await serverFetch(`/lots/${slug}`)
  } catch {
    return null
  }
}

export async function fetchLotBids(slug: string) {
  try {
    return await serverFetch(`/lots/${slug}/bids`)
  } catch {
    return null
  }
}

export async function fetchLatestBuyerPrices(clientSlug: string) {
  try {
    const dates = await serverFetch(`/prices/series/client/dates?client_slug=${clientSlug}&p=1&limit=1`)
    const latest = dates?.data?.[0]
    if (!latest) return null

    const category = latest.categories?.[0]?.toLowerCase()
    if (!category) return null

    const grades = await serverFetch(`/prices/series/client?client_slug=${clientSlug}&category=${category}&date=${latest.date}`)
    return { date: latest.date, category, entries: grades?.data ?? [] }
  } catch {
    return null
  }
}
