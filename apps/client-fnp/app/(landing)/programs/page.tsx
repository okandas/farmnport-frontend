import Link from "next/link"
import { Sprout } from "lucide-react"

const sections = [
    {
        title: "Spray Programs",
        description: "Structured agrochemical spray schedules for crop protection — by crop type, growth stage, and target pest or disease.",
        href: "/spray-programs",
    },
    {
        title: "Feed Programs",
        description: "Complete livestock feeding programs by animal type and production phase — formulations, schedules, and nutritional targets.",
        href: "/feeding-programs",
    },
]

export default function ProgramsPage() {
    return (
        <main className="bg-gradient-to-b from-background to-muted/20">
            <section className="py-6 lg:py-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/60 via-transparent to-emerald-50/40 dark:from-green-950/20 dark:to-emerald-950/10" />
                <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-sm font-medium mb-3">
                            <Sprout className="h-4 w-4" />
                            Farming Programs
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl font-heading mb-3">
                            Farm <span className="text-primary">Programs</span>
                        </h1>
                        <p className="text-lg text-muted-foreground leading-7 max-w-2xl mx-auto">
                            Structured spray and feeding programs to help you manage crop protection and livestock nutrition effectively.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-10 lg:py-14">
                <div className="mx-auto max-w-4xl px-6 lg:px-8">
                    <div className="grid gap-6 sm:grid-cols-2">
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
