import { notFound } from "next/navigation"
import Link from "next/link"
import { serverFetch } from "@/lib/serverFetch"
import { documentsEnabled } from "@/flags"
import { DocumentsClient } from "./DocumentsClient"

export const metadata = {
    title: "Farm Documents & Guides | Farmnport",
    description: "Download premium farm management guides, spray programs, agrochemical datasheets and seed catalogues.",
}

const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://farmnport.com" },
        { "@type": "ListItem", "position": 2, "name": "Market", "item": "https://farmnport.com/market" },
        { "@type": "ListItem", "position": 3, "name": "Documents", "item": "https://farmnport.com/documents" },
    ],
}

export default async function DocumentsPage() {
    const showDocuments = await documentsEnabled()
    if (!showDocuments) notFound()

    let initialDocs: any[] = []
    let initialTotal = 0

    try {
        const result = await serverFetch("/documents/all")
        initialDocs = result?.data || []
        initialTotal = result?.total || 0
    } catch {
        // render empty — client will retry
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-6">
                <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
                    <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/market" className="hover:text-foreground transition-colors">Market</Link>
                    <span>/</span>
                    <span className="text-foreground font-medium">Documents</span>
                </nav>
                <div className="mb-8">
                    <h1 className="text-4xl tracking-tight font-heading mb-4">
                        Farm Documents & Guides
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Download premium spray programs, agrochemical datasheets, rearing guides and more.
                    </p>
                </div>
                <DocumentsClient initialDocs={initialDocs} initialTotal={initialTotal} />
            </div>
        </div>
    )
}
