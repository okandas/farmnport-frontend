import Link from "next/link"
import { serverFetch } from "@/lib/serverFetch"
import { ProgramsCarousel } from "./ProgramsCarousel"

export const metadata = {
    title: "Farm Programs Zimbabwe — Spray, Feeding & Rearing Schedules | farmnport.com",
    description: "Browse structured spray, feeding, and rearing programs to manage crop protection and livestock nutrition in Zimbabwe.",
    alternates: { canonical: "https://farmnport.com/programs" },
}

const REARING_PROGRAMS = [
    {
        slug: "brooding-101",
        title: "Brooding 101",
        tag: "Ross 308 Broilers",
        description: "Warmth, water, feed, ventilation, and daily observation — a complete guide to day-old chick management.",
        sections: 7,
    },
]

const CATEGORIES = [
    { title: "Spray Programs", href: "/spray-programs", api: "/sprayprograms/", slugBase: "/spray-programs" },
    { title: "Feeding Programs", href: "/feeding-programs", api: "/feedingprograms/", slugBase: "/feeding-programs" },
    { title: "Rearing Programs", href: "/rearing-programs", api: null, slugBase: "/rearing-programs" },
]

export default async function ProgramsPage() {
    const results = await Promise.all(
        CATEGORIES.map(async (cat) => {
            if (!cat.api) {
                return { ...cat, programs: REARING_PROGRAMS }
            }
            try {
                const res = await serverFetch(cat.api)
                return { ...cat, programs: (res?.data ?? []).slice(0, 8) }
            } catch {
                return { ...cat, programs: [] }
            }
        })
    )

    return (
        <div className="min-h-screen">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
                    <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                    <span>/</span>
                    <span className="text-foreground font-medium">Programs</span>
                </nav>

                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-8">Farm Programs</h1>

                <div className="flex gap-8">
                    {/* Sidebar */}
                    <aside className="hidden lg:block w-56 shrink-0">
                        <nav className="flex flex-col gap-0.5">
                            {CATEGORIES.map((cat) => (
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
                            cat.programs.length > 0 && (
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
                                    <ProgramsCarousel programs={cat.programs} slugBase={cat.slugBase} />
                                </section>
                            )
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
