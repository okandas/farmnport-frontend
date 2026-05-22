import Link from "next/link"
import { queryBuySeedProducts, listBookingEvents } from "@/lib/query"
import { BuySeedProductsClient } from "./BuySeedProductsClient"

export default async function BuySeedProductsPage() {
    let initialProducts: any[] = []
    let initialTotal = 0
    let bookingEvents: any[] = []

    try {
        const [productsRes, bookingsRes] = await Promise.all([
            queryBuySeedProducts({ p: 1, brand: [] }),
            listBookingEvents({ status: "open" }),
        ])
        initialProducts = productsRes?.data?.data || []
        initialTotal = productsRes?.data?.total || 0
        bookingEvents = bookingsRes?.data?.events || []
    } catch (error) {
        console.error("Error fetching seed products:", error)
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-6">
                <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
                    <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/buy" className="hover:text-foreground transition-colors">Buy</Link>
                    <span>/</span>
                    <span className="text-foreground font-medium">Seed Products</span>
                </nav>
                <div className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight font-heading mb-4">
                        Buy Seed Products Online
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Certified seed potatoes, maize, vegetables and more from trusted suppliers
                    </p>
                </div>
                <BuySeedProductsClient
                    initialProducts={initialProducts}
                    initialTotal={initialTotal}
                    bookingEvents={bookingEvents}
                />
            </div>
        </div>
    )
}
