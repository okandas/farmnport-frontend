import { notFound } from "next/navigation"
import Link from "next/link"
import { serverFetch } from "@/lib/serverFetch"
import { documentsEnabled } from "@/flags"
import { BuyDocumentsClient } from "./BuyDocumentsClient"
import { getBuyCategories } from "@/components/generic/BuyCategoriesNav"

export const metadata = {
    title: "Buy Farm Building Plans & Documents Zimbabwe | farmnport.com",
    description: "Download pig sty, goat pen, chicken house and cattle kraal design plans. Instant PDF download with full floor plans, elevations and 3D impressions.",
    alternates: { canonical: "https://farmnport.com/buy-documents" },
    openGraph: {
        title: "Farm Building Plans & Documents | farmnport.com",
        description: "Download pig sty, goat pen, chicken house and cattle kraal design plans. Instant PDF download.",
        siteName: "farmnport",
        type: "website" as const,
        url: "https://farmnport.com/buy-documents",
    },
    twitter: {
        card: "summary_large_image" as const,
        title: "Farm Building Plans & Documents | farmnport.com",
        description: "Download pig sty, goat pen, chicken house and cattle kraal design plans. Instant PDF download.",
    },
}

export default async function BuyDocumentsPage() {
    const showDocuments = await documentsEnabled()
    if (!showDocuments) notFound()

    let initialDocuments: any[] = []
    let initialTotal = 0

    try {
        const result = await serverFetch("/documents/all")
        initialDocuments = result?.data || []
        initialTotal = result?.total || 0
    } catch (error) {
        console.error("Error fetching documents:", error)
    }

    const categories = await getBuyCategories()

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-6">
                <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
                    <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/buy" className="hover:text-foreground transition-colors">Buy</Link>
                    <span>/</span>
                    <span className="text-foreground font-medium">Plans & Documents</span>
                </nav>
                <div className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight font-heading mb-4">
                        Plans & Documents
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Downloadable plans, templates, and guides for farmers and rural entrepreneurs
                    </p>
                </div>
                <BuyDocumentsClient
                    initialDocuments={initialDocuments}
                    initialTotal={initialTotal}
                    categories={categories}
                />
            </div>
        </div>
    )
}
