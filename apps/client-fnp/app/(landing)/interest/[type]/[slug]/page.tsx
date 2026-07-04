import { notFound } from "next/navigation"
import Link from "next/link"
import { serverFetch } from "@/lib/serverFetch"
import { InterestClient } from "./InterestClient"

interface Props {
    params: Promise<{ type: string; slug: string }>
}

// Map URL type → API path + name field extractor
const TYPE_CONFIG: Record<string, { fetch: (slug: string) => Promise<any>; getName: (data: any) => string | undefined }> = {
    agrochemical: {
        fetch: (slug) => serverFetch(`/agrochemical/${slug}`),
        getName: (d) => d?.name,
    },
    "animal-health": {
        fetch: (slug) => serverFetch(`/animalhealth/${slug}`),
        getName: (d) => d?.name,
    },
    feed: {
        fetch: (slug) => serverFetch(`/feed/${slug}`),
        getName: (d) => d?.name,
    },
    "plant-nutrition": {
        fetch: (slug) => serverFetch(`/plantnutrition/${slug}`),
        getName: (d) => d?.name,
    },
    seed: {
        fetch: (slug) => serverFetch(`/seed-products/${slug}`),
        getName: (d) => d?.name,
    },
    document: {
        fetch: (slug) => serverFetch(`/documents/${slug}`),
        getName: (d) => d?.document?.title,
    },
}

export default async function InterestPage({ params }: Props) {
    const { type, slug } = await params

    const config = TYPE_CONFIG[type]
    if (!config) notFound()

    let name = slug
    try {
        const data = await config.fetch(slug)
        name = config.getName(data) ?? slug
    } catch {
        // fallback to slug if product not found
    }

    const loginRedirect = `/interest/${type}/${slug}`

    return (
        <div className="min-h-screen bg-background">
            <div className="border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <nav className="flex text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                        <span className="mx-2">/</span>
                        <span className="text-foreground truncate">Register Interest</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 text-center space-y-6">
                <div>
                    <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-3">{type.replace(/-/g, " ")}</p>
                    <h1 className="text-2xl font-bold leading-snug">{name}</h1>
                    <p className="text-muted-foreground mt-2 text-sm">This item is not yet available for sale. Register your interest and we'll let you know when it is.</p>
                </div>

                <InterestClient
                    productType={type}
                    slug={slug}
                    name={name}
                    loginRedirect={loginRedirect}
                />
            </div>
        </div>
    )
}
