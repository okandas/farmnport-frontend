import Link from "next/link"
import { ShoppingCart } from "lucide-react"

const sections = [
    {
        title: "Agrochemicals",
        description: "Pesticides, herbicides, and fungicides — browse by category, brand, or active ingredient.",
        href: "/buy-agrochemicals",
    },
    {
        title: "Animal Health",
        description: "Vaccines, antibiotics, and supplements for poultry and livestock.",
        href: "/buy-animal-health",
    },
    {
        title: "Animal Feed",
        description: "Livestock feed products across all animal types — starter, grower, finisher, and more.",
        href: "/buy-feeds",
    },
    {
        title: "Plant Nutrition",
        description: "Fertilizers, foliar feeds, biostimulants, and plant growth regulators.",
        href: "/buy-plant-nutrition",
    },
    {
        title: "Plans & Documents",
        description: "Downloadable infrastructure plans, financial templates, and agronomy guides.",
        href: "/buy-documents",
    },
]

export default function BuyPage() {
    return (
        <main className="bg-gradient-to-b from-background to-muted/20">
            {/* Hero */}
            <section className="py-6 lg:py-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/60 via-transparent to-emerald-50/40 dark:from-green-950/20 dark:to-emerald-950/10" />
                <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-sm font-medium mb-3">
                            <ShoppingCart className="h-4 w-4" />
                            Shop Online
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl font-heading mb-3">
                            Buy{" "}
                            <span className="text-primary">Farm Inputs</span>
                        </h1>
                        <p className="text-lg text-muted-foreground leading-7 max-w-2xl mx-auto">
                            Agrochemicals, animal health products, livestock feed, and plant nutrition — order online with delivery to your door.
                        </p>
                    </div>
                </div>
            </section>

            {/* Shop Sections */}
            <section className="py-10 lg:py-14">
                <div className="mx-auto max-w-4xl px-6 lg:px-8">
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {sections.map(({ title, description, href }) => (
                            <Link
                                key={href}
                                href={href}
                                className="flex flex-col gap-3 p-6 rounded-xl bg-card border border-border hover:border-primary hover:shadow-md transition-all group"
                            >
                                <h2 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                                    {title}
                                </h2>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {description}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    )
}
