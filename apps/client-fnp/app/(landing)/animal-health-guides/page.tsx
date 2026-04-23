import { BaseURL } from "@/lib/schemas"
import { AllAnimalHealthClient } from "./AllAnimalHealthClient"
import { OtherGuidesLinks } from "@/components/shared/OtherGuidesLinks"

const fetchOptions: RequestInit = process.env.NODE_ENV === "production"
    ? { next: { revalidate: 3600 } } as RequestInit
    : { cache: "no-store" }

async function getAllProducts() {
    try {
        const res = await fetch(`${BaseURL}/animalhealth/all`, fetchOptions)
        if (!res.ok) return { data: [], total: 0 }
        const json = await res.json()
        return { data: json?.data || [], total: json?.total || 0 }
    } catch {
        return { data: [], total: 0 }
    }
}

export default async function AnimalHealthGuidesPage() {
    const { data: products, total } = await getAllProducts()

    return (
        <main className="bg-gradient-to-b from-background to-muted/20">
            <section className="py-14 lg:py-20 bg-muted/30">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mb-8 flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight font-heading">
                                Animal Health Guides
                            </h2>
                            <p className="text-muted-foreground mt-2 max-w-lg">
                                Explore animal health products by type. Each guide includes active ingredients, targets, and usage information.
                            </p>
                        </div>
                        <OtherGuidesLinks current="animal-health" />
                    </div>
                    <AllAnimalHealthClient initialProducts={products} initialTotal={total} />
                </div>
            </section>
        </main>
    )
}
