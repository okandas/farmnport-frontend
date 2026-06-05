import Link from "next/link"
import { serverFetch } from "@/lib/serverFetch"
import { FeedingProgramsGrid } from "@/components/structures/feeding-programs-grid"

export default async function FeedingProgramsPage() {
    let programs: any[] = []

    try {
        const data = await serverFetch("/feedingprograms/")
        programs = data?.data || []
    } catch (error) {
        console.error("Error fetching feeding programs:", error)
    }

    return (
        <main>
            <section className="border-b">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-10 pb-8">
                    <nav className="flex text-sm text-muted-foreground mb-4">
                        <Link href="/programs" className="hover:text-foreground transition-colors">Programs</Link>
                        <span className="mx-2">/</span>
                        <span className="text-foreground">Feeding Programs</span>
                    </nav>
                    <p className="text-xs font-semibold text-primary tracking-wide uppercase">Animal Nutrition</p>
                    <h1 className="mt-1 text-3xl font-bold font-heading tracking-tight">Feeding Programs</h1>
                    <p className="mt-2 text-sm text-muted-foreground">Structured feeding schedules for optimal livestock growth and nutrition at every stage.</p>
                </div>
            </section>
            <section className="mx-auto max-w-7xl px-6 lg:px-8 py-8">
                {programs.length === 0 ? (
                    <div className="text-center py-16">
                        <h2 className="text-lg font-semibold mb-1">No Feeding Programs Yet</h2>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">We're working on creating comprehensive feeding programs. Check back soon.</p>
                    </div>
                ) : (
                    <FeedingProgramsGrid programs={programs} />
                )}
            </section>
        </main>
    )
}
