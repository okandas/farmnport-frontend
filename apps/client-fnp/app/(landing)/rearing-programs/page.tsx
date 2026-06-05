import Link from "next/link"
import { RearingProgramsClient, type RearingProgram } from "./RearingProgramsClient"

const programs: RearingProgram[] = [
    {
        slug: "brooding-101",
        title: "Brooding 101",
        author: "Charles Stewart",
        tag: "Ross 308 Broilers",
        animalType: "Poultry",
        description: "Warmth, water, feed, ventilation, and daily observation — a complete guide to day-old chick management.",
        sections: 7,
        href: "/rearing-programs/brooding-101",
    },
]

export default function RearingProgramsPage() {
    return (
        <main>
            <section className="border-b">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-10 pb-8">
                    <nav className="flex text-sm text-muted-foreground mb-4">
                        <Link href="/programs" className="hover:text-foreground transition-colors">Programs</Link>
                        <span className="mx-2">/</span>
                        <span className="text-foreground">Rearing Programs</span>
                    </nav>
                    <p className="text-xs font-semibold text-primary tracking-wide uppercase">Livestock & Poultry</p>
                    <h1 className="mt-1 text-3xl font-bold font-heading tracking-tight">Rearing Programs</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Structured rearing guides for livestock and poultry — brooding, housing, nutrition, biosecurity, and management from arrival to maturity.
                    </p>
                </div>
            </section>
            <RearingProgramsClient programs={programs} />
        </main>
    )
}
