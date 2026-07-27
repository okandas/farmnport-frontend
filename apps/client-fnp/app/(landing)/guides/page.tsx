import Link from "next/link"
import { documentsEnabled } from "@/flags"
import { serverFetch } from "@/lib/serverFetch"
import { GuidesCarousel } from "./GuidesCarousel"

export const metadata = {
    title: "Farming Guides Zimbabwe — Dosage Rates, Active Ingredients & Application Guidelines | farmnport.com",
    description: "Browse dosage rates, active ingredients, and application guidelines for crop protection, plant nutrition, and livestock health in Zimbabwe.",
    alternates: { canonical: "https://farmnport.com/guides" },
}

const CATEGORIES = [
    { title: "Agrochemical Guides", href: "/agrochemical-guides", api: "/agrochemical/all", slugBase: "/agrochemical-guides", flag: true },
    { title: "Animal Health Guides", href: "/animal-health-guides", api: "/animalhealth/all", slugBase: "/animal-health-guides", flag: true },
    { title: "Animal Nutrition", href: "/feed-guides", api: "/feed/all", slugBase: "/feed-guides", flag: true },
    { title: "Plant Nutrition Guides", href: "/plant-nutrition-guides", api: "/plantnutrition/all", slugBase: "/plant-nutrition-guides", flag: true },
    { title: "Seed Guides", href: "/seed-guides", api: "/seed-products/all", slugBase: "/seed-guides", flag: true },
    { title: "Plans & Documents", href: "/documents", api: "/document/all", slugBase: "/buy-documents", flag: false },
]

export default async function GuidesPage() {
    const showDocuments = await documentsEnabled()

    const categories = CATEGORIES.map(c => ({
        ...c,
        flag: c.title === "Plans & Documents" ? showDocuments : c.flag,
    })).filter(c => c.flag)

    const results = await Promise.all(
        categories.map(async (cat) => {
            try {
                const res = await serverFetch(cat.api)
                return { ...cat, products: (res?.data ?? []).slice(0, 8) }
            } catch {
                return { ...cat, products: [] }
            }
        })
    )

    return (
        <div className="min-h-screen">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
                    <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                    <span>/</span>
                    <span className="text-foreground font-medium">Guides</span>
                </nav>

                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-8">Farming Guides</h1>

                <div className="flex gap-8">
                    {/* Sidebar */}
                    <aside className="hidden lg:block w-56 shrink-0">
                        <nav className="flex flex-col gap-0.5">
                            {categories.map((cat) => (
                                <Link
                                    key={cat.href}
                                    href={cat.href}
                                    className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                >
                                    {cat.title}
                                </Link>
                            ))}
                        </nav>
                    </aside>

                    {/* Main content */}
                    <div className="flex-1 min-w-0 space-y-10">
                        {results.map((cat) => (
                            cat.products.length > 0 && (
                                <section key={cat.href}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-bold">{cat.title}</h2>
                                        <Link
                                            href={cat.href}
                                            className="text-sm font-medium px-4 py-1.5 rounded-lg border hover:bg-muted transition-colors"
                                        >
                                            View All
                                        </Link>
                                    </div>
                                    <GuidesCarousel products={cat.products} slugBase={cat.slugBase} />
                                </section>
                            )
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
