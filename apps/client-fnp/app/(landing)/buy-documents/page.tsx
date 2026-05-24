import Link from "next/link"
import { serverFetch } from "@/lib/serverFetch"
import { BuyDocumentsClient } from "./BuyDocumentsClient"

export const metadata = {
    title: "Buy Documents & Plans | farm&port",
    description: "Download rural infrastructure plans, financial planning templates, and more.",
}

export default async function BuyDocumentsPage() {
    let initialDocuments: any[] = []
    let initialTotal = 0

    try {
        const result = await serverFetch("/documents")
        initialDocuments = result?.documents || []
        initialTotal = result?.total || 0
    } catch (error) {
        console.error("Error fetching documents:", error)
    }

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
                />
            </div>
        </div>
    )
}
