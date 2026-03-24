import { BaseURL } from "@/lib/schemas"
import { FeedListingClient } from "./FeedListingClient"

const fetchOptions: RequestInit = process.env.NODE_ENV === "production"
    ? { next: { revalidate: 3600 } } as RequestInit
    : { cache: "no-store" }

async function getFeedProducts() {
    try {
        const res = await fetch(`${BaseURL}/feed/all`, fetchOptions)
        if (!res.ok) return { data: [], total: 0 }
        const json = await res.json()
        return { data: json?.data || [], total: json?.total || 0 }
    } catch {
        return { data: [], total: 0 }
    }
}

export default async function FeedProductsPage() {
    const { data, total } = await getFeedProducts()

    return (
        <main>
            <div className="mx-auto max-w-7xl px-6 lg:px-8 min-h-[70lvh]">
                <div className="pt-10 pb-6">
                    <h1 className="text-3xl font-bold font-heading tracking-tight">
                        Livestock Feed Products
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Browse our complete collection of livestock feed products across all categories and animal types.
                    </p>
                </div>

                <FeedListingClient initialData={data} initialTotal={total} />
            </div>
        </main>
    )
}
