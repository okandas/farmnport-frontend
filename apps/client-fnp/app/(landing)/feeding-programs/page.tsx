import Link from "next/link"
import { serverFetch } from "@/lib/serverFetch"
import { FeedingProgramsCarousel } from "./FeedingProgramsCarousel"
import { capitalizeFirstLetter } from "@/lib/utilities"

export const metadata = {
    title: "Feeding Programs Zimbabwe — Livestock Nutrition Schedules | farmnport.com",
    description: "Browse structured feeding programs for livestock in Zimbabwe — formulations, schedules, and nutritional targets by animal type.",
    keywords: "feeding programs zimbabwe, livestock feed schedule, poultry feeding program, cattle feeding program zimbabwe, broiler feed schedule, pig feeding plan",
    alternates: { canonical: "/feeding-programs" },
    openGraph: {
        title: "Feeding Programs Zimbabwe — Livestock Nutrition Schedules",
        description: "Browse structured feeding programs for livestock in Zimbabwe — formulations, schedules, and nutritional targets by animal type.",
        url: "https://farmnport.com/feeding-programs",
        siteName: "farmnport",
        type: "website",
        images: [{ url: "https://farmnport.com/api/og", width: 1200, height: 630, alt: "farmnport" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Feeding Programs Zimbabwe — Livestock Nutrition Schedules",
        description: "Browse structured feeding programs for livestock in Zimbabwe — formulations, schedules, and nutritional targets by animal type.",
        images: ["/api/og"],
    },
}

function getAnimalGroup(farmProduceName: string): string {
    const name = farmProduceName.toLowerCase()
    if (name.startsWith("chicken")) return "chickens"
    if (name.startsWith("cattle") || name.startsWith("beef")) return "cattle"
    if (name.startsWith("pig") || name.startsWith("pork")) return "pigs"
    if (name.startsWith("sheep") || name.startsWith("lamb")) return "sheep"
    if (name.startsWith("goat")) return "goats"
    if (name.startsWith("duck")) return "ducks"
    if (name.startsWith("turkey")) return "turkeys"
    return farmProduceName.split("(")[0].trim().toLowerCase()
}

export default async function FeedingProgramsPage() {
    let programs: any[] = []

    try {
        const data = await serverFetch("/feedingprograms/")
        programs = data?.data || []
    } catch (error) {
        console.error("Error fetching feeding programs:", error)
    }

    // Group programs by animal type
    const groupMap: Record<string, any[]> = {}
    for (const p of programs) {
        const group = getAnimalGroup(p.farm_produce_name || "")
        if (!groupMap[group]) groupMap[group] = []
        groupMap[group].push(p)
    }

    const groups = Object.entries(groupMap).map(([name, items]) => ({
        title: capitalizeFirstLetter(name),
        slug: name,
        programs: items,
    }))

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://farmnport.com" },
            { "@type": "ListItem", "position": 2, "name": "Programs", "item": "https://farmnport.com/programs" },
            { "@type": "ListItem", "position": 3, "name": "Feeding Programs", "item": "https://farmnport.com/feeding-programs" },
        ],
    }

    return (
        <div className="min-h-screen">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
                    <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/programs" className="hover:text-foreground transition-colors">Programs</Link>
                    <span>/</span>
                    <span className="text-foreground font-medium">Feeding Programs</span>
                </nav>

                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-8">Feeding Programs</h1>

                <div className="flex gap-8">
                    {/* Sidebar */}
                    <aside className="hidden lg:block w-56 shrink-0">
                        <nav className="flex flex-col gap-0.5">
                            {groups.map((group) => (
                                <a
                                    key={group.slug}
                                    href={`#${group.slug}`}
                                    className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                >
                                    {group.title}
                                </a>
                            ))}
                        </nav>
                    </aside>

                    {/* Main content */}
                    <div className="flex-1 min-w-0 space-y-10">
                        {programs.length === 0 ? (
                            <div className="text-center py-16">
                                <h2 className="text-lg font-semibold mb-1">No Feeding Programs Yet</h2>
                                <p className="text-sm text-muted-foreground max-w-md mx-auto">We're working on creating comprehensive feeding programs. Check back soon.</p>
                            </div>
                        ) : (
                            groups.map((group) => (
                                <section key={group.slug} id={group.slug}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-bold">{group.title}</h2>
                                    </div>
                                    <FeedingProgramsCarousel programs={group.programs} />
                                </section>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
