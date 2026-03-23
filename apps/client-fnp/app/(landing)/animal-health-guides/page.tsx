import Link from "next/link"
import { Pill, Syringe, Shield, Heart, Beaker, ArrowRight, Bug, Scissors, Cross, Zap, Baby } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BaseURL } from "@/lib/schemas"

const fetchOptions: RequestInit = process.env.NODE_ENV === "production"
    ? { next: { revalidate: 3600 } } as RequestInit
    : { cache: "no-store" }

const categoryIcons: Record<string, any> = {
    "vaccines": Syringe,
    "antibiotics": Pill,
    "nutrition-supplements": Heart,
    "anti-protozoa": Shield,
    "biosecurity-disinfectants": Shield,
    "tick-flea-control": Bug,
    "worm-fluke-control": Scissors,
    "wound-remedies": Cross,
    "fly-control": Zap,
    "stud-management": Baby,
    "equipment": Beaker,
}

async function getCategories() {
    try {
        const res = await fetch(`${BaseURL}/animalhealthcategories/`, fetchOptions)
        if (!res.ok) return []
        const data = await res.json()
        return data?.data || []
    } catch {
        return []
    }
}

export default async function AnimalHealthGuidesPage() {
    const categories = await getCategories()

    return (
        <main className="bg-gradient-to-b from-background to-muted/20">
            {/* Hero Section */}
            <section className="py-12 lg:py-16 relative overflow-hidden">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    {/* Hero Content */}
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl font-heading mb-4">
                            Animal Health Product Guides
                        </h1>
                        <p className="text-lg text-muted-foreground leading-7 mb-6">
                            Find dosage rates, active ingredients, and withdrawal periods for vaccines, antibiotics, and supplements. No more squinting at bottle labels.
                        </p>
                        <Button
                            size="lg"
                            asChild
                            className="text-base px-6 py-5 h-auto font-semibold shadow-lg hover:shadow-xl transition-all group"
                        >
                            <Link href="/animal-health-guides/all" className="flex items-center gap-2">
                                Browse All Guides
                                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                    </div>

                    {/* Categories Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {categories.map((category: any) => {
                            const Icon = categoryIcons[category.slug] || Pill
                            return (
                                <Link
                                    key={category.slug}
                                    href={`/animal-health-guides/${category.slug}`}
                                    className="flex flex-col items-center gap-3 p-5 rounded-xl bg-card border border-border hover:border-primary hover:bg-accent transition-all group"
                                >
                                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                        <Icon className="w-5 h-5 text-primary" strokeWidth={2} />
                                    </div>
                                    <span className="text-sm font-medium text-center text-foreground group-hover:text-primary transition-colors">
                                        {category.name}
                                    </span>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </section>
        </main>
    )
}
