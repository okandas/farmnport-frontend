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
